'use client';

import React, { useState, useRef } from 'react';

interface Card3DPerspectiveProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export const Card3DPerspective: React.FC<Card3DPerspectiveProps> = ({
  children,
  className = '',
  intensity = 15,
  glare = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -intensity;
    const rotY = ((x - centerX) / centerX) * intensity;

    setRotateX(rotX);
    setRotateY(rotY);

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
    }
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div className="perspective-1000" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`transition-transform duration-200 ease-out transform-gpu relative ${className}`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}

        {/* 3D Specular Light Glare Overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-inherit transition-opacity duration-300 z-50 rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)`,
              opacity: glarePos.opacity,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
