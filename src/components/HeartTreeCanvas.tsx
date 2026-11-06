import React, { useEffect, useRef, useState, useCallback } from 'react';
import { romanticAudio } from '../utils/audio';

interface HeartTreeCanvasProps {
  growthProgress: number; // 0 to 1 (controls trunk and leaves bloom)
  shiftProgress: number; // 0 to 1 (controls translation from center to right side)
  isFullyBloomed: boolean;
  onBloomComplete?: () => void;
  interactive?: boolean;
}

interface Leaf {
  nx: number;
  ny: number;
  nz: number;
  color: string;
  size: number;
  baseRot: number;
  rotSpeed: number;
  swayPhase: number;
  appearProgress: number;
  bloomAnim: number;
  hasBloomed: boolean;
  zOrder: number;
}

interface FallingPetal {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rot: number;
  rotSpeed: number;
  swayPhase: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface BranchSegment {
  startX: number;
  startY: number;
  cp1X: number;
  cp1Y: number;
  cp2X: number;
  cp2Y: number;
  endX: number;
  endY: number;
  startWidth: number;
  endWidth: number;
  appearStart: number;
  appearEnd: number;
  isMainTrunk?: boolean;
}

// Colors directly matched from the video: hot pink, magenta, coral orange, golden yellow, blush pink, and pearl
const LEAF_PALETTE = [
  '#ff2d75', // Hot pink / magenta
  '#f43f5e', // Rose red
  '#ec4899', // Bubblegum pink
  '#e11d48', // Deep crimson
  '#db2777', // Deep rose
  '#fb923c', // Sunset coral/orange
  '#f97316', // Warm tangerine
  '#fbbf24', // Golden yellow
  '#facc15', // Vibrant sunflower yellow
  '#fde047', // Soft yellow highlight
  '#fda4af', // Soft baby pink
  '#fbcfe8', // Pale blush
  '#fff1f2', // Pearly pink white
  '#fed7aa', // Soft peach
];

// Plump heart shape path
const drawHeartPath = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.35);
  ctx.bezierCurveTo(-s * 0.5, -s * 0.95, -s * 1.1, -s * 0.2, -s * 0.8, s * 0.3);
  ctx.bezierCurveTo(-s * 0.55, s * 0.65, -s * 0.2, s * 0.85, 0, s);
  ctx.bezierCurveTo(s * 0.2, s * 0.85, s * 0.55, s * 0.65, s * 0.8, s * 0.3);
  ctx.bezierCurveTo(s * 1.1, -s * 0.2, s * 0.5, -s * 0.95, 0, -s * 0.35);
  ctx.closePath();
};

export const HeartTreeCanvas: React.FC<HeartTreeCanvasProps> = ({
  growthProgress,
  shiftProgress,
  isFullyBloomed,
  onBloomComplete,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tiltRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });
  const leavesRef = useRef<Leaf[]>([]);
  const fallingPetalsRef = useRef<FallingPetal[]>([]);
  const groundSettledPetalsRef = useRef<Array<{ x: number; y: number; rot: number; color: string; size: number }>>([]);
  const branchSegmentsRef = useRef<BranchSegment[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const groundYRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 });
  const treeDimensionsRef = useRef<{ width: number; height: number; scale: number }>({
    width: 600,
    height: 700,
    scale: 1,
  });

  const [hasNotifiedComplete, setHasNotifiedComplete] = useState(false);

  // Generate 800+ leaves filling the downward-pointing heart canopy densely
  const generateLeaves = useCallback((count = 820): Leaf[] => {
    const list: Leaf[] = [];

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // r scales the point towards the visual center of mass of the heart
      const r = Math.pow(Math.random(), 0.56);
      const jitterX = (Math.random() - 0.5) * 1.7;
      const jitterY = (Math.random() - 0.5) * 1.7;

      const nx = (hx * r + jitterX) / 16;
      const ny = ((hy + 2) * r - 2 + jitterY) / 17;

      const nz = (Math.random() - 0.5) * 2;

      const baseSize = 7.5 + Math.random() * 8.5;
      const depthScale = 0.85 + (nz + 1) * 0.22;
      const size = baseSize * depthScale;

      const colorIndex = Math.floor(Math.random() * LEAF_PALETTE.length);
      const color = LEAF_PALETTE[colorIndex];

      const distFromBottom = Math.hypot(nx, ny - 0.7);
      // Strictly start after the stem and branches are fully created (at 0.48)
      const appearProgress = Math.min(0.98, 0.48 + distFromBottom * 0.32 + Math.random() * 0.18);

      list.push({
        nx,
        ny,
        nz,
        color,
        size,
        baseRot: (Math.random() - 0.5) * 1.4,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        appearProgress,
        bloomAnim: 0,
        hasBloomed: false,
        zOrder: nz,
      });
    }

    list.sort((a, b) => a.zOrder - b.zOrder);
    return list;
  }, []);

  // Generate branches calibrated to the heart canopy (stem finishes by 0.48)
  const generateBranches = useCallback(
    (groundY: number, canopyCenterY: number, canopyRadiusX: number, scale: number): BranchSegment[] => {
      const branches: BranchSegment[] = [];
      const trunkTopY = canopyCenterY + canopyRadiusX * 0.65;
      const trunkMidY = groundY - (groundY - trunkTopY) * 0.5;

      // 1. Main Trunk (0.0 to 0.22)
      branches.push({
        startX: 0,
        startY: groundY,
        cp1X: -4 * scale,
        cp1Y: groundY - (groundY - trunkTopY) * 0.3,
        cp2X: 3 * scale,
        cp2Y: trunkMidY,
        endX: 0,
        endY: trunkTopY,
        startWidth: 26 * scale,
        endWidth: 15 * scale,
        appearStart: 0.0,
        appearEnd: 0.22,
        isMainTrunk: true,
      });

      // 2. Primary Limbs splitting into the heart (0.18 to 0.36)
      const leftMainEnd = {
        x: -canopyRadiusX * 0.5,
        y: canopyCenterY + canopyRadiusX * 0.1,
      };
      branches.push({
        startX: 0,
        startY: trunkTopY,
        cp1X: -canopyRadiusX * 0.15,
        cp1Y: trunkTopY - 15 * scale,
        cp2X: -canopyRadiusX * 0.35,
        cp2Y: trunkTopY - 20 * scale,
        endX: leftMainEnd.x,
        endY: leftMainEnd.y,
        startWidth: 14 * scale,
        endWidth: 7 * scale,
        appearStart: 0.18,
        appearEnd: 0.36,
      });

      const rightMainEnd = {
        x: canopyRadiusX * 0.5,
        y: canopyCenterY + canopyRadiusX * 0.1,
      };
      branches.push({
        startX: 0,
        startY: trunkTopY,
        cp1X: canopyRadiusX * 0.15,
        cp1Y: trunkTopY - 15 * scale,
        cp2X: canopyRadiusX * 0.35,
        cp2Y: trunkTopY - 20 * scale,
        endX: rightMainEnd.x,
        endY: rightMainEnd.y,
        startWidth: 14 * scale,
        endWidth: 7 * scale,
        appearStart: 0.18,
        appearEnd: 0.36,
      });

      const centerMainEnd = {
        x: 0,
        y: canopyCenterY - canopyRadiusX * 0.1,
      };
      branches.push({
        startX: 0,
        startY: trunkTopY,
        cp1X: 2 * scale,
        cp1Y: trunkTopY - 25 * scale,
        cp2X: -3 * scale,
        cp2Y: canopyCenterY + canopyRadiusX * 0.2,
        endX: centerMainEnd.x,
        endY: centerMainEnd.y,
        startWidth: 12 * scale,
        endWidth: 5.5 * scale,
        appearStart: 0.22,
        appearEnd: 0.38,
      });

      // 3. Secondary Branches into lobes (finishing by 0.46 so stem is complete before leaves)
      branches.push({
        startX: leftMainEnd.x,
        startY: leftMainEnd.y,
        cp1X: leftMainEnd.x - canopyRadiusX * 0.15,
        cp1Y: leftMainEnd.y - canopyRadiusX * 0.2,
        cp2X: leftMainEnd.x - canopyRadiusX * 0.1,
        cp2Y: canopyCenterY - canopyRadiusX * 0.45,
        endX: -canopyRadiusX * 0.52,
        endY: canopyCenterY - canopyRadiusX * 0.5,
        startWidth: 6.5 * scale,
        endWidth: 2.5 * scale,
        appearStart: 0.28,
        appearEnd: 0.42,
      });

      branches.push({
        startX: leftMainEnd.x,
        startY: leftMainEnd.y,
        cp1X: leftMainEnd.x + canopyRadiusX * 0.1,
        cp1Y: leftMainEnd.y - canopyRadiusX * 0.15,
        cp2X: -canopyRadiusX * 0.2,
        cp2Y: canopyCenterY - canopyRadiusX * 0.25,
        endX: -canopyRadiusX * 0.22,
        endY: canopyCenterY - canopyRadiusX * 0.4,
        startWidth: 5.5 * scale,
        endWidth: 2 * scale,
        appearStart: 0.30,
        appearEnd: 0.44,
      });

      branches.push({
        startX: rightMainEnd.x,
        startY: rightMainEnd.y,
        cp1X: rightMainEnd.x + canopyRadiusX * 0.15,
        cp1Y: rightMainEnd.y - canopyRadiusX * 0.2,
        cp2X: rightMainEnd.x + canopyRadiusX * 0.1,
        cp2Y: canopyCenterY - canopyRadiusX * 0.45,
        endX: canopyRadiusX * 0.52,
        endY: canopyCenterY - canopyRadiusX * 0.5,
        startWidth: 6.5 * scale,
        endWidth: 2.5 * scale,
        appearStart: 0.28,
        appearEnd: 0.42,
      });

      branches.push({
        startX: rightMainEnd.x,
        startY: rightMainEnd.y,
        cp1X: rightMainEnd.x - canopyRadiusX * 0.1,
        cp1Y: rightMainEnd.y - canopyRadiusX * 0.15,
        cp2X: canopyRadiusX * 0.2,
        cp2Y: canopyCenterY - canopyRadiusX * 0.25,
        endX: canopyRadiusX * 0.22,
        endY: canopyCenterY - canopyRadiusX * 0.4,
        startWidth: 5.5 * scale,
        endWidth: 2 * scale,
        appearStart: 0.30,
        appearEnd: 0.44,
      });

      branches.push({
        startX: centerMainEnd.x,
        startY: centerMainEnd.y,
        cp1X: -canopyRadiusX * 0.08,
        cp1Y: centerMainEnd.y - canopyRadiusX * 0.15,
        cp2X: -canopyRadiusX * 0.1,
        cp2Y: canopyCenterY - canopyRadiusX * 0.4,
        endX: -canopyRadiusX * 0.08,
        endY: canopyCenterY - canopyRadiusX * 0.55,
        startWidth: 4.5 * scale,
        endWidth: 1.8 * scale,
        appearStart: 0.32,
        appearEnd: 0.46,
      });

      branches.push({
        startX: centerMainEnd.x,
        startY: centerMainEnd.y,
        cp1X: canopyRadiusX * 0.08,
        cp1Y: centerMainEnd.y - canopyRadiusX * 0.15,
        cp2X: canopyRadiusX * 0.1,
        cp2Y: canopyCenterY - canopyRadiusX * 0.4,
        endX: canopyRadiusX * 0.08,
        endY: canopyCenterY - canopyRadiusX * 0.55,
        startWidth: 4.5 * scale,
        endWidth: 1.8 * scale,
        appearStart: 0.32,
        appearEnd: 0.46,
      });

      return branches;
    },
    []
  );

  useEffect(() => {
    leavesRef.current = generateLeaves(820);
  }, [generateLeaves]);

  // Handle window resizing and canvas configuration
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      containerSizeRef.current = { width, height };

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const isMobile = width < 768;
      isMobileRef.current = isMobile;

      // Ground line: 76% down the viewport
      const groundY = height * 0.76;
      groundYRef.current = groundY;

      // Fit calculation: Ensure complete tree (canopy + trunk) is visible
      const availableHeight = groundY * 0.94;
      const availableWidth = isMobile ? width * 0.88 : width * 0.48;
      const baseStandardHeight = 520;
      const baseStandardWidth = 440;

      const scale = Math.min(availableWidth / baseStandardWidth, availableHeight / baseStandardHeight, 1.25);
      const canopyRadiusX = 175 * scale;
      const canopyCenterY = groundY - 330 * scale;

      treeDimensionsRef.current = {
        width: canopyRadiusX * 2,
        height: 380 * scale,
        scale,
      };

      branchSegmentsRef.current = generateBranches(groundY, canopyCenterY, canopyRadiusX, scale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generateBranches]);

  // Pointer move tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    tiltRef.current.targetX = nx * 14;
    tiltRef.current.targetY = ny * 10;
  };

  const handlePointerLeave = () => {
    tiltRef.current.targetX = 0;
    tiltRef.current.targetY = 0;
  };

  // Click on tree spawns floating heart burst
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    romanticAudio.playSingleChime(659.25);
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5;
      const speed = 1.6 + Math.random() * 2.4;
      fallingPetalsRef.current.push({
        x: clickX,
        y: clickY,
        z: (Math.random() - 0.5) * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color: LEAF_PALETTE[Math.floor(Math.random() * LEAF_PALETTE.length)],
        size: 9 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        swayPhase: Math.random() * Math.PI,
        opacity: 1,
        life: 0,
        maxLife: 150 + Math.random() * 60,
      });
    }
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      // Smooth tilt dampening
      tiltRef.current.currentX += (tiltRef.current.targetX - tiltRef.current.currentX) * 0.08;
      tiltRef.current.currentY += (tiltRef.current.targetY - tiltRef.current.currentY) * 0.08;
      const tiltX = tiltRef.current.currentX;
      const tiltY = tiltRef.current.currentY;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const groundY = groundYRef.current;
      const isMobile = isMobileRef.current;

      // In the video: Tree starts at center (50% X) and smoothly shifts to right (70% X)
      // On mobile portrait, tree remains centered so both top message and tree fit without clipping
      const startCenterX = width * 0.5;
      const targetRightX = isMobile ? width * 0.5 : width * 0.70;

      // Smooth cubic easing for tree translation
      const easeP =
        shiftProgress < 0.5
          ? 4 * shiftProgress * shiftProgress * shiftProgress
          : 1 - Math.pow(-2 * shiftProgress + 2, 3) / 2;

      const currentTreeBaseX = startCenterX + (targetRightX - startCenterX) * easeP;

      const { scale } = treeDimensionsRef.current;
      const canopyRadiusX = 175 * scale;
      const canopyRadiusY = 185 * scale;
      const canopyCenterY = groundY - 330 * scale;

      // 1. Ambient glow behind the tree canopy
      if (growthProgress > 0.3) {
        const glowAlpha = Math.min(0.26, (growthProgress - 0.3) * 0.4);
        const glowGrad = ctx.createRadialGradient(
          currentTreeBaseX + tiltX * 0.5,
          canopyCenterY + tiltY * 0.5,
          20 * scale,
          currentTreeBaseX + tiltX * 0.5,
          canopyCenterY + tiltY * 0.5,
          canopyRadiusX * 1.5
        );
        glowGrad.addColorStop(0, `rgba(255, 105, 180, ${glowAlpha})`);
        glowGrad.addColorStop(0.5, `rgba(244, 63, 94, ${glowAlpha * 0.35})`);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(currentTreeBaseX + tiltX * 0.5, canopyCenterY + tiltY * 0.5, canopyRadiusX * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Crisp white baseline as seen in the video
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Initial Heart Seed at center bottom (seen in the video right as growth starts)
      if (growthProgress < 0.12) {
        const seedScale = Math.max(0, 1 - growthProgress / 0.12);
        ctx.save();
        ctx.translate(currentTreeBaseX, groundY - 8 * scale);
        ctx.fillStyle = '#ff2d75';
        ctx.shadowColor = '#ff2d75';
        ctx.shadowBlur = 8;
        drawHeartPath(ctx, 10 * scale * seedScale);
        ctx.fill();
        ctx.restore();
      }

      // Helper function to render an individual leaf
      const renderSingleLeaf = (leaf: Leaf) => {
        if (leaf.bloomAnim <= 0) return;

        const animScale =
          leaf.bloomAnim < 0.7
            ? (leaf.bloomAnim / 0.7) * 1.15
            : 1.15 - ((leaf.bloomAnim - 0.7) / 0.3) * 0.15;

        const depthFactor = 1 + leaf.nz * 0.15;
        const leaf3DX = leaf.nx * canopyRadiusX * depthFactor;
        const leaf3DY = leaf.ny * canopyRadiusY * depthFactor;

        const parallaxX = tiltX * (1 + leaf.nz * 0.5);
        const parallaxY = tiltY * (1 + leaf.nz * 0.5);

        const drawX = currentTreeBaseX + leaf3DX + parallaxX;
        const drawY = canopyCenterY + leaf3DY + parallaxY;

        const sway = Math.sin(time * 1.8 + leaf.swayPhase) * 0.08;
        const totalRot = leaf.baseRot + sway;
        const renderSize = leaf.size * animScale * scale;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(totalRot);

        if (leaf.nz > 0.4) {
          ctx.shadowColor = leaf.color;
          ctx.shadowBlur = 5;
        }

        ctx.fillStyle = leaf.color;
        drawHeartPath(ctx, renderSize);
        ctx.fill();
        ctx.restore();
      };

      // Update bloom status - strictly starts after stem and branches are completely formed (at 0.48)
      let allBloomedCount = 0;
      if (growthProgress >= 0.48) {
        leavesRef.current.forEach((leaf) => {
          if (growthProgress >= leaf.appearProgress) {
            if (!leaf.hasBloomed) {
              leaf.hasBloomed = true;
            }
            if (leaf.bloomAnim < 1) {
              leaf.bloomAnim = Math.min(1, leaf.bloomAnim + 0.05);
            } else {
              allBloomedCount++;
            }
          }
        });
      } else {
        leavesRef.current.forEach((leaf) => {
          leaf.bloomAnim = 0;
          leaf.hasBloomed = false;
        });
      }

      // Layer 1: Background leaves (nz < -0.2) - rendered only after stem formation
      if (growthProgress >= 0.48) {
        leavesRef.current.forEach((leaf) => {
          if (leaf.nz < -0.2) {
            renderSingleLeaf(leaf);
          }
        });
      }

      // Layer 2: Branches
      const trunkColor = '#f9a8d4';
      ctx.fillStyle = trunkColor;
      ctx.strokeStyle = trunkColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      branchSegmentsRef.current.forEach((branch) => {
        if (growthProgress < branch.appearStart) return;

        const localP = Math.min(1, Math.max(0, (growthProgress - branch.appearStart) / (branch.appearEnd - branch.appearStart)));
        if (localP <= 0) return;

        const t = localP;
        const p0x = currentTreeBaseX + branch.startX + tiltX * 0.2;
        const p0y = branch.startY + tiltY * 0.2;
        const p1x = currentTreeBaseX + branch.cp1X + tiltX * 0.4;
        const p1y = branch.cp1Y + tiltY * 0.4;
        const p2x = currentTreeBaseX + branch.cp2X + tiltX * 0.6;
        const p2y = branch.cp2Y + tiltY * 0.6;
        const p3x = currentTreeBaseX + branch.endX + tiltX * 0.8;
        const p3y = branch.endY + tiltY * 0.8;

        if (branch.isMainTrunk) {
          const currentTopY = p0y + (p3y - p0y) * t;
          const currentTopWidth = branch.startWidth - (branch.startWidth - branch.endWidth) * t;

          ctx.beginPath();
          ctx.moveTo(p0x - branch.startWidth * 0.5, p0y);
          ctx.quadraticCurveTo(p0x - branch.startWidth * 0.65, p0y, p0x - branch.startWidth * 0.5, p0y - 6 * scale);
          ctx.bezierCurveTo(
            p1x - branch.startWidth * 0.4,
            p0y + (p1y - p0y) * t,
            p2x - currentTopWidth * 0.45,
            p0y + (p2y - p0y) * t,
            p0x + (p3x - p0x) * t - currentTopWidth * 0.5,
            currentTopY
          );
          ctx.lineTo(p0x + (p3x - p0x) * t + currentTopWidth * 0.5, currentTopY);
          ctx.bezierCurveTo(
            p2x + currentTopWidth * 0.45,
            p0y + (p2y - p0y) * t,
            p1x + branch.startWidth * 0.4,
            p0y + (p1y - p0y) * t,
            p0x + branch.startWidth * 0.5,
            p0y - 6 * scale
          );
          ctx.quadraticCurveTo(p0x + branch.startWidth * 0.65, p0y, p0x + branch.startWidth * 0.5, p0y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.lineWidth = branch.startWidth - (branch.startWidth - branch.endWidth) * t;
          ctx.beginPath();
          ctx.moveTo(p0x, p0y);

          const stepCount = 20;
          for (let step = 1; step <= stepCount; step++) {
            const subT = (step / stepCount) * t;
            const oneMinusT = 1 - subT;
            const bx =
              oneMinusT * oneMinusT * oneMinusT * p0x +
              3 * oneMinusT * oneMinusT * subT * p1x +
              3 * oneMinusT * subT * subT * p2x +
              subT * subT * subT * p3x;
            const by =
              oneMinusT * oneMinusT * oneMinusT * p0y +
              3 * oneMinusT * oneMinusT * subT * p1y +
              3 * oneMinusT * subT * subT * p2y +
              subT * subT * subT * p3y;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
        }
      });

      // Layer 3: Foreground and midground leaves (nz >= -0.2) - rendered only after stem formation
      if (growthProgress >= 0.48) {
        leavesRef.current.forEach((leaf) => {
          if (leaf.nz >= -0.2) {
            renderSingleLeaf(leaf);
          }
        });
      }

      if (allBloomedCount >= leavesRef.current.length * 0.92 && !hasNotifiedComplete) {
        setHasNotifiedComplete(true);
        if (onBloomComplete) {
          onBloomComplete();
        }
      }

      // Settled ground petals
      groundSettledPetalsRef.current.forEach((sp) => {
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.rot);
        ctx.fillStyle = sp.color;
        drawHeartPath(ctx, sp.size * scale);
        ctx.fill();
        ctx.restore();
      });

      // Layer 4: Drifting and falling heart petals
      if (growthProgress > 0.75 && Math.random() < 0.22) {
        const randomLeaf = leavesRef.current[Math.floor(Math.random() * leavesRef.current.length)];
        if (randomLeaf && randomLeaf.hasBloomed) {
          const depthFactor = 1 + randomLeaf.nz * 0.15;
          fallingPetalsRef.current.push({
            x: currentTreeBaseX + randomLeaf.nx * canopyRadiusX * depthFactor + (Math.random() - 0.5) * 12,
            y: canopyCenterY + randomLeaf.ny * canopyRadiusY * depthFactor,
            z: randomLeaf.nz,
            vx: (Math.random() - 0.5) * 0.8 + 0.25,
            vy: 0.9 + Math.random() * 1.1,
            color: randomLeaf.color,
            size: randomLeaf.size * 0.85,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            swayPhase: Math.random() * Math.PI * 2,
            opacity: 1,
            life: 0,
            maxLife: 320,
          });
        }
      }

      for (let i = fallingPetalsRef.current.length - 1; i >= 0; i--) {
        const petal = fallingPetalsRef.current[i];
        petal.life++;

        petal.x += Math.sin(time * 2 + petal.swayPhase) * 0.9 + petal.vx;
        petal.y += petal.vy;
        petal.rot += petal.rotSpeed;

        if (petal.y >= groundY - 2) {
          petal.y = groundY - 2;
          petal.vy = 0;
          petal.vx = 0;
          petal.opacity -= 0.01;

          if (groundSettledPetalsRef.current.length < 40 && Math.random() < 0.3) {
            groundSettledPetalsRef.current.push({
              x: petal.x,
              y: groundY - 1,
              rot: petal.rot,
              color: petal.color,
              size: petal.size * 0.75,
            });
          }
        }

        if (petal.life > petal.maxLife || petal.opacity <= 0) {
          fallingPetalsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rot);
        ctx.globalAlpha = Math.max(0, petal.opacity);
        ctx.fillStyle = petal.color;
        drawHeartPath(ctx, petal.size * scale);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [growthProgress, shiftProgress, onBloomComplete, hasNotifiedComplete]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      title="Click tree to shower petals ✨"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block touch-none"
      />
    </div>
  );
};
