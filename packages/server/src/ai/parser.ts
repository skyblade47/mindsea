import type { SkillVariant } from '@mindsea/shared';

export function sanitizeJson(text: string): string {
  // Remove markdown code block fences if present
  let cleaned = text.trim();
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }
  return cleaned;
}

export function parseSkillVariants(rawResponse: string): Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[] {
  const jsonStr = sanitizeJson(rawResponse);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('AI 返回的 JSON 格式无效，无法解析技能变体');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI 返回的数据不是数组格式');
  }

  const variants: Omit<SkillVariant, 'perUsePower' | 'totalOutput' | 'mpPerUse' | 'basePower'>[] = [];

  for (const item of parsed) {
    if (!item.name || !item.description || !item.evaluation || typeof item.usageCount !== 'number') {
      throw new Error('技能变体缺少必要字段');
    }
    variants.push({
      id: item.id || `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: item.name,
      description: item.description,
      evaluation: item.evaluation,
      usageCount: item.usageCount,
      naturalLanguageBonus: item.naturalLanguageBonus ?? 1.0,
    });
  }

  return variants;
}

export function parseNarrative(rawResponse: string): string {
  const jsonStr = sanitizeJson(rawResponse);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // If not valid JSON, treat the raw string as the narrative text
    return rawResponse.trim();
  }

  if (typeof parsed === 'object' && parsed !== null && 'narrative' in (parsed as Record<string, unknown>)) {
    return (parsed as Record<string, string>).narrative;
  }

  return String(parsed);
}