import React, { useEffect, useMemo, useState } from "react";
import { FileText, Printer, X, CheckCircle2 } from "lucide-react";
import {
  listInvoices, listInvoicesForClient, subscribePayments, markUnpaid,
} from "../paymentsStore.js";

/* ============================================================
   PAYMENT RECEIPTS — one receipt per payment, auto-issued.

   role="admin"  → sees every receipt (auto-generated for admin).
   role="client" → sees only their own receipts (auto-sent to them).
   Every row opens a compact printable receipt with just the amount.
   ============================================================ */

function money(n, currency = "INR") {
  const sym = "₹";
  return `${sym}${Number(n || 0).toFixed(2)}`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function ReceiptView({ receipt, onClose, canRefund, onRefund }) {
  const snap = receipt.reportSnapshot || {};
  const kind = snap.kind || "REPORT_PAYMENT";
  const isPack = kind === "TOKEN_PACK";
  const isRedeem = kind === "TOKEN_REDEMPTION";

  const heading = isPack ? "Token Pack Receipt" : isRedeem ? "Token Redemption Receipt" : "Payment Receipt";

  const printReceipt = () => {
    const extra = isPack
      ? `<p class="lbl">Tokens</p><p class="sub"><strong>${snap.tokens || 0}</strong> tokens · valid until ${fmtDate(snap.expiresAt)}</p>`
      : isRedeem
        ? `<p class="lbl">Redeemed</p><p class="sub"><strong>1 token</strong> for <em>${receipt.reportName}</em></p>`
        : `<p class="lbl">For</p><p class="sub"><em>${receipt.reportName}</em></p>`;
    const clientBlock = receipt.clientEmail
      ? `<div class="card"><div class="row"><span class="k">Billed to</span><span>${receipt.client || "—"}</span></div><div class="row"><span class="k">Email</span><span>${receipt.clientEmail}</span></div><div class="row"><span class="k">Method</span><span>${receipt.method || "CARD"} · ref ${receipt.cardLast4 || "—"}</span></div></div>`
      : "";
    const html = `
      <html><head><title>Receipt ${receipt.id}</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111;padding:32px;max-width:640px;margin:auto;text-align:center}
        h1{color:#B8860B;margin:0;font-size:22pt}
        .meta{color:#666;font-size:10pt;margin-top:4px}
        .paid{background:#d4edda;color:#155724;padding:4px 12px;border-radius:12px;font-size:11pt;font-weight:bold;display:inline-block;margin-top:12px}
        .amount{font-size:40pt;color:#B8860B;font-weight:bold;margin:24px 0 4px}
        .sub{color:#4A0A13;font-size:11pt;margin:4px 0 12px}
        .lbl{color:#7A1C29;font-size:10pt;text-transform:uppercase;letter-spacing:2px;margin-top:14px}
        .card{border:1px solid #D4AF37;border-radius:8px;padding:12px;margin-top:16px;text-align:left}
        .row{display:flex;justify-content:space-between;padding:3px 0;font-size:10pt}
        .k{color:#7A1C29;font-weight:bold}
        .foot{margin-top:32px;color:#8C6D58;font-size:9pt}
      </style></head><body>
      <h1>Conscious Orbit</h1>
      <p class="meta">${heading} <strong>${receipt.id}</strong> · ${fmtDate(receipt.issuedAt)}</p>
      <div><span class="paid">✓ ${receipt.status}</span></div>
      <p class="lbl">Amount paid</p>
      <p class="amount">${money(receipt.amount, receipt.currency)}</p>
      ${extra}
      ${clientBlock}
      <p class="foot">The Conscious Orbit &copy; ${new Date().getFullYear()}</p>
      </body></html>`;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) { alert("Pop-up blocked — please allow pop-ups to print."); return; }
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch { /* ignore */ } }, 200);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl border border-[#D4AF37] bg-[#FAF4E8] p-6 shadow-2xl space-y-4 text-[#4A0A13] text-center">
        <div className="flex items-center justify-end">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase font-bold text-[#B8860B] tracking-wider justify-center">
            <FileText size={13} /> {heading}
          </div>
          <h2 className="text-lg font-serif font-extrabold text-[#400A12]">{receipt.id}</h2>
          <p className="text-[0.65rem] text-[#7A1C29]">{fmtDate(receipt.issuedAt)}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[0.65rem] font-bold">
            <CheckCircle2 size={11} /> {receipt.status}
          </span>
        </div>

        <div>
          <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-widest">Amount paid</p>
          <p className="font-serif text-5xl font-extrabold text-[#B8860B] mt-1">
            {money(receipt.amount, receipt.currency)}
          </p>
        </div>

        {isPack && (
          <div className="rounded-xl border border-[#D4AF37]/40 bg-white p-3 text-left space-y-1">
            <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Tokens</p>
            <p className="text-sm font-semibold text-[#4A0A13]">
              {snap.tokens || 0} tokens · {receipt.reportName}
            </p>
            {snap.expiresAt && (
              <p className="text-[0.65rem] text-[#7A1C29]">Valid until {fmtDate(snap.expiresAt)}</p>
            )}
          </div>
        )}

        {isRedeem && (
          <div className="rounded-xl border border-[#D4AF37]/40 bg-white p-3 text-left space-y-1">
            <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Redeemed</p>
            <p className="text-sm font-semibold text-[#4A0A13]">1 token · {receipt.reportName}</p>
          </div>
        )}

        {!isPack && !isRedeem && (
          <div className="rounded-xl border border-[#D4AF37]/40 bg-white p-3 text-left space-y-1">
            <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">For</p>
            <p className="text-sm font-semibold text-[#4A0A13]">{receipt.reportName}</p>
          </div>
        )}

        {receipt.clientEmail && (
          <div className="rounded-xl border border-[#D4AF37]/30 bg-white/60 p-2.5 text-left text-[0.7rem] space-y-0.5">
            <p><span className="text-[#7A1C29] font-bold">Billed to:</span> {receipt.client || "—"}</p>
            <p><span className="text-[#7A1C29] font-bold">Email:</span> {receipt.clientEmail}</p>
            <p><span className="text-[#7A1C29] font-bold">Method:</span> {receipt.method || "CARD"} · ref {receipt.cardLast4 || "—"}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 border-t border-[#D4AF37]/30 pt-3 flex-wrap">
          {canRefund && !isRedeem && (
            <button
              onClick={() => {
                if (window.confirm(`Refund receipt ${receipt.id}?`)) onRefund && onRefund(receipt);
              }}
              className="rounded-full border border-[#D4AF37]/50 bg-[#FAF4E8] hover:bg-[#F5EAD4] text-[#7A1C29] text-xs font-semibold px-3 py-1.5 cursor-pointer"
            >
              Refund
            </button>
          )}
          <button
            onClick={printReceipt}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#FAF4E8] hover:bg-[#F5EAD4] text-[#4A0A13] text-xs font-semibold px-3 py-1.5 cursor-pointer"
          >
            <Printer size={12} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPanel({ role = "admin", clientEmail = "" }) {
  const isAdmin = role === "admin";
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("REPORTS"); // 'REPORTS' | 'TOKENS'
  useEffect(() => subscribePayments(() => setTick((v) => v + 1)), []);

  const allReceipts = useMemo(
    () => (isAdmin ? listInvoices() : listInvoicesForClient(clientEmail)),
    [isAdmin, clientEmail, tick]
  );
  const kindOf = (r) => r?.reportSnapshot?.kind || "REPORT_PAYMENT";
  const reportReceipts = allReceipts.filter((r) => kindOf(r) === "REPORT_PAYMENT");
  const tokenPacks = allReceipts.filter((r) => kindOf(r) === "TOKEN_PACK");
  const tokenSpends = allReceipts.filter((r) => kindOf(r) === "TOKEN_REDEMPTION");
  const receipts = tab === "TOKENS" ? [...tokenPacks, ...tokenSpends] : reportReceipts;
  const total = receipts.reduce((s, i) => s + (i.amount || 0), 0);

  // Group token purchases with the spends that happened after them, per client
  const tokenBilling = useMemo(() => {
    const packs = [...tokenPacks].sort((a, b) => new Date(a.issuedAt) - new Date(b.issuedAt));
    const spendsByEmail = new Map();
    for (const s of tokenSpends) {
      const key = (s.clientEmail || "").toLowerCase();
      if (!spendsByEmail.has(key)) spendsByEmail.set(key, []);
      spendsByEmail.get(key).push(s);
    }
    return packs.map((p, i) => {
      const key = (p.clientEmail || "").toLowerCase();
      const packStart = new Date(p.issuedAt).getTime();
      const nextPack = packs.slice(i + 1).find((x) => (x.clientEmail || "").toLowerCase() === key);
      const packEnd = nextPack ? new Date(nextPack.issuedAt).getTime() : Infinity;
      const spends = (spendsByEmail.get(key) || []).filter((s) => {
        const t = new Date(s.issuedAt).getTime();
        return t >= packStart && t < packEnd;
      });
      const bought = p.reportSnapshot?.tokens || 0;
      const spent = spends.length;
      const remaining = Math.max(0, bought - spent);
      return { pack: p, bought, spent, remaining, spends };
    });
  }, [tokenPacks, tokenSpends]);

  const handleRefund = (receipt) => {
    markUnpaid(receipt.reportId);
    try {
      const raw = JSON.parse(localStorage.getItem("co.invoices") || "[]");
      localStorage.setItem("co.invoices", JSON.stringify(raw.filter((x) => x.id !== receipt.id)));
      window.dispatchEvent(new CustomEvent("co:payments-changed"));
    } catch { /* ignore */ }
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-[#D4AF37]/20 pb-3">
        <h1 className="text-xl font-semibold text-[#4A0A13]">
          {isAdmin ? "Payment Receipts" : "My Payment Receipts"}
        </h1>
        <p className="text-xs text-[#7A1C29]">
          {isAdmin
            ? "Every receipt auto-issued when a client pays for a report."
            : "Receipts for the reports you've unlocked — auto-sent when your payment is confirmed."}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {[["REPORTS", "Report payments"], ["TOKENS", "Token billing"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
              tab === id
                ? "bg-[#4A0A13] text-[#F5D77F] border-[#4A0A13]"
                : "bg-[#FAF4E8] text-[#4A0A13] border-[#D4AF37]/30 hover:bg-[#F5EAD4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4">
          <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Receipts</span>
          <p className="text-xl font-semibold text-[#4A0A13] mt-1">{receipts.length}</p>
        </div>
        <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4">
          <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Total {isAdmin ? "collected" : "paid"}</span>
          <p className="text-xl font-semibold text-[#4A0A13] mt-1">{money(total, "INR")}</p>
        </div>
        <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4">
          <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Last payment</span>
          <p className="text-xs text-[#4A0A13] mt-1">{receipts[0] ? fmtDate(receipts[0].issuedAt) : "—"}</p>
        </div>
      </div>

      {tab === "TOKENS" && (
        <div className="space-y-4">
          {!tokenBilling.length && (
            <div className="rounded-2xl border border-dashed border-[#D4AF37]/50 bg-[#FAF4E8]/60 p-8 text-center">
              <p className="text-sm font-semibold text-[#4A0A13]">
                {isAdmin ? "No token purchases yet" : "You haven't bought a token pack yet"}
              </p>
              <p className="text-xs text-[#7A1C29] mt-1">
                Token billing statements appear here as soon as a pack is purchased.
              </p>
            </div>
          )}
          {tokenBilling.map((b) => (
            <div key={b.pack.id} className="rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8] p-4 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Token pack</span>
                  <p className="text-sm font-semibold text-[#4A0A13]">{b.pack.reportName}</p>
                  <p className="text-[0.65rem] text-[#7A1C29]">
                    Purchased {fmtDate(b.pack.issuedAt)} · {b.pack.method || "CARD"} · ref {b.pack.cardLast4}
                  </p>
                  {isAdmin && <p className="text-[0.65rem] text-[#7A1C29]">Client: {b.pack.client} · {b.pack.clientEmail}</p>}
                </div>
                <div className="text-right">
                  <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Amount paid</span>
                  <p className="font-serif text-xl font-extrabold text-[#B8860B]">{money(b.pack.amount, "INR")}</p>
                  {b.pack.reportSnapshot?.expiresAt && (
                    <p className="text-[0.6rem] text-[#8C6D58]">Valid until {fmtDate(b.pack.reportSnapshot.expiresAt)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white p-2">
                  <p className="text-[0.55rem] uppercase font-bold text-[#B8860B]">Bought</p>
                  <p className="font-semibold text-[#4A0A13]">{b.bought}</p>
                </div>
                <div className="rounded-lg border border-[#D4AF37]/30 bg-white p-2">
                  <p className="text-[0.55rem] uppercase font-bold text-[#B8860B]">Spent</p>
                  <p className="font-semibold text-[#4A0A13]">{b.spent}</p>
                </div>
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2">
                  <p className="text-[0.55rem] uppercase font-bold text-emerald-800">Remaining</p>
                  <p className="font-semibold text-emerald-900">{b.remaining}</p>
                </div>
              </div>

              {b.spends.length > 0 && (
                <div>
                  <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-1">Spent on</p>
                  <ul className="space-y-1">
                    {b.spends.map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-lg border border-[#D4AF37]/20 bg-white px-2.5 py-1.5 text-[0.7rem]">
                        <span className="text-[#4A0A13] truncate">🪙 <b>1 token</b> · {s.reportName}</span>
                        <span className="text-[#7A1C29] shrink-0 ml-2">{fmtDate(s.issuedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#D4AF37]/20">
                <button
                  onClick={() => setSelected(b.pack)}
                  className="text-[0.65rem] font-semibold text-[#4A0A13] underline cursor-pointer"
                >
                  View bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "REPORTS" && (
      <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/40 bg-[#FAF4E8]">
        <table className="w-full text-xs">
          <thead className="text-[0.65rem] uppercase text-[#B8860B] tracking-wider">
            <tr className="text-left">
              <th className="px-4 py-3">Receipt</th>
              {isAdmin && <th className="px-4 py-3">Client</th>}
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount paid</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4AF37]/20">
            {!receipts.length && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-6 text-center text-[#8C6D58] italic">
                  {isAdmin
                    ? "No receipts yet — one is auto-generated for you the moment a client pays."
                    : "No receipts yet — you'll see one here right after your first payment."}
                </td>
              </tr>
            )}
            {receipts.map((r) => (
              <tr key={r.id} className="text-[#4A0A13] hover:bg-[#F5EAD4]/40 cursor-pointer" onClick={() => setSelected(r)}>
                <td className="px-4 py-3 font-mono">{r.id}</td>
                {isAdmin && <td className="px-4 py-3">{r.client || r.clientEmail || "—"}</td>}
                <td className="px-4 py-3">{fmtDate(r.issuedAt)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{money(r.amount, r.currency)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(r); }}
                    className="text-[0.65rem] font-semibold text-[#4A0A13] underline cursor-pointer"
                  >
                    View bill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {selected && (
        <ReceiptView
          receipt={selected}
          onClose={() => setSelected(null)}
          canRefund={isAdmin}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}
