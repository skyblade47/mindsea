import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: 'hp' | 'mp' | 'time' | 'exp';
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const COLOR_MAP: Record<string, { bar: string; bg: string; text: string }> = {
  hp: { bar: 'bg-gradient-to-r from-red-600 to-red-400', bg: 'bg-red-950/50', text: 'text-red-300' },
  mp: { bar: 'bg-gradient-to-r from-blue-600 to-cyan', bg: 'bg-blue-950/50', text: 'text-cyan' },
  time: { bar: 'bg-gradient-to-r from-gold-dark to-gold', bg: 'bg-yellow-950/50', text: 'text-gold-light' },
  exp: { bar: 'bg-gradient-to-r from-purple-600 to-purple-400', bg: 'bg-purple-950/50', text: 'text-purple-300' },
};

const SIZE_MAP: Record<string, { bar: string; text: string }> = {
  sm: { bar: 'h-1.5', text: 'text-xs' },
  md: { bar: 'h-2.5', text: 'text-xs' },
  lg: { bar: 'h-4', text: 'text-sm' },
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  color = 'hp',
  label,
  showLabel = true,
  size = 'md',
}) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const colors = COLOR_MAP[color] || COLOR_MAP.hp;
  const sizing = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between mb-1 ${sizing.text} ${colors.text}`}>
          <span>{label || color.toUpperCase()}</span>
          <span className="font-mono">
            {current}/{max}
          </span>
        </div>
      )}
      <div className={`w-full ${sizing.bar} ${colors.bg} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || color}
        />
      </div>
    </div>
  );
};

export default ProgressBar;