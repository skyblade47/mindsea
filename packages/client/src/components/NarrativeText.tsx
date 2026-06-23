import React from 'react';
import { useTyping } from '../hooks/useTyping';

interface NarrativeTextProps {
  text: string;
  speed?: number;
  enabled?: boolean;
  className?: string;
  onComplete?: () => void;
}

const NarrativeText: React.FC<NarrativeTextProps> = ({
  text,
  speed = 40,
  enabled = true,
  className = '',
  onComplete,
}) => {
  const { displayedText, isTyping, skip } = useTyping({
    text,
    speed,
    enabled,
    onComplete,
  });

  return (
    <div
      className={`narrative-text relative ${className}`}
      onClick={isTyping ? skip : undefined}
      role="region"
      aria-label="叙事文本"
    >
      <p className="leading-relaxed whitespace-pre-wrap">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-5 bg-gold ml-0.5 animate-typing-cursor align-middle" />
        )}
      </p>
      {isTyping && (
        <button
          onClick={skip}
          className="mt-2 text-xs text-mist-500 hover:text-mist-300 transition-colors"
          aria-label="跳过打字动画"
        >
          点击跳过
        </button>
      )}
    </div>
  );
};

export default NarrativeText;