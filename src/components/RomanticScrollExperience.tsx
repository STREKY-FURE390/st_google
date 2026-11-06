import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Compass,
  Mountain,
  MapPin,
  ChevronDown,
  Gift,
  TreePine,
} from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface RomanticScrollExperienceProps {
  onOpenHeartTree: () => void;
  onToggleSound: () => void;
  isAudioMuted: boolean;
}

export const RomanticScrollExperience: React.FC<RomanticScrollExperienceProps> = ({
  onOpenHeartTree,
  onToggleSound,
  isAudioMuted,
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [promiseSealed, setPromiseSealed] = useState(false);
  const [celebrationConfetti, setCelebrationConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);

  // Track scroll position to highlight progress dots
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const index = Math.min(4, Math.floor((scrollY + windowHeight * 0.35) / windowHeight));
      setActiveSection(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSealPromise = (e: React.MouseEvent<HTMLButtonElement>) => {
    romanticAudio.playSingleChime(659.25);
    romanticAudio.playSingleChime(783.99);
    setPromiseSealed(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = ['#ff2d75', '#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#ffffff'];
    const newConfetti = Array.from({ length: 28 }, (_, i) => ({
      id: Date.now() + i,
      x: centerX + (Math.random() - 0.5) * 160,
      y: centerY + (Math.random() - 0.5) * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 10 + Math.random() * 14,
    }));

    setCelebrationConfetti(newConfetti);
    setTimeout(() => setCelebrationConfetti([]), 3500);
  };

  const scrollToSection = (index: number) => {
    window.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full text-white overflow-x-hidden selection:bg-pink-500/30 selection:text-pink-100">
      {/* Navigation Progress Dots */}
      <nav className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
        {[0, 1, 2, 3, 4].map((idx) => (
          <button
            key={idx}
            onClick={() => scrollToSection(idx)}
            className={`group relative flex items-center justify-center p-1.5 transition-all`}
            aria-label={`Scroll to section ${idx + 1}`}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSection === idx
                  ? 'w-3 h-3 bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.9)] scale-110'
                  : 'w-2 h-2 bg-zinc-600/60 hover:bg-pink-300/60'
              }`}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-6 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] text-pink-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {idx === 0 && 'Opening'}
              {idx === 1 && 'Part 1'}
              {idx === 2 && 'Part 2'}
              {idx === 3 && 'Her 21st'}
              {idx === 4 && 'The Promise'}
            </span>
          </button>
        ))}
      </nav>

      {/* Floating Confetti Hearts when Promise is sealed */}
      {celebrationConfetti.map((c) => (
        <div
          key={c.id}
          className="fixed pointer-events-none z-50 animate-ping"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Heart
            className="w-5 h-5 fill-current"
            style={{ color: c.color }}
          />
        </div>
      ))}

      {/* ======================================================== */}
      {/* OPENING VIEWPORT: Happy Birthday to my dearest one ❤️😘 */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 text-center snap-start">
        {/* Soft background ambient radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.14)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          {/* Subtle elegant subtitle */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-xs font-medium tracking-widest uppercase mb-6 drop-shadow-[0_2px_12px_rgba(244,114,182,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>For Your Special Day · Her 21st Birthday</span>
          </div>

          {/* Exact Opening Headline */}
          <h1 className="font-serif-romantic text-3xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight leading-tight sm:leading-snug drop-shadow-[0_4px_24px_rgba(255,105,180,0.3)]">
            Happy Birthday to my dearest one ❤️😘
          </h1>

          <p className="mt-6 text-sm sm:text-base text-pink-200/70 max-w-lg font-light leading-relaxed">
            Every step of this journey was written with love for you. Scroll slowly and read each message from the heart.
          </p>

          {/* Gentle scroll indicator */}
          <button
            onClick={() => scrollToSection(1)}
            className="mt-12 sm:mt-16 inline-flex flex-col items-center gap-2 text-pink-300/80 hover:text-pink-200 transition-colors group cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-medium">Scroll down, my love</span>
            <div className="w-8 h-8 rounded-full border border-pink-400/30 flex items-center justify-center group-hover:border-pink-400/60 group-hover:translate-y-1 transition-all">
              <ChevronDown className="w-4 h-4 text-pink-400 animate-bounce" />
            </div>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 1: “I don’t really know why I’m still with you… maybe one day I’ll understand. Whatever happens, I’ll accept it.” */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-20 text-center snap-start">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.08)_0%,rgba(0,0,0,0)_65%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-400/80 uppercase mb-6">
            <span>Part 01</span>
            <span className="text-zinc-600">·</span>
            <span>From An Honest Heart</span>
          </div>

          {/* Decorative subtle heart emblem */}
          <div className="w-12 h-12 rounded-2xl bg-pink-950/40 border border-pink-500/20 flex items-center justify-center mb-8 shadow-inner shadow-pink-500/10">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-500/30" />
          </div>

          {/* Exact Quote 1 */}
          <blockquote className="font-serif-romantic text-2xl sm:text-3xl md:text-4xl text-rose-100 font-normal leading-relaxed md:leading-relaxed drop-shadow-[0_2px_18px_rgba(244,63,94,0.2)]">
            “I don’t really know why I’m still with you… maybe one day I’ll understand. Whatever happens, I’ll accept it.”
          </blockquote>

          <div className="mt-10 flex items-center gap-3 text-xs text-zinc-500 font-light">
            <span className="w-8 h-px bg-zinc-800" />
            <span className="text-pink-300/60 font-handwriting text-lg">Honest & True</span>
            <span className="w-8 h-px bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: “Our memories are so special. They’re alive in our hearts, and I’ll always treasure them.” */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-20 text-center snap-start">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.1)_0%,rgba(0,0,0,0)_65%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-400/80 uppercase mb-6">
            <span>Part 02</span>
            <span className="text-zinc-600">·</span>
            <span>Treasured In Time</span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-pink-950/40 border border-pink-500/20 flex items-center justify-center mb-8 shadow-inner shadow-pink-500/10">
            <Sparkles className="w-6 h-6 text-pink-300" />
          </div>

          {/* Exact Quote 2 */}
          <blockquote className="font-serif-romantic text-2xl sm:text-3xl md:text-4xl text-pink-100 font-normal leading-relaxed md:leading-relaxed drop-shadow-[0_2px_18px_rgba(244,114,182,0.22)]">
            “Our memories are so special. They’re alive in our hearts, and I’ll always treasure them.”
          </blockquote>

          <div className="mt-10 flex items-center gap-3 text-xs text-zinc-500 font-light">
            <span className="w-8 h-px bg-zinc-800" />
            <span className="text-pink-300/60 font-handwriting text-lg">Never forgotten</span>
            <span className="w-8 h-px bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: “This is your 21st birthday. You can do anything you wish for—believe in yourself and follow your dreams.” */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-20 text-center snap-start">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0%,rgba(0,0,0,0)_65%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-300/80 uppercase mb-6">
            <span>Part 03</span>
            <span className="text-zinc-600">·</span>
            <span>The 21st Milestone</span>
          </div>

          {/* Large delicate numeral 21 accent */}
          <div className="relative mb-6">
            <div className="font-serif-romantic text-6xl sm:text-7xl font-bold text-pink-500/20 select-none">
              21
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift className="w-8 h-8 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
            </div>
          </div>

          {/* Exact Quote 3 */}
          <blockquote className="font-serif-romantic text-2xl sm:text-3xl md:text-4xl text-amber-100 font-normal leading-relaxed md:leading-relaxed drop-shadow-[0_2px_18px_rgba(251,191,36,0.2)]">
            “This is your 21st birthday. You can do anything you wish for—believe in yourself and follow your dreams.”
          </blockquote>

          <div className="mt-10 flex items-center gap-3 text-xs text-zinc-500 font-light">
            <span className="w-8 h-px bg-zinc-800" />
            <span className="text-amber-300/70 font-handwriting text-lg">Follow your heart</span>
            <span className="w-8 h-px bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: THE GRAND PROMISE */}
      {/* “I promise that when you turn 25, I’ll take you on a trip—to the mountains, the hills, or anywhere in the world you’d love to go.” */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 text-center snap-start">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.18)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-300 uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Part 04 · A Sacred Promise</span>
          </div>

          {/* LOVELY PINK ROUNDED CARD WITH A GENTLE GLOW (Requested by user) */}
          <div className="relative w-full rounded-3xl p-8 sm:p-12 md:p-14 bg-gradient-to-b from-pink-950/60 via-zinc-950/90 to-pink-950/60 border-2 border-pink-400/50 shadow-[0_0_60px_rgba(244,114,182,0.35),inset_0_1px_20px_rgba(255,182,193,0.15)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(244,114,182,0.5)] group">
            {/* Soft pink corner light accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-pink-300 rounded-tl-2xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-pink-300 rounded-tr-2xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-pink-300 rounded-bl-2xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-pink-300 rounded-br-2xl" />

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-medium tracking-widest uppercase mb-8 shadow-sm shadow-pink-500/20">
              <Compass className="w-3.5 h-3.5 text-pink-300 animate-spin-slow" />
              <span>Written in Stone · For When You Turn 25</span>
            </div>

            {/* EXACT TEXT 4: Keep the text exactly as written below */}
            <p className="font-serif-romantic text-2xl sm:text-3xl md:text-4xl text-pink-50 font-medium leading-relaxed drop-shadow-[0_2px_16px_rgba(244,114,182,0.3)]">
              “I promise that when you turn 25, I’ll take you on a trip—to the mountains, the hills, or anywhere in the world you’d love to go.”
            </p>

            {/* Destination icons previewing the promise */}
            <div className="mt-8 pt-8 border-t border-pink-500/20 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              <div className="p-3 rounded-2xl bg-pink-900/20 border border-pink-400/20 flex flex-col items-center gap-1.5">
                <Mountain className="w-5 h-5 text-pink-300" />
                <span className="text-[11px] text-pink-200/90 font-medium">The Mountains</span>
              </div>
              <div className="p-3 rounded-2xl bg-pink-900/20 border border-pink-400/20 flex flex-col items-center gap-1.5">
                <MapPin className="w-5 h-5 text-rose-300" />
                <span className="text-[11px] text-rose-200/90 font-medium">The Rolling Hills</span>
              </div>
              <div className="p-3 rounded-2xl bg-pink-900/20 border border-pink-400/20 flex flex-col items-center gap-1.5">
                <Compass className="w-5 h-5 text-amber-300" />
                <span className="text-[11px] text-amber-200/90 font-medium">Anywhere With You</span>
              </div>
            </div>

            {/* Interactive Promise Seal Button */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={handleSealPromise}
                className="px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:via-rose-400 hover:to-pink-500 text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_0_25px_rgba(244,114,182,0.6)] hover:shadow-[0_0_35px_rgba(244,114,182,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${promiseSealed ? 'fill-white text-white' : 'fill-pink-200 text-pink-200'} animate-pulse`} />
                <span>{promiseSealed ? 'Promise Sealed With Love ❤️' : 'Accept & Seal This Promise 💖'}</span>
              </button>

              {promiseSealed && (
                <p className="text-xs text-pink-300/80 font-handwriting text-base animate-fade-in">
                  Marked forever in our story. I can’t wait for our adventure. ✨
                </p>
              )}
            </div>
          </div>

          {/* Transition Button to Blooming Heart Tree Finale */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenHeartTree}
              className="px-5 py-2.5 rounded-full bg-zinc-900/90 hover:bg-pink-950/60 border border-pink-500/30 text-pink-200 hover:text-white text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <TreePine className="w-4 h-4 text-pink-400" />
              <span>Explore The Blooming Heart Tree & Greeting ✨</span>
            </button>

            <button
              onClick={onToggleSound}
              className="px-4 py-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{isAudioMuted ? '🎵 Play Birthday Melody' : '🔇 Mute Melody'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
