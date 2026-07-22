import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import DarkVeil from './DarkVeil.jsx';

/* ============================================================
   Royal UI Primitives — reusable building blocks
   Glassmorphism + shimmering gold accents
   ============================================================ */

// DarkVeil WebGL background. The shader's goldRamp() recolors the CPPN motion
// into the site's royal crimson→amber→gold palette natively, so the animation
// is genuinely gold — no CSS blend hacks needed. Overlays only control opacity
// and keep text legible.
export function RoyalBackground({ hueShift = 0, speed = 0.4, opacity = 0.55, className = '' }) {
  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* The animated gold veil itself */}
      <div className="absolute inset-0" style={{ opacity }}>
        <DarkVeil hueShift={hueShift} speed={speed} resolutionScale={0.75} />
      </div>
      {/* Darken toward stone so content stays crisp, retaining a warm undertone */}
      <div className="absolute inset-0 bg-stone-950/55" />
    </div>
  );
}

// Animated orbital brand mark — rotating golden rings + crown
export function OrbitBrand({ size = 40, className = '' }) {
  const dim = { width: size, height: size };
  return (
    <div className={`relative ${className}`} style={dim}>
      {/* Outer dashed ring — slow clockwise */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/40"
      />
      {/* Middle solid ring — counter-rotate */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="absolute rounded-full border border-amber-500/30"
        style={{ inset: `${size * 0.14}px` }}
      />
      {/* Orbiting gold dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        <span
          className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]"
        />
      </motion.div>
      {/* Center crown */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Crown style={{ width: size * 0.42, height: size * 0.42 }} className="text-amber-400" />
      </div>
    </div>
  );
}

// Glass panel wrapper
export function GlassPanel({ className = '', children, ...rest }) {
  return (
    <div
      className={`glass rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

// Royal serif heading (gold shimmer optional)
export function RoyalHeading({ children, level = 2, shimmer = false, className = '' }) {
  const Tag = `h${level}`;
  const sizes = {
    1: 'text-3xl md:text-4xl',
    2: 'text-2xl md:text-3xl',
    3: 'text-xl md:text-2xl',
    4: 'text-lg',
  };
  return (
    <Tag
      className={`font-serif font-bold tracking-tight ${sizes[level]} ${
        shimmer ? 'text-shimmer-gold' : 'text-stone-100'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

// Labelled form field with glowing gold focus state
export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-wider text-stone-300">
          {label}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-[0.68rem] text-stone-500">{hint}</span>}
    </label>
  );
}

// Base input / textarea / select styling — stone-900 bg, amber border, neutral text
export const fieldBase =
  'field-glow w-full rounded-xl bg-stone-900/60 px-3.5 py-2.5 text-sm text-stone-100 ' +
  'placeholder:text-stone-600 border border-amber-500/20';

export function Input(props) {
  return <input {...props} className={`${fieldBase} ${props.className || ''}`} />;
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`${fieldBase} resize-y ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`${fieldBase} appearance-none cursor-pointer ${props.className || ''}`}
    >
      {props.children}
    </select>
  );
}

// Royal gold gradient button
export function RoyalButton({ children, className = '', ...rest }) {
  return (
    <button
      className={`btn-royal inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Ghost / outline button
export function GhostButton({ children, className = '', ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-stone-300 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Status badge
const STATUS_STYLES = {
  RECEIVED: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  PROCESSED: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
};

export function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-white/10 text-white/70 border-white/20';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${style} ${className}`}
    >
      {status}
    </span>
  );
}

// Gold status dot
export function StatusDot({ status }) {
  const colors = {
    RECEIVED: 'bg-cyan-400',
    PENDING: 'bg-amber-400',
    PROCESSED: 'bg-indigo-400',
    PUBLISHED: 'bg-emerald-400',
  };
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${colors[status] || 'bg-white'}`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colors[status] || 'bg-white'}`} />
    </span>
  );
}
