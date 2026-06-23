import React from 'react';
import type { SkillVariant, Skill, SkillDimension } from '@mindsea/shared';

type SkillCardData = SkillVariant | Skill;

interface SkillCardProps {
  skill: SkillCardData;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  showSlotIndex?: boolean;
}

const DIMENSION_LABELS: Record<SkillDimension, string> = {
  power: '威力',
  scope: '范围',
  duration: '持续',
  flexibility: '灵活',
  uniqueness: '独特',
  synergy: '协同',
};

const DIMENSION_COLORS: Record<SkillDimension, string> = {
  power: 'bg-red-500',
  scope: 'bg-purple-500',
  duration: 'bg-green-500',
  flexibility: 'bg-cyan',
  uniqueness: 'bg-yellow-500',
  synergy: 'bg-pink-500',
};

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  selected = false,
  disabled = false,
  onSelect,
  showSlotIndex = false,
}) => {
  const isSkill = 'slotIndex' in skill;

  return (
    <div
      className={`
        card relative transition-all duration-300 cursor-pointer
        ${selected ? 'border-gold/60 card-glow scale-[1.02]' : 'hover:border-mist-500'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
      onClick={disabled ? undefined : onSelect}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && onSelect && (e.key === 'Enter' || e.key === ' ')) {
          onSelect();
        }
      }}
      aria-disabled={disabled}
      aria-selected={selected}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-gold-light font-semibold text-base">{skill.name}</h3>
          {isSkill && showSlotIndex && (
            <span className="text-xs text-mist-500">
              槽位 #{(skill as Skill).slotIndex + 1}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-mist-400">MP {skill.mpPerUse}</div>
          <div className="text-xs text-mist-500">使用 {skill.usageCount} 次</div>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-mist-300 mb-4 line-clamp-2">{skill.description}</p>

      {/* 6维雷达图（水平条形图） */}
      <div className="space-y-1.5 mb-4">
        {Object.keys(DIMENSION_LABELS).map((dim) => {
          const dimension = dim as SkillDimension;
          const value = skill.evaluation[dimension];
          const percentage = Math.min((value / 10) * 100, 100);

          return (
            <div key={dimension} className="flex items-center gap-2">
              <span className="text-xs text-mist-400 w-8 shrink-0">
                {DIMENSION_LABELS[dimension]}
              </span>
              <div className="flex-1 h-2 bg-deep-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${DIMENSION_COLORS[dimension]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-mist-500 w-4 text-right font-mono">{value}</span>
            </div>
          );
        })}
      </div>

      {/* 底部数据 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-deep-900/50 rounded-lg py-1.5">
          <div className="text-xs text-mist-500">单次</div>
          <div className="text-sm text-mist-200 font-mono">{skill.perUsePower}</div>
        </div>
        <div className="bg-deep-900/50 rounded-lg py-1.5">
          <div className="text-xs text-mist-500">总输出</div>
          <div className="text-sm text-cyan font-mono">{skill.totalOutput}</div>
        </div>
        <div className="bg-deep-900/50 rounded-lg py-1.5">
          <div className="text-xs text-mist-500">基础</div>
          <div className="text-sm text-mist-200 font-mono">{skill.basePower}</div>
        </div>
      </div>

      {/* 选择按钮 */}
      {onSelect && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            selected
              ? 'bg-gold text-deep-900'
              : 'bg-deep-700 border border-mist-600 text-mist-300 hover:border-gold/50 hover:text-gold-light'
          }`}
        >
          {selected ? '已选择' : '选择'}
        </button>
      )}
    </div>
  );
};

export default SkillCard;