import type { SkillOp, SkillVariant, IfCondition, FragmentQuality, OpCode } from '@mindsea/shared';
import { ABSOLUTE_RULES } from '@mindsea/shared';

const ALLOWED_OPS: OpCode[] = ['set', 'add', 'mul', 'clamp', 'log', 'if', 'random'];

const BASE_PATHS = new Set([
  'hp',
  'maxHp',
  'mp',
  'maxMp',
  'attack',
  'defense',
  'speed',
  'shield',
  'stun',
]);

const DOT_PREFIXES = new Set(['poison', 'burn', 'bleed', 'frostbite', 'regen', 'corrosion']);
const MOD_PREFIXES = new Set(['stun', 'slow', 'haste', 'weaken', 'empower', 'silence', 'taunt']);

const MAX_OPS_PER_SKILL = 20;
const MAX_NEST_DEPTH = 3;
const MAX_STATUS_DURATION = 5;
const MAX_STAT_ADD = 30;
const MIN_STAT_MUL = 0.3;
const MAX_STAT_MUL = 3.0;
const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 500;
const MAX_LOG_LENGTH = 200;

const QUALITY_DAMAGE_CAP: Record<FragmentQuality, number> = {
  iron_word: 40,
  steel_word: 70,
  silver_sentence: 110,
  source_chapter: 160,
  divine_codex: 250,
};

const QUALITY_HEAL_CAP: Record<FragmentQuality, number> = {
  iron_word: 35,
  steel_word: 60,
  silver_sentence: 95,
  source_chapter: 140,
  divine_codex: 220,
};

const QUALITY_DOT_CAP: Record<FragmentQuality, number> = {
  iron_word: 15,
  steel_word: 25,
  silver_sentence: 40,
  source_chapter: 60,
  divine_codex: 100,
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedOps: SkillOp[];
}

export function validateSkill(
  variant: Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>,
  quality: FragmentQuality = 'iron_word',
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!variant.name || variant.name.length === 0) {
    errors.push('技能名称不能为空');
  } else if (variant.name.length > MAX_NAME_LENGTH) {
    warnings.push(`技能名称过长，已截断至 ${MAX_NAME_LENGTH} 字符`);
  }

  if (!variant.description || variant.description.length === 0) {
    errors.push('技能描述不能为空');
  } else if (variant.description.length > MAX_DESC_LENGTH) {
    warnings.push(`技能描述过长，已截断至 ${MAX_DESC_LENGTH} 字符`);
  }

  if (typeof variant.usageCount !== 'number' || variant.usageCount < 1) {
    errors.push('使用次数必须大于等于 1');
  } else if (variant.usageCount > ABSOLUTE_RULES.USAGE_MAX) {
    warnings.push(`使用次数超过上限，已限制为 ${ABSOLUTE_RULES.USAGE_MAX}`);
  }

  const damageCap = QUALITY_DAMAGE_CAP[quality] ?? 40;
  const sanitizedOps = validateOps(variant.ops || [], quality, damageCap, 0, errors, warnings);

  if (variant.onCast) {
    validateOps(variant.onCast, quality, damageCap, 0, errors, warnings);
  }
  if (variant.onHit) {
    validateOps(variant.onHit, quality, damageCap, 0, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedOps,
  };
}

function validateOps(
  ops: SkillOp[],
  quality: FragmentQuality,
  damageCap: number,
  depth: number,
  errors: string[],
  warnings: string[],
): SkillOp[] {
  if (depth > MAX_NEST_DEPTH) {
    errors.push(`嵌套深度超过上限 ${MAX_NEST_DEPTH}`);
    return [];
  }

  const sanitized: SkillOp[] = [];

  for (const op of ops) {
    if (sanitized.length >= MAX_OPS_PER_SKILL) {
      warnings.push(`指令数量超过上限 ${MAX_OPS_PER_SKILL}，已截断`);
      break;
    }

    if (!op.op || !ALLOWED_OPS.includes(op.op as OpCode)) {
      warnings.push(`未知指令类型: ${op.op}，已跳过`);
      continue;
    }

    const result = validateSingleOp(op, quality, damageCap, depth, errors, warnings);
    if (result) {
      sanitized.push(result);
    }
  }

  return sanitized;
}

function validateSingleOp(
  op: SkillOp,
  quality: FragmentQuality,
  damageCap: number,
  depth: number,
  errors: string[],
  warnings: string[],
): SkillOp | null {
  switch (op.op) {
    case 'set':
    case 'add':
    case 'mul':
      return validateNumericOp(op, quality, damageCap, errors, warnings);

    case 'clamp':
      return validateClampOp(op, errors, warnings);

    case 'if':
      return validateIfOp(op, quality, damageCap, depth, errors, warnings);

    case 'random':
      return validateRandomOp(op, quality, damageCap, depth, errors, warnings);

    case 'log':
      if (op.text && op.text.length > MAX_LOG_LENGTH) {
        return { ...op, text: op.text.slice(0, MAX_LOG_LENGTH) };
      }
      return op;

    default:
      return null;
  }
}

function validateNumericOp(
  op: SkillOp,
  quality: FragmentQuality,
  damageCap: number,
  errors: string[],
  warnings: string[],
): SkillOp | null {
  if (!op.path) {
    errors.push(`${op.op} 指令缺少 path`);
    return null;
  }

  if (op.value === undefined || op.value === null) {
    errors.push(`${op.op} 指令缺少 value`);
    return null;
  }

  const numValue = typeof op.value === 'number' ? op.value : parseFloat(String(op.value));
  if (isNaN(numValue)) {
    errors.push(`${op.op} 指令 value 不是有效数字`);
    return null;
  }

  const pathValid = validatePath(op.path, errors, warnings);
  if (!pathValid) {
    return null;
  }

  // 伤害上限（hp 减）
  if (op.path === 'hp' && op.op === 'add' && numValue < 0) {
    const absVal = Math.abs(numValue);
    if (absVal > damageCap) {
      warnings.push(`伤害值 ${absVal} 超过品质上限 ${damageCap}，已限制`);
      return { ...op, value: -damageCap };
    }
  }

  // 治疗上限（hp 加）
  if (op.path === 'hp' && (op.op === 'add' || op.op === 'set') && numValue > 0) {
    const healCap = QUALITY_HEAL_CAP[quality] ?? 35;
    if (op.op === 'set') {
      if (numValue > healCap * 3) {
        warnings.push(`set hp 值过高，已限制`);
        return { ...op, value: healCap * 3 };
      }
    } else {
      if (numValue > healCap) {
        warnings.push(`治疗值 ${numValue} 超过品质上限 ${healCap}，已限制`);
        return { ...op, value: healCap };
      }
    }
  }

  // 属性数值限制
  if (['attack', 'defense', 'speed'].includes(op.path)) {
    if (op.op === 'add') {
      if (Math.abs(numValue) > MAX_STAT_ADD) {
        warnings.push(`属性加减 ${numValue} 超过上限 ${MAX_STAT_ADD}，已限制`);
        return { ...op, value: numValue > 0 ? MAX_STAT_ADD : -MAX_STAT_ADD };
      }
    }
    if (op.op === 'mul') {
      if (numValue < MIN_STAT_MUL || numValue > MAX_STAT_MUL) {
        warnings.push(`属性倍率 ${numValue} 超出范围 [${MIN_STAT_MUL}, ${MAX_STAT_MUL}]，已限制`);
        return { ...op, value: Math.max(MIN_STAT_MUL, Math.min(MAX_STAT_MUL, numValue)) };
      }
    }
    if (op.op === 'set') {
      if (numValue < 1 || numValue > MAX_STAT_ADD * 3) {
        warnings.push(`set 属性值不合理，已限制`);
        return { ...op, value: Math.max(1, Math.min(MAX_STAT_ADD * 3, numValue)) };
      }
    }
  }

  // MP 加减限制
  if (op.path === 'mp') {
    const mpCap = damageCap * 0.6;
    if (Math.abs(numValue) > mpCap) {
      warnings.push(`MP 变动 ${numValue} 超过上限 ${mpCap}，已限制`);
      return { ...op, value: numValue > 0 ? mpCap : -mpCap };
    }
  }

  // 护盾上限
  if (op.path === 'shield') {
    const shieldCap = damageCap * 1.5;
    if (numValue > shieldCap) {
      warnings.push(`护盾值 ${numValue} 超过上限 ${shieldCap}，已限制`);
      return { ...op, value: shieldCap };
    }
  }

  return { ...op, value: numValue };
}

function validateClampOp(
  op: SkillOp,
  errors: string[],
  warnings: string[],
): SkillOp | null {
  if (!op.path) {
    errors.push('clamp 指令缺少 path');
    return null;
  }
  if (op.min === undefined || op.max === undefined) {
    errors.push('clamp 指令缺少 min 或 max');
    return null;
  }
  if (op.min > op.max) {
    errors.push('clamp min 不能大于 max');
    return null;
  }
  validatePath(op.path, errors, warnings);
  return op;
}

function validateIfOp(
  op: SkillOp,
  quality: FragmentQuality,
  damageCap: number,
  depth: number,
  errors: string[],
  warnings: string[],
): SkillOp | null {
  if (!op.cond) {
    errors.push('if 指令缺少 cond');
    return null;
  }

  if (!validateCondition(op.cond, errors, warnings)) {
    return null;
  }

  const sanitizedThen = validateOps(op.then || [], quality, damageCap, depth + 1, errors, warnings);
  const sanitizedElse = op.else
    ? validateOps(op.else, quality, damageCap, depth + 1, errors, warnings)
    : undefined;

  return { ...op, then: sanitizedThen, else: sanitizedElse };
}

function validateRandomOp(
  op: SkillOp,
  quality: FragmentQuality,
  damageCap: number,
  depth: number,
  errors: string[],
  warnings: string[],
): SkillOp | null {
  if (op.min === undefined || op.max === undefined) {
    errors.push('random 指令缺少 min 或 max');
    return null;
  }
  if (op.min > op.max) {
    errors.push('random min 不能大于 max');
    return null;
  }
  if (op.max - op.min > 10000) {
    warnings.push('random 范围过大，已限制');
    return { ...op, max: op.min + 10000 };
  }

  if (op.then) {
    const sanitizedThen = validateOps(op.then, quality, damageCap, depth + 1, errors, warnings);
    return { ...op, then: sanitizedThen };
  }

  return op;
}

function validateCondition(cond: IfCondition, errors: string[], warnings: string[]): boolean {
  if (!cond.type) {
    errors.push('条件类型不能为空');
    return false;
  }

  const validTypes = ['compare', 'has_status', 'no_status', 'hp_pct', 'mp_pct', 'and', 'or'];
  if (!validTypes.includes(cond.type)) {
    warnings.push(`未知条件类型: ${cond.type}`);
    return false;
  }

  if (cond.type === 'compare') {
    if (!cond.path || !cond.comparator) {
      errors.push('compare 条件缺少 path 或 comparator');
      return false;
    }
    validatePath(cond.path, errors, warnings);
  }

  if (cond.type === 'has_status' || cond.type === 'no_status') {
    if (!cond.status) {
      errors.push('status 条件缺少 status 名称');
      return false;
    }
    if (cond.status.length > 30) {
      warnings.push('status 名称过长，已截断');
    }
  }

  if (cond.type === 'hp_pct' || cond.type === 'mp_pct') {
    if (cond.percent !== undefined && (cond.percent < 0 || cond.percent > 1)) {
      errors.push('百分比必须在 0-1 之间');
      return false;
    }
  }

  if (cond.type === 'and' || cond.type === 'or') {
    let valid = true;
    if (cond.left) valid = validateCondition(cond.left, errors, warnings) && valid;
    if (cond.right) valid = validateCondition(cond.right, errors, warnings) && valid;
    return valid;
  }

  return true;
}

function validatePath(path: string, errors: string[], warnings: string[]): boolean {
  if (!path || path.length === 0) {
    errors.push('path 不能为空');
    return false;
  }

  if (path.length > 100) {
    errors.push('path 过长');
    return false;
  }

  // 不允许相对路径或特殊字符
  if (!/^[a-zA-Z0-9_.]+$/.test(path)) {
    errors.push(`path 包含非法字符: ${path}`);
    return false;
  }

  const parts = path.split('.');
  const root = parts[0];

  // 基础属性直接放行
  if (BASE_PATHS.has(root) && parts.length === 1) {
    return true;
  }

  // variables.* 临时变量
  if (root === 'variables' && parts.length >= 2 && parts.length <= 3) {
    return true;
  }

  // dot.*.value / dot.*.duration
  if (root === 'dot' && parts.length >= 2) {
    const dotName = parts[1];
    if (dotName && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dotName)) {
      if (parts.length === 2 || parts[2] === 'value' || parts[2] === 'duration') {
        return true;
      }
    }
  }

  // 自定义属性路径允许，但给出警告
  if (parts.length <= 3) {
    warnings.push(`自定义属性路径: ${path}`);
    return true;
  }

  warnings.push(`路径层级过深或不规范: ${path}，已跳过`);
  return false;
}
