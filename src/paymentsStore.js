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

// ---------- token packs ----------
const TOKENS_KEY = "co.tokens";

export const TOKEN_PACKS = [
  { id: "MONTHLY",  label: "1 Month",  tokens: 3,  price: 999,  durationDays: 30,  perToken: 333 },
  { id: "SEMI",     label: "6 Months", tokens: 15, price: 3999, durationDays: 183, perToken: 267 },
  { id: "ANNUAL",   label: "1 Year",   tokens: 30, price: 6999, durationDays: 365, perToken: 233 },
];

const readTokens = () => readJson(TOKENS_KEY, {});

/** Balance for one client email. Returns { tokens, packId, expiresAt, expired }. */
export function getTokenBalance(email) {
  const target = (email || "").trim().toLowerCase();
  if (!target) return { tokens: 0, packId: null, expiresAt: null, expired: false };
  const all = readTokens();
  const row = all[target] || { tokens: 0, packId: null, expiresAt: null };
  const expired = row.expiresAt ? new Date(row.expiresAt).getTime() < Date.now() : false;
  return { ...row, expired, tokens: expired ? 0 : (row.tokens || 0) };
}

/** Purchase a token pack — adds tokens, sets expiry, writes a receipt. */
export function buyTokenPack({ email, packId, client, cardLast4, method }) {
  const pack = TOKEN_PACKS.find((p) => p.id === packId);
  const target = (email || "").trim().toLowerCase();
  if (!target) throw new Error("email required");
  if (!pack) throw new Error("invalid pack");

  const all = readTokens();
  const now = new Date();
  const current = all[target] || { tokens: 0, packId: null, expiresAt: null };
  const stillActive = current.expiresAt && new Date(current.expiresAt).getTime() > now.getTime();
  const carryOver = stillActive ? (current.tokens || 0) : 0;
  const newExpiry = new Date(Math.max(now.getTime(), stillActive ? new Date(current.expiresAt).getTime() : now.getTime()) + pack.durationDays * 86400000);

  all[target] = {
    tokens: carryOver + pack.tokens,
    packId: pack.id,
    packLabel: pack.label,
    expiresAt: newExpiry.toISOString(),
    lastPurchaseAt: now.toISOString(),
  };
  writeJson(TOKENS_KEY, all);

  // Record a receipt for the pack purchase
  const invoices = listInvoices();
  const invoice = {
    id: `RCP-${Date.now().toString(36).toUpperCase()}`,
    reportId: `TOKEN-${pack.id}`,
    reportName: `Token pack — ${pack.label} (${pack.tokens} tokens)`,
    client: client || target,
    clientEmail: target,
    clientCompany: "",
    amount: pack.price,
    currency: "INR",
    method: method || "CARD",
    cardLast4: cardLast4 || "0000",
    issuedAt: now.toISOString(),
    status: "PAID",
    reportSnapshot: { kind: "TOKEN_PACK", pack: pack.id, tokens: pack.tokens, expiresAt: newExpiry.toISOString() },
  };
  invoices.unshift(invoice);
  writeJson(INVOICES_KEY, invoices);

  notify();
  return { balance: all[target], invoice };
}

/** Spend one token to unlock a report. Returns the new balance and receipt. */
export function unlockReportWithToken({ email, reportId, reportName, client }) {
  const target = (email || "").trim().toLowerCase();
  if (!target) throw new Error("email required");
  const all = readTokens();
  const row = all[target];
  const active = row && row.expiresAt && new Date(row.expiresAt).getTime() > Date.now() && (row.tokens || 0) > 0;
  if (!active) throw new Error("No active tokens.");

  row.tokens = row.tokens - 1;
  writeJson(TOKENS_KEY, all);

  const paid = getPaidReports();
  paid[reportId] = { paidAt: new Date().toISOString(), amount: 0, currency: "INR", method: "TOKEN" };
  writeJson(PAID_KEY, paid);

  const invoices = listInvoices();
  const invoice = {
    id: `RCP-${Date.now().toString(36).toUpperCase()}`,
    reportId,
    reportName: reportName || reportId,
    client: client || target,
    clientEmail: target,
    clientCompany: "",
    amount: 0,
    currency: "INR",
    method: "TOKEN",
    cardLast4: "TKN",
    issuedAt: new Date().toISOString(),
    status: "PAID",
    reportSnapshot: { kind: "TOKEN_REDEMPTION", packId: row.packId },
  };
  invoices.unshift(invoice);
  writeJson(INVOICES_KEY, invoices);

  notify();
  return { balance: row, invoice };
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
