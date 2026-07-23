import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, TrendingUp, DollarSign, FileText, Target,
  BarChart3, Cpu, CheckCircle2, ChevronRight, Zap, Layers,
  Briefcase, Award, Loader2,
} from 'lucide-react';
import { GlassPanel, GhostButton } from './ui.jsx';

const PIPELINE = [
  {
    stage: 'RECEIVED',
    title: 'Customer Discovery',
    modules: [
      { name: 'Scrum Engine', icon: Cpu },
      { name: 'Discovery Form', icon: FileText },
    ],
    input: 'Idea Statement',
    output: 'Interaction Volume',
    desc: 'Capture the core business idea / problem statement and evaluate direct consumer communication feasibility.',
    detail: [
      { label: 'Business Idea / Problem', value: 'Autonomous solar drones for rural medical delivery' },
      { label: 'Consumer Communication', value: 'Feasible — direct clinic outreach' },
      { label: 'Interaction Volume', value: '45 stakeholders · 12 weekly' },
    ],
    color: 'cyan',
  },
  {
    stage: 'PENDING',
    title: 'Requirement & Profiling',
    modules: [
      { name: 'Profiling Classifier', icon: Briefcase },
      { name: 'Sector Mapping', icon: Layers },
    ],
    input: 'B2B / B2C Categorization',
    output: 'Sector Profile',
    desc: 'Classify the business model, then map consumer demographics, target industry, and ideal company profile.',
    detail: [
      { label: 'Model Classification', value: 'B2B' },
      { label: 'Target Sector', value: 'Logistics · Healthcare · Remote Aviation' },
      { label: 'Ideal Company Profile', value: 'Regional health networks, 50+ clinics' },
    ],
    color: 'amber',
  },
  {
    stage: 'PROCESSED',
    title: 'Mapping & Market Sizing',
    modules: [
      { name: 'Market Calculator', icon: BarChart3 },
      { name: 'Feasibility Evaluator', icon: ShieldCheck },
    ],
    input: 'TAM / SAM / SOM',
    output: 'Conversion % & Viability',
    desc: 'Quantitative market sizing with funnel conversion analytics and B2B/B2C ROI feasibility.',
    detail: [
      { label: 'TAM', value: '$50.0M' },
      { label: 'SAM (15% of TAM)', value: '$7.5M' },
      { label: 'SOM (10% of SAM)', value: '$0.75M' },
      { label: 'Viability Verdict', value: 'B2B ROI positive · Proceed' },
    ],
    color: 'indigo',
  },
  {
    stage: 'PUBLISHED',
    title: 'Execution & Strategy Engine',
    modules: [
      { name: 'Pricing Matrix', icon: DollarSign },
      { name: 'Industry Doc Gen', icon: FileText },
      { name: 'GTM & OKR Builder', icon: Target },
    ],
    input: 'Competitor Grid · GTM Roadmap',
    output: 'OKR Framework',
    desc: 'Generate structured strategy: market intelligence, industry report, pricing, validation, GTM, and OKRs.',
    detail: [
      { label: 'Competitor Grid', value: '3 positioned · $150 vs $180 / $210' },
      { label: 'GTM Roadmap', value: 'Govt partnerships + NGO tenders' },
      { label: 'OKR Framework', value: '2 objectives · 4 key results' },
    ],
    color: 'emerald',
  },
];

const COLOR_MAP = {
  cyan:    { text: 'text-cyan-300',    border: 'border-cyan-400/40',    bg: 'bg-cyan-500/10',    glow: 'rgba(6,182,212,0.4)',    dot: 'bg-cyan-400' },
  amber:   { text: 'text-amber-300',   border: 'border-amber-400/40',   bg: 'bg-amber-500/10',   glow: 'rgba(245,158,11,0.4)',   dot: 'bg-amber-400' },
  indigo:  { text: 'text-indigo-300',  border: 'border-indigo-400/40',  bg: 'bg-indigo-500/10',  glow: 'rgba(99,102,241,0.4)',   dot: 'bg-indigo-400' },
  emerald: { text: 'text-emerald-300', border: 'border-emerald-400/40', bg: 'bg-emerald-500/10', glow: 'rgba(16,185,129,0.4)',   dot: 'bg-emerald-400' },
};

const statusOrder = ['RECEIVED', 'PENDING', 'PROCESSED', 'PUBLISHED'];

export default function VentureProcessor({
  activeReport,
  onStatusChange,
  onScoreChange,
  computedScore,
  computedSubScores,
  computedDecision,
}) {
  const initialStage = statusOrder.indexOf(activeReport?.status);
  const [activeStage, setActiveStage] = useState(initialStage >= 0 ? initialStage : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [runStep, setRunStep] = useState(-1); // -1 = idle, 0-3 = processing each stage

  // Keep activeStage in sync with report's status if not running
  useEffect(() => {
    if (!isRunning && activeReport) {
      const idx = statusOrder.indexOf(activeReport.status);
      if (idx >= 0) {
        setActiveStage(idx);
      }
    }
  }, [activeReport, isRunning]);

  // Run the full pipeline simulation
  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunStep(0);
  };

  // Step through stages on a timer
  useEffect(() => {
    if (!isRunning) return;
    if (runStep < 0) return;
    if (runStep >= 4) {
      setIsRunning(false);
      setRunStep(-1);
      return;
    }
    setActiveStage(runStep);
    
    // Call parent to update status
    if (onStatusChange) {
      onStatusChange(statusOrder[runStep]);
    }
    
    const t = setTimeout(() => setRunStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [runStep, isRunning, onStatusChange]);

  const score = activeReport?.score ?? computedScore;
  const isComplete = activeReport?.status === 'PUBLISHED';

  // Customize dynamic detail rendering based on the active report details
  const getDynamicDetail = (stageIndex) => {
    if (!activeReport) return PIPELINE[stageIndex].detail;
    
    const p = activeReport.profile || {};
    const c = activeReport.clusterData || {};
    
    if (stageIndex === 0) {
      return [
        { label: 'Business Idea / Problem', value: c.problemStatement || 'No problem statement defined yet.' },
        { label: 'Venture Name', value: p.companyName || activeReport.name },
        { label: 'Contact Info', value: p.contactInfo || 'Not specified' },
      ];
    } else if (stageIndex === 1) {
      return [
        { label: 'Model Classification', value: p.businessModel || 'Not classified' },
        { label: 'Target Sector / Stage', value: `${p.industry || 'General'} · ${p.stage || 'Idea'}` },
        { label: 'Ideal Company Profile', value: c.idealCustomerProfile || 'Not specified' },
      ];
    } else if (stageIndex === 2) {
      if (activeReport.vertical === 'startups') {
        const tam = activeReport.engineData?.tam ?? 50000000;
        const samPct = activeReport.engineData?.samPct ?? 18;
        const sam = Math.round(tam * (samPct / 100));
        return [
          { label: 'TAM (Total)', value: `$${tam.toLocaleString()}` },
          { label: 'SAM (Serviceable)', value: `$${sam.toLocaleString()} (${samPct}%)` },
          { label: 'Viability Verdict', value: 'Proceed with analysis' },
        ];
      } else if (activeReport.vertical === 'msmes') {
        return [
          { label: 'Workflow', value: activeReport.engineData?.workflow || 'Not specified' },
          { label: 'Daily Friction', value: activeReport.engineData?.friction || 'Not specified' },
          { label: 'Hours Lost / Wk', value: `${activeReport.engineData?.hoursLost ?? 0} hrs` },
        ];
      } else {
        return [
          { label: 'SOP Summary', value: activeReport.engineData?.processMap || 'Not specified' },
          { label: 'Primary KPI', value: 'Maturity standard assessment' },
        ];
      }
    } else {
      return [
        { label: 'Revenue Model', value: c.revenueModel || 'Not defined' },
        { label: 'Launch Geography', value: c.launchGeography || 'Not specified' },
        { label: 'Funding Ask', value: c.fundingAsk || 'Not specified' },
      ];
    }
  };

  const activeStageObj = {
    ...PIPELINE[activeStage],
    detail: getDynamicDetail(activeStage),
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-amber-400" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">
              Processing Architecture
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-stone-100 md:text-3xl">
            Venture Processing Pipeline
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-400">
            Analyze venture <span className="text-amber-300">{activeReport?.name}</span> by running it through the complete pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <GhostButton onClick={runPipeline} disabled={isRunning}>
            {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {isRunning ? 'Processing…' : 'Run Pipeline'}
          </GhostButton>
        </div>
      </div>

      {/* Horizontal pipeline flow */}
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {PIPELINE.map((stage, idx) => {
            const c = COLOR_MAP[stage.color];
            const isActive = activeStage === idx;
            const isProcessing = isRunning && runStep === idx;
            const isDone = isRunning ? runStep > idx : statusOrder.indexOf(activeReport?.status) >= idx;
            return (
              <div key={stage.stage} className="flex flex-1 items-center gap-3">
                {/* Stage node */}
                <button
                  onClick={() => { if (!isRunning) setActiveStage(idx); }}
                  className={`group relative flex-1 rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? `${c.border} ${c.bg} shadow-[0_0_28px_${c.glow}]`
                      : 'border-amber-500/15 bg-black/30 hover:border-amber-400/30'
                  }`}
                >
                  {/* Processing shimmer */}
                  {isProcessing && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className={`absolute inset-y-0 w-1/3 ${c.bg} blur-xl`}
                        animate={{ x: ['-100%', '350%'] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  )}

                  <div className="relative flex items-center justify-between">
                    <span className={`text-[0.6rem] font-bold uppercase tracking-[0.15em] ${isActive ? c.text : 'text-stone-500'}`}>
                      {String(idx + 1).padStart(2, '0')} · {stage.stage}
                    </span>
                    {isDone ? (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    ) : isProcessing ? (
                      <Loader2 size={15} className={`animate-spin ${c.text}`} />
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${isActive ? c.dot : 'bg-amber-200/20'}`} />
                    )}
                  </div>

                  <h4 className={`relative mt-2 font-serif text-base font-bold ${isActive ? 'text-stone-100' : 'text-stone-300'}`}>
                    {stage.title}
                  </h4>

                  {/* Module chips */}
                  <div className="relative mt-3 space-y-1.5">
                    {stage.modules.map((m) => (
                      <div key={m.name} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[0.62rem] ${isActive ? `${c.border} bg-black/30` : 'border-transparent bg-white/[0.02]'}`}>
                        <m.icon size={11} className={isActive ? c.text : 'text-stone-600'} />
                        <span className="text-stone-300">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Connector arrow */}
                {idx < PIPELINE.length - 1 && (
                  <div className="hidden lg:flex shrink-0 items-center">
                    <motion.div
                      animate={isProcessing ? { x: [0, 4, 0] } : {}}
                      transition={{ duration: 0.6, repeat: isProcessing ? Infinity : 0 }}
                    >
                      <ChevronRight size={18} className="text-amber-400/50" />
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Score Aggregator */}
        <div className="mt-5 border-t border-amber-500/15 pt-5">
          <ScoreAggregator
            score={score}
            setScore={onScoreChange}
            decision={computedDecision}
            isComplete={isComplete}
            subScores={computedSubScores}
          />
        </div>
      </GlassPanel>

      {/* Active stage detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <StageDetail stage={activeStageObj} index={activeStage} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ScoreAggregator({ score, setScore, decision, isComplete, subScores }) {
  const verdict = score >= 75 ? 'HIGH VIABILITY' : score >= 50 ? 'MODERATE VIABILITY' : 'LOW VIABILITY';
  const verdictColor = score >= 75 ? 'text-emerald-300' : score >= 50 ? 'text-amber-300' : 'text-rose-300';
  const ringColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';

  const R = 52;
  const C = 2 * Math.PI * R;

  const displayScores = [
    { label: 'Feasibility', value: subScores?.feasibility ?? 82, icon: ShieldCheck },
    { label: 'Market Potential', value: subScores?.marketPotential ?? 88, icon: TrendingUp },
    { label: 'Pricing Power', value: subScores?.pricingPower ?? 74, icon: DollarSign },
    { label: 'GTM Viability', value: subScores?.gtmViability ?? 90, icon: Target },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
      {/* Gauge */}
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
            <motion.circle
              cx="64" cy="64" r={R} fill="none"
              stroke={ringColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - score / 100) }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 8px ${ringColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-4xl font-bold text-shimmer-gold">{score}</span>
            <span className="text-[0.58rem] uppercase tracking-[0.15em] text-stone-500">/ 100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-amber-400" />
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">Final Action</span>
            {isComplete && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-emerald-300">
                <CheckCircle2 size={9} /> Synthesized
              </span>
            )}
          </div>
          <h4 className="font-serif text-lg font-bold text-stone-100">Score Aggregator</h4>
          <p className={`mt-0.5 text-xs font-bold ${verdictColor}`}>{verdict}</p>
          {/* Interactive override */}
          <label className="mt-2 flex items-center gap-2 text-[0.62rem] text-stone-500">
            <span>Override</span>
            <input
              type="range" min={0} max={100} value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-24"
            />
          </label>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {displayScores.map((s) => (
          <div key={s.label} className="rounded-xl border border-amber-500/15 bg-black/30 p-3">
            <div className="flex items-center gap-1.5">
              <s.icon size={12} className="text-amber-400" />
              <span className="text-[0.6rem] uppercase tracking-wider text-stone-500">{s.label}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-stone-100">{s.value}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/40">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Binary decision */}
      <div className={`flex items-center gap-4 rounded-2xl border p-4 ${
        decision === 1 ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-rose-400/40 bg-rose-500/10'
      }`}>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full font-serif text-2xl font-bold ${
          decision === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
        }`}>
          {decision}
        </div>
        <div>
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-stone-500">Decision</span>
          <p className={`font-serif text-base font-bold ${decision === 1 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {decision === 1 ? 'Proceed · Viable' : 'Pivot · Abort'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StageDetail({ stage, index }) {
  const c = COLOR_MAP[stage.color];
  return (
    <GlassPanel className="overflow-hidden p-0">
      {/* Header bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 px-6 py-4 ${c.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.border} ${c.bg}`}>
            <span className={`font-serif text-base font-bold ${c.text}`}>{index + 1}</span>
          </div>
          <div>
            <span className={`text-[0.6rem] font-bold uppercase tracking-[0.18em] ${c.text}`}>Stage {index + 1} · {stage.stage}</span>
            <h3 className="font-serif text-xl font-bold text-stone-100">{stage.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-black/30 px-3 py-1.5">
          <span className={`font-semibold ${c.text}`}>{stage.input}</span>
          <ChevronRight size={14} className="text-amber-400/60" />
          <span className="font-semibold text-stone-100">{stage.output}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: description + modules */}
        <div className="border-b border-amber-500/15 p-6 lg:border-b-0 lg:border-r">
          <p className="text-sm text-stone-400">{stage.desc}</p>
          <h5 className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">Core Processing Modules</h5>
          <div className="mt-3 space-y-2">
            {stage.modules.map((m) => (
              <div key={m.name} className={`flex items-center gap-3 rounded-xl border ${c.border} bg-black/30 p-3`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
                  <m.icon size={16} className={c.text} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-100">{m.name}</p>
                  <p className="text-[0.66rem] text-stone-200/45">Module · {stage.stage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: data transform */}
        <div className="p-6">
          <h5 className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">Key Input / Output</h5>
          <div className="mt-3 space-y-2">
            {stage.detail.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/15 bg-black/30 px-4 py-2.5">
                <span className="text-[0.7rem] uppercase tracking-wider text-stone-500">{d.label}</span>
                <span className="text-right text-sm font-semibold text-stone-100">{d.value}</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 flex items-center gap-2 rounded-xl border ${c.border} bg-black/40 p-3`}>
            <Zap size={14} className={c.text} />
            <span className="text-xs text-stone-300">
              Output <strong className={c.text}>{stage.output}</strong> is forwarded to the next stage.
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
