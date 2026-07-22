import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, Target, Factory, Building2, AlertTriangle,
  Clock, PiggyBank, ShieldCheck, ChevronRight,
  Gauge, Workflow, Percent,
} from 'lucide-react';
import { GlassPanel, Field, Input, Select, Textarea } from './ui.jsx';

/* ============================================================
   VERTICAL ENGINES — function-specific Zai modules
   A. Startup: TAM/SAM/SOM calculator with channel conversion
   B. MSME:   bottleneck root-cause + savings quantifier
   C. Industry: SOP/defect analysis with quality framework
   ============================================================ */

/* ---------------- A. STARTUP — MARKET SIZING ENGINE ---------------- */
export function StartupMarketEngine() {
  const [tam, setTam] = useState(50000000);
  const [samPct, setSamPct] = useState(18);
  const [channels, setChannels] = useState({ direct: 40, partner: 25, online: 35 });
  const [conversion, setConversion] = useState(8);

  const sam = useMemo(() => Math.round(tam * (samPct / 100)), [tam, samPct]);
  // SOM = SAM weighted by channel reach × overall conversion
  const channelWeight = (channels.direct + channels.partner + channels.online) / 100;
  const som = useMemo(
    () => Math.round(sam * channelWeight * (conversion / 100)),
    [sam, channelWeight, conversion]
  );
  const feasibility = Math.min(100, Math.round(40 + (som / Math.max(tam, 1)) * 1000));

  return (
    <div className="space-y-6">
      <EngineHead
        icon={TrendingUp}
        kicker="Startup Vertical · Strategic Market Intelligence"
        title="Market Sizing & Conversion Engine"
        desc="Calculate Total, Serviceable, and Obtainable markets, then model funnel conversion across sales channels."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Inputs */}
        <GlassPanel className="space-y-4 p-6">
          <Field label="Total Addressable Market (TAM) — USD">
            <Input type="number" value={tam} onChange={(e) => setTam(parseInt(e.target.value) || 0)} />
          </Field>
          <Field label={`Serviceable % of TAM — ${samPct}%`} hint="Share of TAM your model can actually reach">
            <input type="range" min={1} max={100} value={samPct} onChange={(e) => setSamPct(parseInt(e.target.value))} className="w-full" />
          </Field>

          <div className="rounded-xl border border-amber-500/15 bg-black/30 p-4">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-amber-300/70">Channel Mix (% of reach)</p>
            {[
              { key: 'direct', label: 'Direct Sales' },
              { key: 'partner', label: 'Channel / Partner' },
              { key: 'online', label: 'Online / Self-serve' },
            ].map((ch) => (
              <div key={ch.key} className="mb-2.5 flex items-center gap-3">
                <span className="w-28 text-xs text-stone-400">{ch.label}</span>
                <input
                  type="range" min={0} max={100} value={channels[ch.key]}
                  onChange={(e) => setChannels((p) => ({ ...p, [ch.key]: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-9 text-right text-xs font-bold text-amber-300">{channels[ch.key]}%</span>
              </div>
            ))}
          </div>

          <Field label={`Overall Conversion Rate — ${conversion}%`} hint="Lead-to-customer conversion across channels">
            <input type="range" min={1} max={50} value={conversion} onChange={(e) => setConversion(parseInt(e.target.value))} className="w-full" />
          </Field>
        </GlassPanel>

        {/* Output — funnel */}
        <GlassPanel className="flex flex-col p-6">
          <h4 className="font-serif text-lg font-bold text-stone-100">Funnel Output</h4>
          <div className="mt-4 flex-1 space-y-3">
            <FunnelBar label="TAM" value={tam} max={tam} color="from-rose-600 to-rose-500" />
            <FunnelBar label="SAM" value={sam} max={tam} color="from-amber-600 to-amber-500" sub={`${samPct}% of TAM`} />
            <FunnelBar label="SOM" value={som} max={tam} color="from-emerald-600 to-emerald-500" sub={`${Math.round((som / Math.max(sam, 1)) * 100)}% of SAM`} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Metric label="Channel Reach" value={`${Math.round(channelWeight * 100)}%`} icon={Workflow} />
            <Metric label="Conv. Rate" value={`${conversion}%`} icon={Percent} />
            <Metric label="Feasibility" value={`${feasibility}`} icon={Gauge} />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

/* ---------------- B. MSME — LEAN PROCESS OPTIMIZATION ---------------- */
export function MsmeOptimizationEngine() {
  const [workflow, setWorkflow] = useState('Order received → owner approves invoice manually → dispatch → WhatsApp follow-up for payment');
  const [team, setTeam] = useState(7);
  const [friction, setFriction] = useState('Invoice approvals stall because only the owner can sign off — every order waits on me');
  const [hoursLost, setHoursLost] = useState(14);
  const [hourlyRate, setHourlyRate] = useState(35);

  const weeklyCost = hoursLost * hourlyRate;
  const annualCost = weeklyCost * 50;
  // Estimate savings: automation typically recovers ~60% of owner-bottleneck time
  const estSavings = Math.round(annualCost * 0.6);

  return (
    <div className="space-y-6">
      <EngineHead
        icon={Factory}
        kicker="MSME Vertical · Operations Diagnostic"
        title="Lean Process Optimization Engine"
        desc="MSMEs run lean with centralized decisions. Map the workflow, isolate the bottleneck, and quantify recoverable time & cost."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassPanel className="space-y-4 p-6">
          <Field label="Step-by-Step Current Workflow">
            <Textarea value={workflow} onChange={(e) => setWorkflow(e.target.value)} className="min-h-[80px]" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Team Size Involved">
              <Input type="number" value={team} onChange={(e) => setTeam(parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Existing Tools">
              <Select defaultValue="excel">
                <option value="excel">Excel / Sheets</option>
                <option value="manual">Manual / Paper</option>
                <option value="basic">Basic SaaS</option>
                <option value="none">None</option>
              </Select>
            </Field>
          </div>
          <Field label="Primary Daily Friction / Bottleneck (in your own words)">
            <Textarea value={friction} onChange={(e) => setFriction(e.target.value)} className="min-h-[70px]" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Hours Lost / Week">
              <Input type="number" value={hoursLost} onChange={(e) => setHoursLost(parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Effective Hourly Cost (USD)">
              <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)} />
            </Field>
          </div>
        </GlassPanel>

        {/* Diagnosis */}
        <div className="space-y-4">
          <GlassPanel className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <h4 className="font-serif text-base font-bold text-stone-100">Root-Cause Diagnosis</h4>
            </div>
            <div className="space-y-2 text-xs text-stone-400">
              <DiagRow tag="Bottleneck" value="Single-sign-off dependency on owner" />
              <DiagRow tag="Cause" value="Centralized authority, no delegation rules" />
              <DiagRow tag="Impact" value="Every order queued; throughput throttled" />
              <DiagRow tag="Fix Lever" value="Tiered approval thresholds + auto-routing" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <PiggyBank size={15} className="text-emerald-400" />
              <h4 className="font-serif text-base font-bold text-stone-100">Quantified Savings</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SavingsCard icon={Clock} label="Weekly Cost Lost" value={`$${weeklyCost.toLocaleString()}`} />
              <SavingsCard icon={DollarSign} label="Annual Cost Lost" value={`$${annualCost.toLocaleString()}`} tone="rose" />
            </div>
            <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-emerald-300/80">Estimated Recovery (60%)</p>
              <p className="font-serif text-2xl font-bold text-emerald-300">${estSavings.toLocaleString()}<span className="text-sm text-stone-400">/yr</span></p>
              <p className="mt-1 text-[0.66rem] text-stone-500">Low-capital automation typically recovers ~60% of owner-bottleneck time.</p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- C. INDUSTRY — ENTERPRISE PROCESS ANALYSIS ---------------- */
export function IndustryAnalysisEngine() {
  const [framework, setFramework] = useState('sixsigma');
  const [defectRate, setDefectRate] = useState(4.2);
  const [downtime, setDowntime] = useState(6.1);
  const [departments, setDepartments] = useState(4);

  // Sigma level approximation from defect rate (%)
  const sigma = useMemo(() => {
    if (defectRate <= 0) return 6;
    const y = 100 - defectRate;
    const z = 1.5 + (Math.log(y / (100 - y)) / Math.log(10)) * 1.7;
    return Math.min(6, Math.max(0, Math.round(z * 10) / 10));
  }, [defectRate]);

  const frameworkMeta = {
    sixsigma: { name: 'Six Sigma / DMAIC', target: 'Defect rate < 3.4 DPMO (≈4.8σ)' },
    iso: { name: 'ISO 9001', target: 'Documented QMS + corrective-action loops' },
    tqm: { name: 'TQM', target: 'Continuous improvement +全员参与' },
    none: { name: 'None / Ad-hoc', target: 'No formal quality framework' },
  }[framework];

  return (
    <div className="space-y-6">
      <EngineHead
        icon={Building2}
        kicker="Industry Vertical · Systems Architecture"
        title="Enterprise Process Analysis Engine"
        desc="Multi-departmental scale with SOPs, governance, and KPIs. Root-cause at enterprise grade using your quality framework."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <GlassPanel className="space-y-4 p-6">
          <Field label="Quality Framework" hint="Drives the analysis methodology & sign-off gates">
            <Select value={framework} onChange={(e) => setFramework(e.target.value)}>
              <option value="sixsigma">Six Sigma (DMAIC)</option>
              <option value="iso">ISO 9001</option>
              <option value="tqm">TQM</option>
              <option value="none">None / Ad-hoc</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Defect Rate (%)">
              <Input type="number" step="0.1" value={defectRate} onChange={(e) => setDefectRate(parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Downtime (hrs/mo)">
              <Input type="number" step="0.1" value={downtime} onChange={(e) => setDowntime(parseFloat(e.target.value) || 0)} />
            </Field>
          </div>
          <Field label="Departments / Business Units">
            <Input type="number" value={departments} onChange={(e) => setDepartments(parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Process Map / SOP Summary">
            <Textarea defaultValue="Line-3 changeover: manual recalibration by ops team, QA sign-off, then production resume. Averaging 4.2% defects post-changeover." className="min-h-[70px]" />
          </Field>
        </GlassPanel>

        {/* Enterprise diagnosis */}
        <div className="space-y-4">
          <GlassPanel className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={15} className="text-amber-400" />
              <h4 className="font-serif text-base font-bold text-stone-100">Systemic Efficiency Read</h4>
            </div>
            <div className="space-y-2 text-xs text-stone-400">
              <DiagRow tag="Framework" value={frameworkMeta.name} />
              <DiagRow tag="Target" value={frameworkMeta.target} />
              <DiagRow tag="Defect Rate" value={`${defectRate}% → target ≤ 0.00034%`} />
              <DiagRow tag="Sigma Level" value={`${sigma}σ (goal 4.8σ+)`} />
              <DiagRow tag="Scope" value={`${departments} departments · cross-functional sign-off`} />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Target size={15} className="text-amber-400" />
              <h4 className="font-serif text-base font-bold text-stone-100">Phased Roadmap</h4>
            </div>
            <div className="space-y-3">
              <RoadmapPhase phase="Phase 1 · Define + Measure" desc="Map current changeover SOP, baseline defect/downtime data per department." />
              <RoadmapPhase phase="Phase 2 · Analyze" desc="Root-cause via Ishikawa; isolate the calibration variance driver." />
              <RoadmapPhase phase="Phase 3 · Improve + Control" desc="Auto-calibration pilot, control charts, leadership sign-off gate." />
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

/* ---------- shared small components ---------- */
function EngineHead({ icon: Icon, kicker, title, desc }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-amber-400" />
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-300/70">{kicker}</span>
      </div>
      <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-100 md:text-3xl">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-stone-400">{desc}</p>
    </div>
  );
}

function FunnelBar({ label, value, max, color, sub }) {
  const pct = Math.max(2, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-stone-300">{label}</span>
        <span className="font-semibold text-amber-300">${value.toLocaleString()}</span>
      </div>
      <div className="h-7 overflow-hidden rounded-lg bg-black/40">
        <motion.div
          className={`h-full rounded-lg bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      {sub && <span className="mt-0.5 block text-[0.62rem] text-stone-500">{sub}</span>}
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-amber-500/15 bg-black/30 p-3 text-center">
      <Icon size={13} className="mx-auto text-amber-400" />
      <p className="mt-1 font-serif text-lg font-bold text-stone-100">{value}</p>
      <p className="text-[0.58rem] uppercase tracking-wider text-stone-500">{label}</p>
    </div>
  );
}

function DiagRow({ tag, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/10 bg-black/20 px-3 py-2">
      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-amber-300/60">{tag}</span>
      <span className="text-right text-stone-300">{value}</span>
    </div>
  );
}

function SavingsCard({ icon: Icon, label, value, tone = 'amber' }) {
  const toneCls = tone === 'rose' ? 'text-rose-300 border-rose-400/20 bg-rose-500/5' : 'text-amber-300 border-amber-400/20 bg-amber-500/5';
  return (
    <div className={`rounded-xl border p-3 ${toneCls}`}>
      <Icon size={13} />
      <p className="mt-1 font-serif text-lg font-bold">{value}</p>
      <p className="text-[0.58rem] uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function RoadmapPhase({ phase, desc }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10">
        <ChevronRight size={12} className="text-amber-400" />
      </div>
      <div>
        <p className="text-xs font-bold text-stone-200">{phase}</p>
        <p className="text-[0.7rem] text-stone-500">{desc}</p>
      </div>
    </div>
  );
}
