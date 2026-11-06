import React, { useEffect, useRef } from 'react';

export const FloatingPetalsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Heart petal colors: romantic blush, soft rose, crimson, pastel pink
    const colors = [
      'rgba(255, 182, 193, 0.45)', // light pink
      'rgba(244, 114, 182, 0.35)', // pink-400
      'rgba(251, 113, 133, 0.35)', // rose-400
      'rgba(225, 29, 72, 0.25)',   // crimson subtle
      'rgba(254, 205, 211, 0.5)',  // rose-200
    ];

    interface Petal {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      rot: number;
      rotSpeed: number;
      swaySpeed: number;
      swayPhase: number;
      color: string;
      opacity: number;
    }

    const petals: Petal[] = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.5 + Math.random() * 0.8,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      swaySpeed: 0.01 + Math.random() * 0.02,
      swayPhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.3 + Math.random() * 0.5,
    }));

    const drawPetalHeart = (c: CanvasRenderingContext2D, s: number) => {
      c.beginPath();
      c.moveTo(0, -s * 0.35);
      c.bezierCurveTo(-s * 0.5, -s * 0.95, -s * 1.1, -s * 0.2, -s * 0.8, s * 0.3);
      c.bezierCurveTo(-s * 0.55, s * 0.65, -s * 0.2, s * 0.85, 0, s);
      c.bezierCurveTo(s * 0.2, s * 0.85, s * 0.55, s * 0.65, s * 0.8, s * 0.3);
      c.bezierCurveTo(s * 1.1, -s * 0.2, s * 0.5, -s * 0.95, 0, -s * 0.35);
      c.closePath();
    };

    let time = 0;
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.vy;
        p.x += Math.sin(time * 2 + p.swayPhase) * 0.6 + p.vx;
        p.rot += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(255, 105, 180, 0.3)';
        ctx.shadowBlur = 4;
        drawPetalHeart(ctx, p.size);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};
