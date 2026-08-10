import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  checkHealth, listReports, advanceReport, revertReport, getReport, deleteReport,
  processReport, runOrbitaAnalysis as apiRunOrbitaAnalysis,
  submitReview as apiSubmitReview, downloadReportDocx,
} from "../api.js";
import { downloadReportDoc } from "../reportDoc.js";
import QueriesPanel from "./QueriesPanel.jsx";
import DocumentUpload from "./DocumentUpload.jsx";
import StrengthBadge from "./StrengthBadge.jsx";
import AiAssessmentPanel from "./AiAssessmentPanel.jsx";
import {
  ShieldCheck,
  Layers,
  UserCheck,
  Folder,
  Activity,
  MessageSquare,
  Search,
  Bell,
  LogOut,
  Home,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Download,
  Eye,
  FileText,
  Edit,
  Trash2,
  Send,
  Building2,
  GraduationCap,
  School,
  Factory,
  Rocket,
  Target,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Cpu,
  PieChart,
  BarChart3,
  Check,
  X,
  RefreshCw,
  Mail,
  User
} from "lucide-react";
import { KANBAN_COLUMNS } from "../constants.js";
import { OrbitBrand } from "./ui.jsx";
import { listInvoices, subscribePayments, markUnpaid, isReportPaid, getReportPayment, setReportPayment, clearReportPayment, ALL_METHODS, payForReport } from "../paymentsStore.js";

/* ============================================================
   ELEGANT & SIMPLE ADMIN DATA SEEDS
   ============================================================ */

const INITIAL_10_MODULES = [
  {
    id: "mod-01",
    code: "MOD-01",
    name: "Market Sizing & Whitespace",
    category: "Market Foundation",
    icon: Target,
    status: "PENDING",
    score: null,
    desc: "TAM/SAM/SOM structural estimation, whitespace analysis, and market potential.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-02",
    code: "MOD-02",
    name: "Competitor Intelligence",
    category: "Market Foundation",
    icon: Layers,
    status: "PENDING",
    score: null,
    desc: "Feature teardowns, pricing models, positioning matrices, and defensibility moats.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-03",
    code: "MOD-03",
    name: "Financial Viability & Unit Economics",
    category: "Business Viability",
    icon: DollarSign,
    status: "PENDING",
    score: null,
    desc: "CAC, LTV, payback period, gross margin modeling, and break-even trajectory.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-04",
    code: "MOD-04",
    name: "Go-To-Market Strategy",
    category: "Launch & Execution",
    icon: TrendingUp,
    status: "PENDING",
    score: null,
    desc: "Channel selection, sales cycle optimization, partner ecosystems, and GTM engines.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-05",
    code: "MOD-05",
    name: "Risk & Vulnerability Audit",
    category: "Business Viability",
    icon: ShieldAlert,
    status: "PENDING",
    score: null,
    desc: "Single points of failure, supply chain exposure, and regulatory compliance risks.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-06",
    code: "MOD-06",
    name: "Customer Persona & Demand Signal",
    category: "Market Foundation",
    icon: Activity,
    status: "PENDING",
    score: null,
    desc: "Problem severity validation, willingness-to-pay signals, and journey friction.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-07",
    code: "MOD-07",
    name: "Regulatory & Compliance Framework",
    category: "Business Viability",
    icon: Building2,
    status: "PENDING",
    score: null,
    desc: "ISO, GDPR, HIPAA, and industry-specific regulatory standards audit.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-08",
    code: "MOD-08",
    name: "Technology Architecture Audit",
    category: "Launch & Execution",
    icon: Cpu,
    status: "PENDING",
    score: null,
    desc: "System scalability, tech stack vulnerability, maintenance debt, and IP integrity.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-09",
    code: "MOD-09",
    name: "Operations & Supply Bottlenecks",
    category: "Launch & Execution",
    icon: PieChart,
    status: "PENDING",
    score: null,
    desc: "Process latency, fulfillment overheads, vendor SLA analysis, and operational yield.",
    leadAuditor: null,
    activeProjects: 0
  },
  {
    id: "mod-10",
    code: "MOD-10",
    name: "Executive Verdict & Scorecard",
    category: "Executive Governance",
    icon: Sparkles,
    status: "PENDING",
    score: null,
    desc: "Synthesized binary GO/NO-GO recommendation, capital deployment verdict, and scorecard.",
    leadAuditor: null,
    activeProjects: 0
  }
];

const INITIAL_CLIENT_PROFILES = [];
/* Profiles are derived from the clients attached to real submitted
   reports — see clientProfilesFromReports() below. */


const INITIAL_PROJECT_REGISTRATIONS = [];
/* Registrations mirror real client submissions rather than demo rows. */


/* ---- Backend bridge ------------------------------------------------------
   Maps the server's four-status pipeline onto this console's report rows.
   Seeds below remain when no API is reachable. */
const SERVER_STATUS_TO_ADMIN = {
  RECEIVED: "PENDING",
  PENDING: "IN_PROGRESS",
  PROCESSED: "PROCESSED",
  REVIEWING: "REVIEWING",
  PUBLISHED: "COMPLETED",
};

function adminReportFromServer(r) {
  const done = (r.completedModules || []).length;
  return {
    id: r.id,
    reportName: r.name,
    domain: (r.vertical || "startups").replace(/^./, (c) => c.toUpperCase()),
    tags: (r.tags || []).slice(0, 2),
    status: SERVER_STATUS_TO_ADMIN[r.status] || r.status,
    progressPct: Math.round((done / 10) * 100),
    score: r.score ?? 0,
    auditor: "Pipeline Engine",
    fromApi: true,
    serverStatus: r.status,
    createdAt: r.createdAt || null,
    updatedAt: r.updatedAt || r.createdAt || null,
    clientEmail: ((r.client && (r.client.email || r.client.contact)) || "").trim().toLowerCase(),
    clientCompany: ((r.client && r.client.company) || r.name || "").trim(),
    problem: (r.clusters && r.clusters.market && r.clusters.market.problem) || "",
    decision: r.decision || null,
    scoreBand: r.scoreBand || null,
  };
}

function formatReportDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* Client profiles and project registrations have no endpoints of their own —
   they are the client record attached to each submitted report, so both views
   are derived from the real report list rather than kept as separate demo
   data. One profile per distinct client email/company. */
function clientProfilesFromReports(serverReports = []) {
  const byKey = new Map();
  for (const r of serverReports) {
    const c = (r.client && typeof r.client === "object") ? r.client : {};
    const email = (c.email || c.contact || "").trim();
    const company = (c.company || r.name || "").trim();
    const key = (email || company).toLowerCase();
    if (!key || byKey.has(key)) continue;
    byKey.set(key, {
      id: `cli-${key.replace(/[^a-z0-9]+/g, "-")}`,
      fullName: c.contact?.trim() || company || "Unnamed client",
      email: email || "—",
      company: company || "—",
      domain: (r.vertical || "startups").replace(/^./, (ch) => ch.toUpperCase()),
      status: r.status === "PUBLISHED" ? "VERIFIED" : "ACTIVE",
      strengthBand: r.scoreBand || null,
      accountType: "Client",
      phone: (c.phone || "").toString().trim() || "—",
      location: c.geography?.trim() || "—",
      stage: c.stage || "—",
      businessModel: c.businessModel || "—",
      website: (c.website || "").trim() || "—",
      problem: (r.clusters && r.clusters.market && r.clusters.market.problem) || "",
      firstReportId: r.id,
      fromApi: true,
    });
  }
  return [...byKey.values()];
}

function registrationsFromReports(serverReports = []) {
  return serverReports.map((r) => {
    const c = (r.client && typeof r.client === "object") ? r.client : {};
    return {
      id: `reg-${r.id}`,
      // The report this registration mirrors, so its actions can drive the
      // real pipeline instead of a local label that the poll overwrites.
      reportId: r.id,
      serverStatus: r.status,
      projectName: r.name,
      domain: (r.vertical || "startups").replace(/^./, (ch) => ch.toUpperCase()),
      clientName: c.contact?.trim() || c.company?.trim() || "—",
      clientEmail: (c.email || c.contact || "—").trim(),
      status: r.status === "PUBLISHED" ? "APPROVED" : r.status === "RECEIVED" ? "NEW" : "UNDER_AUDIT",
      notes: r.clusters?.market?.problem || "",
      icon: Rocket,
      submitted: (r.createdAt || "").split("T")[0],
      fromApi: true,
    };
  });
}

const INITIAL_REPORTS = [];
/* Reports come from the backend: every client submission lands here for
   admin review and approval. Nothing is pre-seeded. */

const DEMO_REPORTS_KEY = "co.demoReports";

/* Three sample published-but-unpaid reports for demoing the paywall flow
   without needing to run the backend through a real submission. */
const SAMPLE_UNPAID_REPORTS = [
  {
    id: "demo-founder-labs",
    reportName: "Founder Labs — SaaS launch strategy",
    domain: "Startups",
    tags: ["saas", "b2b"],
    status: "COMPLETED",
    progressPct: 100,
    score: 82,
    auditor: "Pipeline Engine",
    fromApi: false,
    serverStatus: "PUBLISHED",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    clientEmail: "founder@venture.io",
    clientCompany: "Founder Labs",
    problem: "Reduce onboarding time for B2B SaaS teams from days to hours.",
    decision: 1,
    scoreBand: "STRONG",
    isDemo: true,
  },
  {
    id: "demo-aurora-retail",
    reportName: "Aurora Retail — Tier-2 city expansion",
    domain: "Retail",
    tags: ["retail", "expansion"],
    status: "COMPLETED",
    progressPct: 100,
    score: 68,
    auditor: "Pipeline Engine",
    fromApi: false,
    serverStatus: "PUBLISHED",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    clientEmail: "priya@aurora.co",
    clientCompany: "Aurora Retail",
    problem: "Expand fast-fashion stores into 5 Tier-2 cities within 12 months.",
    decision: 1,
    scoreBand: "MODERATE",
    isDemo: true,
  },
  {
    id: "demo-helio-edu",
    reportName: "Helio Edu — Bootcamp market entry",
    domain: "Education",
    tags: ["edtech", "bootcamp"],
    status: "COMPLETED",
    progressPct: 100,
    score: 74,
    auditor: "Pipeline Engine",
    fromApi: false,
    serverStatus: "PUBLISHED",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 / 2).toISOString(),
    clientEmail: "arjun@helio.edu",
    clientCompany: "Helio Edu",
    problem: "Launch a 12-week data analytics bootcamp targeted at working professionals.",
    decision: 1,
    scoreBand: "STRONG",
    isDemo: true,
  },
];

function readDemoReports() {
  try { return localStorage.getItem(DEMO_REPORTS_KEY) === "1" ? SAMPLE_UNPAID_REPORTS : []; }
  catch { return []; }
}


const INITIAL_TICKETS = [];
/* No demo tickets — the desk fills with real client queries. */


export default function AdminDashboard({ onLogout, onGoHome }) {
  // Navigation State
  const [activeNav, setActiveNav] = useState("all-modules");

  // Search & Global state
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Data States
  const [modules, setModules] = useState(INITIAL_10_MODULES);
  const [clientProfiles, setClientProfiles] = useState(INITIAL_CLIENT_PROFILES);
  const [registrations, setRegistrations] = useState(INITIAL_PROJECT_REGISTRATIONS);
  const [reports, setReports] = useState(() => readDemoReports());
  const [demoOn, setDemoOn] = useState(() => localStorage.getItem(DEMO_REPORTS_KEY) === "1");
  const toggleDemoReports = () => {
    const next = !demoOn;
    if (next) localStorage.setItem(DEMO_REPORTS_KEY, "1");
    else localStorage.removeItem(DEMO_REPORTS_KEY);
    setDemoOn(next);
    setReports((prev) => {
      const withoutDemo = prev.filter((r) => !r.isDemo);
      return next ? [...SAMPLE_UNPAID_REPORTS, ...withoutDemo] : withoutDemo;
    });
  };
  const [apiStatus, setApiStatus] = useState("checking");

  /* Pull the report list and derive every console view from it. Kept as a
     stable callback so the polling effect below can reuse it — clients submit
     on their own side, so the admin console has to refresh to notice a new
     submission rather than staying frozen on what loaded at mount. */
  const refreshReports = useCallback(async (signal) => {
    const data = await listReports(signal);
    setApiStatus("online");
    const serverReports = data?.reports || [];
    /* Trust the server unconditionally — with no demo seeds left, an empty
       database must render as an empty console, not as stale rows. */
    setReports([...readDemoReports(), ...serverReports.map(adminReportFromServer)]);
    setClientProfiles(clientProfilesFromReports(serverReports));
    setRegistrations(registrationsFromReports(serverReports));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const health = await checkHealth(controller.signal);
        if (!health.ready) { setApiStatus("offline"); return; }
        await refreshReports(controller.signal);
      } catch (err) {
        if (err.name !== "AbortError") setApiStatus("offline");
      }
    })();
    return () => controller.abort();
  }, [refreshReports]);

  // Poll for newly submitted client reports, and refresh on tab focus.
  useEffect(() => {
    if (apiStatus !== "online") return undefined;
    const id = setInterval(() => {
      refreshReports().catch(() => {});
    }, 15000);
    const onFocus = () => {
      if (document.visibilityState === "visible") refreshReports().catch(() => {});
    };
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [apiStatus, refreshReports]);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  // Filters
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState("ALL");
  const [profileStatusFilter, setProfileStatusFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL");
  const [reportView, setReportView] = useState("list"); // 'list' | 'board'
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");

  // Search & Shortlist section
  const [shortlistDomain, setShortlistDomain] = useState("ALL");
  const [shortlistStatus, setShortlistStatus] = useState("ALL");
  const [shortlistMinScore, setShortlistMinScore] = useState(0);
  const [shortlistMaxScore, setShortlistMaxScore] = useState(100);
  const [shortlistBucket, setShortlistBucket] = useState(new Set()); // ids

  // Invoices — client-side simulated payments store
  const [invoiceList, setInvoiceList] = useState(() => listInvoices());
  const [paymentEditorReportId, setPaymentEditorReportId] = useState(null);
  const [payVersion, setPayVersion] = useState(0);
  useEffect(() => {
    const unsub = subscribePayments(() => {
      setInvoiceList(listInvoices());
      setPayVersion((v) => v + 1);
    });
    return unsub;
  }, []);
  /* { row, loading, detail } — detail is the server's { report, moduleResults,
     pipeline } for API rows, null for local sample rows. */
  const [reportDetail, setReportDetail] = useState(null);
  /* Which report the Client Documents section is filtered to; "" = all. */
  const [adminDocReportId, setAdminDocReportId] = useState("");
  const [ticketFilter, setTicketFilter] = useState("ALL");

  // Per-report critical analysis for the Registrations panel.
  // Shape: { [reportId]: { loading?: bool, error?: string, data?: OrbitaResult } }
  const [analysisByReport, setAnalysisByReport] = useState({});

  const runCriticalAnalysis = useCallback(async (reportId) => {
    setAnalysisByReport((prev) => ({ ...prev, [reportId]: { loading: true } }));
    try {
      const data = await apiRunOrbitaAnalysis(reportId);
      setAnalysisByReport((prev) => ({ ...prev, [reportId]: { data } }));
    } catch (err) {
      setAnalysisByReport((prev) => ({ ...prev, [reportId]: { error: err.message || "Analysis failed." } }));
    }
  }, []);

  // Modals
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
  const [isAddRegistrationModalOpen, setIsAddRegistrationModalOpen] = useState(false);

  // Report Review Modal
  const [reviewReportId, setReviewReportId] = useState(null);
  const [reviewReportData, setReviewReportData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [orbitaResult, setOrbitaResult] = useState(null);
  const [orbitaLoading, setOrbitaLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ adminScore: "", approvalNote: "", verdict: "", analysis: "", strengths: "", risks: "" });
  const [moduleOverrides, setModuleOverrides] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // New Profile Form
  const [newProfile, setNewProfile] = useState({ fullName: "", email: "", company: "", domain: "Startups" });
  // New Registration Form
  const [newReg, setNewReg] = useState({ projectName: "", domain: "Startups", clientName: "", clientEmail: "", notes: "" });

  const handleUpdateModuleStatus = (id, newStatus) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
  };


  const handleUpdateReportProgress = async (id, delta) => {
    const target = reports.find((r) => r.id === id);

    /* API-backed rows move through the server's state machine instead of a
       local percentage — advance is gated there, so a 409 names the modules
       still missing rather than letting the row lie about its progress. */
    if (target?.fromApi && apiStatus === "online") {
      try {
        const data = delta > 0 ? await advanceReport(id) : await revertReport(id);
        // Express answers { report }, FastAPI answers { status }.
        const serverStatus = data?.report?.status || data?.status;
        if (serverStatus) {
          setReports((prev) =>
            prev.map((rep) =>
              rep.id === id
                ? {
                    ...rep,
                    serverStatus,
                    status: SERVER_STATUS_TO_ADMIN[serverStatus] || serverStatus,
                    progressPct: data?.report
                      ? Math.round(((data.report.completedModules || []).length / 10) * 100)
                      : rep.progressPct,
                  }
                : rep
            )
          );
        }
      } catch (err) {
        alert(err.message || "The pipeline refused that transition.");
      }
      return;
    }

    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== id) return rep;
        const newPct = Math.min(100, Math.max(0, rep.progressPct + delta));
        let newStatus = rep.status;
        if (newPct === 100) newStatus = "COMPLETED";
        else if (newPct > 50) newStatus = "PROCESSED";
        else if (newPct > 0) newStatus = "IN_PROGRESS";
        return { ...rep, progressPct: newPct, status: newStatus };
      })
    );
  };

  // Report detail view — pulls module results + transition history for API rows.
  const handleViewReport = async (rep) => {
    if (rep.fromApi && apiStatus === "online") {
      setReportDetail({ row: rep, loading: true, detail: null });
      try {
        const data = await getReport(rep.id);
        setReportDetail({ row: rep, loading: false, detail: data });
      } catch (err) {
        setReportDetail({ row: rep, loading: false, detail: null, error: err.message });
      }
    } else {
      setReportDetail({ row: rep, loading: false, detail: null });
    }
  };

  // Delete a report (and its module results, server-side) after confirmation.
  const handleDeleteReport = async (rep) => {
    if (!window.confirm(`Delete "${rep.reportName}" and all its module results? This cannot be undone.`)) return;
    if (rep.fromApi && apiStatus === "online") {
      try {
        await deleteReport(rep.id);
      } catch (err) {
        alert(err.message || "The server refused to delete this report.");
        return;
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== rep.id));
    setReportDetail((d) => (d?.row?.id === rep.id ? null : d));
  };

  // Run all 10 gating modules using the report's stored intake data and
  // advance the pipeline through to REVIEWING — the point where the admin
  // manually reviews and publishes.
  const [processingId, setProcessingId] = useState(null);
  const handleProcessReport = async (rep) => {
    if (!rep.fromApi || apiStatus !== "online") {
      alert("Processing requires a live backend.");
      return;
    }
    setProcessingId(rep.id);
    try {
      const data = await processReport(rep.id);
      const serverStatus = data?.report?.status;
      setReports((prev) =>
        prev.map((r) =>
          r.id === rep.id
            ? {
                ...r,
                serverStatus,
                status: SERVER_STATUS_TO_ADMIN[serverStatus] || serverStatus,
                progressPct: Math.round(((data?.report?.completedModules || []).length / 10) * 100),
              }
            : r
        )
      );
      alert(`Processed. Report is now in ${serverStatus} — open the review to add your analysis.`);
    } catch (err) {
      alert(err.message || "Processing failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateTicketStatus = (id, newStatus, note) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus, investigationNote: note || t.investigationNote } : t))
    );
  };

  const openReviewModal = async (reportId) => {
    setReviewReportId(reportId);
    setReviewReportData(null);
    setReviewError(null);
    setOrbitaResult(null);
    setReviewForm({ adminScore: "", approvalNote: "" });
    setModuleOverrides({});
    setReviewLoading(true);
    try {
      const data = await getReport(reportId);
      setReviewReportData(data);
    } catch (err) {
      setReviewError(err.message || "Failed to load report data.");
    } finally {
      setReviewLoading(false);
    }
  };

  const runOrbitaAnalysis = async () => {
    if (!reviewReportId) return;
    setOrbitaLoading(true);
    setOrbitaResult(null);
    try {
      const data = await apiRunOrbitaAnalysis(reviewReportId);
      setOrbitaResult(data);
    } catch (err) {
      setOrbitaResult({ error: err.message || "Analysis failed." });
    } finally {
      setOrbitaLoading(false);
    }
  };

  const submitReview = async (action) => {
    if (!reviewReportId) return;

    if (action === "approve") {
      // Backend requires adminScore (0-100). Catch it here so we don't waste
      // a round trip on a 422.
      const raw = reviewForm.adminScore;
      const n = Number(raw);
      if (raw === "" || raw === null || raw === undefined || Number.isNaN(n) || n < 0 || n > 100) {
        alert("Please enter a Score between 0 and 100 before approving.");
        return;
      }
    }

    setReviewSubmitting(true);
    try {
      if (action === "approve") {
        const body = {
          adminScore: Number(reviewForm.adminScore),
          adminAnalysis: reviewForm.analysis || undefined,
          adminVerdict: reviewForm.verdict || undefined,
          adminStrengths: reviewForm.strengths || undefined,
          adminRisks: reviewForm.risks || undefined,
          approvalNote: reviewForm.approvalNote || undefined,
        };
        /* Goes through the API client so the session token travels with it —
           the review endpoint is admin-only, and a bare fetch would 403.
           It also normalises the error envelopes this used to unpack by hand. */
        await apiSubmitReview(reviewReportId, body);
      } else {
        await revertReport(reviewReportId);
      }

      // Clear submitting BEFORE the alert so the button doesn't hang on
      // "Submitting…" while the alert blocks the event loop.
      setReviewSubmitting(false);
      setReviewReportId(null);
      alert(action === "approve" ? "Review submitted and report published." : "Report sent back.");

      try {
        const data = await listReports();
        const rows = (data?.reports || []).map(adminReportFromServer);
        if (rows.length) setReports([...readDemoReports(), ...rows]);
      } catch (_) { /* ignore refresh errors */ }
    } catch (err) {
      setReviewSubmitting(false);
      alert(err.message || "Review submission failed.");
    }
  };

  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    const item = {
      id: `cli-${Date.now()}`,
      fullName: newProfile.fullName,
      email: newProfile.email,
      company: newProfile.company,
      domain: newProfile.domain,
      status: "VERIFIED",
      accountType: "Client",
      phone: "+1 (555) 000-0000",
      location: "Global"
    };
    setClientProfiles([item, ...clientProfiles]);
    setIsAddProfileModalOpen(false);
    setNewProfile({ fullName: "", email: "", company: "", domain: "Startups" });
  };

  const handleCreateRegistrationSubmit = (e) => {
    e.preventDefault();
    const domainIcons = {
      "Students & Scholars": GraduationCap,
      "Educational Institutions": School,
      "MSMEs": Factory,
      "Industries": Building2,
      "Startups": Rocket
    };
    const item = {
      id: `reg-${Date.now()}`,
      projectName: newReg.projectName,
      domain: newReg.domain,
      domainIcon: domainIcons[newReg.domain] || Rocket,
      clientName: newReg.clientName,
      clientEmail: newReg.clientEmail,
      regDate: new Date().toISOString().split("T")[0],
      status: "PENDING_REVIEW",
      priority: "MEDIUM",
      capabilitiesRequested: ["Domain Diagnostic", "Executive Scorecard"],
      notes: newReg.notes
    };
    setRegistrations([item, ...registrations]);
    setIsAddRegistrationModalOpen(false);
    setNewReg({ projectName: "", domain: "Startups", clientName: "", clientEmail: "", notes: "" });
  };

  // Filtered lists
  const filteredModules = modules.filter((m) => {
    const matchesCat = moduleCategoryFilter === "ALL" || m.category === moduleCategoryFilter;
    const matchesQ = searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  const filteredProfiles = clientProfiles.filter((p) => {
    const matchesSt = profileStatusFilter === "ALL" || p.status === profileStatusFilter;
    const matchesQ = searchQuery === "" || p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSt && matchesQ;
  });

  const filteredRegistrations = registrations.filter((r) => {
    const matchesDom = domainFilter === "ALL" || r.domain === domainFilter;
    const matchesQ = searchQuery === "" || r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || r.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDom && matchesQ;
  });

  const fromTs = reportDateFrom ? new Date(`${reportDateFrom}T00:00:00`).getTime() : null;
  const toTs = reportDateTo ? new Date(`${reportDateTo}T23:59:59`).getTime() : null;
  const filteredReports = reports
    .filter((rep) => {
      const matchesSt = reportStatusFilter === "ALL" || rep.status === reportStatusFilter;
      const matchesQ = searchQuery === "" || rep.reportName.toLowerCase().includes(searchQuery.toLowerCase());
      const t = rep.createdAt ? new Date(rep.createdAt).getTime() : null;
      const matchesFrom = fromTs === null || (t !== null && t >= fromTs);
      const matchesTo = toTs === null || (t !== null && t <= toTs);
      return matchesSt && matchesQ && matchesFrom && matchesTo;
    });

  const filteredTickets = tickets.filter((t) => {
    const matchesType = ticketFilter === "ALL" || (ticketFilter === "QUERY" && t.type === "BUSINESS_QUERY") || (ticketFilter === "CONTACT" && t.type === "CONTACT_FORM") || t.status === ticketFilter;
    const matchesQ = searchQuery === "" || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQ;
  });

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#4A0A13] font-sans selection:bg-[#D4AF37] selection:text-[#4A0A13] flex flex-col relative">
      
      {/* Soft Subtle Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06)_0%,transparent_70%)]" />

      {/* ============================================================ */}
      {/* ELEGANT UNIFIED HEADER & NAVBAR                              */}
      {/* ============================================================ */}
      <header className="relative z-30 w-full border-b border-[#D4AF37]/30 bg-[#FAF4E8] px-6 py-4 shadow-xs">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Admin Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
            <OrbitBrand size={30} />
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm font-semibold tracking-wider text-[#4A0A13]">
                CONSCIOUS ORBIT
              </span>
              <span className="h-4 w-px bg-[#D4AF37]/50" />
              <span className="text-xs font-medium text-[#7A1C29] bg-[#4A0A13]/5 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                Admin Workspace
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border border-[#D4AF37]/40 bg-[#FAF4E8] pl-9 pr-4 py-1.5 text-xs text-[#4A0A13] placeholder-[#7A1C29]/40 focus:border-[#4A0A13] focus:outline-none transition"
            />
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="text-xs font-medium text-[#4A0A13] hover:text-[#B8860B] transition cursor-pointer px-3 py-1.5"
            >
              Home
            </button>
            <button
              onClick={onLogout}
              className="rounded-full border border-[#D4AF37] bg-[#4A0A13] hover:bg-[#5C0F1A] px-4 py-1.5 text-xs font-medium text-[#F5D77F] transition cursor-pointer shadow-xs"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navbar Tabs */}
        <div className="w-full mt-4 pt-3 border-t border-[#D4AF37]/20 flex items-center justify-start overflow-x-auto gap-2 no-scrollbar">
          {[
            { id: "search-shortlist", label: "1. Search & Shortlist", count: null, icon: Search },
            { id: "all-modules", label: "2. All 10 Modules", count: 10, icon: Layers },
            { id: "client-forms", label: "3. Client Forms & Profiles", count: clientProfiles.length, icon: UserCheck },
            { id: "registrations", label: "4. Registrations (5 Domains)", count: registrations.length, icon: Folder },
            { id: "report-tracking", label: "5. Report Tracking", count: reports.length, icon: Activity },
            { id: "queries-investigation", label: "6. Client Queries", count: null, icon: MessageSquare },
            { id: "client-documents", label: "7. Client Documents", count: null, icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#4A0A13] text-[#FAF4E8] border border-[#D4AF37] shadow-xs font-semibold"
                    : "bg-[#FAF4E8] text-[#4A0A13] border border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#F5D77F]" : "text-[#D4AF37]"} />
                <span>{tab.label}</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[0.65rem] ${
                  isActive ? "bg-[#FAF4E8]/20 text-[#FAF4E8]" : "bg-[#4A0A13]/10 text-[#4A0A13]"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN ELEGANT WORKSPACE CONTENT                               */}
      {/* ============================================================ */}
      <main className="relative z-10 flex-1 w-full p-4 md:p-8 space-y-6">

        {/* ============================================================ */}
        {/* WELCOME ADMIN CARD BANNER (LIKE CLIENT WORKSPACE)            */}
        {/* ============================================================ */}
        <div className="relative w-full bg-[#4A0A13] border border-[#D4AF37]/40 rounded-2xl p-6 md:p-7 text-[#FAF4E8] shadow-md overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.18)_0%,transparent_70%)]" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_80%_20%,rgba(245,215,127,0.1)_0%,transparent_60%)]" />
          </div>

          <div className="relative z-10 space-y-3">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 bg-[#FAF4E8] text-[#4A0A13] text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
              <ShieldCheck size={13} className="text-[#800000]" />
              <span>Admin Workspace Governance</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#FAF4E8] tracking-tight leading-tight flex items-center gap-2">
              <span>Welcome back, System Admin!</span>
              <span className="animate-bounce inline-block">👋</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs md:text-sm text-[#FAF4E8]/85 font-normal max-w-3xl leading-relaxed">
              Master control portal to audit all 10 intelligence modules, manage client profiles, monitor project registrations across 5 core domains, track report progress, and resolve client queries.
            </p>

            {/* Welcome Card Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveNav("all-modules")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  activeNav === "all-modules"
                    ? "bg-[#FAF4E8] text-[#4A0A13]"
                    : "bg-[#C89B3C] hover:bg-[#D4AF37] text-[#4A0A13]"
                }`}
              >
                <Layers size={14} />
                <span>10 Intelligence Modules</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddProfileModalOpen(true)}
                className="px-4 py-2 rounded-full border border-[#D4AF37] bg-white/10 hover:bg-white/20 text-[#FAF4E8] font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} className="text-[#F5D77F]" />
                <span>Create Client Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddRegistrationModalOpen(true)}
                className="px-4 py-2 rounded-full border border-[#D4AF37] bg-white/10 hover:bg-white/20 text-[#FAF4E8] font-medium text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Folder size={14} className="text-[#F5D77F]" />
                <span>Register Project (5 Domains)</span>
              </button>

              {/* Quick Summary Badges */}
              <div className="ml-auto hidden xl:flex items-center gap-4 border-l border-[#D4AF37]/30 pl-4 text-xs">
                <div>
                  <span className="text-[#F5D77F] font-semibold block">10 / 10</span>
                  <span className="text-[#FAF4E8]/70 text-[0.65rem]">Modules Active</span>
                </div>
                <div className="h-6 w-px bg-[#D4AF37]/30" />
                <div>
                  <span className="text-[#F5D77F] font-semibold block">5 Domains</span>
                  <span className="text-[#FAF4E8]/70 text-[0.65rem]">Homepage Tracked</span>
                </div>
                <div className="h-6 w-px bg-[#D4AF37]/30" />
                <div>
                  <span className="text-[#F5D77F] font-semibold block">Operational</span>
                  <span className="text-[#FAF4E8]/70 text-[0.65rem]">System Governance</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* SEARCH & SHORTLIST MENU                                       */}
        {/* ------------------------------------------------------------ */}
        {activeNav === "search-shortlist" && (() => {
          const q = searchQuery.trim().toLowerCase();
          const domains = ["ALL", ...Array.from(new Set(reports.map((r) => r.domain))).sort()];
          const statuses = ["ALL", "PENDING", "IN_PROGRESS", "PROCESSED", "REVIEWING", "COMPLETED"];
          const matched = reports.filter((r) => {
            const inQ = !q
              || r.reportName.toLowerCase().includes(q)
              || (r.clientEmail || "").includes(q)
              || (r.clientCompany || "").toLowerCase().includes(q);
            const inDomain = shortlistDomain === "ALL" || r.domain === shortlistDomain;
            const inStatus = shortlistStatus === "ALL" || r.status === shortlistStatus;
            const s = r.score ?? 0;
            const inScore = s >= shortlistMinScore && s <= shortlistMaxScore;
            return inQ && inDomain && inStatus && inScore;
          });
          const bucketReports = reports.filter((r) => shortlistBucket.has(r.id));
          const toggleBucket = (id) => {
            setShortlistBucket((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id); else next.add(id);
              return next;
            });
          };
          const clientHits = clientProfiles.filter((p) =>
            !q || p.fullName.toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q) || (p.company || "").toLowerCase().includes(q)
          ).slice(0, 6);
          const ticketHits = tickets.filter((t) =>
            !q || (t.title || "").toLowerCase().includes(q) || (t.clientName || "").toLowerCase().includes(q)
          ).slice(0, 6);
          return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#D4AF37]/20 pb-4">
              <h1 className="text-xl font-semibold text-[#4A0A13]">Search & Shortlist</h1>
              <p className="text-xs text-[#7A1C29]">
                Full-text search across reports, clients and tickets, and a shortlist builder that filters reports and
                collects the ones you want to act on.
              </p>
            </div>

            {/* Search Menu */}
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[#D4AF37]" />
                <span className="text-[0.7rem] uppercase font-bold tracking-wider text-[#B8860B]">Search menu</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports, clients, tickets by name, email, company…"
                className="w-full rounded-full border border-[#D4AF37]/40 bg-white px-4 py-2 text-sm text-[#4A0A13] placeholder-[#8C6D58]/60 focus:border-[#4A0A13] focus:outline-none"
                style={{ fontSize: "16px" }}
              />
              {q && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-1">Reports ({matched.length})</p>
                    <ul className="space-y-1">
                      {matched.slice(0, 6).map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => { setActiveNav("report-tracking"); }}
                            className="text-left text-[#4A0A13] hover:text-[#B8860B] truncate w-full cursor-pointer"
                          >
                            {r.reportName} <span className="text-[#8C6D58]">· {r.status}</span>
                          </button>
                        </li>
                      ))}
                      {!matched.length && <li className="text-[#8C6D58] italic">No matches</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-1">Clients ({clientHits.length})</p>
                    <ul className="space-y-1">
                      {clientHits.map((c) => (
                        <li key={c.id}>
                          <button
                            onClick={() => { setActiveNav("client-forms"); setSelectedProfile(c); }}
                            className="text-left text-[#4A0A13] hover:text-[#B8860B] truncate w-full cursor-pointer"
                          >
                            {c.fullName} <span className="text-[#8C6D58]">· {c.company}</span>
                          </button>
                        </li>
                      ))}
                      {!clientHits.length && <li className="text-[#8C6D58] italic">No matches</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-1">Tickets ({ticketHits.length})</p>
                    <ul className="space-y-1">
                      {ticketHits.map((t) => (
                        <li key={t.id} className="text-[#4A0A13] truncate">{t.title}</li>
                      ))}
                      {!ticketHits.length && <li className="text-[#8C6D58] italic">No matches</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Shortlisting Menu */}
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-[#D4AF37]" />
                  <span className="text-[0.7rem] uppercase font-bold tracking-wider text-[#B8860B]">Shortlisting menu</span>
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-[#7A1C29]">
                  <span>{matched.length} match · {shortlistBucket.size} in shortlist</span>
                  {shortlistBucket.size > 0 && (
                    <button
                      onClick={() => setShortlistBucket(new Set())}
                      className="rounded-full bg-[#4A0A13] text-[#F5D77F] hover:bg-[#5C0F1A] text-[0.65rem] font-semibold px-2.5 py-1 cursor-pointer flex items-center gap-1"
                    >
                      <X size={10} /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Domain</label>
                  <select
                    value={shortlistDomain}
                    onChange={(e) => setShortlistDomain(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1.5 text-xs cursor-pointer"
                  >
                    {domains.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Status</label>
                  <select
                    value={shortlistStatus}
                    onChange={(e) => setShortlistStatus(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1.5 text-xs cursor-pointer"
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Min score</label>
                  <input
                    type="number" min="0" max="100"
                    value={shortlistMinScore}
                    onChange={(e) => setShortlistMinScore(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Max score</label>
                  <input
                    type="number" min="0" max="100"
                    value={shortlistMaxScore}
                    onChange={(e) => setShortlistMaxScore(Number(e.target.value) || 100)}
                    className="mt-1 w-full rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#D4AF37]/30 bg-white">
                <table className="w-full text-xs">
                  <thead className="text-[0.6rem] uppercase text-[#B8860B] tracking-wider bg-[#FAF4E8]">
                    <tr className="text-left">
                      <th className="px-3 py-2 w-8"></th>
                      <th className="px-3 py-2">Report</th>
                      <th className="px-3 py-2">Domain</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15">
                    {!matched.length && (
                      <tr><td colSpan={5} className="px-3 py-4 text-center text-[#8C6D58] italic">No reports match these filters.</td></tr>
                    )}
                    {matched.map((r) => (
                      <tr key={r.id} className="text-[#4A0A13]">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={shortlistBucket.has(r.id)}
                            onChange={() => toggleBucket(r.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium truncate">{r.reportName}</td>
                        <td className="px-3 py-2">{r.domain}</td>
                        <td className="px-3 py-2">{r.status}</td>
                        <td className="px-3 py-2 text-right font-mono">{r.score ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bucketReports.length > 0 && (
                <div className="pt-2 border-t border-[#D4AF37]/20">
                  <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-2">Your shortlist</p>
                  <div className="flex flex-wrap gap-2">
                    {bucketReports.map((r) => (
                      <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-[#4A0A13] text-[#F5D77F] px-3 py-1 text-[0.65rem] font-semibold">
                        {r.reportName}
                        <button
                          onClick={() => toggleBucket(r.id)}
                          className="hover:text-white cursor-pointer"
                          title="Remove from shortlist"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          );
        })()}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 1: ALL 10 MODULES                                    */}
        {/* ------------------------------------------------------------ */}
        {activeNav === "all-modules" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-[#4A0A13]">All 10 Intelligence Modules</h1>
                <p className="text-xs text-[#7A1C29]">System intelligence scoring and module governance.</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {["ALL", "Market Foundation", "Business Viability", "Launch & Execution", "Executive Governance"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setModuleCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      moduleCategoryFilter === cat
                        ? "bg-[#4A0A13] text-[#F5D77F] border border-[#D4AF37]"
                        : "bg-[#FAF4E8] text-[#4A0A13] border border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map((mod) => {
                const IconComp = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-5 shadow-xs hover:border-[#D4AF37] transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#4A0A13] text-[#F5D77F] flex items-center justify-center">
                            <IconComp size={18} />
                          </div>
                          <div>
                            <span className="text-[0.68rem] text-[#D4AF37] font-medium uppercase tracking-wide">
                              {mod.code}
                            </span>
                            <h3 className="font-semibold text-sm text-[#4A0A13]">{mod.name}</h3>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-medium border ${
                            mod.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : mod.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {mod.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#7A1C29] leading-relaxed">{mod.desc}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#D4AF37]/20 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#7A1C29]">Score</span>
                        <span className="font-medium text-[#4A0A13]">{mod.score} / 100</span>
                      </div>

                      <div className="w-full bg-[#4A0A13]/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#4A0A13] h-1.5 rounded-full"
                          style={{ width: `${mod.score}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => setSelectedModule(mod)}
                          className="flex-1 rounded-full border border-[#D4AF37]/50 bg-[#FAF4E8] hover:bg-[#F5EAD4] py-1 text-xs text-[#4A0A13] font-medium transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <select
                          value={mod.status}
                          onChange={(e) => handleUpdateModuleStatus(mod.id, e.target.value)}
                          className="rounded-full border border-[#D4AF37]/40 bg-[#FAF4E8] px-2 py-1 text-xs text-[#4A0A13] cursor-pointer"
                        >
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 2: CLIENT FORMS & PROFILES                            */}
        {/* ------------------------------------------------------------ */}
        {activeNav === "client-forms" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-[#4A0A13]">Client Profiles &amp; Forms</h1>
                <p className="text-xs text-[#7A1C29]">Manage verified profiles and intake records.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-[#D4AF37]/30 bg-[#FAF4E8] p-1">
                  {["ALL", "VERIFIED", "ACTIVE", "PENDING"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setProfileStatusFilter(st)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        profileStatusFilter === st
                          ? "bg-[#4A0A13] text-[#FAF4E8]"
                          : "text-[#4A0A13] hover:bg-[#F5EAD4]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddProfileModalOpen(true)}
                  className="rounded-full border border-[#D4AF37] bg-[#4A0A13] hover:bg-[#5C0F1A] px-4 py-1.5 text-xs font-medium text-[#F5D77F] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Profile</span>
                </button>
              </div>
            </div>

            {/* Profiles Table */}
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FAF4E8] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#4A0A13] text-[#FAF4E8] font-medium text-[0.7rem] uppercase">
                  <tr>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Company</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/20 text-[#4A0A13]">
                  {!filteredProfiles.length && (
                    <tr><td colSpan={5} className="p-8 text-center">
                      <p className="text-sm font-semibold text-[#4A0A13]">No client profiles yet</p>
                      <p className="text-xs text-[#7A1C29] mt-1">Profiles are created from the client details attached to submitted reports.</p>
                    </td></tr>
                  )}
                  {filteredProfiles.map((prof) => (
                    <tr key={prof.id} className="hover:bg-[#F5EAD4]/40 transition">
                      <td className="p-3.5">
                        <div className="font-semibold text-sm text-[#4A0A13]">{prof.fullName}</div>
                        <div className="text-[0.68rem] text-[#7A1C29]">{prof.email}</div>
                      </td>
                      <td className="p-3.5 font-medium">{prof.company}</td>
                      <td className="p-3.5 text-[#7A1C29]">{prof.domain}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] border border-[#D4AF37]/40 bg-[#4A0A13]/5 text-[#4A0A13] font-medium">
                            {prof.status}
                          </span>
                          {prof.strengthBand && <StrengthBadge band={prof.strengthBand} size="sm" />}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedProfile(prof)}
                          className="rounded-full border border-[#D4AF37] px-3 py-1 text-xs text-[#4A0A13] hover:bg-[#4A0A13] hover:text-[#FAF4E8] transition cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 3: REGISTRATIONS (5 DOMAINS)                          */}
        {/* ------------------------------------------------------------ */}
        {activeNav === "registrations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h1 className="text-xl font-semibold text-[#4A0A13]">Project Registrations</h1>
                <p className="text-xs text-[#7A1C29]">Domain project registrations across 5 core verticals.</p>
              </div>

              <button
                onClick={() => setIsAddRegistrationModalOpen(true)}
                className="rounded-full border border-[#D4AF37] bg-[#4A0A13] hover:bg-[#5C0F1A] px-4 py-1.5 text-xs font-medium text-[#F5D77F] transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
              >
                <Plus size={14} />
                <span>New Registration</span>
              </button>
            </div>

            {/* 5 Domain Selector */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {[
                "ALL",
                "Students & Scholars",
                "Educational Institutions",
                "MSMEs",
                "Industries",
                "Startups"
              ].map((dom) => (
                <button
                  key={dom}
                  onClick={() => setDomainFilter(dom)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    domainFilter === dom
                      ? "bg-[#4A0A13] text-[#FAF4E8] border border-[#D4AF37]"
                      : "bg-[#FAF4E8] text-[#4A0A13] border border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                  }`}
                >
                  {dom === "ALL" ? "All 5 Domains" : dom}
                </button>
              ))}
            </div>

            {/* Registrations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!filteredRegistrations.length && (
                <div className="rounded-2xl border border-dashed border-[#D4AF37]/50 bg-[#FAF4E8]/60 p-8 text-center">
                  <p className="text-sm font-semibold text-[#4A0A13]">No project registrations yet</p>
                  <p className="text-xs text-[#7A1C29] mt-1">Registrations appear here as clients submit ventures through the intake engine.</p>
                </div>
              )}
              {filteredRegistrations.map((reg) => {
                const DomIcon = reg.domainIcon || Building2;
                return (
                  <div
                    key={reg.id}
                    className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-5 shadow-xs hover:border-[#D4AF37] transition space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#4A0A13] text-[#F5D77F] flex items-center justify-center">
                          <DomIcon size={18} />
                        </div>
                        <div>
                          <span className="text-[0.65rem] text-[#D4AF37] font-medium uppercase">{reg.domain}</span>
                          <h3 className="font-semibold text-sm text-[#4A0A13]">{reg.projectName}</h3>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] border border-[#D4AF37]/40 bg-[#4A0A13]/5 text-[#4A0A13] font-medium">
                        {reg.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#7A1C29] space-y-1">
                      <p>Lead: <strong className="text-[#4A0A13]">{reg.clientName}</strong> ({reg.clientEmail})</p>
                      <p className="italic">"{reg.notes}"</p>
                    </div>

                    {/* Review-of-response strip: shows response state + AI critical analysis */}
                    {(() => {
                      const a = analysisByReport[reg.reportId];
                      const reviewed = Boolean(a && a.data);
                      return (
                        <div className="rounded-xl border border-[#D4AF37]/30 bg-white/60 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
                                reviewed ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-[#FAF4E8] text-[#7A1C29] border border-[#D4AF37]/40"
                              }`}>
                                Response {reviewed ? "REVIEWED" : "RECEIVED"}
                              </span>
                              {a?.data?.summary && (
                                <span className="text-[0.65rem] text-[#7A1C29]">{a.data.summary.slice(0, 90)}{a.data.summary.length > 90 ? "…" : ""}</span>
                              )}
                            </div>
                            <button
                              onClick={() => runCriticalAnalysis(reg.reportId)}
                              disabled={a?.loading}
                              title="Run critical analysis — feeds report-based suggestions back to the AI"
                              className="rounded-full bg-[#4A0A13] text-[#F5D77F] hover:bg-[#5C0F1A] text-[0.65rem] font-semibold px-2.5 py-1 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <Sparkles size={11} />
                              {a?.loading ? "Analysing…" : reviewed ? "Re-run" : "Run Analysis"}
                            </button>
                          </div>
                          {a?.error && (
                            <p className="text-[0.65rem] text-[#7A1C29]">Analysis error: {a.error}</p>
                          )}
                          {a?.data && (a.data.keyStrengths?.length || a.data.keyConcerns?.length) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[0.7rem]">
                              {a.data.keyStrengths?.length > 0 && (
                                <div>
                                  <span className="text-[0.6rem] uppercase font-bold text-emerald-700 tracking-wider">AI Suggestions</span>
                                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-[#4A0A13]">
                                    {a.data.keyStrengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {a.data.keyConcerns?.length > 0 && (
                                <div>
                                  <span className="text-[0.6rem] uppercase font-bold text-[#7A1C29] tracking-wider">Concerns to address</span>
                                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-[#4A0A13]">
                                    {a.data.keyConcerns.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Actions follow the report's real stage. An approved
                        registration offers nothing to approve, and the others
                        drive the actual pipeline rather than flipping a local
                        label that the next poll would overwrite. */}
                    <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-end gap-2 flex-wrap">
                      {reg.serverStatus === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
                          <Check size={12} /> Approved
                        </span>
                      ) : reg.serverStatus === "REVIEWING" ? (
                        <button
                          onClick={() => openReviewModal(reg.reportId)}
                          title="Open the review panel to score and approve this report"
                          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 text-xs font-medium transition cursor-pointer"
                        >
                          Review &amp; Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const row = reports.find((r) => r.id === reg.reportId);
                            if (row) handleProcessReport(row);
                          }}
                          disabled={processingId === reg.reportId}
                          title="Run the intelligence modules so this report can be reviewed"
                          className="rounded-full bg-[#4A0A13] hover:bg-[#5C0F1A] text-[#F5D77F] px-3 py-1 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                        >
                          {processingId === reg.reportId ? "Processing…" : "Process"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActiveNav("report-tracking");
                          setReportStatusFilter("ALL");
                        }}
                        title="Open this submission in Report Tracking"
                        className="rounded-full border border-[#D4AF37] bg-[#FAF4E8] hover:bg-[#F5EAD4] text-[#4A0A13] px-3 py-1 text-xs font-medium transition cursor-pointer"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 4: REPORT TRACKING                                    */}
        {/* ------------------------------------------------------------ */}
        {activeNav === "report-tracking" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#D4AF37]/20 pb-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-[#4A0A13]">Report Progress Tracking</h1>
                  <p className="text-xs text-[#7A1C29]">Monitor report generation status and scores.</p>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={toggleDemoReports}
                    title="Toggle 3 sample unpaid reports for testing the paywall"
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                      demoOn
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-[#FAF4E8] text-[#4A0A13] border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                    }`}
                  >
                    {demoOn ? "Demo data: ON" : "Load demo data"}
                  </button>
                  <div className="w-px h-5 bg-[#D4AF37]/30 mx-1" />
                  {[["list", "List"], ["board", "Board"]].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setReportView(id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      reportView === id
                        ? "bg-[#D4AF37] text-[#4A0A13]"
                        : "bg-[#FAF4E8] text-[#4A0A13] border border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                </div>
              </div>

              {/* Row 2 — status filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[0.65rem] uppercase font-bold tracking-wider text-[#B8860B] mr-1">Status</span>
                {["ALL", "PENDING", "IN_PROGRESS", "PROCESSED", "REVIEWING", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                      reportStatusFilter === st
                        ? "bg-[#4A0A13] text-[#FAF4E8]"
                        : "bg-[#FAF4E8] text-[#4A0A13] border border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Row 3 — shortlist by date */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] uppercase font-bold tracking-wider text-[#B8860B] mr-1">Shortlist by date</span>
                <input
                  type="date"
                  value={reportDateFrom}
                  max={reportDateTo || undefined}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  title="Submitted on or after"
                  className="rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1 text-[0.7rem] text-[#4A0A13] focus:border-[#4A0A13] focus:outline-none"
                />
                <span className="text-[0.65rem] text-[#8C6D58]">to</span>
                <input
                  type="date"
                  value={reportDateTo}
                  min={reportDateFrom || undefined}
                  onChange={(e) => setReportDateTo(e.target.value)}
                  title="Submitted on or before"
                  className="rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1 text-[0.7rem] text-[#4A0A13] focus:border-[#4A0A13] focus:outline-none"
                />
                {[["Today", 0], ["7d", 7], ["30d", 30]].map(([label, days]) => (
                  <button
                    key={label}
                    onClick={() => {
                      const to = new Date();
                      const from = new Date();
                      from.setDate(to.getDate() - days);
                      const fmt = (d) => d.toISOString().split("T")[0];
                      setReportDateFrom(fmt(from));
                      setReportDateTo(fmt(to));
                    }}
                    className="rounded-full border border-[#D4AF37]/40 bg-[#FAF4E8] hover:bg-[#F5EAD4] text-[#4A0A13] text-[0.65rem] font-semibold px-2.5 py-1 cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
                {(reportDateFrom || reportDateTo) && (
                  <button
                    onClick={() => { setReportDateFrom(""); setReportDateTo(""); }}
                    className="rounded-full bg-[#4A0A13] text-[#F5D77F] hover:bg-[#5C0F1A] text-[0.65rem] font-semibold px-2.5 py-1 cursor-pointer flex items-center gap-1"
                    title="Clear date filter"
                  >
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
            </div>

            {reportView === "list" ? (
              <div className="space-y-4">
                {!filteredReports.length && (
                  <div className="rounded-2xl border border-dashed border-[#D4AF37]/50 bg-[#FAF4E8]/60 p-8 text-center">
                    <p className="text-sm font-semibold text-[#4A0A13]">No client reports yet</p>
                    <p className="text-xs text-[#7A1C29] mt-1">When a client submits an intake it appears here for review, processing and approval.</p>
                  </div>
                )}
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[0.65rem] text-[#D4AF37] font-medium uppercase">{rep.domain} · {rep.status}</span>
                      <h3 className="font-semibold text-sm text-[#4A0A13]">{rep.reportName}</h3>
                      <p className="text-xs text-[#7A1C29]">Auditor: {rep.auditor}</p>
                      <p className="text-[0.65rem] text-[#8C6D58]">
                        Submitted: {formatReportDateTime(rep.createdAt)}
                        {rep.updatedAt && rep.updatedAt !== rep.createdAt && (
                          <span> · Updated: {formatReportDateTime(rep.updatedAt)}</span>
                        )}
                      </p>
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A1C29]">Progress</span>
                        <span className="font-medium text-[#4A0A13]">{rep.progressPct}%</span>
                      </div>
                      <div className="w-full bg-[#4A0A13]/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#4A0A13] h-1.5 rounded-full" style={{ width: `${rep.progressPct}%` }} />
                      </div>

                      <div className="flex justify-end gap-1 pt-1">
                        <button
                          onClick={() => handleViewReport(rep)}
                          title="View report detail"
                          className="h-6 w-6 rounded-full border border-[#D4AF37]/40 text-[#4A0A13] flex items-center justify-center cursor-pointer hover:bg-[#F5EAD4]"
                        >
                          <Eye size={12} />
                        </button>
                        {rep.fromApi && ["RECEIVED", "PENDING", "PROCESSED"].includes(rep.serverStatus) && (
                          <button
                            onClick={() => handleProcessReport(rep)}
                            disabled={processingId === rep.id}
                            title="Run all modules and advance to REVIEWING"
                            className="h-6 px-2 rounded-full bg-[#4A0A13] text-[#F5D77F] text-[0.65rem] font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#5C0F1A] disabled:opacity-50"
                          >
                            <Sparkles size={10} />
                            {processingId === rep.id ? "…" : "Process"}
                          </button>
                        )}
                        {(rep.status === "REVIEWING" || rep.serverStatus === "REVIEWING") && (
                          <button
                            onClick={() => openReviewModal(rep.id)}
                            title="Review report"
                            className="h-6 w-6 rounded-full bg-[#D4AF37] text-[#4A0A13] flex items-center justify-center cursor-pointer hover:bg-[#F5D77F]"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        {rep.fromApi && rep.serverStatus === "PUBLISHED" && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadReportDocx(rep.id, `${rep.reportName || 'strategy-report'}.docx`)
                                .catch((err) => alert(err.message || 'Could not download the report.'))
                            }
                            title="Download the published .docx"
                            className="h-6 w-6 rounded-full border border-[#D4AF37]/40 text-[#4A0A13] flex items-center justify-center cursor-pointer hover:bg-[#F5EAD4]"
                          >
                            <Download size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(rep)}
                          title="Delete report"
                          className="h-6 w-6 rounded-full border border-[#D4AF37]/40 text-[#7A1C29] flex items-center justify-center cursor-pointer hover:bg-[#F5EAD4]"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          onClick={() => handleUpdateReportProgress(rep.id, -20)}
                          className="h-6 w-6 rounded-full border border-[#D4AF37]/40 text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleUpdateReportProgress(rep.id, 20)}
                          className="h-6 w-6 rounded-full bg-[#4A0A13] text-[#FAF4E8] text-xs font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Kanban board — one column per pipeline status, same actions. */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {KANBAN_COLUMNS.map((col) => {
                  const adminStatus = SERVER_STATUS_TO_ADMIN[col.status] || col.status;
                  const items = filteredReports.filter((r) => r.status === adminStatus);
                  return (
                    <div key={col.status} className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8]/60 p-3 space-y-3 min-h-40">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#B8860B]">{adminStatus}</span>
                        <span className="text-[0.65rem] font-mono text-[#7A1C29]">{items.length}</span>
                      </div>
                      {items.map((rep) => (
                        <div key={rep.id} className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-3 shadow-xs space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[0.6rem] text-[#D4AF37] font-medium uppercase">{rep.domain}</span>
                            {rep.serverStatus === "PUBLISHED" && (
                              <span className={`text-[0.55rem] font-bold px-1.5 py-0 rounded-full border ${
                                isReportPaid(rep.id) ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
                              }`}>
                                {isReportPaid(rep.id) ? "Paid" : "Unpaid"}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-xs text-[#4A0A13] leading-snug">{rep.reportName}</h4>
                          <p className="text-[0.55rem] text-[#8C6D58]">{formatReportDateTime(rep.createdAt)}</p>
                          <div className="w-full bg-[#4A0A13]/10 rounded-full h-1 overflow-hidden">
                            <div className="bg-[#4A0A13] h-1 rounded-full" style={{ width: `${rep.progressPct}%` }} />
                          </div>
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="font-mono text-[0.65rem] font-bold text-[#4A0A13]">{rep.score}%</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleViewReport(rep)} title="View"
                                className="h-5 w-5 rounded-full border border-[#D4AF37]/40 text-[#4A0A13] flex items-center justify-center cursor-pointer hover:bg-[#F5EAD4]">
                                <Eye size={10} />
                              </button>
                              {rep.fromApi && ["RECEIVED", "PENDING", "PROCESSED"].includes(rep.serverStatus) && (
                                <button
                                  onClick={() => handleProcessReport(rep)}
                                  disabled={processingId === rep.id}
                                  title="Run modules & advance to REVIEWING"
                                  className="h-5 px-1.5 rounded-full bg-[#4A0A13] text-[#F5D77F] text-[0.55rem] font-bold flex items-center gap-0.5 cursor-pointer hover:bg-[#5C0F1A] disabled:opacity-50"
                                >
                                  <Sparkles size={8} />
                                  {processingId === rep.id ? "…" : "Run"}
                                </button>
                              )}
                              {(adminStatus === "REVIEWING" || rep.serverStatus === "REVIEWING") && (
                                <button onClick={() => openReviewModal(rep.id)} title="Review"
                                  className="h-5 w-5 rounded-full bg-[#D4AF37] text-[#4A0A13] flex items-center justify-center cursor-pointer hover:bg-[#F5D77F]">
                                  <Edit size={10} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteReport(rep)} title="Delete"
                                className="h-5 w-5 rounded-full border border-[#D4AF37]/40 text-[#7A1C29] flex items-center justify-center cursor-pointer hover:bg-[#F5EAD4]">
                                <Trash2 size={10} />
                              </button>
                              <button onClick={() => handleUpdateReportProgress(rep.id, -20)}
                                className="h-5 w-5 rounded-full border border-[#D4AF37]/40 text-[0.65rem] font-bold flex items-center justify-center cursor-pointer">
                                -
                              </button>
                              <button onClick={() => handleUpdateReportProgress(rep.id, 20)}
                                className="h-5 w-5 rounded-full bg-[#4A0A13] text-[#FAF4E8] text-[0.65rem] font-bold flex items-center justify-center cursor-pointer">
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!items.length && (
                        <p className="text-center text-[0.65rem] text-[#8C6D58] py-4">No reports</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* SECTION 5: QUERIES AND INVESTIGATION                          */}
        {/* ------------------------------------------------------------ */}
        {/* SECTION 5: CLIENT QUERIES - real client questions and responses */}
        {activeNav === "queries-investigation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <QueriesPanel role="admin" />
          </motion.div>
        )}

        {/* SECTION 6: CLIENT DOCUMENTS - read-only view of client uploads */}
        {activeNav === "client-documents" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="border-b border-[#D4AF37]/20 pb-4">
              <h1 className="text-lg sm:text-xl font-semibold text-[#4A0A13]">Client Documents</h1>
              <p className="text-xs text-[#7A1C29]">
                Files clients uploaded in support of their submissions. Pick a report to see what
                was attached to it, or leave it on All to see everything.
              </p>
            </div>

            <div className="space-y-1 max-w-md">
              <label
                className="font-mono text-[0.68rem] uppercase font-bold text-[#B8860B] tracking-wider"
                htmlFor="admin-doc-report"
              >
                Filter by report
              </label>
              <select
                id="admin-doc-report"
                value={adminDocReportId}
                onChange={(e) => setAdminDocReportId(e.target.value)}
                className="w-full rounded-xl border border-[#D4AF37]/60 bg-white px-3.5 py-2.5 text-xs text-[#4A0A13] focus:border-[#4A0A13] focus:outline-none cursor-pointer"
              >
                <option value="">All uploaded documents</option>
                {reports.filter((r) => r.fromApi).map((r) => (
                  <option key={r.id} value={r.id}>{r.reportName}</option>
                ))}
              </select>
              <p className="text-[0.65rem] text-[#8C6D58]">
                Documents are read-only here - the client owns them.
              </p>
            </div>

            <DocumentUpload
              key={adminDocReportId || "all"}
              reportId={adminDocReportId || undefined}
              canDelete={false}
              canVerify={true}
              title="Uploaded by clients"
            />
          </motion.div>
        )}


      </main>

      {/* Report Detail Modal — module scores, pipeline state, history */}
      {reportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-5 shadow-xl space-y-4 text-xs text-[#4A0A13]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[0.65rem] text-[#D4AF37] font-medium uppercase">
                  {reportDetail.row.domain} · {reportDetail.row.status}
                </span>
                <h2 className="text-lg font-semibold text-[#4A0A13]">{reportDetail.row.reportName}</h2>
                <p className="text-[#7A1C29]">Auditor: {reportDetail.row.auditor}</p>
              </div>
              <div className="flex items-center gap-2">
                {reportDetail.detail && (
                  <button
                    onClick={() => downloadReportDoc(reportDetail.detail.report, reportDetail.detail.moduleResults || {})}
                    title="Download strategy report (.doc)"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/50 text-[0.68rem] font-bold text-[#4A0A13] hover:bg-[#F5EAD4] cursor-pointer"
                  >
                    <Download size={12} />
                    <span>.doc</span>
                  </button>
                )}
                <button
                  onClick={() => setReportDetail(null)}
                  className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {reportDetail.loading && (
              <p className="text-[#7A1C29] animate-pulse py-6 text-center">Loading report detail from the pipeline…</p>
            )}
            {reportDetail.error && (
              <p className="text-[#7A1C29] py-2">Could not load detail: {reportDetail.error}</p>
            )}

            {!reportDetail.loading && reportDetail.detail && (() => {
              const { report, moduleResults = {}, pipeline } = reportDetail.detail;
              const decision = moduleResults.industryReport?.output?.decision;
              return (
                <div className="space-y-4">
                  {/* Verdict strip */}
                  <div className="rounded-xl border border-[#D4AF37]/50 bg-white p-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <span className="text-[0.65rem] uppercase text-[#B8860B] font-bold">Orbital Score</span>
                      <p className="font-mono text-xl font-bold">{report.score ?? 0}/100</p>
                    </div>
                    <div>
                      <span className="text-[0.65rem] uppercase text-[#B8860B] font-bold">Verdict</span>
                      <p className="font-bold">{report.decision === 1 ? "GO / PROCEED" : report.decision === 0 ? "PIVOT" : "Pending"}</p>
                    </div>
                    <div>
                      <span className="text-[0.65rem] uppercase text-[#B8860B] font-bold">Pipeline</span>
                      <p className="font-mono">{report.status} · {pipeline?.progressPercent ?? 0}%</p>
                    </div>
                    {decision?.headline && (
                      <p className="w-full text-[#7A1C29] italic">"{decision.headline}"</p>
                    )}
                  </div>

                  {/* Module results */}
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Module Results ({Object.keys(moduleResults).length}/10)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(moduleResults).map(([key, res]) => (
                        <div key={key} className="rounded-xl border border-[#D4AF37]/40 bg-white px-3 py-2 flex items-center justify-between">
                          <span className="font-medium">{key}</span>
                          <span className="font-mono font-bold">{res.score ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                    {pipeline?.missingModules?.length > 0 && (
                      <p className="text-[#7A1C29] mt-2">
                        Missing for this stage: {pipeline.missingModules.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Transition history */}
                  {(report.transitions || []).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Status History</h3>
                      <div className="space-y-1.5">
                        {report.transitions.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-[0.7rem]">
                            <span className="font-mono text-[#B8860B]">{t.from || "•"} → {t.to}</span>
                            <span className="text-[#8C6D58]">{t.note}</span>
                            {t.at && <span className="ml-auto text-[#8C6D58]">{String(t.at).slice(0, 10)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {!reportDetail.loading && !reportDetail.detail && !reportDetail.error && (
              <p className="text-[#7A1C29] py-2">
                This is a local sample report — score {reportDetail.row.score}%, progress {reportDetail.row.progressPct}%.
                Generate a report through the pipeline to see per-module results and history here.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Simple Modals */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-5 shadow-xl space-y-3">
            <h2 className="text-lg font-semibold text-[#4A0A13]">{selectedModule.name}</h2>
            <p className="text-xs text-[#7A1C29]">{selectedModule.desc}</p>
            <div className="text-right pt-2">
              <button onClick={() => setSelectedModule(null)} className="rounded-full bg-[#4A0A13] text-[#FAF4E8] px-4 py-1 text-xs font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedProfile && (() => {
        const email = (selectedProfile.email || "").toLowerCase();
        const company = (selectedProfile.company || "").toLowerCase();
        const clientReports = reports.filter(
          (r) => (r.clientEmail && r.clientEmail === email) ||
                 (!r.clientEmail && r.clientCompany && r.clientCompany.toLowerCase() === company)
        );
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-6 shadow-xl space-y-5 text-xs text-[#4A0A13]">
            <div className="flex items-start justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
              <div>
                <span className="text-[0.65rem] uppercase font-bold tracking-wider text-[#B8860B]">
                  {selectedProfile.domain} · {selectedProfile.status}
                </span>
                <h2 className="text-lg font-semibold text-[#4A0A13]">{selectedProfile.fullName}</h2>
                <p className="text-[#7A1C29]">{selectedProfile.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedProfile.strengthBand && <StrengthBadge band={selectedProfile.strengthBand} size="sm" />}
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Client information */}
            <section className="space-y-2">
              <h3 className="text-[0.7rem] uppercase font-bold text-[#B8860B] tracking-wider">Client information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Email</span>
                  <p className="text-[#4A0A13]">{selectedProfile.email}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Phone</span>
                  <p className="text-[#4A0A13]">{selectedProfile.phone}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Location</span>
                  <p className="text-[#4A0A13]">{selectedProfile.location}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Website</span>
                  <p className="text-[#4A0A13]">{selectedProfile.website || "—"}</p>
                </div>
              </div>
            </section>

            {/* What they are responding — intake responses */}
            <section className="space-y-2">
              <h3 className="text-[0.7rem] uppercase font-bold text-[#B8860B] tracking-wider">What they are responding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Stage</span>
                  <p className="text-[#4A0A13]">{selectedProfile.stage}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Business model</span>
                  <p className="text-[#4A0A13]">{selectedProfile.businessModel}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Domain</span>
                  <p className="text-[#4A0A13]">{selectedProfile.domain}</p>
                </div>
              </div>
              {selectedProfile.problem && (
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white/60 px-3 py-2">
                  <span className="text-[0.6rem] uppercase text-[#8C6D58]">Problem statement</span>
                  <p className="text-[#4A0A13] leading-relaxed">{selectedProfile.problem}</p>
                </div>
              )}
            </section>

            {/* Document reports — the reports this client submitted */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[0.7rem] uppercase font-bold text-[#B8860B] tracking-wider">Document reports</h3>
                <span className="text-[0.65rem] text-[#8C6D58]">{clientReports.length} report{clientReports.length === 1 ? "" : "s"}</span>
              </div>
              {!clientReports.length && (
                <p className="text-[0.7rem] text-[#8C6D58] italic">This client has no submitted reports on record.</p>
              )}
              <div className="space-y-2">
                {clientReports.map((rep) => (
                  <div key={rep.id} className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-[#D4AF37]" />
                        <p className="font-semibold text-[#4A0A13] truncate">{rep.reportName}</p>
                      </div>
                      <p className="text-[0.65rem] text-[#8C6D58] mt-0.5">
                        {rep.status} · Score {rep.score ?? 0} · Submitted {formatReportDateTime(rep.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setSelectedProfile(null); handleViewReport(rep); }}
                        title="View report detail"
                        className="h-7 px-2 rounded-full border border-[#D4AF37]/40 text-[0.65rem] font-semibold text-[#4A0A13] hover:bg-[#F5EAD4] cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={11} /> View
                      </button>
                      {rep.fromApi && rep.serverStatus === "PUBLISHED" && (
                        <button
                          onClick={() =>
                            downloadReportDocx(rep.id, `${rep.reportName || 'strategy-report'}.docx`)
                              .catch((err) => alert(err.message || 'Could not download the report.'))
                          }
                          title="Download published .docx"
                          className="h-7 px-2 rounded-full bg-[#4A0A13] text-[#F5D77F] text-[0.65rem] font-semibold hover:bg-[#5C0F1A] cursor-pointer flex items-center gap-1"
                        >
                          <Download size={11} /> .docx
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Uploaded documents for the first report */}
            {clientReports[0] && (
              <section className="space-y-2">
                <h3 className="text-[0.7rem] uppercase font-bold text-[#B8860B] tracking-wider">Uploaded documents</h3>
                <DocumentUpload
                  key={clientReports[0].id}
                  reportId={clientReports[0].id}
                  canDelete={false}
                  canVerify={true}
                  title={`Attached to ${clientReports[0].reportName}`}
                />
              </section>
            )}

            <div className="text-right pt-2 border-t border-[#D4AF37]/30">
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-4 py-1.5 text-xs font-medium hover:bg-[#5C0F1A] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-5 shadow-xl space-y-3 text-xs">
            <h2 className="text-base font-semibold text-[#4A0A13]">{selectedTicket.title}</h2>
            <textarea
              id="simpleNoteInput"
              rows={3}
              defaultValue={selectedTicket.investigationNote}
              className="w-full rounded-xl border border-[#D4AF37]/50 p-2.5 bg-[#FAF4E8] text-xs text-[#4A0A13]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setSelectedTicket(null)} className="px-3 py-1 text-xs">Cancel</button>
              <button
                onClick={() => {
                  const val = document.getElementById("simpleNoteInput").value;
                  handleUpdateTicketStatus(selectedTicket.id, "RESOLVED", val);
                  setSelectedTicket(null);
                }}
                className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-4 py-1 text-xs font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateProfileSubmit} className="w-full max-w-md rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-5 shadow-xl space-y-3 text-xs">
            <h2 className="text-base font-semibold text-[#4A0A13]">Add Client Profile</h2>
            <input required type="text" placeholder="Full Name" value={newProfile.fullName} onChange={(e) => setNewProfile({ ...newProfile, fullName: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <input required type="email" placeholder="Email" value={newProfile.email} onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <input required type="text" placeholder="Company" value={newProfile.company} onChange={(e) => setNewProfile({ ...newProfile, company: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddProfileModalOpen(false)} className="px-3 py-1">Cancel</button>
              <button type="submit" className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-4 py-1 font-medium">Save</button>
            </div>
          </form>
        </div>
      )}

      {isAddRegistrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateRegistrationSubmit} className="w-full max-w-md rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] p-5 shadow-xl space-y-3 text-xs">
            <h2 className="text-base font-semibold text-[#4A0A13]">New Project Registration</h2>
            <input required type="text" placeholder="Project Name" value={newReg.projectName} onChange={(e) => setNewReg({ ...newReg, projectName: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <select value={newReg.domain} onChange={(e) => setNewReg({ ...newReg, domain: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]">
              <option value="Startups">Startups</option>
              <option value="MSMEs">MSMEs</option>
              <option value="Industries">Industries</option>
              <option value="Educational Institutions">Educational Institutions</option>
              <option value="Students & Scholars">Students & Scholars</option>
            </select>
            <input required type="text" placeholder="Client Name" value={newReg.clientName} onChange={(e) => setNewReg({ ...newReg, clientName: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <input required type="email" placeholder="Client Email" value={newReg.clientEmail} onChange={(e) => setNewReg({ ...newReg, clientEmail: e.target.value })} className="w-full rounded-xl border border-[#D4AF37]/40 p-2 bg-[#FAF4E8]" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddRegistrationModalOpen(false)} className="px-3 py-1">Cancel</button>
              <button type="submit" className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-4 py-1 font-medium">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Report Review Modal */}
      {reviewReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37] bg-[#FAF4E8] shadow-xl text-xs text-[#4A0A13]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/30 sticky top-0 bg-[#FAF4E8] z-10">
              <div>
                <h2 className="text-base font-semibold text-[#4A0A13]">Report Review</h2>
                <p className="text-[0.65rem] text-[#7A1C29]">ID: {reviewReportId}</p>
              </div>
              <button onClick={() => setReviewReportId(null)}
                className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Loading state */}
            {reviewLoading && (
              <div className="p-8 text-center text-[#7A1C29] animate-pulse">Loading report data…</div>
            )}

            {/* Error state */}
            {reviewError && (
              <div className="p-8 text-center text-red-600">{reviewError}</div>
            )}

            {/* Content */}
            {!reviewLoading && !reviewError && reviewReportData && (() => {
              const { report, moduleResults = {}, pipeline } = reviewReportData;
              const intakeData = report.intakeData ? Object.fromEntries(
                Object.entries(report.intakeData).map(([k, v]) => [k, v ? (typeof v === 'object' ? v : { value: v }) : {}])
              ) : {};
              return (
                <div className="space-y-0">
                  {/* Top: Intake Data */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-sm text-[#4A0A13] mb-2">Intake Data from User</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Company Info */}
                      <div className="rounded-xl border border-[#D4AF37]/40 bg-white p-3 space-y-2">
                        <span className="text-[0.65rem] uppercase text-[#B8860B] font-bold">Company</span>
                        <p className="text-sm font-medium text-[#4A0A13]">{report.name}</p>
                        <p className="text-xs text-[#7A1C29]">{report.client?.company || report.name}</p>
                        <p className="text-xs text-[#7A1C29]">{report.client?.industry || report.vertical}</p>
                        <p className="text-xs text-[#7A1C29]">Email: {report.client?.email || '—'}</p>
                      </div>

                      {/* Cluster Data */}
                      {report.clusters && Object.entries(report.clusters).map(([cluster, data]) => (
                        <div key={cluster} className="rounded-xl border border-[#D4AF37]/40 bg-white p-3 space-y-2">
                          <span className="text-[0.65rem] uppercase text-[#B8860B] font-bold">{cluster}</span>
                          {data && typeof data === 'object' ? Object.entries(data).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-[0.6rem] text-[#8C6D58] uppercase">{key}</span>
                              <p className="text-xs text-[#4A0A13]">{val || '—'}</p>
                            </div>
                          )) : (
                            <p className="text-xs text-[#7A1C29]">{String(data) || '—'}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI assessment - recommends a mark; the admin decides */}
                  <AiAssessmentPanel
                    reportId={reviewReportId}
                    currentAdminScore={reviewForm.adminScore}
                    onApply={(a) => {
                      /* Prefill from the recommendation so the admin edits rather
                         than retypes. Their submitted values still publish. */
                      setReviewForm((prev) => ({
                        ...prev,
                        adminScore: String(a.recommendedScore ?? prev.adminScore ?? ""),
                        verdict: a.verdict || prev.verdict,
                        analysis: a.analysis || prev.analysis,
                        strengths: (a.strengths || []).join("\n") || prev.strengths,
                        risks: (a.risks || []).join("\n") || prev.risks,
                      }));
                    }}
                  />

                  {/* Middle: Orbitaa AI assist */}
                  <div className="p-5 border-t border-[#D4AF37]/30 space-y-3 bg-[#FBF7ED]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-[#4A0A13] flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#D4AF37]" />
                          Ask Orbitaa
                        </h3>
                        <p className="text-[0.65rem] text-[#7A1C29]">
                          AI second-opinion on the module scores — flags anything over- or under-scored and gives an overall recommendation.
                        </p>
                      </div>
                      <button
                        onClick={runOrbitaAnalysis}
                        disabled={orbitaLoading}
                        className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-4 py-1.5 text-[0.7rem] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#5C0F1A] disabled:opacity-50"
                      >
                        <Sparkles size={12} />
                        {orbitaLoading ? "Orbitaa is analysing…" : orbitaResult ? "Re-run Orbitaa" : "Run Orbitaa Analysis"}
                      </button>
                    </div>

                    {orbitaResult?.error && (
                      <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-[0.7rem] text-red-700">
                        {orbitaResult.error}
                      </div>
                    )}

                    {orbitaResult?.analysis && (() => {
                      const a = orbitaResult.analysis;
                      const overallColor = {
                        confident_go: "bg-emerald-100 text-emerald-800 border-emerald-300",
                        cautious_go: "bg-amber-100 text-amber-800 border-amber-300",
                        needs_work: "bg-orange-100 text-orange-800 border-orange-300",
                        pivot_recommended: "bg-red-100 text-red-800 border-red-300",
                      }[a.overallAssessment] || "bg-gray-100 text-gray-800 border-gray-300";
                      const overallLabel = {
                        confident_go: "Confident GO",
                        cautious_go: "Cautious GO",
                        needs_work: "Needs Work",
                        pivot_recommended: "Pivot Recommended",
                      }[a.overallAssessment] || a.overallAssessment;

                      return (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full border text-[0.65rem] font-bold uppercase tracking-wider ${overallColor}`}>
                              {overallLabel}
                            </span>
                            {a.live === false && (
                              <span className="inline-block px-2 py-1 rounded-full border border-[#D4AF37]/40 bg-[#FAF4E8] text-[0.6rem] text-[#7A1C29]">
                                heuristic (no live model)
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#4A0A13] leading-relaxed whitespace-pre-wrap">{a.summary}</p>

                          {(a.keyStrengths?.length || a.keyConcerns?.length) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {a.keyStrengths?.length > 0 && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                  <span className="text-[0.65rem] uppercase font-bold text-emerald-700">Key Strengths</span>
                                  <ul className="mt-1.5 space-y-1 list-disc list-inside text-[0.7rem] text-emerald-900">
                                    {a.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {a.keyConcerns?.length > 0 && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                                  <span className="text-[0.65rem] uppercase font-bold text-red-700">Key Concerns</span>
                                  <ul className="mt-1.5 space-y-1 list-disc list-inside text-[0.7rem] text-red-900">
                                    {a.keyConcerns.map((c, i) => <li key={i}>{c}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}

                          {a.moduleReviews?.length > 0 && (
                            <div className="rounded-xl border border-[#D4AF37]/40 bg-white p-3">
                              <span className="text-[0.65rem] uppercase font-bold text-[#B8860B]">Per-Module Review</span>
                              <div className="mt-2 space-y-1.5">
                                {a.moduleReviews.map((m) => {
                                  const badge = m.assessment === "over_scored"
                                    ? "bg-orange-100 text-orange-800"
                                    : m.assessment === "under_scored"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-emerald-100 text-emerald-800";
                                  return (
                                    <div key={m.moduleKey} className="flex items-start gap-2 text-[0.7rem]">
                                      <span className="font-mono text-[0.65rem] text-[#7A1C29] min-w-[10rem] shrink-0">{m.moduleKey}</span>
                                      <span className="font-mono text-[0.65rem] text-[#4A0A13] min-w-[5.5rem] shrink-0">
                                        pipeline {Math.round(m.pipelineScore ?? 0)} → orbitaa {Math.round(m.orbitaScore ?? 0)}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-semibold uppercase shrink-0 ${badge}`}>
                                        {m.assessment.replace("_", " ")}
                                      </span>
                                      <span className="text-[0.7rem] text-[#4A0A13] leading-snug">{m.reasoning}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              const strengths = (a.keyStrengths || []).join("\n");
                              const risks = (a.keyConcerns || []).join("\n");
                              const analysis = a.summary || "";
                              const avg = a.moduleReviews?.length
                                ? Math.round(a.moduleReviews.reduce((s, m) => s + (m.orbitaScore || 0), 0) / a.moduleReviews.length)
                                : "";
                              const verdictMap = {
                                confident_go: "GO",
                                cautious_go: "CONDITIONAL",
                                needs_work: "PIVOT",
                                pivot_recommended: "REJECT",
                              };
                              setReviewForm((f) => ({
                                ...f,
                                adminScore: String(avg || f.adminScore),
                                verdict: verdictMap[a.overallAssessment] || f.verdict,
                                analysis: f.analysis ? f.analysis : analysis,
                                strengths: f.strengths ? f.strengths : strengths,
                                risks: f.risks ? f.risks : risks,
                              }));
                            }}
                            className="text-[0.7rem] text-[#4A0A13] underline hover:text-[#7A1C29] cursor-pointer"
                          >
                            ↓ Prefill my review form with Orbitaa's findings
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bottom: Admin Manual Review Form */}
                  <div className="p-5 border-t border-[#D4AF37]/30 space-y-4">
                    <h3 className="font-semibold text-sm text-[#4A0A13]">Your Analysis & Score</h3>

                    {/* Score */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Score (0-100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={reviewForm.adminScore}
                        onChange={(e) => setReviewForm({ ...reviewForm, adminScore: e.target.value })}
                        placeholder="Enter score"
                        className="w-full max-w-xs rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      />
                    </div>

                    {/* Verdict */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Verdict</label>
                      <select
                        value={reviewForm.verdict || ""}
                        onChange={(e) => setReviewForm({ ...reviewForm, verdict: e.target.value })}
                        className="w-full max-w-xs rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      >
                        <option value="">Select verdict</option>
                        <option value="GO">GO — Proceed with venture</option>
                        <option value="CONDITIONAL">CONDITIONAL — Proceed with caveats</option>
                        <option value="PIVOT">PIVOT — Needs changes</option>
                        <option value="REJECT">REJECT — Not viable</option>
                      </select>
                    </div>

                    {/* Analysis */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Your Analysis</label>
                      <textarea
                        rows={4}
                        value={reviewForm.analysis || ""}
                        onChange={(e) => setReviewForm({ ...reviewForm, analysis: e.target.value })}
                        placeholder="Write your analysis of this venture based on the intake data..."
                        className="w-full rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      />
                    </div>

                    {/* Strengths */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Strengths</label>
                      <textarea
                        rows={2}
                        value={reviewForm.strengths || ""}
                        onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                        placeholder="Key strengths (one per line)"
                        className="w-full rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      />
                    </div>

                    {/* Risks */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Risks & Concerns</label>
                      <textarea
                        rows={2}
                        value={reviewForm.risks || ""}
                        onChange={(e) => setReviewForm({ ...reviewForm, risks: e.target.value })}
                        placeholder="Key risks (one per line)"
                        className="w-full rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      />
                    </div>

                    {/* Approval Note */}
                    <div className="space-y-1">
                      <label className="text-[0.7rem] font-medium text-[#7A1C29]">Note to User</label>
                      <textarea
                        rows={2}
                        value={reviewForm.approvalNote}
                        onChange={(e) => setReviewForm({ ...reviewForm, approvalNote: e.target.value })}
                        placeholder="Add a note for the user..."
                        className="w-full rounded-xl border border-[#D4AF37]/50 bg-[#FAF4E8] px-3 py-2 text-xs text-[#4A0A13]"
                      />
                    </div>

                    {/* Payment configuration for this report — set before approving */}
                    {(() => {
                      const cfg = getReportPayment(reviewReportId);
                      return (
                        <div className="rounded-xl border-2 border-[#D4AF37]/60 bg-white p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-[#D4AF37]" />
                            <span className="text-[0.7rem] font-bold text-[#4A0A13] uppercase tracking-wider">Client payment for this report</span>
                          </div>
                          <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                            <input
                              type="checkbox"
                              checked={!!cfg.free}
                              onChange={(e) => setReportPayment(reviewReportId, { free: e.target.checked })}
                              className="mt-0.5 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-emerald-900">Approve without payment</span>
                              <p className="text-[0.65rem] text-emerald-800">
                                Give this client free access — they see the full report immediately, no paywall.
                              </p>
                            </div>
                          </label>
                          {!cfg.free && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Price (₹)</label>
                                <input
                                  type="number" min="0" step="1"
                                  value={cfg.price}
                                  onChange={(e) => setReportPayment(reviewReportId, { price: Number(e.target.value) || 0 })}
                                  className="mt-0.5 w-full rounded-md border border-[#D4AF37]/40 bg-white px-2 py-1.5 text-sm font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Methods</label>
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                  {ALL_METHODS.map((m) => {
                                    const on = cfg.methods.includes(m.id);
                                    return (
                                      <button
                                        key={m.id} type="button"
                                        onClick={() => {
                                          const next = on
                                            ? cfg.methods.filter((x) => x !== m.id)
                                            : [...cfg.methods, m.id];
                                          if (next.length === 0) return;
                                          setReportPayment(reviewReportId, { methods: next });
                                        }}
                                        className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border cursor-pointer ${
                                          on
                                            ? "bg-[#4A0A13] text-[#F5D77F] border-[#4A0A13]"
                                            : "bg-white text-[#4A0A13] border-[#D4AF37]/40 hover:bg-[#F5EAD4]"
                                        }`}
                                      >
                                        {m.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          downloadReportDocx(reviewReportId, 'strategy-report.docx')
                            .catch((err) => alert(err.message || 'Could not download the report.'))
                        }
                        title="Download the current .docx (uses whatever is saved on the server so far)"
                        className="rounded-full border border-[#D4AF37]/50 bg-[#FAF4E8] hover:bg-[#F5EAD4] px-5 py-2 text-xs font-medium text-[#4A0A13] transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Download size={12} />
                        Download .docx
                      </button>
                      <button
                        onClick={() => submitReview("sendBack")}
                        disabled={reviewSubmitting}
                        className="rounded-full border border-[#D4AF37]/50 bg-[#FAF4E8] hover:bg-[#F5EAD4] px-5 py-2 text-xs font-medium text-[#4A0A13] transition cursor-pointer disabled:opacity-50"
                      >
                        Send Back
                      </button>
                      <button
                        onClick={() => submitReview("approve")}
                        disabled={reviewSubmitting}
                        className="rounded-full bg-[#4A0A13] text-[#F5D77F] px-5 py-2 text-xs font-semibold transition cursor-pointer hover:bg-[#5C0F1A] disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        {reviewSubmitting ? "Submitting…" : "Approve & Publish"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}


      <footer className="py-4 text-center text-[0.7rem] text-[#7A1C29] font-medium border-t border-[#D4AF37]/20">
        © 2026 Conscious Orbit · Admin Workspace
      </footer>

    </div>
  );
}
