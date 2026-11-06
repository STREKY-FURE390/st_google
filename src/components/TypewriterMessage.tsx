import React, { useEffect, useState, useRef, useMemo } from 'react';
import { toSmallCaps } from '../utils/smallCaps';

interface TypewriterMessageProps {
  lines: string[];
  isStarted: boolean;
  onComplete?: () => void;
  typingSpeed?: number; // ms per character
  useSmallCaps?: boolean;
}

export const TypewriterMessage: React.FC<TypewriterMessageProps> = ({
  lines: inputLines,
  isStarted,
  onComplete,
  typingSpeed = 48,
  useSmallCaps = true,
}) => {
  // Memoize mapped lines so reference is completely stable across re-renders
  const lines = useMemo(() => {
    return useSmallCaps ? inputLines.map((l) => toSmallCaps(l)) : inputLines;
  }, [inputLines, useSmallCaps]);

  const linesKey = useMemo(() => lines.join('___'), [lines]);

  const [displayedLines, setDisplayedLines] = useState<string[]>(() => lines.map(() => ''));
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track previous state to prevent redundant setState calls and eliminate infinite update loops
  const prevResetKeyRef = useRef<string>('');

  // Reset when isStarted turns false, or when lines content changes while not running
  useEffect(() => {
    const resetKey = `${isStarted ? '1' : '0'}_${linesKey}`;
    if (!isStarted && prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setDisplayedLines(lines.map(() => ''));
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setIsFinished(false);
    }
  }, [isStarted, linesKey, lines]);

  useEffect(() => {
    if (!isStarted || isFinished) return;

    if (currentLineIndex >= lines.length) {
      setIsFinished(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    const targetLine = lines[currentLineIndex];
    if (typeof targetLine === 'undefined') return;

    // Check if current line is complete
    if (currentCharIndex >= targetLine.length) {
      const linePause =
        targetLine.includes('💕') || targetLine.includes('🎈') || targetLine.includes('❤️') || targetLine.includes('🌟')
          ? 320
          : 200;

      const timeout = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, linePause);
      return () => clearTimeout(timeout);
    }

    // Step through Unicode emojis correctly
    const nextCharSlice = getNextCharacterOrEmoji(targetLine, currentCharIndex);
    const nextStep = nextCharSlice.length || 1;

    let delay = typingSpeed;
    if (nextCharSlice === '.' || nextCharSlice === ',' || nextCharSlice === ';') {
      delay += 90;
    }

    const timeout = setTimeout(() => {
      setDisplayedLines((prev) => {
        const next = [...prev];
        next[currentLineIndex] = targetLine.slice(0, currentCharIndex + nextStep);
        return next;
      });
      setCurrentCharIndex((prev) => prev + nextStep);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isStarted, currentLineIndex, currentCharIndex, linesKey, lines, isFinished, typingSpeed]);

  return (
    <div className="font-sans text-left transition-all duration-300">
      <div className="space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base lg:text-[1.05rem] font-medium tracking-wide">
        {lines.map((line, idx) => {
          const isCurrentActiveLine = currentLineIndex === idx && !isFinished;
          const isPastLine = idx < currentLineIndex || isFinished;
          const text = displayedLines[idx] || '';

          if (idx > currentLineIndex && !isPastLine && text.length === 0) {
            return (
              <div key={idx} className="h-4 sm:h-5 md:h-6 opacity-0">
                &nbsp;
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="min-h-[1.4rem] sm:min-h-[1.65rem] md:min-h-[1.9rem] text-white/95"
            >
              <span className="leading-relaxed drop-shadow-[0_2px_8px_rgba(255,105,180,0.12)] inline">
                {text}
                {/* Blinking cursor following the typed text inline */}
                {isCurrentActiveLine && (
                  <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4.5 ml-1 bg-pink-400 animate-pulse align-middle" />
                )}
              </span>
            </div>
          );
        })}

        {/* Finished steady cursor */}
        {isFinished && (
          <div className="pt-2 text-xs text-pink-300/70 font-normal flex items-center gap-1.5">
            <span>✨ Wishing you the happiest birthday</span>
          </div>
        )}
      </div>
    </div>
  );
};

function getNextCharacterOrEmoji(str: string, index: number): string {
  if (index >= str.length) return '';
  const code = str.codePointAt(index);
  if (code !== undefined && code > 0xffff) {
    return str.slice(index, index + 2);
  }
  return str.slice(index, index + 1);
}
