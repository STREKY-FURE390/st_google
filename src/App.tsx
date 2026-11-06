import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeartTreeCanvas } from './components/HeartTreeCanvas';
import { RomanticLeftMessages } from './components/RomanticLeftMessages';
import { TypewriterMessage } from './components/TypewriterMessage';
import { CustomizeModal } from './components/CustomizeModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { FloatingPetalsBackground } from './components/FloatingPetalsBackground';
import { romanticAudio } from './utils/audio';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  Heart,
  Sparkles,
  BookOpen,
  Tv,
} from 'lucide-react';

const DEFAULT_GREETING_LINES = [
  'Happy Birthday, Angel! ❤️',
  "The world is lucky to have someone like you. You know, you're truly a beautiful person.",
  "I don't wish to be with you; I just wish to see you every day. Honestly, that's more than enough for me.",
];

export default function App() {
  // Mode: 'typewriter' (Reel Mode) starts FIRST, then automatically transitions to 'story' (Her Story)
  const [activeMode, setActiveMode] = useState<'typewriter' | 'story'>('typewriter');
  const [greetingLines, setGreetingLines] = useState<string[]>(DEFAULT_GREETING_LINES);
  const [recipientName, setRecipientName] = useState('');
  const [growthProgress, setGrowthProgress] = useState(0);
  const [shiftProgress, setShiftProgress] = useState(0);
  const [isTypingStarted, setIsTypingStarted] = useState(false);
  const [isFullyBloomed, setIsFullyBloomed] = useState(false);
  const [autoTransitioning, setAutoTransitioning] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [confettiBurst, setConfettiBurst] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const activeModeRef = useRef(activeMode);
  activeModeRef.current = activeMode;
  const isTypingStartedRef = useRef(false);

  // URL parameters support
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to');
      const msgParam = params.get('msg');
      const modeParam = params.get('mode');

      if (modeParam === 'story') {
        setActiveMode('story');
      }

      if (msgParam) {
        const parsed = JSON.parse(msgParam);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGreetingLines(parsed);
        }
      } else if (toParam) {
        setRecipientName(toParam);
        setGreetingLines([
          `Happy Birthday, ${toParam}! ❤️`,
          "The world is lucky to have someone like you. You know, you're truly a beautiful person.",
          "I don't wish to be with you; I just wish to see you every day. Honestly, that's more than enough for me.",
        ]);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Growth animation loop: stable identity that never causes infinite re-render loops
  const startTreeAnimation = useCallback((modeOverride?: 'typewriter' | 'story') => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const currentMode = modeOverride || activeModeRef.current;
    setGrowthProgress(0);
    setShiftProgress(currentMode === 'story' ? 1 : 0);
    isTypingStartedRef.current = false;
    setIsTypingStarted(false);
    setIsFullyBloomed(false);
    setAutoTransitioning(false);
    startTimeRef.current = Date.now();

    const growDuration = 3200;
    const shiftDuration = currentMode === 'story' ? 0 : 1000;
    const totalDuration = growDuration + shiftDuration;

    const updateLoop = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentGrowth = Math.min(1, elapsed / growDuration);
      setGrowthProgress(currentGrowth);

      if (currentMode === 'story') {
        setShiftProgress(1); // Keep tree positioned on the right side
      } else {
        if (elapsed > growDuration) {
          const currentShift = Math.min(1, (elapsed - growDuration) / shiftDuration);
          setShiftProgress(currentShift);
        } else {
          setShiftProgress(0);
        }
      }

      if (elapsed >= totalDuration * 0.95 && !isTypingStartedRef.current) {
        isTypingStartedRef.current = true;
        setIsTypingStarted(true);
      }

      if (elapsed < totalDuration) {
        animFrameRef.current = requestAnimationFrame(updateLoop);
      } else {
        setGrowthProgress(1);
        setShiftProgress(1);
        setIsFullyBloomed(true);
        if (!isTypingStartedRef.current) {
          isTypingStartedRef.current = true;
          setIsTypingStarted(true);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
  }, []);

  // First: Reel mode starts on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startTreeAnimation('typewriter');
    }, 120);
    return () => clearTimeout(timer);
  }, [startTreeAnimation]);

  const handleReplay = useCallback(() => {
    startTreeAnimation();
    if (!isAudioMuted) {
      romanticAudio.play();
    }
  }, [startTreeAnimation, isAudioMuted]);

  // Automatic transition from Reel Mode to Her Story upon typewriter finish
  const handleTypewriterComplete = useCallback(() => {
    setAutoTransitioning(true);
    romanticAudio.playSingleChime(659.25);
    romanticAudio.playSingleChime(783.99);
    const timer = setTimeout(() => {
      setActiveMode('story');
      setAutoTransitioning(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  // Global typing listener supporting 'ᴛʏᴘᴇ ꜱᴏᴍᴇᴛʜɪɴɢ ᴛᴏ ꜱᴛᴀʀᴛ'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      romanticAudio.playSingleChime(580 + Math.random() * 200);
      handleReplay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReplay]);

  // Start background music on first user interaction
  useEffect(() => {
    const startAudioOnInteraction = () => {
      romanticAudio.play().then(() => {
        setIsAudioMuted(false);
        setShowAudioPrompt(false);
      }).catch(() => {});
    };

    window.addEventListener('click', startAudioOnInteraction, { once: true });
    window.addEventListener('keydown', startAudioOnInteraction, { once: true });
    window.addEventListener('touchstart', startAudioOnInteraction, { once: true });

    return () => {
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
    };
  }, []);

  const handleToggleSound = () => {
    setShowAudioPrompt(false);
    const unmuted = romanticAudio.toggleMute();
    setIsAudioMuted(!unmuted);
  };

  const handleSealPromiseConfetti = () => {
    const colors = ['#ff2d75', '#f43f5e', '#fb7185', '#fda4af', '#facc15', '#ffffff'];
    const burst = Array.from({ length: 36 }, (_, i) => ({
      id: Date.now() + i,
      x: window.innerWidth * 0.45 + (Math.random() - 0.5) * 300,
      y: window.innerHeight * 0.55 + (Math.random() - 0.5) * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfettiBurst(burst);
    setTimeout(() => setConfettiBurst([]), 3500);
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Ambient background petals */}
      <FloatingPetalsBackground />

      {/* Confetti hearts on promise sealed */}
      {confettiBurst.map((c) => (
        <div
          key={c.id}
          className="fixed pointer-events-none z-50 animate-ping"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Heart className="w-5 h-5 fill-current" style={{ color: c.color }} />
        </div>
      ))}

      {/* Top Header Bar */}
      <header className="relative z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/60 backdrop-blur-md border-b border-pink-500/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" />
          <span className="font-semibold text-white text-xs sm:text-sm tracking-wide">
            ʙɪʀᴛʜᴅᴀʏ ᴡɪꜱʜ ꜰᴏʀ ʜᴇʀ
          </span>
          <span className="hidden sm:inline text-zinc-600">·</span>
          <span className="hidden sm:inline text-pink-300/80 text-xs tracking-wider">
            21ꜱᴛ ᴄᴇʟᴇʙʀᴀᴛɪᴏɴ
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs">
            <button
              onClick={() => setActiveMode('story')}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                activeMode === 'story'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ʜᴇʀ ꜱᴛᴏʀʏ</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('typewriter');
                handleReplay();
              }}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                activeMode === 'typewriter'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>ʀᴇᴇʟ ᴍᴏᴅᴇ</span>
            </button>
          </div>

          {/* Music Toggle */}
          <button
            onClick={handleToggleSound}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
              isAudioMuted
                ? 'bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-500'
                : 'bg-pink-950/60 border-pink-500/50 text-pink-300 shadow-sm shadow-pink-500/20'
            }`}
            title={isAudioMuted ? 'Play romantic music' : 'Mute music'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />}
            <span className="hidden xs:inline">{isAudioMuted ? 'ᴍᴜꜱɪᴄ' : 'ᴍᴜꜱɪᴄ ᴏɴ'}</span>
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-pink-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Replay tree growth"
          >
            <RotateCcw className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">ʀᴇᴘʟᴀʏ</span>
          </button>

          {/* Standalone Code */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:border-pink-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View standalone HTML/CSS/JS code"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">ᴄᴏᴅᴇ</span>
          </button>
        </div>
      </header>

      {/* Audio hint banner if still muted */}
      {showAudioPrompt && isAudioMuted && (
        <div
          onClick={handleToggleSound}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-pink-950/80 border border-pink-500/30 text-pink-200 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-pink-900/30 backdrop-blur-md animate-bounce"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-300" />
          <span>ᴛᴀᴘ ᴀɴʏᴡʜᴇʀᴇ ᴛᴏ ᴘʟᴀʏ ʙᴀᴄᴋɢʀᴏᴜɴᴅ ᴍᴜꜱɪᴄ 🎵</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: TEXT ON THE LEFT SIDE, PINK TREE ON THE RIGHT SIDE        */}
      {/* ========================================================================= */}
      <main className="relative flex-1 w-full h-[calc(100vh-55px)] flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Fullscreen Canvas Background: Draws the baseline across the entire bottom and anchors the tree on the right */}
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
          <HeartTreeCanvas
            growthProgress={growthProgress}
            shiftProgress={shiftProgress}
            isFullyBloomed={isFullyBloomed}
            onBloomComplete={() => setIsFullyBloomed(true)}
            interactive={true}
          />
        </div>

        {/* LEFT COLUMN: THE ROMANTIC BIRTHDAY TEXT (Opening + 4 Graceful Sections) */}
        {/* Sits on the left side, allowing natural scroll & stepping while tree remains on the right */}
        <div className="relative z-20 w-full md:w-[48%] lg:w-[45%] xl:w-[42%] h-[46%] md:h-full flex flex-col justify-start md:justify-center px-4 sm:px-8 md:pl-10 lg:pl-14 xl:pl-16 pt-2 md:pt-4 pb-4 pointer-events-auto">
          {activeMode === 'story' ? (
            <div className="w-full h-full max-w-xl flex flex-col justify-center">
              <RomanticLeftMessages
                onSealPromise={handleSealPromiseConfetti}
                onTriggerStart={handleReplay}
              />
            </div>
          ) : (
            /* Reel Typewriter Mode */
            <div className="w-full max-w-md my-auto flex flex-col justify-center">
              <TypewriterMessage
                lines={greetingLines}
                isStarted={isTypingStarted}
                typingSpeed={46}
                useSmallCaps={true}
                onComplete={handleTypewriterComplete}
              />

              {autoTransitioning && (
                <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs shadow-md shadow-pink-900/30 animate-pulse w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-spin" />
                  <span>ᴛʀᴀɴꜱɪᴛɪᴏɴɪɴɢ ᴛᴏ ʜᴇʀ ꜱᴛᴏʀʏ... 💖</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN AREA: Dedicated transparent click/interaction zone for the tree */}
        <div className="relative z-20 w-full md:w-[52%] lg:w-[55%] xl:w-[58%] h-[54%] md:h-full pointer-events-none flex items-end justify-center pb-6">
          <div className="text-[11px] text-pink-200/50 pointer-events-auto cursor-pointer hover:text-pink-200 transition-colors tracking-wider">
            ᴛᴀᴘ ᴛʀᴇᴇ ᴛᴏ ꜱʜᴏᴡᴇʀ ᴘᴇᴛᴀʟꜱ ✨
          </div>
        </div>
      </main>

      {/* Standalone Code Modal */}
      <StandaloneExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        lines={greetingLines}
      />
    </div>
  );
}
