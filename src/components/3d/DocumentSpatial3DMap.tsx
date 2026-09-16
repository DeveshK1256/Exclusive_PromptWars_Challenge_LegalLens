'use client';

import React, { useState } from 'react';
import { Layers, RotateCcw, ZoomIn, ZoomOut, AlertOctagon, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { XRayFindingCard } from '@/lib/xray/types';

interface DocumentSpatial3DMapProps {
  documentTitle: string;
  documentType: string;
  findings: XRayFindingCard[];
}

export const DocumentSpatial3DMap: React.FC<DocumentSpatial3DMapProps> = ({
  documentTitle,
  documentType,
  findings,
}) => {
  const [rotateX, setRotateX] = useState(35);
  const [rotateZ, setRotateZ] = useState(-20);
  const [zoom, setZoom] = useState(1);
  const [selectedFinding, setSelectedFinding] = useState<XRayFindingCard | null>(null);

  const handleReset = () => {
    setRotateX(35);
    setRotateZ(-20);
    setZoom(1);
    setSelectedFinding(null);
  };

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'red':
        return { border: 'border-rose-500/60', bg: 'bg-rose-950/40', text: 'text-rose-400', shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]', badge: 'High Risk' };
      case 'orange':
        return { border: 'border-amber-500/60', bg: 'bg-amber-950/40', text: 'text-amber-400', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]', badge: 'Review' };
      case 'yellow':
        return { border: 'border-yellow-500/50', bg: 'bg-yellow-950/30', text: 'text-yellow-400', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]', badge: 'Key Term' };
      default:
        return { border: 'border-emerald-500/50', bg: 'bg-emerald-950/30', text: 'text-emerald-400', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]', badge: 'Standard' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl overflow-hidden relative">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              3D Spatial Document Layer Map
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Interactive 3D depth stack of contract clause severity layers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.4))}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 transition-colors"
            title="Reset 3D View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Scene Viewport Canvas */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden flex items-center justify-center p-6 cursor-grab active:cursor-grabbing">
        {/* Subtle Background Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* 3D Stack Container */}
        <div
          className="relative transition-transform duration-300 ease-out transform-gpu flex flex-col items-center justify-center"
          style={{
            transform: `scale(${zoom}) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
            transformStyle: 'preserve-3d',
            perspective: '1200px',
          }}
        >
          {findings.map((finding, idx) => {
            const style = getSeverityGlow(finding.severity);
            const zOffset = (findings.length - idx) * 45;

            return (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className={`w-72 sm:w-80 p-4 rounded-2xl border ${style.border} ${style.bg} ${style.shadow} backdrop-blur-md transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 group mb-[-25px]`}
                style={{
                  transform: `translateZ(${zOffset}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ${style.text}`}>
                    Layer #{idx + 1} — {style.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Kind: {finding.finding_kind}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {finding.title}
                </h4>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {finding.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Rotate Drag Control Overlay Instructions */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-2">
          <span>X-Rotate: {rotateX}°</span>
          <span>Z-Rotate: {rotateZ}°</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Selected Finding Detail Drawer */}
      {selectedFinding && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {selectedFinding.title}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedFinding(null)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedFinding.description}</p>
          {selectedFinding.source_reference && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 italic">
              Verbatim Reference: "{selectedFinding.source_reference}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
