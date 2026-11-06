import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Mountain,
  MapPin,
  Compass,
  ChevronDown,
  ChevronUp,
  Gift,
  Keyboard,
  Type,
} from 'lucide-react';
import { romanticAudio } from '../utils/audio';
import { toSmallCaps } from '../utils/smallCaps';

interface RomanticLeftMessagesProps {
  onSealPromise?: () => void;
  activeSectionIndex?: number;
  onSectionChange?: (index: number) => void;
  onTriggerStart?: () => void;
}

export const RomanticLeftMessages: React.FC<RomanticLeftMessagesProps> = ({
  onSealPromise,
  activeSectionIndex,
  onSectionChange,
  onTriggerStart,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPromiseSealed, setIsPromiseSealed] = useState(false);
  const [useSmallCaps, setUseSmallCaps] = useState(true);
  const [typedInput, setTypedInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sectionsCount = 5; // 0: Opening, 1: Part 1, 2: Part 2, 3: Part 3, 4: The Promise

  const fmt = (text: string): string => {
    return useSmallCaps ? toSmallCaps(text) : text;
  };

  const setSection = (idx: number) => {
    const clamped = Math.max(0, Math.min(sectionsCount - 1, idx));
    setCurrentSection(clamped);
    if (onSectionChange) onSectionChange(clamped);

    const el = document.getElementById(`msg-section-${clamped}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => setSection(currentSection + 1);
  const handlePrev = () => setSection(currentSection - 1);

  // Sync external index if provided
  useEffect(() => {
    if (activeSectionIndex !== undefined && activeSectionIndex !== currentSection) {
      setCurrentSection(activeSectionIndex);
    }
  }, [activeSectionIndex]);

  const handleSeal = () => {
    romanticAudio.playSingleChime(659.25);
    romanticAudio.playSingleChime(783.99);
    setIsPromiseSealed(true);
    if (onSealPromise) onSealPromise();
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedInput(val);
    romanticAudio.playSingleChime(520 + Math.random() * 300);
    if (onTriggerStart) {
      onTriggerStart();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* Interactive 'ᴛʏᴘᴇ ꜱᴏᴍᴇᴛʜɪɴɢ ᴛᴏ ꜱᴛᴀʀᴛ' Prompt & Style Bar */}
      <div className="shrink-0 mb-2 p-2.5 sm:p-3 rounded-2xl bg-zinc-950/80 border border-pink-500/25 backdrop-blur-md shadow-md shadow-pink-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
            <Keyboard className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <label
              htmlFor="type-start-input"
              className="block text-[11px] sm:text-xs font-semibold text-pink-300 tracking-wider truncate cursor-pointer"
            >
              ᴛʏᴘᴇ ꜱᴏᴍᴇᴛʜɪɴɢ ᴛᴏ ꜱᴛᴀʀᴛ
            </label>
            <input
              id="type-start-input"
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={handleTypingChange}
              placeholder="ᴛʏᴘᴇ ʜᴇʀᴇ ᴏʀ ᴘʀᴇꜱꜱ ᴀɴʏ ᴋᴇʏ..."
              className="w-full bg-black/40 border border-pink-500/20 rounded-md px-2 py-0.5 text-xs text-pink-100 placeholder-pink-400/40 focus:outline-none focus:border-pink-400 transition-colors"
            />
          </div>
        </div>

        {/* Font Style Toggle Button */}
        <button
          onClick={() => setUseSmallCaps(!useSmallCaps)}
          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
            useSmallCaps
              ? 'bg-pink-950/70 border-pink-500/50 text-pink-200 shadow-sm shadow-pink-500/20'
              : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-400 hover:text-white'
          }`}
          title="Toggle Small Caps font style"
        >
          <Type className="w-3 h-3 text-pink-400" />
          <span>{useSmallCaps ? 'ᴛʏᴘᴇ ꜱᴛʏʟᴇ: ᴏɴ' : 'Type Style: Standard'}</span>
        </button>
      </div>

      {/* Scrollable Narrative Message Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-y-auto pr-1 sm:pr-2 scroll-smooth space-y-10 sm:space-y-14 py-2 md:py-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(244,114,182,0.3) transparent' }}
      >
        {/* ======================================================== */}
        {/* OPENING: Happy Birthday to my dearest one ❤️😘 */}
        {/* ======================================================== */}
        <section
          id="msg-section-0"
          className="min-h-[200px] sm:min-h-[240px] flex flex-col justify-center text-left py-3 transition-all duration-500"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-medium tracking-widest uppercase mb-3.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{fmt('Her 21st Birthday · A Love Letter')}</span>
          </div>

          {/* EXACT TEXT OPENING: Keep the text exactly as written below */}
          <h1 className="font-serif-romantic text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] text-white font-normal tracking-tight leading-snug drop-shadow-[0_2px_16px_rgba(255,105,180,0.3)]">
            {fmt('Happy Birthday to my dearest one')} ❤️😘
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-pink-200/70 font-light leading-relaxed max-w-md">
            {fmt('As you scroll down, each piece of my heart will reveal itself one by one.')}
          </p>

          <button
            onClick={() => setSection(1)}
            className="mt-5 inline-flex items-center gap-2 text-xs text-pink-300/80 hover:text-pink-200 transition-colors w-fit font-medium cursor-pointer"
          >
            <span>{fmt('Read first part')}</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </section>

        {/* ======================================================== */}
        {/* SECTION 1: “I don’t really know why I’m still with you… maybe one day I’ll understand. Whatever happens, I’ll accept it.” */}
        {/* ======================================================== */}
        <section
          id="msg-section-1"
          className="min-h-[200px] sm:min-h-[240px] flex flex-col justify-center text-left py-3 transition-all duration-500"
        >
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-400/80 uppercase mb-3">
            <span>{fmt('Part 01')}</span>
            <span className="text-zinc-600">·</span>
            <span>{fmt('Honest Heart')}</span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-pink-500/20 backdrop-blur-md shadow-lg shadow-pink-950/20">
            {/* EXACT TEXT 1: Keep the text exactly as written below */}
            <blockquote className="font-serif-romantic text-lg sm:text-xl md:text-2xl text-rose-100 font-normal leading-relaxed">
              “{fmt('I don’t really know why I’m still with you… maybe one day I’ll understand. Whatever happens, I’ll accept it.')}”
            </blockquote>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-pink-300/60 font-handwriting text-base">{fmt('Unfiltered love')}</span>
              <button
                onClick={() => setSection(2)}
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{fmt('Next part')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: “Our memories are so special. They’re alive in our hearts, and I’ll always treasure them.” */}
        {/* ======================================================== */}
        <section
          id="msg-section-2"
          className="min-h-[200px] sm:min-h-[240px] flex flex-col justify-center text-left py-3 transition-all duration-500"
        >
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-400/80 uppercase mb-3">
            <span>{fmt('Part 02')}</span>
            <span className="text-zinc-600">·</span>
            <span>{fmt('Precious Memories')}</span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-pink-500/20 backdrop-blur-md shadow-lg shadow-pink-950/20">
            {/* EXACT TEXT 2: Keep the text exactly as written below */}
            <blockquote className="font-serif-romantic text-lg sm:text-xl md:text-2xl text-pink-100 font-normal leading-relaxed">
              “{fmt('Our memories are so special. They’re alive in our hearts, and I’ll always treasure them.')}”
            </blockquote>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-pink-300/60 font-handwriting text-base">{fmt('Held forever')}</span>
              <button
                onClick={() => setSection(3)}
                className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{fmt('Her 21st')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: “This is your 21st birthday. You can do anything you wish for—believe in yourself and follow your dreams.” */}
        {/* ======================================================== */}
        <section
          id="msg-section-3"
          className="min-h-[200px] sm:min-h-[240px] flex flex-col justify-center text-left py-3 transition-all duration-500"
        >
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-300/80 uppercase mb-3">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>{fmt('Part 03 · Her 21st Milestone')}</span>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg shadow-amber-950/20">
            {/* EXACT TEXT 3: Keep the text exactly as written below */}
            <blockquote className="font-serif-romantic text-lg sm:text-xl md:text-2xl text-amber-100 font-normal leading-relaxed">
              “{fmt('This is your 21st birthday. You can do anything you wish for—believe in yourself and follow your dreams.')}”
            </blockquote>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <span className="text-amber-300/70 font-handwriting text-base">{fmt('Believe in you')}</span>
              <button
                onClick={() => setSection(4)}
                className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{fmt('The Promise')}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: THE GRAND PROMISE */}
        {/* “I promise that when you turn 25, I’ll take you on a trip—to the mountains, the hills, or anywhere in the world you’d love to go.” */}
        {/* Lovely pink rounded card with a gentle glow */}
        {/* ======================================================== */}
        <section
          id="msg-section-4"
          className="min-h-[280px] flex flex-col justify-center text-left py-3 transition-all duration-500"
        >
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-pink-300 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{fmt('Part 04 · The Sacred Promise')}</span>
          </div>

          {/* LOVELY PINK ROUNDED CARD WITH A GENTLE GLOW */}
          <div className="relative p-6 sm:p-7 md:p-8 rounded-3xl bg-gradient-to-b from-pink-950/60 via-zinc-950/90 to-pink-950/70 border-2 border-pink-400/50 shadow-[0_0_40px_rgba(244,114,182,0.35),inset_0_1px_15px_rgba(255,182,193,0.15)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_55px_rgba(244,114,182,0.5)]">
            {/* Soft pink corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-pink-300 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-pink-300 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-pink-300 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-pink-300 rounded-br-xl" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-200 text-[11px] font-medium tracking-wider uppercase mb-4">
              <Compass className="w-3 h-3 text-pink-300" />
              <span>{fmt('For When You Turn 25')}</span>
            </div>

            {/* EXACT TEXT 4: Keep the text exactly as written below */}
            <p className="font-serif-romantic text-lg sm:text-xl md:text-2xl text-pink-50 font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(244,114,182,0.3)]">
              “{fmt('I promise that when you turn 25, I’ll take you on a trip—to the mountains, the hills, or anywhere in the world you’d love to go.')}”
            </p>

            {/* Destination badges */}
            <div className="mt-5 pt-4 border-t border-pink-500/20 grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-pink-900/25 border border-pink-400/20 flex flex-col items-center text-center gap-1">
                <Mountain className="w-4 h-4 text-pink-300" />
                <span className="text-[10px] text-pink-200/90 font-medium">{fmt('The Mountains')}</span>
              </div>
              <div className="p-2 rounded-xl bg-pink-900/25 border border-pink-400/20 flex flex-col items-center text-center gap-1">
                <MapPin className="w-4 h-4 text-rose-300" />
                <span className="text-[10px] text-rose-200/90 font-medium">{fmt('The Hills')}</span>
              </div>
              <div className="p-2 rounded-xl bg-pink-900/25 border border-pink-400/20 flex flex-col items-center text-center gap-1">
                <Compass className="w-4 h-4 text-amber-300" />
                <span className="text-[10px] text-amber-200/90 font-medium">{fmt('Anywhere')}</span>
              </div>
            </div>

            {/* Seal Promise Button */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                onClick={handleSeal}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-400 hover:via-rose-400 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,114,182,0.6)] hover:shadow-[0_0_30px_rgba(244,114,182,0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${isPromiseSealed ? 'fill-white text-white' : 'fill-pink-200 text-pink-200'} animate-pulse`} />
                <span>{isPromiseSealed ? fmt('Promise Sealed Forever ❤️') : fmt('Accept & Seal This Promise 💖')}</span>
              </button>

              {isPromiseSealed && (
                <span className="text-xs text-pink-300/80 font-handwriting text-sm">
                  {fmt('Marked in our hearts forever ✨')}
                </span>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Narrative Section Stepper & Indicator Controls at the bottom of the left column */}
      <div className="pt-2.5 border-t border-pink-500/15 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              onClick={() => setSection(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentSection === idx ? 'w-6 bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`Jump to section ${idx + 1}`}
            />
          ))}
          <span className="ml-2 font-mono text-[11px] text-zinc-500">
            {currentSection === 0 ? fmt('Intro') : `${currentSection}/4`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentSection === 0}
            className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Previous section"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentSection === sectionsCount - 1}
            className="p-1 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next section"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
