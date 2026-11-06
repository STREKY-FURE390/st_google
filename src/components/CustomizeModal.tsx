import React, { useState } from 'react';
import { X, RotateCcw, Share2, Check, Sparkles } from 'lucide-react';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: string[];
  onSave: (newLines: string[]) => void;
  recipientName: string;
  onSaveRecipient: (name: string) => void;
}

const DEFAULT_LINES = [
  'Hey you 💕',
  'Happy Birthday 🎈',
  'May God bless you 🍀',
  'And give u many happiness 💕',
  "Just saying... you're pretty",
  'awesome ❤️',
  'Sending good vibes and maybe a',
  'wish 🌟',
  'Hope u have a great day today 💕',
];

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  lines,
  onSave,
  recipientName,
  onSaveRecipient,
}) => {
  const [currentLines, setCurrentLines] = useState<string[]>(lines);
  const [currentName, setCurrentName] = useState(recipientName);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleLineChange = (index: number, val: string) => {
    const updated = [...currentLines];
    updated[index] = val;
    setCurrentLines(updated);
  };

  const handleResetToDefault = () => {
    setCurrentLines(DEFAULT_LINES);
    setCurrentName('');
  };

  const handleApply = () => {
    let finalLines = [...currentLines];
    if (currentName.trim()) {
      finalLines[0] = `Hey ${currentName.trim()} 💕`;
    }
    onSave(finalLines);
    onSaveRecipient(currentName);
    onClose();
  };

  const handleCopyShareLink = () => {
    const params = new URLSearchParams();
    if (currentName.trim()) {
      params.set('to', currentName.trim());
    }
    params.set('msg', JSON.stringify(currentLines));
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-pink-500/20 rounded-2xl p-6 text-white shadow-2xl shadow-pink-500/10">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Personalize Birthday Greeting</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-pink-300 uppercase tracking-wider mb-1.5">
              Recipient Name (Optional)
            </label>
            <input
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder="e.g. Jessica, Sarah, Bestie, Mom..."
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Greeting Message Lines (9 Lines)
            </label>
            <div className="space-y-2">
              {currentLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-pink-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Original
            </button>
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 text-xs text-pink-300 hover:text-pink-200 bg-pink-950/40 hover:bg-pink-900/50 border border-pink-800/40 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors shadow-lg shadow-pink-600/30"
            >
              Save & Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
