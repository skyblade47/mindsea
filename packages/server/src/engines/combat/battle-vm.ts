import { v4 as uuidv4 } from 'uuid';
import type { SkillOp, IfCondition, ActiveModifier, CombatLogEntry, TargetType } from '@mindsea/shared';

export interface VMEntity {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  stun: number;
  modifiers: ActiveModifier[];
  dot: Record<string, { value: number; duration: number }>;
  shield: number;
}

export interface VMState {
  player: VMEntity;
  enemy: VMEntity;
  log: CombatLogEntry[];
  turn: number;
  status: 'active' | 'won' | 'lost';
  variables: Record<string, number>;
}

const MAX_OPS_PER_SKILL = 20;
const MAX_NEST_DEPTH = 3;

export class BattleVM {
  private state: VMState;
  private opCount = 0;
  private currentSource: 'player' | 'enemy' = 'player';

  constructor(state: VMState) {
    this.state = state;
  }

  getState(): VMState {
    return this.state;
  }

  executeOps(ops: SkillOp[], source: 'player' | 'enemy' = 'player'): void {
    this.currentSource = source;
    this.opCount = 0;
    this.executeOpsRecursive(ops, 0);
    this.checkBattleEnd();
  }

  private executeOpsRecursive(ops: SkillOp[], depth: number): void {
    if (depth > MAX_NEST_DEPTH) return;

    for (const op of ops) {
      if (this.opCount >= MAX_OPS_PER_SKILL) return;
      this.opCount++;

      switch (op.op) {
        case 'set':
          this.opSet(op);
          break;
        case 'add':
          this.opAdd(op);
          break;
        case 'mul':
          this.opMul(op);
          break;
        case 'clamp':
          this.opClamp(op);
          break;
        case 'if':
          if (depth < MAX_NEST_DEPTH && op.cond && this.evaluateCondition(op.cond)) {
            this.executeOpsRecursive(op.then || [], depth + 1);
          } else if (depth < MAX_NEST_DEPTH && op.else) {
            this.executeOpsRecursive(op.else, depth + 1);
          }
          break;
        case 'random':
          this.opRandom(op, depth);
          break;
        case 'log':
          this.opLog(op);
          break;
      }
    }
  }

  private getTarget(target?: TargetType): VMEntity {
    if (target === 'self') {
      return this.currentSource === 'player' ? this.state.player : this.state.enemy;
    }
    if (target === 'enemy') {
      return this.currentSource === 'player' ? this.state.enemy : this.state.player;
    }
    return this.currentSource === 'player' ? this.state.enemy : this.state.player;
  }

  private resolvePath(entity: VMEntity, path: string): { obj: any; key: string } | null {
    const parts = path.split('.');
    let obj: any = entity;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (obj[part] === undefined || obj[part] === null) {
        if (typeof obj[part] !== 'object') {
          obj[part] = {};
        }
      }
      obj = obj[part];
    }

    const key = parts[parts.length - 1];
    return { obj, key };
  }

  private getPathValue(entity: VMEntity, path: string): number {
    if (path === 'hp') return entity.hp;
    if (path === 'maxHp') return entity.maxHp;
    if (path === 'mp') return entity.mp;
    if (path === 'maxMp') return entity.maxMp;
    if (path === 'attack') return entity.attack;
    if (path === 'defense') return entity.defense;
    if (path === 'speed') return entity.speed;
    if (path === 'shield') return entity.shield;
    if (path === 'stun') return entity.stun;

    const resolved = this.resolvePath(entity, path);
    if (!resolved) return 0;
    const val = resolved.obj[resolved.key];
    return typeof val === 'number' ? val : 0;
  }

  private setPathValue(entity: VMEntity, path: string, value: number): void {
    if (path === 'hp') {
      entity.hp = Math.max(0, Math.min(entity.maxHp, value));
      return;
    }
    if (path === 'maxHp') { entity.maxHp = Math.max(1, value); return; }
    if (path === 'mp') {
      entity.mp = Math.max(0, Math.min(entity.maxMp, value));
      return;
    }
    if (path === 'maxMp') { entity.maxMp = Math.max(1, value); return; }
    if (path === 'attack') { entity.attack = Math.max(1, value); return; }
    if (path === 'defense') { entity.defense = Math.max(0, value); return; }
    if (path === 'speed') { entity.speed = Math.max(1, value); return; }
    if (path === 'shield') { entity.shield = Math.max(0, value); return; }
    if (path === 'stun') { entity.stun = Math.max(0, value); return; }

    const resolved = this.resolvePath(entity, path);
    if (resolved) {
      resolved.obj[resolved.key] = value;
    }
  }

  private opSet(op: SkillOp): void {
    if (!op.path || op.value === undefined) return;
    const target = this.getTarget(op.target);
    const val = typeof op.value === 'number' ? op.value : parseFloat(String(op.value));
    this.setPathValue(target, op.path, val);
  }

  private opAdd(op: SkillOp): void {
    if (!op.path || op.value === undefined) return;
    const target = this.getTarget(op.target);
    const addVal = typeof op.value === 'number' ? op.value : parseFloat(String(op.value));
    const current = this.getPathValue(target, op.path);

    let actualChange = addVal;

    if (op.path === 'hp' && addVal < 0) {
      const damage = Math.abs(addVal);
      const { actualDamage, shieldAbsorbed } = this.applyShield(target, damage);
      actualChange = -actualDamage;
      this.setPathValue(target, 'hp', current - actualDamage);

      if (shieldAbsorbed > 0) {
        this.state.log.push({
          turn: this.state.turn,
          actor: target.name,
          action: 'shield',
          value: shieldAbsorbed,
          description: `护盾吸收了 ${shieldAbsorbed} 点伤害`,
        });
      }
      if (actualDamage > 0) {
        const actor = this.currentSource === 'player' ? this.state.player.name : this.state.enemy.name;
        this.state.log.push({
          turn: this.state.turn,
          actor,
          action: 'damage',
          value: actualDamage,
          description: `${actor} 造成了 ${actualDamage} 点伤害`,
        });
      }
      return;
    }

    if (op.path === 'hp' && addVal > 0) {
      const maxHeal = target.maxHp - current;
      const actualHeal = Math.min(addVal, maxHeal);
      this.setPathValue(target, 'hp', current + actualHeal);
      const actor = this.currentSource === 'player' ? this.state.player.name : this.state.enemy.name;
      this.state.log.push({
        turn: this.state.turn,
        actor,
        action: 'heal',
        value: actualHeal,
        description: `${actor} 恢复了 ${actualHeal} 点生命`,
      });
      return;
    }

    this.setPathValue(target, op.path, current + addVal);

    if (['attack', 'defense', 'speed'].includes(op.path)) {
      const actor = this.currentSource === 'player' ? this.state.player.name : this.state.enemy.name;
      const direction = addVal >= 0 ? '提升' : '降低';
      this.state.log.push({
        turn: this.state.turn,
        actor,
        action: 'modify_stat',
        value: Math.abs(addVal),
        description: `${target.name} 的 ${op.path} ${direction}了 ${Math.abs(addVal)}`,
      });
    }
  }

  private opMul(op: SkillOp): void {
    if (!op.path || op.value === undefined) return;
    const target = this.getTarget(op.target);
    const mulVal = typeof op.value === 'number' ? op.value : parseFloat(String(op.value));
    const current = this.getPathValue(target, op.path);
    const newVal = current * mulVal;
    this.setPathValue(target, op.path, newVal);

    if (['attack', 'defense', 'speed'].includes(op.path)) {
      const actor = this.currentSource === 'player' ? this.state.player.name : this.state.enemy.name;
      const direction = mulVal >= 1 ? '提升' : '降低';
      const pct = Math.round(Math.abs(mulVal - 1) * 100);
      this.state.log.push({
        turn: this.state.turn,
        actor,
        action: 'modify_stat',
        value: pct,
        description: `${target.name} 的 ${op.path} ${direction}了 ${pct}%`,
      });
    }
  }

  private opClamp(op: SkillOp): void {
    if (!op.path || op.min === undefined || op.max === undefined) return;
    const target = this.getTarget(op.target);
    const current = this.getPathValue(target, op.path);
    const clamped = Math.max(op.min, Math.min(op.max, current));
    this.setPathValue(target, op.path, clamped);
  }

  private opRandom(op: SkillOp, depth: number): void {
    if (op.min === undefined || op.max === undefined) return;
    const val = Math.floor(Math.random() * (op.max - op.min + 1)) + op.min;
    if (op.assignTo) {
      this.state.variables[op.assignTo] = val;
    }
    if (op.then && depth < MAX_NEST_DEPTH) {
      this.executeOpsRecursive(op.then, depth + 1);
    }
  }

  private opLog(op: SkillOp): void {
    if (!op.text) return;
    const actor = this.currentSource === 'player' ? this.state.player.name : this.state.enemy.name;
    this.state.log.push({
      turn: this.state.turn,
      actor,
      action: 'log',
      value: 0,
      description: op.text,
    });
  }

  private applyShield(target: VMEntity, damage: number): { actualDamage: number; shieldAbsorbed: number } {
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, damage);
      target.shield -= absorbed;
      return { actualDamage: damage - absorbed, shieldAbsorbed: absorbed };
    }
    return { actualDamage: damage, shieldAbsorbed: 0 };
  }

  private evaluateCondition(cond: IfCondition): boolean {
    switch (cond.type) {
      case 'compare': {
        if (!cond.path || cond.comparator === undefined || cond.value === undefined) return false;
        const target = this.getTarget(cond.target);
        let leftVal: number;
        if (cond.path.startsWith('variables.')) {
          const varName = cond.path.slice(10);
          leftVal = this.state.variables[varName] ?? 0;
        } else {
          leftVal = this.getPathValue(target, cond.path);
        }
        const rightVal = typeof cond.value === 'number'
          ? cond.value
          : this.state.variables[String(cond.value)] ?? 0;

        switch (cond.comparator) {
          case 'eq': return leftVal === rightVal;
          case 'neq': return leftVal !== rightVal;
          case 'gt': return leftVal > rightVal;
          case 'lt': return leftVal < rightVal;
          case 'gte': return leftVal >= rightVal;
          case 'lte': return leftVal <= rightVal;
          default: return false;
        }
      }
      case 'has_status': {
        if (!cond.status) return false;
        const target = this.getTarget(cond.target);
        return target.modifiers.some((m) => m.path.includes(cond.status!) && m.duration > 0)
          || (target.dot && target.dot[cond.status] && target.dot[cond.status].duration > 0);
      }
      case 'no_status': {
        if (!cond.status) return true;
        const target = this.getTarget(cond.target);
        const hasMod = target.modifiers.some((m) => m.path.includes(cond.status!) && m.duration > 0);
        const hasDot = target.dot && target.dot[cond.status] && target.dot[cond.status].duration > 0;
        return !hasMod && !hasDot;
      }
      case 'hp_pct': {
        const target = this.getTarget(cond.target);
        const pct = target.hp / target.maxHp;
        if (cond.comparator === 'lt') return pct < (cond.percent ?? 0.5);
        if (cond.comparator === 'gt') return pct > (cond.percent ?? 0.5);
        if (cond.comparator === 'lte') return pct <= (cond.percent ?? 0.5);
        if (cond.comparator === 'gte') return pct >= (cond.percent ?? 0.5);
        return false;
      }
      case 'mp_pct': {
        const target = this.getTarget(cond.target);
        const pct = target.mp / target.maxMp;
        if (cond.comparator === 'lt') return pct < (cond.percent ?? 0.5);
        if (cond.comparator === 'gt') return pct > (cond.percent ?? 0.5);
        return false;
      }
      case 'and':
        return (cond.left ? this.evaluateCondition(cond.left) : true)
          && (cond.right ? this.evaluateCondition(cond.right) : true);
      case 'or':
        return (cond.left ? this.evaluateCondition(cond.left) : false)
          || (cond.right ? this.evaluateCondition(cond.right) : false);
      default:
        return false;
    }
  }

  addModifier(
    target: 'player' | 'enemy',
    path: string,
    duration: number,
    value: number,
    revertType: 'add' | 'mul' | 'set',
    revertValue: number,
    source: 'player' | 'enemy',
  ): void {
    const entity = target === 'player' ? this.state.player : this.state.enemy;
    const mod: ActiveModifier = {
      id: `mod_${uuidv4().slice(0, 8)}`,
      path,
      duration,
      maxDuration: duration,
      value,
      revertType,
      revertValue,
      source,
    };
    entity.modifiers.push(mod);
  }

  addDot(target: 'player' | 'enemy', name: string, duration: number, value: number): void {
    const entity = target === 'player' ? this.state.player : this.state.enemy;
    if (entity.dot[name]) {
      entity.dot[name].value = Math.max(entity.dot[name].value, value);
      entity.dot[name].duration = Math.max(entity.dot[name].duration, duration);
    } else {
      entity.dot[name] = { value, duration };
    }
  }

  processTurnEffects(entity: 'player' | 'enemy'): void {
    const target = entity === 'player' ? this.state.player : this.state.enemy;

    // 眩晕递减
    if (target.stun > 0) {
      target.stun--;
    }

    // DOT 伤害/治疗
    for (const [name, dot] of Object.entries(target.dot)) {
      if (dot.duration <= 0) continue;

      if (name === 'regen' || name === 'heal_over_time') {
        const heal = Math.min(dot.value, target.maxHp - target.hp);
        target.hp = Math.min(target.maxHp, target.hp + dot.value);
        this.state.log.push({
          turn: this.state.turn,
          actor: target.name,
          action: 'regen',
          value: heal,
          description: `${target.name} 恢复了 ${heal} 点生命`,
        });
      } else {
        const dmg = dot.value;
        target.hp = Math.max(0, target.hp - dmg);
        const dotNames: Record<string, string> = {
          poison: '中毒',
          burn: '灼烧',
          bleed: '流血',
          frostbite: '冻伤',
        };
        this.state.log.push({
          turn: this.state.turn,
          actor: target.name,
          action: 'dot',
          value: dmg,
          description: `${target.name} 受到 ${dotNames[name] || name} 伤害 ${dmg}`,
        });
      }

      dot.duration--;
    }

    // 清理过期 DOT
    for (const name of Object.keys(target.dot)) {
      if (target.dot[name].duration <= 0) {
        delete target.dot[name];
      }
    }

    // 处理 modifiers 持续时间
    const expired: ActiveModifier[] = [];
    for (const mod of target.modifiers) {
      mod.duration--;
      if (mod.duration <= 0) {
        expired.push(mod);
      }
    }

    // 回滚过期 modifiers
    for (const mod of expired) {
      const current = this.getPathValue(target, mod.path);
      switch (mod.revertType) {
        case 'add':
          this.setPathValue(target, mod.path, current + mod.revertValue);
          break;
        case 'mul':
          this.setPathValue(target, mod.path, current * mod.revertValue);
          break;
        case 'set':
          this.setPathValue(target, mod.path, mod.revertValue);
          break;
      }
    }

    target.modifiers = target.modifiers.filter((m) => m.duration > 0);

    if (expired.length > 0) {
      this.state.log.push({
        turn: this.state.turn,
        actor: target.name,
        action: 'status_expired',
        value: expired.length,
        description: `${expired.length} 个效果结束了`,
      });
    }
  }

  isStunned(entity: 'player' | 'enemy'): boolean {
    const target = entity === 'player' ? this.state.player : this.state.enemy;
    return target.stun > 0;
  }

  private checkBattleEnd(): void {
    if (this.state.player.hp <= 0) {
      this.state.status = 'lost';
      this.state.log.push({
        turn: this.state.turn,
        actor: '系统',
        action: 'defeat',
        value: 0,
        description: `${this.state.player.name} 被击败了...`,
      });
    } else if (this.state.enemy.hp <= 0) {
      this.state.status = 'won';
      this.state.log.push({
        turn: this.state.turn,
        actor: '系统',
        action: 'victory',
        value: 0,
        description: `${this.state.enemy.name} 被击败了！`,
      });
    }
  }
}
