import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2 } from 'lucide-react';

interface StandaloneExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: string[];
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({
  isOpen,
  onClose,
  lines,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const standaloneHtml = generateStandaloneHtml(lines);

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birthday_heart_tree.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Standalone Single-File Source Code</h3>
              <p className="text-xs text-zinc-400">
                Self-contained HTML + CSS + JavaScript. Double-click to run in any browser offline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4">
          <div className="relative max-h-72 overflow-y-auto rounded-lg bg-zinc-900 border border-zinc-800 p-3 font-mono text-xs text-zinc-300">
            <pre className="whitespace-pre overflow-x-auto">{standaloneHtml.slice(0, 1500)}... (truncated view)</pre>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs text-zinc-500">Includes audio synth, 3D heart canopy, and typewriter text</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .html File
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-pink-600/30"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Full Code!' : 'Copy Source Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateStandaloneHtml(lines: string[]): string {
  const jsonLines = JSON.stringify(lines);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Birthday Wish - Heart Tree</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000000;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    #stage { position: relative; width: 100%; height: 100%; overflow: hidden; }
    #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 10; }
    canvas { display: block; touch-action: none; cursor: pointer; }
    #message-container { position: absolute; inset: 0; z-index: 20; pointer-events: none; display: flex; }
    @media (min-width: 768px) {
      #message-container { align-items: center; padding-left: 8%; width: 48%; }
    }
    @media (max-width: 767px) {
      #message-container { align-items: flex-start; padding: 24px 20px 0; width: 100%; height: 38%; }
    }
    .text-box { pointer-events: auto; max-width: 440px; }
    .line {
      font-size: clamp(0.95rem, 2vw, 1.15rem);
      line-height: 1.75;
      font-weight: 500;
      min-height: 1.75em;
      display: flex;
      align-items: baseline;
      color: rgba(255, 255, 255, 0.95);
      letter-spacing: 0.02em;
    }
    .cursor {
      display: inline-block;
      width: 7px;
      height: 17px;
      background: #f472b6;
      margin-left: 5px;
      transform: translateY(2px);
      animation: blink 0.85s infinite;
    }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .controls { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 30; }
    button.btn {
      background: rgba(24, 24, 27, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e4e4e7;
      padding: 7px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    button.btn:hover { background: rgba(244, 114, 182, 0.25); border-color: #f472b6; color: #fff; }
  </style>
</head>
<body>
  <div id="stage">
    <div id="canvas-container">
      <canvas id="treeCanvas"></canvas>
    </div>
    <div id="message-container">
      <div class="text-box" id="textBox"></div>
    </div>
  </div>

  <div class="controls">
    <button class="btn" id="replayBtn">↺ Replay</button>
    <button class="btn" id="soundBtn">🎵 Play Music</button>
  </div>

  <script>
    const LINES = ${jsonLines};
    const PALETTE = ['#ff2d75', '#f43f5e', '#ec4899', '#e11d48', '#db2777', '#fb923c', '#f97316', '#fbbf24', '#facc15', '#fde047', '#fda4af', '#fbcfe8', '#fff1f2', '#fed7aa'];

    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');
    const textBox = document.getElementById('textBox');

    let growthProgress = 0, shiftProgress = 0, isTypingStarted = false;
    let leaves = [], petals = [], settledPetals = [];
    let groundY = 0, treeScale = 1, isMobile = false;
    let targetTiltX = 0, targetTiltY = 0, tiltX = 0, tiltY = 0;

    let audioCtx = null, audioPlaying = false, audioMuted = true;
    const melody = [
      { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.3 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
      { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.3 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
      { f: 261.63, d: 0.4 }, { f: 261.63, d: 0.3 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.1 },
      { f: 466.16, d: 0.4 }, { f: 466.16, d: 0.3 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.8 }
    ];
    let noteIdx = 0;

    function initAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }
    function playTone(freq, dur) {
      if (!audioCtx || audioMuted) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const overtone = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t);
      overtone.type = 'triangle'; overtone.frequency.setValueAtTime(freq * 2.02, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.5);
      osc.connect(gain); overtone.connect(gain); gain.connect(audioCtx.destination);
      osc.start(t); overtone.start(t); osc.stop(t + dur * 1.6); overtone.stop(t + dur * 0.9);
    }
    function stepMelody() {
      if (!audioPlaying) return;
      const n = melody[noteIdx];
      playTone(n.f, n.d);
      noteIdx = (noteIdx + 1) % melody.length;
      setTimeout(stepMelody, Math.max(350, n.d * 850));
    }

    let currentLine = 0, currentChar = 0, lineElements = [];
    function setupMessage() {
      textBox.innerHTML = '';
      lineElements = LINES.map((_, i) => {
        const div = document.createElement('div');
        div.className = 'line line-' + i;
        textBox.appendChild(div);
        return div;
      });
      currentLine = 0; currentChar = 0;
    }

    function typeStep() {
      if (!isTypingStarted) { setTimeout(typeStep, 60); return; }
      if (currentLine >= LINES.length) return;
      const lineStr = LINES[currentLine];
      if (currentChar >= lineStr.length) {
        const prevCursor = lineElements[currentLine].querySelector('.cursor');
        if (prevCursor) prevCursor.remove();
        currentLine++; currentChar = 0;
        setTimeout(typeStep, 320);
        return;
      }
      let step = 1;
      const code = lineStr.codePointAt(currentChar);
      if (code > 0xffff) step = 2;
      currentChar += step;
      lineElements[currentLine].innerHTML = lineStr.slice(0, currentChar) + '<span class="cursor"></span>';
      setTimeout(typeStep, 48);
    }

    function drawHeart(c, s) {
      c.beginPath();
      c.moveTo(0, -s * 0.35);
      c.bezierCurveTo(-s * 0.5, -s * 0.95, -s * 1.1, -s * 0.2, -s * 0.8, s * 0.3);
      c.bezierCurveTo(-s * 0.55, s * 0.65, -s * 0.2, s * 0.85, 0, s);
      c.bezierCurveTo(s * 0.2, s * 0.85, s * 0.55, s * 0.65, s * 0.8, s * 0.3);
      c.bezierCurveTo(s * 1.1, -s * 0.2, s * 0.5, -s * 0.95, 0, -s * 0.35);
      c.closePath();
    }

    function initLeaves() {
      leaves = [];
      for (let i = 0; i < 820; i++) {
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        const r = Math.pow(Math.random(), 0.56);
        const nx = (hx * r + (Math.random() - 0.5) * 1.7) / 16;
        const ny = ((hy + 2) * r - 2 + (Math.random() - 0.5) * 1.7) / 17;
        const nz = (Math.random() - 0.5) * 2;
        const dist = Math.hypot(nx, ny - 0.7);
        leaves.push({
          nx, ny, nz,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          size: (7.5 + Math.random() * 8.5) * (0.85 + (nz + 1) * 0.22),
          rot: (Math.random() - 0.5) * 1.4,
          appearProgress: Math.min(0.98, 0.30 + dist * 0.38 + Math.random() * 0.18),
          bloomAnim: 0,
          swayPhase: Math.random() * Math.PI * 2
        });
      }
      leaves.sort((a,b) => a.nz - b.nz);
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      isMobile = w < 768;
      groundY = h * 0.76;
      treeScale = Math.min((w * (isMobile ? 0.88 : 0.48)) / 440, (groundY * 0.94) / 520, 1.25);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
      targetTiltX = ((e.clientX / window.innerWidth) - 0.5) * 16;
      targetTiltY = ((e.clientY / window.innerHeight) - 0.5) * 10;
    });

    canvas.addEventListener('click', (e) => {
      initAudio();
      playTone(659.25, 0.4);
      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14;
        petals.push({
          x: e.offsetX, y: e.offsetY,
          vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2 - 1,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          size: 10 + Math.random() * 6, rot: Math.random() * 3, opacity: 1
        });
      }
    });

    let time = 0, animStartTime = Date.now();
    function loop() {
      time += 0.016;
      const elapsed = Date.now() - animStartTime;
      growthProgress = Math.min(1, elapsed / 3200);
      shiftProgress = elapsed > 3200 ? Math.min(1, (elapsed - 3200) / 1000) : 0;
      if (elapsed >= 4100 && !isTypingStarted) isTypingStarted = true;

      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h);

      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;

      const startX = w * 0.5;
      const targetX = isMobile ? w * 0.5 : w * 0.70;
      const easeShift = shiftProgress < 0.5 ? 4 * shiftProgress * shiftProgress * shiftProgress : 1 - Math.pow(-2 * shiftProgress + 2, 3) / 2;
      const curTreeX = startX + (targetX - startX) * easeShift;

      const canopyCenterY = groundY - 330 * treeScale;
      const radX = 175 * treeScale, radY = 185 * treeScale;

      if (growthProgress < 0.12) {
        const seedScale = Math.max(0, 1 - growthProgress / 0.12);
        ctx.save(); ctx.translate(curTreeX, groundY - 8 * treeScale);
        ctx.fillStyle = '#ff2d75'; ctx.shadowColor = '#ff2d75'; ctx.shadowBlur = 8;
        drawHeart(ctx, 10 * treeScale * seedScale); ctx.fill(); ctx.restore();
      }

      // Stem & Branches (trunk grows 0 to 0.22, branches grow 0.18 to 0.46)
      ctx.fillStyle = '#f9a8d4'; ctx.strokeStyle = '#f9a8d4'; ctx.lineCap = 'round';
      const trunkTop = canopyCenterY + radX * 0.65;
      const trunkProg = Math.min(1, growthProgress / 0.22);
      if (trunkProg > 0) {
        ctx.beginPath();
        const curTop = groundY + (trunkTop - groundY) * trunkProg;
        ctx.moveTo(curTreeX - 13 * treeScale, groundY);
        ctx.quadraticCurveTo(curTreeX - 16 * treeScale, groundY, curTreeX - 13 * treeScale, groundY - 6 * treeScale);
        ctx.lineTo(curTreeX - 8 * treeScale, curTop);
        ctx.lineTo(curTreeX + 8 * treeScale, curTop);
        ctx.lineTo(curTreeX + 13 * treeScale, groundY - 6 * treeScale);
        ctx.quadraticCurveTo(curTreeX + 16 * treeScale, groundY, curTreeX + 13 * treeScale, groundY);
        ctx.closePath(); ctx.fill();
      }

      if (growthProgress > 0.18) {
        const bp = Math.min(1, (growthProgress - 0.18) / 0.28);
        ctx.lineWidth = 7 * treeScale;
        ctx.beginPath(); ctx.moveTo(curTreeX, trunkTop);
        ctx.quadraticCurveTo(curTreeX - radX * 0.3, trunkTop - 10, curTreeX - radX * 0.5 * bp, (trunkTop + (canopyCenterY + radX * 0.1 - trunkTop) * bp));
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(curTreeX, trunkTop);
        ctx.quadraticCurveTo(curTreeX + radX * 0.3, trunkTop - 10, curTreeX + radX * 0.5 * bp, (trunkTop + (canopyCenterY + radX * 0.1 - trunkTop) * bp));
        ctx.stroke();
      }

      // Heart leaves bloom strictly AFTER the stem has formed (>= 0.48)
      if (growthProgress >= 0.48) {
        leaves.forEach(leaf => { renderLeaf(leaf, curTreeX, canopyCenterY, radX, radY); });
      } else {
        leaves.forEach(leaf => { leaf.bloomAnim = 0; });
      }

      function renderLeaf(leaf, tx, ty, rx, ry) {
        if (growthProgress >= leaf.appearProgress) leaf.bloomAnim = Math.min(1, leaf.bloomAnim + 0.05);
        if (leaf.bloomAnim <= 0) return;
        const s = leaf.bloomAnim < 0.7 ? (leaf.bloomAnim / 0.7) * 1.15 : 1.15 - ((leaf.bloomAnim - 0.7) / 0.3) * 0.15;
        const lx = tx + leaf.nx * rx * (1 + leaf.nz * 0.15) + tiltX * (1 + leaf.nz * 0.5);
        const ly = ty + leaf.ny * ry * (1 + leaf.nz * 0.15) + tiltY * (1 + leaf.nz * 0.5);
        ctx.save(); ctx.translate(lx, ly);
        ctx.rotate(leaf.rot + Math.sin(time * 2 + leaf.swayPhase) * 0.07);
        ctx.fillStyle = leaf.color;
        drawHeart(ctx, leaf.size * s * treeScale);
        ctx.fill(); ctx.restore();
      }

      settledPetals.forEach(sp => {
        ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(sp.rot); ctx.fillStyle = sp.color;
        drawHeart(ctx, sp.size * treeScale); ctx.fill(); ctx.restore();
      });

      if (growthProgress > 0.75 && Math.random() < 0.2) {
        const l = leaves[Math.floor(Math.random() * leaves.length)];
        petals.push({
          x: curTreeX + l.nx * radX, y: canopyCenterY + l.ny * radY,
          vx: (Math.random() - 0.5) * 0.6 + 0.2, vy: 1 + Math.random(),
          color: l.color, size: l.size * 0.85, rot: 0, opacity: 1
        });
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i]; p.x += Math.sin(time * 2) * 0.8 + p.vx; p.y += p.vy;
        if (p.y >= groundY - 2) {
          p.y = groundY - 2; p.opacity -= 0.01;
          if (settledPetals.length < 40 && Math.random() < 0.25) {
            settledPetals.push({ x: p.x, y: groundY - 1, rot: p.rot, color: p.color, size: p.size * 0.75 });
          }
        }
        if (p.opacity <= 0) { petals.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
        drawHeart(ctx, p.size * treeScale); ctx.fill(); ctx.restore();
      }

      ctx.restore();
      requestAnimationFrame(loop);
    }

    function start() {
      resize(); initLeaves(); setupMessage();
      animStartTime = Date.now(); isTypingStarted = false;
      typeStep();
    }

    let bgAudio = new Audio('./assets/aistudio/WhatsApp_Audio_2026-11-06_at_10.52.09_AM_284cb740.mpeg');
    bgAudio.loop = true; bgAudio.volume = 0.75;

    document.getElementById('replayBtn').addEventListener('click', start);
    document.getElementById('soundBtn').addEventListener('click', () => {
      audioMuted = !audioMuted;
      if (!audioMuted) {
        bgAudio.play().catch(() => { initAudio(); audioPlaying = true; stepMelody(); });
      } else {
        bgAudio.pause();
      }
      document.getElementById('soundBtn').innerText = audioMuted ? '🔇 Sound Off' : '🎵 Music On';
    });

    start(); loop();
  </script>
</body>
</html>`;
}
