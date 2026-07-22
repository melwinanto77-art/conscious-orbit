import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Building2, Factory, Rocket, Crown,
  ChevronRight, Sparkles, FileText, LayoutDashboard, Settings,
  Layers, ClipboardList, Search, DollarSign, Cpu, Home,
  Users, TrendingUp, Download, CheckCircle2,
  Plus, X, ChevronDown, Target, Zap,
} from 'lucide-react';
import './App.css';
import {
  GlassPanel, RoyalHeading, Field, Input, Textarea, Select,
  RoyalButton, GhostButton, StatusBadge, StatusDot, OrbitBrand,
} from './components/ui.jsx';
import VentureProcessor from './components/VentureProcessor.jsx';
import { StartupMarketEngine, MsmeOptimizationEngine, IndustryAnalysisEngine } from './components/VerticalEngines.jsx';
import Homepage from './components/Homepage.jsx';
import Login from './components/Login.jsx';

/* ============================================================
   THE CONSCIOUS ORBIT — Royal SaaS Dashboard
   Verticals: Students · Institutions · MSMEs · Industries · Startups
   ============================================================ */

const VERTICALS = [
  { id: 'students',      name: 'Students & Scholars',        icon: GraduationCap, desc: 'Academic counseling, research mentorship & project management' },
  { id: 'institutions',  name: 'Educational Institutions',   icon: Building2,     desc: 'Curriculum development, faculty training & org diagnosis' },
  { id: 'msmes',         name: 'MSMEs',                       icon: Factory,      desc: 'Small-team operations focused on operational bottlenecks' },
  { id: 'industries',    name: 'Industries',                  icon: Building2,    desc: 'Large-scale systemic optimization & multi-stakeholder strategy' },
  { id: 'startups',      name: 'Startups',                    icon: Rocket,       desc: 'Idea-to-execution journeys & market validation' },
];

const CLUSTER_TABS = [
  { id: 'market',  name: 'Market & Customer Foundation', cluster: 'Cluster 1' },
  { id: 'viability', name: 'Business Viability',         cluster: 'Cluster 2' },
  { id: 'launch',  name: 'Launch & Execution',           cluster: 'Cluster 3' },
];

const FLAGSHIP_TRACKS = [
  { id: 'validation', name: 'Startup Validation Track', desc: 'Validate problem-solution fit before committing capital.', icon: Target },
  { id: 'opportunity', name: 'Market Opportunity Track', desc: 'Map TAM/SAM/SOM and competitive whitespace.', icon: TrendingUp },
  { id: 'investor',   name: 'Investor-Ready Track',     desc: 'Sharpen narrative, unit economics & the ask.', icon: DollarSign },
];

const KANBAN_COLUMNS = [
  { status: 'RECEIVED',  action: 'SCRUMING',    note: 'Reviewing business ideas & problem statements' },
  { status: 'PENDING',   action: 'REQUIREMENT', note: 'Gathering customer data & B2B/B2C specs' },
  { status: 'PROCESSED', action: 'MAPPING',     note: 'Defining TAM/SAM/SOM conversions' },
  { status: 'PUBLISHED', action: 'DELIVERED',   note: 'Generated scores & downloadable artifacts' },
];

const BUILD_YOUR_OWN = [
  'Market Sizing', 'Competitor Teardown', 'Pricing Strategy', 'GTM Plan',
  'Financial Model', 'Risk Register', 'User Personas', 'OKR Framework',
];

// Seed report cards for the Kanban board
const SEED_REPORTS = [
  { id: 'r1', name: 'EcoFly Medical Drones', vertical: 'startups', tags: ['Logistics', 'Healthcare'], status: 'PUBLISHED',  score: 86 },
  { id: 'r2', name: 'Apex AI Recruiter',      vertical: 'startups', tags: ['HR Tech', 'SaaS'],       status: 'PROCESSED', score: 72 },
  { id: 'r3', name: 'GreenPack Biodegradable',vertical: 'startups', tags: ['Eco', 'Retail'],         status: 'PENDING',   score: 64 },
  { id: 'r4', name: 'Nimbus Cloud Audit',     vertical: 'startups', tags: ['Fintech', 'B2B'],        status: 'RECEIVED',  score: 0 },
  { id: 'r5', name: 'Verdant Agri-Tech',      vertical: 'msmes',    tags: ['AgriTech'],              status: 'PROCESSED', score: 78 },
  { id: 'r6', name: 'Helix Pharma Ops',       vertical: 'industries', tags: ['Pharma'],             status: 'PUBLISHED',  score: 91 },
];

function App() {
  const [page, setPage] = useState('home'); // 'home' | 'login' | 'dashboard'
  const [activeVertical, setActiveVertical] = useState('startups');
  const [activeCluster, setActiveCluster] = useState('market');
  const [selectedTracks, setSelectedTracks] = useState(['validation', 'investor']);
  const [customPicks, setCustomPicks] = useState(['Market Sizing']);
  const [reports, setReports] = useState(SEED_REPORTS);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState('pipeline'); // 'pipeline' | 'intake' | 'board'

  const toggleTrack = (id) =>
    setSelectedTracks((p) => (p.includes(id) ? p.filter((t) => t !== id) : [...p, id]));
  const toggleCustom = (name) =>
    setCustomPicks((p) => (p.includes(name) ? p.filter((t) => t !== name) : [...p, name]));

  const moveReport = (id, dir) => {
    const order = ['RECEIVED', 'PENDING', 'PROCESSED', 'PUBLISHED'];
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const idx = order.indexOf(r.status);
        const next = Math.min(order.length - 1, Math.max(0, idx + dir));
        return { ...r, status: order[next] };
      })
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReports((prev) => [
        {
          id: `r${Date.now()}`,
          name: 'New Royal Report',
          vertical: activeVertical,
          tags: ['Draft'],
          status: 'RECEIVED',
          score: 0,
        },
        ...prev,
      ]);
      setIsGenerating(false);
      setIsGenModalOpen(false);
    }, 1900);
  };

  const activeVerticalObj = VERTICALS.find((v) => v.id === activeVertical);

  // ---- Page-level routing (no router lib needed) ----
  if (page === 'home') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Homepage onEnter={() => setPage('dashboard')} onLogin={() => setPage('login')} />
        </motion.div>
      </AnimatePresence>
    );
  }
  if (page === 'login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Login onLogin={() => setPage('dashboard')} onBack={() => setPage('home')} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen text-stone-100">
      {/* ============ SIDEBAR ============ */}
      <Sidebar
        verticals={VERTICALS}
        activeVertical={activeVertical}
        setActiveVertical={setActiveVertical}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        goHome={() => setPage('home')}
      />

      {/* ============ MAIN ============ */}
      <main className="flex-1 overflow-x-hidden">
        <Topbar activeVertical={activeVerticalObj} />

        <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
          {/* VERTICAL HERO */}
          <VerticalHero vertical={activeVerticalObj} />

          {/* MAIN-VIEW TABS */}
          <MainViewTabs mainView={mainView} setMainView={setMainView} />

          {/* ---------- PIPELINE VIEW (processing architecture) ---------- */}
          {mainView === 'pipeline' && <VentureProcessor />}

          {/* ---------- INTAKE VIEW (vertical-specific) ---------- */}
          {mainView === 'intake' && (
            <>
              {activeVertical === 'startups' && (
                <>
                  <ThreeLayerEngine
                    activeCluster={activeCluster}
                    setActiveCluster={setActiveCluster}
                    selectedTracks={selectedTracks}
                    toggleTrack={toggleTrack}
                    customPicks={customPicks}
                    toggleCustom={toggleCustom}
                    onGenerate={() => setIsGenModalOpen(true)}
                  />
                  <div className="mt-10 flex items-center gap-4">
                    <div className="h-px flex-1 bg-amber-500/15" />
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-amber-300/50">Function Engine</span>
                    <div className="h-px flex-1 bg-amber-500/15" />
                  </div>
                  <StartupMarketEngine />
                </>
              )}
              {activeVertical === 'msmes' && <MsmeOptimizationEngine />}
              {activeVertical === 'industries' && <IndustryAnalysisEngine />}
              {(activeVertical === 'students' || activeVertical === 'institutions') && (
                <GenericVerticalPanel vertical={activeVerticalObj} />
              )}
            </>
          )}

          {/* ---------- BOARD VIEW (kanban) ---------- */}
          {mainView === 'board' && (
            <KanbanBoard
              reports={reports}
              columns={KANBAN_COLUMNS}
              moveReport={moveReport}
              expandedReport={expandedReport}
              setExpandedReport={setExpandedReport}
              onGenerate={() => setIsGenModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* ============ GENERATE REPORT MODAL ============ */}
      <AnimatePresence>
        {isGenModalOpen && (
          <GenerateReportModal
            onClose={() => setIsGenModalOpen(false)}
            onConfirm={handleGenerate}
            loading={isGenerating}
            vertical={activeVerticalObj}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   SIDEBAR — royal left navigation with 5 verticals
   ============================================================ */
function Sidebar({ verticals, activeVertical, setActiveVertical, open, setOpen, goHome }) {
  return (
    <aside
      className={`sticky top-0 z-20 flex h-screen flex-col border-r border-amber-500/15 bg-black/50 backdrop-blur-xl transition-all duration-300 ${
        open ? 'w-72' : 'w-20'
      }`}
    >
      {/* Brand — click to return home */}
      <button
        onClick={goHome}
        className="group flex w-full items-center gap-3 px-5 py-6 text-left transition hover:bg-white/[0.03]"
        title="Back to home"
      >
        <OrbitBrand size={40} />
        {open && (
          <div className="overflow-hidden">
            <h1 className="font-serif text-lg font-bold leading-tight text-shimmer-gold">
              The Conscious Orbit
            </h1>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-stone-500">
              Royal Strategy Suite
            </p>
          </div>
        )}
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute -right-3 top-7 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/40 bg-black/80 text-amber-300 backdrop-blur transition hover:bg-amber-500/20"
        aria-label="Toggle sidebar"
      >
        <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {open && (
          <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-stone-600">
            Target Verticals
          </p>
        )}
        {verticals.map((v) => {
          const Icon = v.icon;
          const active = activeVertical === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveVertical(v.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 border ${
                active
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-950/30 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-950/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50 border-transparent'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                />
              )}
              <Icon
                size={18}
                className={`shrink-0 ${active ? 'text-amber-400' : 'text-stone-500 group-hover:text-amber-300'}`}
              />
              {open && (
                <span className="truncate text-sm font-medium">{v.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="space-y-1 px-3 pb-5">
          <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-stone-600">
            System
          </p>
          <button
            onClick={goHome}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-200/50 transition hover:bg-white/5 hover:text-stone-100"
          >
            <Home size={18} className="text-stone-600" />
            Back to Home
          </button>
          {[
            { icon: LayoutDashboard, label: 'Overview' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-200/50 transition hover:bg-white/5 hover:text-stone-100"
            >
              <item.icon size={18} className="text-stone-600" />
              {item.label}
            </button>
          ))}
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-stone-300">Royal Tier</span>
            </div>
            <p className="mt-1 text-[0.68rem] text-stone-200/50">
              All flagship tracks unlocked
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ============================================================
   TOPBAR
   ============================================================ */
function Topbar({ activeVertical }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-500/10 bg-black/30 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2 text-sm text-stone-200/50">
        <LayoutDashboard size={16} className="text-amber-400" />
        <span>Dashboard</span>
        <ChevronRight size={14} />
        <span className="font-medium text-stone-200">{activeVertical?.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-amber-500/20 bg-black/40 px-3 py-2 md:flex">
          <Search size={15} className="text-stone-600" />
          <input
            placeholder="Search ventures…"
            className="field-glow w-40 bg-transparent text-sm text-stone-100 placeholder:text-stone-300/30 focus:w-56"
          />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-sm font-bold text-stone-300">
          R
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   MAIN-VIEW TABS — switch between Pipeline / Intake / Board
   ============================================================ */
function MainViewTabs({ mainView, setMainView }) {
  const tabs = [
    { id: 'pipeline', label: 'Processing Pipeline', icon: Cpu },
    { id: 'intake',   label: 'Intake Engine',       icon: Layers },
    { id: 'board',    label: 'Tracking Board',      icon: ClipboardList },
  ];
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-500/15 bg-black/40 p-1.5 backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = mainView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setMainView(tab.id)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              active ? 'text-amber-900' : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            {active && (
              <motion.span
                layoutId="main-view-tab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)]"
              />
            )}
            <tab.icon size={15} className="relative" />
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}


function VerticalHero({ vertical }) {
  const Icon = vertical?.icon;
  return (
    <motion.div
      key={vertical.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassPanel className="relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-transparent">
              {Icon && <Icon className="h-7 w-7 text-amber-400" />}
            </div>
            <div>
              <RoyalHeading level={2} shimmer>
                {vertical?.name}
              </RoyalHeading>
              <p className="mt-1 max-w-xl text-sm text-stone-400">{vertical?.desc}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <GhostButton>
              <FileText size={15} /> Brief
            </GhostButton>
            <RoyalButton>
              <Sparkles size={15} /> New Engagement
            </RoyalButton>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

/* ============================================================
   THREE-LAYER INTAKE ENGINE (Startup vertical)
   ============================================================ */
function ThreeLayerEngine({
  activeCluster, setActiveCluster,
  selectedTracks, toggleTrack,
  customPicks, toggleCustom,
  onGenerate,
}) {
  return (
    <section className="space-y-7">
      <SectionTitle
        icon={Layers}
        kicker="Startup Vertical"
        title="Three-Layer Dynamic Intake Engine"
        subtitle="A layered architecture: capture once, cluster by theme, then select flagship tracks."
      />

      {/* LAYER 1 — CLIENT PROFILE */}
      <div className="space-y-3">
        <LayerBadge n={1} title="Client Profile" hint="Captured once at signup" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <GlassPanel className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Company Name">
              <Input defaultValue="EcoFly Robotics" />
            </Field>
            <Field label="Industry">
              <Select defaultValue="Logistics">
                <option>Logistics</option><option>Healthcare</option><option>Fintech</option>
                <option>SaaS</option><option>AgriTech</option>
              </Select>
            </Field>
            <Field label="Stage">
              <Select defaultValue="Seed">
                <option>Idea</option><option>Pre-Seed</option><option>Seed</option>
                <option>Series A</option><option>Growth</option>
              </Select>
            </Field>
            <Field label="Geography">
              <Input defaultValue="Bengaluru, IN" />
            </Field>
            <Field label="Business Model">
              <Select defaultValue="B2B">
                <option>B2B</option><option>B2C</option><option>B2B2C</option><option>Marketplace</option>
              </Select>
            </Field>
            <Field label="Contact Info">
              <Input defaultValue="founder@ecofly.io" />
            </Field>
          </div>
        </GlassPanel>
      </motion.div>
      </div>

      {/* LAYER 2 — CLUSTER FORMS */}
      <div className="space-y-3">
        <LayerBadge n={2} title="Cluster Forms" hint="Report-specific inputs grouped by theme" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <GlassPanel className="overflow-hidden p-0">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-amber-500/15 bg-black/30 p-2">
            {CLUSTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCluster(tab.id)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeCluster === tab.id ? 'text-amber-900' : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                {activeCluster === tab.id && (
                  <motion.span
                    layoutId="cluster-tab"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.4)]"
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <span className={`text-[0.62rem] font-bold uppercase tracking-wider ${activeCluster === tab.id ? 'text-amber-900/70' : 'text-amber-300/50'}`}>
                    {tab.cluster}
                  </span>
                  {tab.name}
                </span>
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCluster}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {activeCluster === 'market' && (
                  <>
                    <Field label="Problem statement">
                      <Textarea defaultValue="Rural clinics wait hours for emergency blood & vaccine deliveries." className="min-h-[90px]" />
                    </Field>
                    <Field label="Specific pain point">
                      <Textarea defaultValue="Last-mile cold-chain breaks spoil 30% of medical cargo." className="min-h-[90px]" />
                    </Field>
                    <Field label="Willingness-to-pay signals">
                      <Input defaultValue="$15–25 per priority delivery" />
                    </Field>
                    <Field label="Ideal customer profile">
                      <Input defaultValue="Regional health networks, 50+ clinics" />
                    </Field>
                  </>
                )}
                {activeCluster === 'viability' && (
                  <>
                    <Field label="Revenue model"><Input defaultValue="Per-delivery + monthly retainer" /></Field>
                    <Field label="Unit economics (gross margin)"><Input defaultValue="62% at scale" /></Field>
                    <Field label="Key costs"><Input defaultValue="Fleet, batteries, BVLOS compliance" /></Field>
                    <Field label="Break-even timeline"><Input defaultValue="Month 18" /></Field>
                  </>
                )}
                {activeCluster === 'launch' && (
                  <>
                    <Field label="Launch geography"><Input defaultValue="Karnataka pilot zone" /></Field>
                    <Field label="Go-to-market motion"><Input defaultValue="Govt partnerships + NGO tenders" /></Field>
                    <Field label="Key milestones (12mo)"><Textarea defaultValue="3 hubs live · 10 clinics onboarded · BVLOS certified" className="min-h-[70px]" /></Field>
                    <Field label="Funding ask"><Input defaultValue="$1.2M seed" /></Field>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </GlassPanel>
      </motion.div>
      </div>

      {/* LAYER 3 — REPORT & TRACK CATALOGUE */}
      <div className="space-y-3">
        <LayerBadge n={3} title="Report & Track Catalogue" hint="Flagship tracks + build-your-own" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="space-y-5">
        {/* Flagship tracks */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FLAGSHIP_TRACKS.map((track) => {
            const Icon = track.icon;
            const selected = selectedTracks.includes(track.id);
            return (
              <button
                key={track.id}
                onClick={() => toggleTrack(track.id)}
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                  selected
                    ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/15 to-amber-700/5 shadow-[0_0_28px_rgba(245,158,11,0.18)]'
                    : 'border-amber-500/20 bg-black/40 hover:border-amber-400/40'
                }`}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20" />
                <div className="relative flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
                </div>
                <h4 className="relative mt-4 font-serif text-lg font-bold text-stone-100">{track.name}</h4>
                <p className="relative mt-1 text-xs text-stone-400">{track.desc}</p>
                <span className="relative mt-3 inline-block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                  Flagship · Premium
                </span>
              </button>
            );
          })}
        </div>

        {/* Build your own picker */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <h4 className="font-serif text-lg font-bold text-stone-100">Build Your Own Track</h4>
          </div>
          <p className="mt-1 text-sm text-stone-400">Compose a custom report from modular components.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BUILD_YOUR_OWN.map((mod) => {
              const on = customPicks.includes(mod);
              return (
                <button
                  key={mod}
                  onClick={() => toggleCustom(mod)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    on
                      ? 'border-amber-400/60 bg-amber-500/20 text-stone-200'
                      : 'border-amber-500/20 bg-black/30 text-stone-400 hover:border-amber-400/40'
                  }`}
                >
                  {on && <CheckCircle2 size={12} className="text-amber-400" />}
                  {mod}
                </button>
              );
            })}
          </div>

          {/* Smart Suggestion engine — recommends add-ons from current selection */}
          <SmartSuggestions
            picks={customPicks}
            tracks={selectedTracks}
            onAdd={toggleCustom}
          />
        </GlassPanel>
      </motion.div>
      </div>

      {/* Generate Report button — spans bottom of data entry */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={onGenerate}
          className="btn-royal flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold shadow-[0_8px_32px_rgba(245,158,11,0.35)]"
        >
          <Sparkles size={18} /> Generate Report
          <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">
            {selectedTracks.length + customPicks.length} modules
          </span>
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   GENERIC PANEL — Students / Institutions
   ============================================================ */
function GenericVerticalPanel({ vertical }) {
  const Icon = vertical?.icon;
  const cards =
    vertical?.id === 'students'
      ? [
          { icon: GraduationCap, title: 'Academic Counseling', desc: '1:1 mentorship plans, course trajectories & research direction.' },
          { icon: ClipboardList, title: 'Research Mentorship', desc: 'Pair scholars with domain guides; track thesis milestones.' },
          { icon: Target, title: 'Project Management', desc: 'Scoped deliverables, deadlines & advisor reviews.' },
        ]
      : [
          { icon: FileText, title: 'Curriculum Development', desc: 'Design outcomes-aligned curricula across departments.' },
          { icon: Users, title: 'Faculty Training', desc: 'Upskill faculty with tracked competency modules.' },
          { icon: Building2, title: 'Organizational Diagnosis', desc: 'Audit institutional health across stakeholders.' },
        ];
  return (
    <section className="space-y-6">
      <SectionTitle
        icon={Icon}
        kicker="Engagement Modules"
        title={`${vertical?.name} Modules`}
        subtitle="Royal-grade engagement workflows tailored to this vertical."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const CIcon = c.icon;
          return (
            <GlassPanel key={c.title} className="group p-5 transition hover:border-amber-400/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                <CIcon className="h-5 w-5 text-amber-400" />
              </div>
              <h4 className="mt-4 font-serif text-lg font-bold text-stone-100">{c.title}</h4>
              <p className="mt-1 text-sm text-stone-400">{c.desc}</p>
              <button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 transition hover:gap-2">
                Explore <ChevronRight size={13} />
              </button>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   KANBAN BOARD — report lifecycle tracking
   ============================================================ */
function KanbanBoard({ reports, columns, moveReport, expandedReport, setExpandedReport, onGenerate }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          icon={ClipboardList}
          kicker="Operations Pipeline"
          title="Application & Report Tracking"
          subtitle="The lifecycle of every generated report — from intake to published artifact."
          noMargin
        />
        <RoyalButton onClick={onGenerate}>
          <Plus size={15} /> New Report
        </RoyalButton>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = reports.filter((r) => r.status === col.status);
          return (
            <div key={col.status} className="flex flex-col rounded-2xl border border-amber-500/15 bg-black/30 backdrop-blur-md">
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-amber-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusDot status={col.status} />
                  <span className="text-sm font-bold uppercase tracking-wider text-stone-100">{col.status}</span>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-300">{items.length}</span>
              </div>
              <div className="border-b border-amber-500/10 bg-amber-500/[0.03] px-4 py-2">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                  Action · {col.action}
                </span>
                <p className="mt-0.5 text-[0.68rem] text-stone-200/45">{col.note}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3 p-3">
                <AnimatePresence>
                  {items.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25 }}
                      className="group rounded-xl border border-amber-500/20 bg-gradient-to-br from-white/[0.04] to-transparent p-3.5 transition hover:border-amber-400/45 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-semibold leading-snug text-stone-100">{r.name}</h5>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.tags.map((t) => (
                          <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[0.62rem] text-stone-400">{t}</span>
                        ))}
                      </div>

                      {/* Score (only when published) */}
                      {r.status === 'PUBLISHED' && r.score > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                              style={{ width: `${r.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-amber-300">{r.score}</span>
                          <button
                            onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}
                            className="text-amber-300/60 transition hover:text-stone-300"
                            aria-label="Expand"
                          >
                            <ChevronDown size={14} className={`transition ${expandedReport === r.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      )}

                      <AnimatePresence>
                        {expandedReport === r.id && r.status === 'PUBLISHED' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 rounded-lg border border-amber-500/15 bg-black/30 p-3">
                              {[
                                { k: 'Market Demand', v: 88 },
                                { k: 'Tech Feasibility', v: 72 },
                                { k: 'Unit Economics', v: 90 },
                              ].map((m) => (
                                <div key={m.k} className="flex items-center gap-2 text-[0.68rem]">
                                  <span className="w-28 text-stone-400">{m.k}</span>
                                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/40">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${m.v}%` }} />
                                  </div>
                                  <span className="w-7 text-right font-bold text-amber-300">{m.v}</span>
                                </div>
                              ))}
                              <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 py-2 text-xs font-semibold text-stone-300 transition hover:bg-amber-500/20">
                                <Download size={13} /> Download Artifact
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Mover controls */}
                      <div className="mt-3 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => moveReport(r.id, -1)}
                          disabled={r.status === 'RECEIVED'}
                          className="text-[0.62rem] text-stone-500 transition hover:text-stone-300 disabled:opacity-30"
                        >
                          ← Back
                        </button>
                        <span className="text-[0.6rem] uppercase tracking-wider text-amber-300/40">{r.vertical}</span>
                        <button
                          onClick={() => moveReport(r.id, 1)}
                          disabled={r.status === 'PUBLISHED'}
                          className="text-[0.62rem] text-stone-500 transition hover:text-stone-300 disabled:opacity-30"
                        >
                          Advance →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-amber-500/15 px-3 py-8 text-center text-xs text-stone-200/35">
                    No reports in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   GENERATE REPORT MODAL
   ============================================================ */
function GenerateReportModal({ onClose, onConfirm, loading, vertical }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 16, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-[#1a0807] to-[#0a0606] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-amber-500/15 px-6 py-4">
          <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="relative flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-shimmer-gold">Generate Royal Report</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-500 transition hover:bg-white/5 hover:text-stone-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-stone-300">
            Compose a new report for the <strong className="text-stone-300">{vertical?.name}</strong> vertical.
            Selected modules will be synthesized into a flagship deliverable.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Layers, label: 'Intake' },
              { icon: Sparkles, label: 'Synthesize' },
              { icon: Download, label: 'Deliver' },
            ].map((step, i) => (
              <div key={step.label} className="rounded-xl border border-amber-500/15 bg-black/30 p-3">
                <step.icon size={16} className="mx-auto text-amber-400" />
                <p className="mt-1.5 text-[0.68rem] text-stone-400">{i + 1}. {step.label}</p>
              </div>
            ))}
          </div>
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-400"
              />
              Synthesizing royal insights…
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-amber-500/15 px-6 py-4">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <RoyalButton onClick={onConfirm} disabled={loading}>
            <Sparkles size={15} /> {loading ? 'Generating…' : 'Confirm & Generate'}
          </RoyalButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Small shared presentational helpers
   ============================================================ */
function SectionTitle({ icon: Icon, kicker, title, subtitle, noMargin }) {
  return (
    <div className={noMargin ? '' : 'mb-1'}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-amber-400" />}
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">{kicker}</span>
      </div>
      <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-100 md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-stone-400">{subtitle}</p>}
    </div>
  );
}

function LayerBadge({ n, title, hint }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/40 bg-gradient-to-br from-amber-500/25 to-transparent font-serif text-sm font-bold text-amber-300">
        {n}
      </div>
      <div>
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/60">Layer {n}</span>
        <h3 className="font-serif text-lg font-bold text-stone-100">{title}</h3>
      </div>
      <span className="ml-1 hidden text-xs text-stone-200/40 sm:inline">— {hint}</span>
    </div>
  );
}

/* ============================================================
   SMART SUGGESTION ENGINE (Zai upsell module)
   Analyzes current selection + filled clusters, recommends
   high-value add-ons achievable with minimal extra inputs.
   ============================================================ */
function SmartSuggestions({ picks, tracks, onAdd }) {
  // Recommendation rules: each keyed on what the user already has,
  // suggesting a module + the small incremental cost to unlock it.
  const RULES = [
    {
      when: ['Market Sizing'],
      suggest: 'Competitor Teardown',
      reason: 'You have market sizing — a competitor teardown needs only 3 more fields and completes Cluster 1.',
      addFields: 3,
    },
    {
      when: ['Market Sizing', 'Competitor Teardown'],
      suggest: 'Pricing Strategy',
      reason: 'With market + competitor data mapped, pricing strategy unlocks with just 2 extra inputs.',
      addFields: 2,
    },
    {
      when: ['Pricing Strategy'],
      suggest: 'Financial Model',
      reason: 'Pricing is set — a full financial model needs only unit costs & growth rate.',
      addFields: 4,
    },
    {
      when: ['GTM Plan'],
      suggest: 'OKR Framework',
      reason: 'Your GTM is defined — align OKRs to it with just 1 objective input.',
      addFields: 1,
    },
    {
      when: ['Financial Model'],
      suggest: 'Risk Register',
      reason: 'A financial model pairs naturally with a risk register (3 fields).',
      addFields: 3,
    },
  ];

  const suggestions = RULES.filter(
    (r) => r.when.every((w) => picks.includes(w)) && !picks.includes(r.suggest)
  ).slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-5 rounded-xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-transparent p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-amber-300/80">
          Zai Smart Suggestion
        </span>
      </div>
      <p className="mt-1 text-[0.68rem] text-stone-400">
        Based on your {picks.length} selected module{picks.length !== 1 ? 's' : ''} and {tracks.length} flagship track{tracks.length !== 1 ? 's' : ''}:
      </p>
      <div className="mt-3 space-y-2">
        {suggestions.map((s) => (
          <div key={s.suggest} className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/15 bg-black/30 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-100">{s.suggest}</span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-amber-300">
                  +{s.addFields} field{s.addFields !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="mt-0.5 text-[0.66rem] text-stone-500">{s.reason}</p>
            </div>
            <button
              onClick={() => onAdd(s.suggest)}
              className="btn-royal shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
