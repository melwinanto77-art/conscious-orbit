import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Crown,
  Sparkles, ShieldCheck, Loader2, CheckCircle2,
} from 'lucide-react';
import { OrbitBrand, RoyalBackground } from './ui.jsx';
import { fieldBase } from './ui.jsx';

/* ============================================================
   LOGIN PAGE — royal split layout
   Brand showcase panel + glassmorphism auth form
   ============================================================ */

export default function Login({ onLogin, onBack }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth then enter dashboard
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1400);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated WebGL royal background (amber-tinted DarkVeil) */}
      <RoyalBackground />
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-950/30 blur-[128px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-rose-950/45 blur-[128px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-8 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid w-full overflow-hidden rounded-3xl border border-amber-500/20 shadow-[0_24px_80px_rgba(0,0,0,0.6)] lg:grid-cols-2"
        >
          {/* ===== LEFT — ROYAL BRAND PANEL ===== */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-red-950/60 via-black/40 to-amber-900/20 p-10 lg:flex">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
              <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-rose-950/30 blur-3xl" />
            </div>

            {/* Top: back + brand */}
            <div className="relative flex items-center justify-between">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-200"
              >
                <ArrowLeft size={15} /> Home
              </button>
              <div className="flex items-center gap-2">
                <OrbitBrand size={30} />
                <span className="font-serif text-sm font-bold text-shimmer-gold">Conscious Orbit</span>
              </div>
            </div>

            {/* Center: showcase */}
            <div className="relative my-10 flex flex-col items-center text-center">
              <OrbitBrand size={88} />
              <h2 className="mt-8 font-serif text-3xl font-bold leading-tight text-stone-100">
                Strategy with <span className="text-shimmer-gold">Sovereignty</span>
              </h2>
              <p className="mt-3 max-w-xs text-sm text-stone-400">
                Sign in to run ventures through the four-stage intelligence pipeline and your
                royal decision engine.
              </p>

              {/* Feature ticks */}
              <div className="mt-8 w-full max-w-xs space-y-3 text-left">
                {[
                  'Five-vertical intelligence suite',
                  'TAM / SAM / SOM market sizing',
                  'Conscious Orbital Score & 1/0 decision',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="shrink-0 text-amber-400" />
                    <span className="text-sm text-stone-200/75">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: trust badge */}
            <div className="relative flex items-center gap-2 rounded-xl border border-amber-500/15 bg-black/30 px-4 py-3">
              <ShieldCheck size={15} className="shrink-0 text-amber-400" />
              <span className="text-[0.72rem] text-stone-400">
                Royal-tier encryption · Enterprise-grade security
              </span>
            </div>
          </div>

          {/* ===== RIGHT — AUTH FORM ===== */}
          <div className="relative bg-black/50 p-8 backdrop-blur-xl md:p-10">
            {/* Mobile brand header */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2">
                <OrbitBrand size={32} />
                <span className="font-serif text-sm font-bold text-shimmer-gold">Conscious Orbit</span>
              </div>
              <button onClick={onBack} className="text-stone-500 transition hover:text-stone-200">
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="inline-flex rounded-xl border border-amber-500/20 bg-black/40 p-1">
              {[
                { id: 'signin', label: 'Sign In' },
                { id: 'signup', label: 'Create Account' },
              ].map((opt) => {
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`relative rounded-lg px-5 py-2 text-sm font-medium transition ${
                      active ? 'text-amber-900' : 'text-stone-400 hover:text-stone-100'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)]"
                      />
                    )}
                    <span className="relative">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Heading */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-amber-400" />
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">
                  {mode === 'signin' ? 'Welcome Back' : 'Join the Orbit'}
                </span>
              </div>
              <h1 className="mt-2 font-serif text-3xl font-bold text-stone-100">
                {mode === 'signin' ? 'Sign in to your suite' : 'Create your royal account'}
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                {mode === 'signin'
                  ? 'Enter your credentials to access the dashboard.'
                  : 'Begin your venture intelligence journey in seconds.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <FormField label="Full Name" icon={Crown}>
                    <input
                      type="text"
                      required
                      placeholder="Your royal name"
                      className={`${fieldBase} pl-11`}
                    />
                  </FormField>
                </motion.div>
              )}

              <FormField label="Email Address" icon={Mail}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@venture.io"
                  className={`${fieldBase} pl-11`}
                />
              </FormField>

              <FormField label="Password" icon={Lock}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${fieldBase} pl-11 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 transition hover:text-stone-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </FormField>

              {/* Remember + forgot (signin only) */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-stone-400">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-500/30 bg-black/40 accent-amber-500"
                    />
                    Remember me
                  </label>
                  <button type="button" className="font-medium text-amber-300 transition hover:text-stone-300">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-royal flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    {mode === 'signin' ? 'Enter the Suite' : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-amber-500/15" />
              <span className="text-[0.68rem] uppercase tracking-wider text-stone-600">or continue with</span>
              <div className="h-px flex-1 bg-amber-500/15" />
            </div>

            {/* Social auth */}
            <div className="grid grid-cols-2 gap-3">
              {['Google', 'GitHub'].map((p) => (
                <button
                  key={p}
                  onClick={onLogin}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-white/[0.02] py-2.5 text-sm font-medium text-stone-300 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-stone-100"
                >
                  <SocialIcon name={p} />
                  {p}
                </button>
              ))}
            </div>

            {/* Switch mode */}
            <p className="mt-6 text-center text-sm text-stone-400">
              {mode === 'signin' ? "Don't have an account? " : 'Already part of the orbit? '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-amber-300 transition hover:text-stone-300"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Form field with leading icon ---------- */
function FormField({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-amber-300/50" />
        {children}
      </div>
    </label>
  );
}

/* ---------- Inline social glyphs (no extra deps) ---------- */
function SocialIcon({ name }) {
  if (name === 'Google') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0">
        <path fill="#f59e0b" d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.6 3.8-5.35 3.8A6.7 6.7 0 0 1 5.3 12 6.7 6.7 0 0 1 12 5.3c1.7 0 3.2.6 4.4 1.7l2.4-2.4A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.2 0 9.7-3.8 9.7-10 0-.6-.05-1.2-.35-1.9z"/>
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" className="shrink-0 fill-amber-200/80">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>
    </svg>
  );
}
