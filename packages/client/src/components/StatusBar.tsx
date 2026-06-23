import React from 'react';
import type { Skill } from '@mindsea/shared';

interface StatusBarProps {
  timeRemaining: number;
  level: number;
  skillPoints: number;
  maxSlots: number;
  currentSkills: Skill[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const StatusBar: React.FC<StatusBarProps> = ({
  timeRemaining,
  level,
  skillPoints,
  maxSlots,
  currentSkills,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-deep-800/80 backdrop-blur-md border-b border-mist-700/30">
      {/* 时间 */}
      <div className="flex items-center gap-2">
        <span className="text-cyan text-sm font-mono">{formatTime(timeRemaining)}</span>
        <span className="text-mist-500 text-xs">剩余</span>
      </div>

      {/* 等级 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-gold-light text-sm font-semibold">Lv.{level}</span>
        </div>

        {/* SP */}
        <div className="flex items-center gap-1">
          <span className="text-cyan-light text-xs">SP</span>
          <span className="text-mist-200 text-sm font-mono">{skillPoints}</span>
        </div>

        {/* 技能槽位 */}
        <div className="flex items-center gap-1">
          <span className="text-mist-400 text-xs">技能</span>
          <span className="text-mist-200 text-sm font-mono">
            {currentSkills.length}/{maxSlots}
          </span>
        </div>
      </div>

      {/* 技能槽位指示器 */}
      <div className="flex gap-1">
        {Array.from({ length: maxSlots }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i < currentSkills.length
                ? 'bg-gold shadow-sm shadow-gold/50'
                : 'bg-deep-600 border border-mist-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusBar;