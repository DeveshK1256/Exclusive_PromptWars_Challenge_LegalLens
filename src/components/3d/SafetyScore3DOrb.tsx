'use client';

import React, { useEffect, useRef } from 'react';

interface SafetyScore3DOrbProps {
  score: number;
  size?: number;
}

export const SafetyScore3DOrb: React.FC<SafetyScore3DOrbProps> = ({ score, size = 110 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const getScoreTheme = (val: number) => {
    if (val >= 80) return { r: 16, g: 185, b: 129, hex: '#10b981', label: 'Low Risk' };
    if (val >= 50) return { r: 245, g: 158, b: 11, hex: '#f59e0b', label: 'Moderate' };
    return { r: 244, g: 63, b: 94, hex: '#f43f5e', label: 'High Risk' };
  };

  const theme = getScoreTheme(score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationX = 0;
    let rotationY = 0;

    // Generate 3D sphere point cloud nodes
    const numPoints = 120;
    const points: { x: number; y: number; z: number; size: number }[] = [];
    const radius = size * 0.35;

    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;

      points.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        size: Math.random() * 1.8 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;

      rotationX += 0.008;
      rotationY += 0.012;

      // Draw ambient 3D radial glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.3);
      glowGrad.addColorStop(0, `rgba(${theme.r}, ${theme.g}, ${theme.b}, 0.25)`);
      glowGrad.addColorStop(0.7, `rgba(${theme.r}, ${theme.g}, ${theme.b}, 0.08)`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Transform and render 3D nodes
      const projected = points.map((p) => {
        // Rotate around Y axis
        let x1 = p.x * Math.cos(rotationY) - p.z * Math.sin(rotationY);
        let z1 = p.x * Math.sin(rotationY) + p.z * Math.cos(rotationY);

        // Rotate around X axis
        let y2 = p.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = p.y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

        // Perspective projection scale based on Z depth
        const perspective = 200;
        const scale = perspective / (perspective + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + radius) / (radius * 2)));

        return { px, py, scale, alpha, z2 };
      });

      // Sort points back to front for proper 3D depth rendering
      projected.sort((a, b) => a.z2 - b.z2);

      // Draw connecting 3D wireframe mesh lines for close points
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius * 0.45) {
            const lineAlpha = (1 - dist / (radius * 0.45)) * 0.2 * projected[i].alpha;
            ctx.strokeStyle = `rgba(${theme.r}, ${theme.g}, ${theme.b}, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw 3D nodes
      projected.forEach((pt) => {
        ctx.fillStyle = `rgba(${theme.r}, ${theme.g}, ${theme.b}, ${pt.alpha})`;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, Math.max(0.8, pt.scale * 1.5), 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [score, size, theme.r, theme.g, theme.b]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} className="block cursor-grab active:cursor-grabbing" aria-label={`3D Safety Orb - Score ${score}/100 (${theme.label})`} role="img" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-xl font-black text-slate-100 tracking-tight drop-shadow-md">{score}</span>
        <span className="text-[9px] uppercase font-mono text-slate-300 font-bold tracking-wider">/ 100</span>
      </div>
    </div>
  );
};
