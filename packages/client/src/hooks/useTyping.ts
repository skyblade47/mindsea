import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypingOptions {
  text: string;
  speed?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

interface UseTypingReturn {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  skip: () => void;
  reset: () => void;
}

export function useTyping({
  text,
  speed = 40,
  enabled = true,
  onComplete,
}: UseTypingOptions): UseTypingReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTyping = useCallback(() => {
    if (!enabled || !text) {
      setDisplayedText(text ?? '');
      setIsComplete(true);
      setIsTyping(false);
      return;
    }

    clearTimer();
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearTimer();
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
  }, [text, speed, enabled, clearTimer, onComplete]);

  const skip = useCallback(() => {
    clearTimer();
    setDisplayedText(text ?? '');
    setIsTyping(false);
    setIsComplete(true);
    indexRef.current = text?.length ?? 0;
    onComplete?.();
  }, [text, clearTimer, onComplete]);

  const reset = useCallback(() => {
    clearTimer();
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(false);
    setIsComplete(false);
  }, [clearTimer]);

  useEffect(() => {
    startTyping();
    return clearTimer;
  }, [text, startTyping, clearTimer]);

  return {
    displayedText,
    isTyping,
    isComplete,
    skip,
    reset,
  };
}