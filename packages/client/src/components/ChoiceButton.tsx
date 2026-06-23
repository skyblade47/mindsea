import React from 'react';
import type { Choice, AdventureNodeType } from '@mindsea/shared';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  disabled?: boolean;
}

const NODE_TYPE_LABELS: Record<AdventureNodeType, string> = {
  combat: '战斗',
  event: '事件',
  forge: '铸造',
  rest: '休整',
  elite: '精英',
  boss: '首领',
  treasure: '宝藏',
};

const NODE_TYPE_COLORS: Record<AdventureNodeType, string> = {
  combat: 'border-red-700/50 hover:border-red-500 text-red-300',
  event: 'border-cyan-dark/50 hover:border-cyan text-cyan',
  forge: 'border-gold-dark/50 hover:border-gold text-gold-light',
  rest: 'border-green-800/50 hover:border-green-600 text-green-300',
  elite: 'border-purple-700/50 hover:border-purple-500 text-purple-300',
  boss: 'border-red-800/50 hover:border-red-600 text-red-400 bg-gradient-to-r from-red-950/30',
  treasure: 'border-yellow-700/50 hover:border-yellow-500 text-yellow-300',
};

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onClick, disabled = false }) => {
  return (
    <button
      onClick={() => onClick(choice)}
      disabled={disabled}
      className={`
        w-full text-left px-5 py-4 rounded-xl border transition-all duration-300
        bg-deep-800/60 backdrop-blur-sm
        ${NODE_TYPE_COLORS[choice.nodeType] || 'border-mist-700 hover:border-mist-500 text-mist-300'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-deep-700/60 hover:scale-[1.01] active:scale-[0.99]'}
      `}
      role="button"
      aria-label={`选择: ${choice.text}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex-1 text-sm font-medium">{choice.text}</span>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded border border-current opacity-60">
          {NODE_TYPE_LABELS[choice.nodeType]}
        </span>
      </div>
      {choice.rewards && (
        <div className="mt-2 flex gap-3 text-xs text-mist-500">
          {choice.rewards.exp && <span>经验 +{choice.rewards.exp}</span>}
          {choice.rewards.fragments && <span>碎片 +{choice.rewards.fragments}</span>}
          {choice.rewards.timeCost && <span>时间 -{choice.rewards.timeCost}s</span>}
        </div>
      )}
    </button>
  );
};

export default ChoiceButton;