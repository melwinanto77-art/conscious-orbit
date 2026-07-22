import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, Building2, Factory, Rocket, Crown,
  ChevronRight, ArrowRight, Sparkles, ShieldCheck,
  TrendingUp, DollarSign, Target, Award, Play, CheckCircle2,
} from 'lucide-react';
import {
  GlassPanel, RoyalHeading, RoyalButton, GhostButton, OrbitBrand, RoyalBackground,
} from './ui.jsx';

/* ============================================================
   HOMEPAGE — royal landing page for The Conscious Orbit
   Hero · verticals · pipeline · score · tracks · CTA
   ============================================================ */

const VERTICALS = [
  { icon: GraduationCap, name: 'Students & Scholars',      desc: 'Academic counseling, research mentorship & project management.' },
  { icon: Building2,     name: 'Educational Institutions', desc: 'Curriculum development, faculty training & org diagnosis.' },
  { icon: Factory,       name: 'MSMEs',                    desc: 'Small-team operations focused on operational bottlenecks.' },
  { icon: Building2,     name: 'Industries',               desc: 'Large-scale systemic optimization & multi-stakeholder strategy.' },
  { icon: Rocket,        name: 'Startups',                 desc: 'Idea-to-execution journeys & market validation.' },
];

const PIPELINE = [
  { n: '01', stage: 'RECEIVED',  title: 'Customer Discovery',   color: 'text-cyan-300',    note: 'Idea Statement → Interaction Volume' },
  { n: '02', stage: 'PENDING',   title: 'Requirement & Profiling', color: 'text-amber-300', note: 'B2B/B2C → Sector Profile' },
  { n: '03', stage: 'PROCESSED', title: 'Market Sizing',        color: 'text-indigo-300',  note: 'TAM/SAM/SOM → Viability' },
  { n: '04', stage: 'PUBLISHED', title: 'Strategy Engine',      color: 'text-emerald-300', note: 'GTM & OKRs → Decision' },
];

const TRACKS = [
  { icon: Target,     name: 'Startup Validation', desc: 'Validate problem-solution fit before committing capital.' },
  { icon: TrendingUp, name: 'Market Opportunity', desc: 'Map TAM/SAM/SOM and competitive whitespace.' },
  { icon: DollarSign, name: 'Investor-Ready',     desc: 'Sharpen narrative, unit economics & the ask.' },
];

const STATS = [
  { value: '5',  label: 'Target Verticals' },
  { value: '4',  label: 'Processing Stages' },
  { value: '0–100', label: 'Orbital Score' },
  { value: '1/0', label: 'Decision Engine' },
];

export default function Homepage({ onEnter, onLogin }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated WebGL royal background (amber-tinted DarkVeil) */}
      <RoyalBackground />
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-950/30 blur-[128px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-rose-950/40 blur-[128px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-amber-900/15 blur-[128px]" />
      </div>

      {/* ===== NAV BAR ===== */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <OrbitBrand size={36} />
          <div>
            <span className="font-serif text-lg font-bold text-shimmer-gold">The Conscious Orbit</span>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-stone-500">Royal Strategy Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <GhostButton onClick={onLogin} className="hidden sm:inline-flex">
            Sign In
          </GhostButton>
          <RoyalButton onClick={onEnter}>
            Enter Dashboard <ChevronRight size={15} />
          </RoyalButton>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-12 text-center md:px-8 md:pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-8 flex justify-center"
        >
          <OrbitBrand size={96} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-stone-300"
        >
          <Sparkles size={13} className="text-amber-400" />
          Venture Intelligence &amp; Strategy Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl"
        >
          <span className="text-shimmer-gold">Intelligence in Orbit.</span>
          <br />
          <span className="text-stone-100">Strategy with Sovereignty.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-base text-stone-400 md:text-lg"
        >
          A royal platform that takes a raw business idea and processes it through a structured
          four-stage pipeline — from discovery to a decisive <span className="text-amber-300">Conscious Orbital Score</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <RoyalButton onClick={onEnter} className="px-6 py-3 text-base">
            <Play size={17} /> Launch the Suite
          </RoyalButton>
          <GhostButton onClick={onLogin} className="px-6 py-3 text-base">
            Sign In <ArrowRight size={16} />
          </GhostButton>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-amber-500/15 bg-black/30 p-4 backdrop-blur-md">
              <div className="font-serif text-2xl font-bold text-shimmer-gold md:text-3xl">{s.value}</div>
              <div className="mt-1 text-[0.68rem] uppercase tracking-wider text-stone-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </header>

      {/* ===== VERTICALS ===== */}
      <Section id="verticals" kicker="Five Target Verticals" title="Built for every orbit of ambition">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <GlassPanel className="group h-full p-6 transition hover:border-amber-400/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-transparent">
                    <Icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold text-stone-100">{v.name}</h3>
                  <p className="mt-2 text-sm text-stone-400">{v.desc}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
          {/* CTA tile */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, delay: VERTICALS.length * 0.07 }}
            className="flex items-center"
          >
            <button
              onClick={onEnter}
              className="group flex h-full w-full flex-col items-start justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-transparent p-6 text-left transition hover:from-amber-500/25"
            >
              <Sparkles className="h-6 w-6 text-amber-400" />
              <h3 className="mt-3 font-serif text-lg font-bold text-stone-100">Explore the suite</h3>
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-amber-300 transition group-hover:gap-2">
                Enter dashboard <ArrowRight size={14} />
              </span>
            </button>
          </motion.div>
        </div>
      </Section>

      {/* ===== PIPELINE ===== */}
      <Section id="pipeline" kicker="The Processing Architecture" title="Four stages from idea to decision">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((p, i) => (
            <motion.div
              key={p.stage}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative"
            >
              <GlassPanel className="h-full p-5">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-bold text-amber-500/30">{p.n}</span>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[0.15em] ${p.color}`}>{p.stage}</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-bold text-stone-100">{p.title}</h4>
                <p className="mt-2 text-xs text-stone-400">{p.note}</p>
              </GlassPanel>
              {/* Connector arrow */}
              {i < PIPELINE.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                  <ChevronRight size={20} className="text-amber-400/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ===== SCORE SHOWCASE ===== */}
      <Section id="score" kicker="Final Evaluation Metric" title="The Conscious Orbital Score">
        <GlassPanel className="relative overflow-hidden p-8 md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[auto_1fr]">
            {/* Gauge */}
            <div className="mx-auto">
              <ScoreRing value={86} />
            </div>
            {/* Description */}
            <div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">Score Aggregator</span>
              </div>
              <RoyalHeading level={3} className="mt-2">A sovereign decision in one number</RoyalHeading>
              <p className="mt-3 max-w-xl text-sm text-stone-400">
                Every venture is synthesized into a single 0–100 score across Feasibility, Market Potential,
                Pricing Power, and GTM Viability — then resolved into a binary decision:{' '}
                <span className="font-semibold text-emerald-300">1 · Proceed</span> or{' '}
                <span className="font-semibold text-rose-300">0 · Pivot</span>.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Feasibility', value: 82, icon: ShieldCheck },
                  { label: 'Market Potential', value: 88, icon: TrendingUp },
                  { label: 'Pricing Power', value: 74, icon: DollarSign },
                  { label: 'GTM Viability', value: 90, icon: Target },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-amber-500/15 bg-black/30 p-3">
                    <div className="flex items-center gap-1.5">
                      <s.icon size={12} className="text-amber-400" />
                      <span className="text-[0.6rem] uppercase tracking-wider text-stone-500">{s.label}</span>
                    </div>
                    <div className="mt-1.5 font-serif text-xl font-bold text-stone-100">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </Section>

      {/* ===== FLAGSHIP TRACKS ===== */}
      <Section id="tracks" kicker="Report & Track Catalogue" title="Flagship tracks for the startup journey">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TRACKS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <GlassPanel className="group h-full p-6 transition hover:border-amber-400/50 hover:shadow-[0_0_28px_rgba(245,158,11,0.15)]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-amber-400/60" />
                  </div>
                  <h4 className="mt-4 font-serif text-xl font-bold text-stone-100">{t.name} Track</h4>
                  <p className="mt-2 text-sm text-stone-400">{t.desc}</p>
                  <span className="mt-4 inline-block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">Flagship · Premium</span>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel className="relative overflow-hidden p-10 text-center md:p-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-red-900/20" />
            <div className="relative">
              <OrbitBrand size={64} className="mx-auto" />
              <RoyalHeading level={2} shimmer className="mt-6">
                Place your venture into orbit
              </RoyalHeading>
              <p className="mx-auto mt-4 max-w-xl text-sm text-stone-400 md:text-base">
                Enter the royal suite and run your idea through the complete intelligence pipeline.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <RoyalButton onClick={onEnter} className="px-7 py-3 text-base">
                  <Sparkles size={17} /> Enter Dashboard
                </RoyalButton>
                <GhostButton onClick={onLogin} className="px-7 py-3 text-base">
                  Sign In <ArrowRight size={16} />
                </GhostButton>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-amber-500/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <OrbitBrand size={26} />
            <span className="font-serif text-sm font-semibold text-stone-300">The Conscious Orbit</span>
          </div>
          <p className="text-[0.7rem] text-stone-600">
            Royal Strategy Suite · Venture Intelligence Platform · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Small local helpers ---------- */

function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="relative z-10 mx-auto max-w-7xl px-5 py-14 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-amber-400" />
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">{kicker}</span>
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-stone-100 md:text-4xl">{title}</h2>
      </motion.div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

// Animated circular score ring
function ScoreRing({ value = 86 }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const ringColor = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="relative h-44 w-44">
      <svg width="176" height="176" className="-rotate-90">
        <circle cx="88" cy="88" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="88" cy="88" r={R} fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${ringColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-5xl font-bold text-shimmer-gold">{value}</span>
        <span className="text-[0.62rem] uppercase tracking-[0.15em] text-stone-500">/ 100</span>
        <span className="mt-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-emerald-300">
          1 · Viable
        </span>
      </div>
    </div>
  );
}
