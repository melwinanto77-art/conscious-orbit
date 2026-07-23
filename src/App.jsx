import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Building2, Factory, Rocket, Crown,
  ChevronRight, Sparkles, FileText, LayoutDashboard, Settings,
  Layers, ClipboardList, Search, DollarSign, Cpu, Home,
  Users, TrendingUp, Download, CheckCircle2,
  Plus, X, ChevronDown, Target, Zap, ShieldCheck,
} from 'lucide-react';
import './App.css';
import {
  GlassPanel, RoyalHeading, Field, Input, Textarea, Select,
  RoyalButton, GhostButton, StatusBadge, StatusDot, OrbitBrand,
} from './components/ui.jsx';
import VentureProcessor from './components/VentureProcessor.jsx';
import {
  StartupMarketEngine, MsmeOptimizationEngine, IndustryAnalysisEngine,
  StudentMentorshipEngine, InstitutionalMaturityEngine
} from './components/VerticalEngines.jsx';
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

const TRACKS_BY_VERTICAL = {
  startups: [
    { id: 'validation', name: 'Startup Validation Track', desc: 'Validate problem-solution fit before committing capital.', icon: Target },
    { id: 'opportunity', name: 'Market Opportunity Track', desc: 'Map TAM/SAM/SOM and competitive whitespace.', icon: TrendingUp },
    { id: 'investor',   name: 'Investor-Ready Track',     desc: 'Sharpen narrative, unit economics & the ask.', icon: DollarSign },
  ],
  msmes: [
    { id: 'bottleneck', name: 'Bottleneck Mapping Track', desc: 'Isolate operational friction points and calculate waste.', icon: Target },
    { id: 'efficiency', name: 'Lean Efficiency Track', desc: 'Optimize team allocation and communication pipelines.', icon: TrendingUp },
    { id: 'digital',    name: 'SaaS Integration Track', desc: 'Select low-code tools to automate manual approvals.', icon: Zap },
  ],
  industries: [
    { id: 'governance', name: 'SOP & Governance Track', desc: 'Standardize cross-functional sign-offs and roles.', icon: ShieldCheck },
    { id: 'quality',    name: 'Quality Assurance Track', desc: 'Align calibration schedules with defect targets.', icon: Target },
    { id: 'scale',      name: 'System Scale Track',      desc: 'Model multi-department throughput and bottlenecks.', icon: Layers },
  ],
  students: [
    { id: 'counseling', name: 'Academic Counseling Track', desc: 'Map course credits, timelines, and post-grad targets.', icon: GraduationCap },
    { id: 'research',   name: 'Research Mentorship Track', desc: 'Format thesis drafts and coordinate guide feedback.', icon: FileText },
    { id: 'project',    name: 'Project Capstone Track',    desc: 'Break project milestones into scoped weekly tasks.', icon: Target },
  ],
  institutions: [
    { id: 'curriculum', name: 'Curriculum Alignment Track', desc: 'Audit educational outcomes against modern industry requirements.', icon: FileText },
    { id: 'faculty',    name: 'Faculty Competency Track', desc: 'Track training milestones and certificate compliance.', icon: Users },
    { id: 'diagnosis',  name: 'Institutional Health Track', desc: 'Survey stakeholders to run organizational SWOT diagnostics.', icon: Building2 },
  ]
};

const BUILD_YOUR_OWN = [
  'Market Sizing', 'Competitor Teardown', 'Pricing Strategy', 'GTM Plan',
  'Financial Model', 'Risk Register', 'User Personas', 'OKR Framework',
];

const KANBAN_COLUMNS = [
  { status: 'RECEIVED',  action: 'SCRUMING',    note: 'Reviewing business ideas & problem statements' },
  { status: 'PENDING',   action: 'REQUIREMENT', note: 'Gathering customer data & B2B/B2C specs' },
  { status: 'PROCESSED', action: 'MAPPING',     note: 'Defining TAM/SAM/SOM conversions' },
  { status: 'PUBLISHED', action: 'DELIVERED',   note: 'Generated scores & downloadable artifacts' },
];

const SEED_REPORTS = [
  {
    id: 'r1',
    name: 'EcoFly Medical Drones',
    vertical: 'startups',
    tags: ['Logistics', 'Healthcare'],
    status: 'PUBLISHED',
    score: 86,
    profile: {
      companyName: 'EcoFly Medical Drones',
      industry: 'Logistics',
      stage: 'Seed',
      geography: 'Bengaluru, IN',
      businessModel: 'B2B',
      contactInfo: 'founder@ecofly.io',
    },
    clusterData: {
      problemStatement: 'Rural clinics wait hours for emergency blood & vaccine deliveries.',
      painPoint: 'Last-mile cold-chain breaks spoil 30% of medical cargo.',
      willingnessToPay: '$15–25 per priority delivery',
      idealCustomerProfile: 'Regional health networks, 50+ clinics',
      revenueModel: 'Per-delivery + monthly retainer',
      unitEconomics: '62% at scale',
      keyCosts: 'Fleet, batteries, BVLOS compliance',
      breakEvenTimeline: 'Month 18',
      launchGeography: 'Karnataka pilot zone',
      gtmMotion: 'Govt partnerships + NGO tenders',
      keyMilestones: '3 hubs live · 10 clinics onboarded · BVLOS certified',
      fundingAsk: '$1.2M seed',
    },
    selectedTracks: ['validation', 'investor'],
    customPicks: ['Market Sizing'],
    engineData: {
      tam: 50000000,
      samPct: 18,
      channels: { direct: 40, partner: 25, online: 35 },
      conversion: 8,
    }
  },
  {
    id: 'r2',
    name: 'Apex AI Recruiter',
    vertical: 'startups',
    tags: ['HR Tech', 'SaaS'],
    status: 'PROCESSED',
    score: 72,
    profile: {
      companyName: 'Apex AI Recruiter',
      industry: 'SaaS',
      stage: 'Pre-Seed',
      geography: 'San Francisco, US',
      businessModel: 'B2B',
      contactInfo: 'recruiter@apex.ai',
    },
    clusterData: {
      problemStatement: 'Tech hiring is slow, taking 45+ days per engineering hire.',
      painPoint: 'Technical screening wastes 60% of engineering managers\' time.',
      willingnessToPay: '$199/mo per seat',
      idealCustomerProfile: 'Fast-growing tech scaleups',
      revenueModel: 'SaaS subscription',
      unitEconomics: '85% gross margin',
      keyCosts: 'LLM tokens, API hosting, outbound sales',
      breakEvenTimeline: 'Month 6',
      launchGeography: 'North America',
      gtmMotion: 'LinkedIn outbound + product-led growth',
      keyMilestones: 'Launch MVP · 20 beta clients · Integrate with ATS',
      fundingAsk: '$500K pre-seed',
    },
    selectedTracks: ['validation', 'opportunity'],
    customPicks: ['Competitor Teardown'],
    engineData: {
      tam: 12000000,
      samPct: 25,
      channels: { direct: 20, partner: 10, online: 70 },
      conversion: 12,
    }
  },
  {
    id: 'r3',
    name: 'GreenPack Biodegradable',
    vertical: 'startups',
    tags: ['Eco', 'Retail'],
    status: 'PENDING',
    score: 64,
    profile: {
      companyName: 'GreenPack Biodegradable',
      industry: 'Eco',
      stage: 'Idea',
      geography: 'London, UK',
      businessModel: 'B2B2C',
      contactInfo: 'info@greenpack.co.uk',
    },
    clusterData: {
      problemStatement: 'E-commerce packaging generates millions of tons of plastic waste.',
      painPoint: 'Consumers demand eco-friendly options, but brands find compostables too fragile.',
      willingnessToPay: '$0.40 per mailer bag',
      idealCustomerProfile: 'D2C brands shipping >5k orders/mo',
      revenueModel: 'Direct-to-brand wholesale',
      unitEconomics: '45% margins at scale',
      keyCosts: 'Raw bio-resins, molding machinery, certifications',
      breakEvenTimeline: 'Month 24',
      launchGeography: 'United Kingdom',
      gtmMotion: 'Eco brand partnerships + trade shows',
      keyMilestones: 'Material formulation sign-off · Pilot with 3 brands · Secure factory space',
      fundingAsk: '$800K seed',
    },
    selectedTracks: ['validation'],
    customPicks: ['Pricing Strategy'],
    engineData: {
      tam: 45000000,
      samPct: 10,
      channels: { direct: 50, partner: 30, online: 20 },
      conversion: 5,
    }
  },
  {
    id: 'r4',
    name: 'Nimbus Cloud Audit',
    vertical: 'startups',
    tags: ['Fintech', 'B2B'],
    status: 'RECEIVED',
    score: 0,
    profile: {
      companyName: 'Nimbus Cloud Audit',
      industry: 'Fintech',
      stage: 'Pre-Seed',
      geography: 'New York, US',
      businessModel: 'B2B',
      contactInfo: 'audit@nimbus.io',
    },
    clusterData: {
      problemStatement: 'Companies overspend on cloud infrastructure by 30% without realizing it.',
      painPoint: 'Multi-cloud setups lack unified cost visibility and automated savings suggestions.',
      willingnessToPay: '10% of generated savings',
      idealCustomerProfile: 'Mid-market companies spending >$20k/mo on AWS/Azure',
      revenueModel: 'Gainshare / commission-based',
      unitEconomics: '92% margins',
      keyCosts: 'Read-only API processing, cloud compute, SOC2 compliance',
      breakEvenTimeline: 'Month 12',
      launchGeography: 'Global SaaS',
      gtmMotion: 'Product Hunt launch + AWS Marketplace co-selling',
      keyMilestones: 'Connect 10 test accounts · Achieve $50k in audited savings · Launch v1.0',
      fundingAsk: '$350K pre-seed',
    },
    selectedTracks: ['opportunity'],
    customPicks: ['GTM Plan'],
    engineData: {
      tam: 80000000,
      samPct: 15,
      channels: { direct: 15, partner: 40, online: 45 },
      conversion: 7,
    }
  },
  {
    id: 'r5',
    name: 'Verdant Agri-Tech',
    vertical: 'msmes',
    tags: ['AgriTech'],
    status: 'PROCESSED',
    score: 78,
    profile: {
      companyName: 'Verdant Agri-Tech',
      industry: 'AgriTech',
      stage: 'Seed',
      geography: 'Pune, IN',
      businessModel: 'B2B',
      contactInfo: 'contact@verdant.in',
    },
    clusterData: {
      problemStatement: 'Smallholder farmers lack precise soil and weather metrics for crop selection.',
      painPoint: 'Manual soil testing takes 10+ days; weather apps are too generic.',
      willingnessToPay: '₹500 ($6) per test',
      idealCustomerProfile: 'Farmer cooperatives, agro-input dealers',
      revenueModel: 'Pay-per-test + agronomy advisory subscription',
      unitEconomics: '55% gross margin',
      keyCosts: 'Sensor probes, cellular data plans, local operations agents',
      breakEvenTimeline: 'Month 18',
      launchGeography: 'Maharashtra district',
      gtmMotion: 'Dealer networks + NGO-sponsored farming camps',
      keyMilestones: 'Deploy 50 field stations · Onboard 2,000 farmers · Launch Marathi mobile app',
      fundingAsk: '$600K seed',
    },
    selectedTracks: ['bottleneck'],
    customPicks: ['User Personas'],
    engineData: {
      team: 7,
      hoursLost: 14,
      hourlyRate: 35,
      tools: 'excel',
      workflow: 'Soil sample collected → sent to regional lab → manual report compiled → physical handoff to farmer',
      friction: 'Lab testing backlog delays output by 12 days, letting planting seasons pass without data',
    }
  },
  {
    id: 'r6',
    name: 'Helix Pharma Ops',
    vertical: 'industries',
    tags: ['Pharma'],
    status: 'PUBLISHED',
    score: 91,
    profile: {
      companyName: 'Helix Pharma Ops',
      industry: 'Pharma',
      stage: 'Growth',
      geography: 'Basel, CH',
      businessModel: 'B2B',
      contactInfo: 'operations@helix.ch',
    },
    clusterData: {
      problemStatement: 'Biotech manufacturing lines suffer from frequent downtime and calibration defects.',
      painPoint: 'Manual alignment of bioreactors leads to batch contamination and FDA warnings.',
      willingnessToPay: '$100k+ annual enterprise licensing',
      idealCustomerProfile: 'Mid-sized clinical manufacturers & CDMOs',
      revenueModel: 'Enterprise SaaS + professional service retainer',
      unitEconomics: '78% margins',
      keyCosts: 'Machine-learning model training, edge hardware integration, validator travel',
      breakEvenTimeline: 'Month 36',
      launchGeography: 'Europe (DACH region)',
      gtmMotion: 'Direct enterprise sales + industry consortiums',
      keyMilestones: 'Validation at 2 reference sites · ISO 13485 certification · Close first enterprise contract',
      fundingAsk: '$3.5M Series A',
    },
    selectedTracks: ['governance'],
    customPicks: ['Risk Register'],
    engineData: {
      framework: 'sixsigma',
      defectRate: 4.2,
      downtime: 6.1,
      departments: 4,
      processMap: 'Line-3 changeover: manual recalibration by ops team, QA sign-off, then production resume. Averaging 4.2% defects post-changeover.'
    }
  },
];

function computeScore(report) {
  if (!report) return { score: 0, subScores: { feasibility: 0, marketPotential: 0, pricingPower: 0, gtmViability: 0 }, decision: 0 };
  
  let feasibility = 50;
  let marketPotential = 50;
  let pricingPower = 50;
  let gtmViability = 50;
  
  if (report.vertical === 'startups') {
    const data = report.engineData || { tam: 50000000, samPct: 18, channels: { direct: 40, partner: 25, online: 35 }, conversion: 8 };
    const tam = data.tam || 0;
    const samPct = data.samPct || 0;
    const channels = data.channels || { direct: 33, partner: 33, online: 34 };
    const conversion = data.conversion || 0;
    
    const sam = tam * (samPct / 100);
    const channelWeight = (channels.direct + channels.partner + channels.online) / 100;
    const som = sam * channelWeight * (conversion / 100);
    
    marketPotential = Math.min(100, Math.round(30 + (som > 0 ? Math.log10(som) * 8 : 0)));
    feasibility = Math.min(100, Math.round(40 + conversion * 5));
    pricingPower = Math.min(100, Math.round(30 + (channels.direct * 0.8) + (channels.partner * 0.4)));
    gtmViability = Math.min(100, Math.round(20 + conversion * 6 + (channels.online * 0.6)));
  } else if (report.vertical === 'msmes') {
    const data = report.engineData || { team: 7, hoursLost: 14, hourlyRate: 35, tools: 'excel' };
    const team = data.team || 0;
    const hoursLost = data.hoursLost || 0;
    const hourlyRate = data.hourlyRate || 0;
    
    const weeklyCost = hoursLost * hourlyRate;
    const annualCost = weeklyCost * 50;
    const estSavings = annualCost * 0.6;
    
    marketPotential = Math.min(100, Math.round(25 + (estSavings > 0 ? Math.log10(estSavings) * 10 : 0)));
    feasibility = Math.min(100, Math.max(20, Math.round(100 - team * 6)));
    pricingPower = Math.min(100, Math.round(30 + hourlyRate * 1.5));
    gtmViability = Math.min(100, Math.round(40 + hoursLost * 2.5));
  } else if (report.vertical === 'industries') {
    const data = report.engineData || { framework: 'sixsigma', defectRate: 4.2, downtime: 6.1, departments: 4 };
    const framework = data.framework || 'sixsigma';
    const defectRate = data.defectRate || 0;
    const downtime = data.downtime || 0;
    const departments = data.departments || 1;
    
    marketPotential = Math.min(100, Math.round(Math.max(10, 95 - defectRate * 9)));
    feasibility = Math.min(100, Math.round(Math.max(10, 90 - downtime * 5)));
    pricingPower = framework === 'sixsigma' ? 88 : framework === 'iso' ? 80 : framework === 'tqm' ? 85 : 50;
    gtmViability = Math.min(100, Math.max(15, 95 - departments * 5));
  } else if (report.vertical === 'students') {
    const data = report.engineData || { level: 'Undergrad', scoping: true, litReview: false, analysis: false, hours: 5 };
    const hours = data.hours || 0;
    marketPotential = data.level === 'PhD' ? 90 : data.level === 'Grad' ? 75 : 60;
    feasibility = Math.min(100, Math.round(30 + hours * 8));
    pricingPower = (data.scoping ? 20 : 0) + (data.litReview ? 30 : 0) + (data.analysis ? 50 : 0);
    gtmViability = Math.min(100, Math.round(40 + hours * 6));
  } else if (report.vertical === 'institutions') {
    const data = report.engineData || { students: 1200, depts: 8, digitalMaturity: 'Medium', trainingHours: 20 };
    const students = data.students || 0;
    const depts = data.depts || 1;
    const digitalMaturity = data.digitalMaturity || 'Medium';
    const trainingHours = data.trainingHours || 0;
    
    marketPotential = Math.min(100, Math.round(30 + Math.min(students, 5000) / 100));
    feasibility = digitalMaturity === 'High' ? 85 : digitalMaturity === 'Medium' ? 65 : 45;
    pricingPower = Math.min(100, Math.round(40 + trainingHours * 1.5));
    gtmViability = Math.min(100, Math.max(10, 95 - depts * 4));
  }
  
  const score = Math.round((marketPotential + feasibility + pricingPower + gtmViability) / 4);
  const decision = score >= 60 ? 1 : 0;
  
  return {
    score,
    subScores: { feasibility, marketPotential, pricingPower, gtmViability },
    decision
  };
}

function App() {
  const [page, setPage] = useState('home'); // 'home' | 'login' | 'dashboard'
  const [reports, setReports] = useState(SEED_REPORTS);
  const [activeReportId, setActiveReportId] = useState('r1');
  const [activeVertical, setActiveVertical] = useState('startups');
  const [activeCluster, setActiveCluster] = useState('market');
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState('pipeline'); // 'pipeline' | 'intake' | 'board'

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  // Sync activeVertical when activeReport changes
  const handleSelectReport = (id) => {
    setActiveReportId(id);
    const selected = reports.find((r) => r.id === id);
    if (selected) {
      setActiveVertical(selected.vertical);
    }
  };

  const handleProfileChange = (key, value) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        const updatedProfile = { ...r.profile, [key]: value };
        const name = key === 'companyName' ? value : r.name;
        let tags = r.tags || [];
        if (key === 'industry') {
          tags = [value, r.profile?.stage || 'Seed'];
        } else if (key === 'stage') {
          tags = [r.profile?.industry || 'Logistics', value];
        }
        return { ...r, name, tags, profile: updatedProfile };
      })
    );
  };

  const handleClusterChange = (key, value) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        return {
          ...r,
          clusterData: {
            ...r.clusterData,
            [key]: value,
          },
        };
      })
    );
  };

  const handleEngineDataChange = (key, value) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        const nextData = { ...r.engineData, [key]: value };
        const scoreResults = computeScore({ ...r, engineData: nextData });
        return {
          ...r,
          engineData: nextData,
          score: scoreResults.score
        };
      })
    );
  };

  const toggleTrack = (id) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        const current = r.selectedTracks || [];
        const next = current.includes(id) ? current.filter((t) => t !== id) : [...current, id];
        return { ...r, selectedTracks: next };
      })
    );
  };

  const toggleCustom = (name) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        const current = r.customPicks || [];
        const next = current.includes(name) ? current.filter((t) => t !== name) : [...current, name];
        return { ...r, customPicks: next };
      })
    );
  };

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

  const handleScoreOverride = (newScore) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== activeReportId) return r;
        return { ...r, score: newScore };
      })
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newId = `r${Date.now()}`;
      const activeVerticalObj = VERTICALS.find((v) => v.id === activeVertical);
      const newVenture = {
        id: newId,
        name: 'New ' + activeVerticalObj.name + ' Venture',
        vertical: activeVertical,
        tags: [activeVerticalObj.name, 'Idea'],
        status: 'RECEIVED',
        score: 60,
        profile: {
          companyName: 'New ' + activeVerticalObj.name + ' Venture',
          industry: activeVertical === 'startups' ? 'Logistics' : 'Services',
          stage: 'Idea',
          geography: 'Mumbai, IN',
          businessModel: 'B2B',
          contactInfo: 'founder@newventure.io',
        },
        clusterData: {
          problemStatement: '',
          painPoint: '',
          willingnessToPay: '',
          idealCustomerProfile: '',
          revenueModel: '',
          unitEconomics: '',
          keyCosts: '',
          breakEvenTimeline: '',
          launchGeography: '',
          gtmMotion: '',
          keyMilestones: '',
          fundingAsk: '',
        },
        selectedTracks: [],
        customPicks: [],
        engineData: activeVertical === 'startups' ? {
          tam: 10000000,
          samPct: 15,
          channels: { direct: 33, partner: 33, online: 34 },
          conversion: 5,
        } : activeVertical === 'msmes' ? {
          team: 5,
          hoursLost: 10,
          hourlyRate: 25,
          tools: 'manual',
        } : activeVertical === 'industries' ? {
          framework: 'sixsigma',
          defectRate: 3.5,
          downtime: 5.0,
          departments: 3,
        } : activeVertical === 'students' ? {
          level: 'Undergrad',
          scoping: true,
          litReview: false,
          analysis: false,
          hours: 5,
        } : {
          students: 1000,
          depts: 5,
          digitalMaturity: 'Medium',
          trainingHours: 15,
        }
      };

      setReports((prev) => [newVenture, ...prev]);
      setActiveReportId(newId);
      setIsGenerating(false);
      setIsGenModalOpen(false);
    }, 1900);
  };

  const activeVerticalObj = VERTICALS.find((v) => v.id === activeVertical);

  // Compute live scores dynamically
  const { score: computedScore, subScores: computedSubScores, decision: computedDecision } = computeScore(activeReport);

  // ---- Page-level routing ----
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
        setActiveVertical={(v) => {
          setActiveVertical(v);
          // Find first report with this vertical and select it, or create a mock
          const matched = reports.find(r => r.vertical === v);
          if (matched) {
            setActiveReportId(matched.id);
          }
        }}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        goHome={() => setPage('home')}
      />

      {/* ============ MAIN ============ */}
      <main className="flex-1 overflow-x-hidden">
        <Topbar
          activeVertical={activeVerticalObj}
          reports={reports}
          activeReportId={activeReportId}
          setActiveReportId={handleSelectReport}
          onAddReport={() => setIsGenModalOpen(true)}
        />

        <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8">
          {/* VERTICAL HERO */}
          <VerticalHero vertical={activeVerticalObj} onNewEngagement={() => setIsGenModalOpen(true)} />

          {/* MAIN-VIEW TABS */}
          <MainViewTabs mainView={mainView} setMainView={setMainView} />

          {/* ---------- PIPELINE VIEW (processing architecture) ---------- */}
          {mainView === 'pipeline' && (
            <VentureProcessor
              activeReport={activeReport}
              onStatusChange={(status) => {
                setReports(prev => prev.map(r => r.id === activeReport.id ? { ...r, status } : r));
              }}
              onScoreChange={handleScoreOverride}
              computedScore={computedScore}
              computedSubScores={computedSubScores}
              computedDecision={computedDecision}
            />
          )}

          {/* ---------- INTAKE VIEW (three-layer) ---------- */}
          {mainView === 'intake' && (
            <>
              <ThreeLayerEngine
                activeReport={activeReport}
                handleProfileChange={handleProfileChange}
                handleClusterChange={handleClusterChange}
                activeCluster={activeCluster}
                setActiveCluster={setActiveCluster}
                activeVertical={activeVertical}
                toggleTrack={toggleTrack}
                toggleCustom={toggleCustom}
                onGenerate={() => setIsGenModalOpen(true)}
              />
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px flex-1 bg-amber-500/15" />
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-amber-300/50">Function Engine</span>
                <div className="h-px flex-1 bg-amber-500/15" />
              </div>
              {activeVertical === 'startups' && (
                <StartupMarketEngine activeReport={activeReport} onEngineDataChange={handleEngineDataChange} />
              )}
              {activeVertical === 'msmes' && (
                <MsmeOptimizationEngine activeReport={activeReport} onEngineDataChange={handleEngineDataChange} />
              )}
              {activeVertical === 'industries' && (
                <IndustryAnalysisEngine activeReport={activeReport} onEngineDataChange={handleEngineDataChange} />
              )}
              {activeVertical === 'students' && (
                <StudentMentorshipEngine activeReport={activeReport} onEngineDataChange={handleEngineDataChange} />
              )}
              {activeVertical === 'institutions' && (
                <InstitutionalMaturityEngine activeReport={activeReport} onEngineDataChange={handleEngineDataChange} />
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
              activeReportId={activeReportId}
              onSelectReport={handleSelectReport}
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
   SIDEBAR
   ============================================================ */
function Sidebar({ verticals, activeVertical, setActiveVertical, open, setOpen, goHome }) {
  return (
    <aside
      className={`sticky top-0 z-20 flex h-screen flex-col border-r border-amber-500/15 bg-black/50 backdrop-blur-xl transition-all duration-300 ${
        open ? 'w-72' : 'w-20'
      }`}
    >
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
   TOPBAR — Venture Selector included
   ============================================================ */
function Topbar({ activeVertical, reports, activeReportId, setActiveReportId, onAddReport }) {
  const [open, setOpen] = useState(false);
  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-500/10 bg-black/30 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2 text-sm text-stone-200/50">
        <LayoutDashboard size={16} className="text-amber-400" />
        <span>Dashboard</span>
        <ChevronRight size={14} />
        <span className="font-medium text-stone-200">{activeVertical?.name}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Venture Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-black/45 px-3 py-2 text-xs font-semibold text-stone-200 transition hover:border-amber-400/50"
          >
            <Crown size={12} className="text-amber-400" />
            <span>Venture: <strong className="text-amber-300">{activeReport?.name}</strong></span>
            <ChevronDown size={12} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 z-30 w-64 origin-top-right rounded-xl border border-amber-500/20 bg-stone-900/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <p className="px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-stone-500">Select Active Venture</p>
                  <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                    {reports.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setActiveReportId(r.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          r.id === activeReportId
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'text-stone-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate font-medium">{r.name}</span>
                        <span className="text-[0.55rem] font-bold uppercase tracking-wider opacity-60">
                          {r.vertical}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-amber-500/15 mt-2 pt-2">
                    <button
                      onClick={() => {
                        onAddReport();
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-amber-500/15 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/25"
                    >
                      <Plus size={12} /> New Venture
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
   MAIN-VIEW TABS
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

function VerticalHero({ vertical, onNewEngagement }) {
  const Icon = vertical?.icon;
  return (
    <motion.div
      key={vertical?.id}
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
            <RoyalButton onClick={onNewEngagement}>
              <Sparkles size={15} /> New Engagement
            </RoyalButton>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

/* ============================================================
   THREE-LAYER INTAKE ENGINE
   ============================================================ */
function ThreeLayerEngine({
  activeReport, handleProfileChange, handleClusterChange,
  activeCluster, setActiveCluster, activeVertical,
  toggleTrack, toggleCustom, onGenerate
}) {
  const profile = activeReport?.profile || {};
  const clusterData = activeReport?.clusterData || {};
  const selectedTracks = activeReport?.selectedTracks || [];
  const customPicks = activeReport?.customPicks || [];

  const currentFlagshipTracks = TRACKS_BY_VERTICAL[activeVertical] || [];

  return (
    <section className="space-y-7">
      <SectionTitle
        icon={Layers}
        kicker={`${activeVertical?.toUpperCase()} Vertical`}
        title="Three-Layer Dynamic Intake Engine"
        subtitle="A layered architecture: capture once, cluster by theme, then select flagship tracks."
      />

      {/* LAYER 1 — CLIENT PROFILE */}
      <div className="space-y-3">
        <LayerBadge n={1} title="Client Profile" hint="Captured once at signup" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <GlassPanel className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Company / Venture Name">
                <Input value={profile.companyName ?? ''} onChange={(e) => handleProfileChange('companyName', e.target.value)} />
              </Field>
              <Field label="Industry / Sector">
                <Select value={profile.industry ?? 'Logistics'} onChange={(e) => handleProfileChange('industry', e.target.value)}>
                  <option value="Logistics">Logistics</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Fintech">Fintech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="Eco">Eco / GreenTech</option>
                  <option value="Education">Education</option>
                  <option value="Services">Services</option>
                </Select>
              </Field>
              <Field label="Current Stage">
                <Select value={profile.stage ?? 'Seed'} onChange={(e) => handleProfileChange('stage', e.target.value)}>
                  <option value="Idea">Idea / Concept</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Growth">Growth Scale</option>
                </Select>
              </Field>
              <Field label="Operating Geography">
                <Input value={profile.geography ?? ''} onChange={(e) => handleProfileChange('geography', e.target.value)} />
              </Field>
              <Field label="Business Model">
                <Select value={profile.businessModel ?? 'B2B'} onChange={(e) => handleProfileChange('businessModel', e.target.value)}>
                  <option value="B2B">B2B SaaS / Enterprise</option>
                  <option value="B2C">B2C Retail / App</option>
                  <option value="B2B2C">B2B2C Hybrid</option>
                  <option value="Marketplace">Marketplace Platform</option>
                </Select>
              </Field>
              <Field label="Primary Contact Info">
                <Input value={profile.contactInfo ?? ''} onChange={(e) => handleProfileChange('contactInfo', e.target.value)} />
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
                        <Textarea value={clusterData.problemStatement ?? ''} onChange={(e) => handleClusterChange('problemStatement', e.target.value)} className="min-h-[90px]" />
                      </Field>
                      <Field label="Specific pain point">
                        <Textarea value={clusterData.painPoint ?? ''} onChange={(e) => handleClusterChange('painPoint', e.target.value)} className="min-h-[90px]" />
                      </Field>
                      <Field label="Willingness-to-pay signals">
                        <Input value={clusterData.willingnessToPay ?? ''} onChange={(e) => handleClusterChange('willingnessToPay', e.target.value)} />
                      </Field>
                      <Field label="Ideal customer profile">
                        <Input value={clusterData.idealCustomerProfile ?? ''} onChange={(e) => handleClusterChange('idealCustomerProfile', e.target.value)} />
                      </Field>
                    </>
                  )}
                  {activeCluster === 'viability' && (
                    <>
                      <Field label="Revenue model">
                        <Input value={clusterData.revenueModel ?? ''} onChange={(e) => handleClusterChange('revenueModel', e.target.value)} />
                      </Field>
                      <Field label="Unit economics (gross margin)">
                        <Input value={clusterData.unitEconomics ?? ''} onChange={(e) => handleClusterChange('unitEconomics', e.target.value)} />
                      </Field>
                      <Field label="Key costs">
                        <Input value={clusterData.keyCosts ?? ''} onChange={(e) => handleClusterChange('keyCosts', e.target.value)} />
                      </Field>
                      <Field label="Break-even timeline">
                        <Input value={clusterData.breakEvenTimeline ?? ''} onChange={(e) => handleClusterChange('breakEvenTimeline', e.target.value)} />
                      </Field>
                    </>
                  )}
                  {activeCluster === 'launch' && (
                    <>
                      <Field label="Launch geography">
                        <Input value={clusterData.launchGeography ?? ''} onChange={(e) => handleClusterChange('launchGeography', e.target.value)} />
                      </Field>
                      <Field label="Go-to-market motion">
                        <Input value={clusterData.gtmMotion ?? ''} onChange={(e) => handleClusterChange('gtmMotion', e.target.value)} />
                      </Field>
                      <Field label="Key milestones (12mo)">
                        <Textarea value={clusterData.keyMilestones ?? ''} onChange={(e) => handleClusterChange('keyMilestones', e.target.value)} className="min-h-[70px]" />
                      </Field>
                      <Field label="Funding ask">
                        <Input value={clusterData.fundingAsk ?? ''} onChange={(e) => handleClusterChange('fundingAsk', e.target.value)} />
                      </Field>
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
            {currentFlagshipTracks.map((track) => {
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

            {/* Smart Suggestion engine */}
            <SmartSuggestions
              picks={customPicks}
              tracks={selectedTracks}
              onAdd={toggleCustom}
            />
          </GlassPanel>
        </motion.div>
      </div>

      {/* Generate Report button */}
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
   KANBAN BOARD
   ============================================================ */
function KanbanBoard({
  reports, columns, moveReport, expandedReport, setExpandedReport,
  onGenerate, activeReportId, onSelectReport
}) {
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
                      className={`group cursor-pointer rounded-xl border p-3.5 transition hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] ${
                        r.id === activeReportId
                          ? 'border-amber-400 bg-gradient-to-br from-amber-500/15 to-transparent'
                          : 'border-amber-500/20 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-amber-400/45'
                      }`}
                      onClick={() => onSelectReport(r.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          {r.id === activeReportId && (
                            <span className="mb-1 self-start rounded bg-amber-500/20 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider text-amber-300">
                              Active Venture
                            </span>
                          )}
                          <h5 className="text-sm font-semibold leading-snug text-stone-100">{r.name}</h5>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.tags?.map((t) => (
                          <span key={t} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[0.62rem] text-stone-400">{t}</span>
                        ))}
                      </div>

                      {/* Score */}
                      {r.score > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                              style={{ width: `${r.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-amber-300">{r.score}</span>
                          {r.status === 'PUBLISHED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedReport(expandedReport === r.id ? null : r.id);
                              }}
                              className="text-amber-300/60 transition hover:text-stone-300"
                              aria-label="Expand"
                            >
                              <ChevronDown size={14} className={`transition ${expandedReport === r.id ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>
                      )}

                      <AnimatePresence>
                        {expandedReport === r.id && r.status === 'PUBLISHED' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="mt-3 space-y-2 rounded-lg border border-amber-500/15 bg-black/30 p-3">
                              {[
                                { k: 'Market Potential', v: Math.round(r.score * 1.02) > 100 ? 100 : Math.round(r.score * 1.02) },
                                { k: 'Feasibility', v: Math.round(r.score * 0.95) },
                                { k: 'Pricing Power', v: Math.round(r.score * 0.88) },
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
                          onClick={(e) => {
                            e.stopPropagation();
                            moveReport(r.id, -1);
                          }}
                          disabled={r.status === 'RECEIVED'}
                          className="text-[0.62rem] text-stone-500 transition hover:text-stone-300 disabled:opacity-30"
                        >
                          ← Back
                        </button>
                        <span className="text-[0.6rem] uppercase tracking-wider text-amber-300/40">{r.vertical}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveReport(r.id, 1);
                          }}
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
   SMART SUGGESTION ENGINE
   ============================================================ */
function SmartSuggestions({ picks, tracks, onAdd }) {
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
