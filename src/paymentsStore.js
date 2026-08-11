/* ============================================================
   Client-side simulated payments store.

   There is no real payment gateway integrated. Paid-report state
   and invoices live in localStorage so the client demo/full flow
   and the admin invoice list stay in sync across reloads without
   a backend endpoint.
   ============================================================ */

const PAID_KEY = "co.paidReports";
const INVOICES_KEY = "co.invoices";
const SETTINGS_KEY = "co.paymentSettings";

export const DEFAULT_SETTINGS = {
  price: 2499,
  currency: "INR",
  methods: ["CARD", "UPI", "NET_BANKING"],
};

export const ALL_METHODS = [
  { id: "CARD", label: "Credit / Debit card" },
  { id: "UPI", label: "UPI" },
  { id: "NET_BANKING", label: "Net banking" },
  { id: "WALLET", label: "Wallet" },
];

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const writeJson = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export const getPaidReports = () => readJson(PAID_KEY, {});
export const isReportPaid = (id) => Boolean(id && getPaidReports()[id]);

export const listInvoices = () => readJson(INVOICES_KEY, []);

export const getPaymentSettings = () => {
  const merged = { ...DEFAULT_SETTINGS, ...readJson(SETTINGS_KEY, {}) };
  merged.currency = "INR"; // rupees only
  return merged;
};
export function setPaymentSettings(patch) {
  const next = { ...getPaymentSettings(), ...patch };
  writeJson(SETTINGS_KEY, next);
  notify();
  return next;
}

// ---------- per-report payment overrides ----------
const OVERRIDES_KEY = "co.reportPaymentOverrides";
const readOverrides = () => readJson(OVERRIDES_KEY, {});

/** Resolve the payment config for a specific report: per-report override merged
 *  on top of the global default settings. */
export function getReportPayment(reportId) {
  const base = { ...getPaymentSettings(), free: false };
  const override = reportId ? (readOverrides()[reportId] || null) : null;
  if (!override) return { ...base, overridden: false };
  return { ...base, ...override, currency: "INR", overridden: true };
}

export function setReportPayment(reportId, patch) {
  if (!reportId) return null;
  const all = readOverrides();
  all[reportId] = { ...(all[reportId] || {}), ...patch };
  writeJson(OVERRIDES_KEY, all);
  notify();
  return all[reportId];
}

export function clearReportPayment(reportId) {
  if (!reportId) return;
  const all = readOverrides();
  delete all[reportId];
  writeJson(OVERRIDES_KEY, all);
  notify();
}

const notify = () => {
  try { window.dispatchEvent(new CustomEvent("co:payments-changed")); } catch { /* ignore */ }
};

export function subscribePayments(listener) {
  const handler = () => listener();
  window.addEventListener("co:payments-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("co:payments-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

/** Simulate payment success. Marks report paid + writes an invoice. */
export function payForReport({
  reportId, reportName, amount, client, clientEmail, clientCompany,
  cardLast4, method, currency, reportSnapshot,
}) {
  if (!reportId) throw new Error("reportId required");
  const settings = getReportPayment(reportId);
  const finalAmount = amount ?? settings.price;
  const finalCurrency = currency || settings.currency;
  const now = new Date().toISOString();

  const paid = getPaidReports();
  paid[reportId] = { paidAt: now, amount: finalAmount, currency: finalCurrency, method };
  writeJson(PAID_KEY, paid);

  const invoices = listInvoices();
  const invoice = {
    id: `INV-${Date.now().toString(36).toUpperCase()}`,
    reportId,
    reportName: reportName || reportId,
    client: client || clientEmail || clientCompany || "—",
    clientEmail: (clientEmail || "").trim().toLowerCase(),
    clientCompany: clientCompany || "",
    amount: finalAmount,
    currency: finalCurrency,
    method: method || "CARD",
    cardLast4: cardLast4 || "0000",
    issuedAt: now,
    status: "PAID",
    reportSnapshot: reportSnapshot || null, // { domain, score, verdict, submittedAt, ... }
  };
  invoices.unshift(invoice);
  writeJson(INVOICES_KEY, invoices);

  notify();
  return invoice;
}

export function listInvoicesForClient(email) {
  const target = (email || "").trim().toLowerCase();
  if (!target) return [];
  return listInvoices().filter((i) => (i.clientEmail || "").toLowerCase() === target);
}

export function markUnpaid(reportId) {
  const paid = getPaidReports();
  delete paid[reportId];
  writeJson(PAID_KEY, paid);
  notify();
}
