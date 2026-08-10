import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { payForReport, getReportPayment, subscribePayments, ALL_METHODS } from "../paymentsStore.js";

/* ============================================================
   PAYMENT MODAL — simulated gateway for unlocking a report.

   Price, currency and enabled methods are read live from the
   admin-controlled paymentsStore settings, so any change the
   admin makes takes effect on the next open.
   ============================================================ */

const onlyDigits = (v) => v.replace(/\D+/g, "");

export default function PaymentModal({ report, client, onClose, onPaid }) {
  const [settings, setSettings] = useState(() => getReportPayment(report?.id));
  useEffect(() => subscribePayments(() => setSettings(getReportPayment(report?.id))), [report?.id]);

  const enabledMethods = ALL_METHODS.filter((m) => settings.methods.includes(m.id));
  const [method, setMethod] = useState(enabledMethods[0]?.id || "CARD");
  useEffect(() => {
    if (!enabledMethods.find((m) => m.id === method)) {
      setMethod(enabledMethods[0]?.id || "CARD");
    }
  }, [settings.methods]); // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState({ name: "", card: "", exp: "", cvc: "", upi: "", bank: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    let last4 = "0000";
    if (method === "CARD") {
      const card = onlyDigits(form.card);
      if (!form.name.trim()) return setError("Name on card is required.");
      if (card.length < 12 || card.length > 19) return setError("Enter a valid card number.");
      if (!/^\d{2}\/\d{2}$/.test(form.exp)) return setError("Expiry must be MM/YY.");
      if (!/^\d{3,4}$/.test(form.cvc)) return setError("CVC must be 3–4 digits.");
      last4 = card.slice(-4);
    } else if (method === "UPI") {
      if (!/^[\w.\-]+@[\w.\-]+$/.test(form.upi)) return setError("Enter a valid UPI ID (e.g. name@bank).");
      last4 = form.upi.slice(-4);
    } else if (method === "NET_BANKING" || method === "WALLET") {
      if (!form.bank.trim()) return setError(method === "WALLET" ? "Choose a wallet." : "Choose a bank.");
      last4 = form.bank.slice(0, 4).toUpperCase();
    }

    setBusy(true);
    setTimeout(() => {
      try {
        const inv = payForReport({
          reportId: report.id,
          reportName: report.name || report.reportName,
          client: client || form.name || form.upi || "—",
          cardLast4: last4,
          method,
        });
        setInvoice(inv);
        onPaid && onPaid(inv);
      } catch (err) {
        setError(err.message || "Payment failed.");
      } finally {
        setBusy(false);
      }
    }, 900);
  };

  const currencySymbol = settings.currency === "INR" ? "₹" : settings.currency === "EUR" ? "€" : "$";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-[#D4AF37] bg-[#FAF4E8] p-6 shadow-2xl space-y-4 text-[#4A0A13]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase font-bold text-[#B8860B] tracking-wider">
              <CreditCard size={13} /> Payment gateway
            </div>
            <h2 className="text-lg font-serif font-extrabold text-[#400A12]">Unlock Full Report</h2>
            <p className="text-xs text-[#7A1C29]">{report?.name || report?.reportName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {invoice ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-700" />
            <p className="text-sm font-bold text-emerald-900">Payment successful</p>
            <p className="text-xs text-emerald-800">Invoice <span className="font-mono">{invoice.id}</span> issued to admin.</p>
            <p className="text-[0.7rem] text-emerald-700">{currencySymbol}{invoice.amount.toFixed(2)} · {invoice.method} · ref {invoice.cardLast4}</p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl bg-[#400A12] text-[#F5D77F] text-xs font-bold cursor-pointer hover:bg-[#5C0F1A]"
            >
              View full report
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="rounded-xl border border-[#D4AF37]/50 bg-white p-3 flex items-center justify-between">
              <span className="text-xs text-[#7A1C29]">Full report unlock</span>
              <span className="font-serif text-xl font-extrabold text-[#B8860B]">
                {currencySymbol}{settings.price}
              </span>
            </div>

            {enabledMethods.length > 1 && (
              <div className="space-y-1">
                <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Payment method</span>
                <div className="flex flex-wrap gap-1.5">
                  {enabledMethods.map((m) => (
                    <button
                      key={m.id} type="button"
                      onClick={() => setMethod(m.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border ${
                        method === m.id
                          ? "bg-[#400A12] text-[#F5D77F] border-[#4A0A13]"
                          : "bg-white text-[#4A0A13] border-[#D4AF37]/40 hover:bg-[#F5EAD4]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === "CARD" && (
              <>
                <label className="block space-y-1">
                  <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Name on card</span>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm focus:border-[#4A0A13] focus:outline-none"
                    style={{ fontSize: "16px" }} placeholder="Alex Founder"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Card number</span>
                  <input
                    type="text" value={form.card} inputMode="numeric" maxLength={23}
                    onChange={(e) => {
                      const digits = onlyDigits(e.target.value).slice(0, 19);
                      const grouped = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                      setForm({ ...form, card: grouped });
                    }}
                    className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm font-mono focus:border-[#4A0A13] focus:outline-none"
                    style={{ fontSize: "16px" }} placeholder="4242 4242 4242 4242"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Expiry</span>
                    <input
                      type="text" value={form.exp} inputMode="numeric" maxLength={5}
                      onChange={(e) => {
                        let v = onlyDigits(e.target.value).slice(0, 4);
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                        setForm({ ...form, exp: v });
                      }}
                      className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm font-mono focus:border-[#4A0A13] focus:outline-none"
                      style={{ fontSize: "16px" }} placeholder="MM/YY"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">CVC</span>
                    <input
                      type="text" value={form.cvc} inputMode="numeric" maxLength={4}
                      onChange={(e) => setForm({ ...form, cvc: onlyDigits(e.target.value).slice(0, 4) })}
                      className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm font-mono focus:border-[#4A0A13] focus:outline-none"
                      style={{ fontSize: "16px" }} placeholder="123"
                    />
                  </label>
                </div>
              </>
            )}

            {method === "UPI" && (
              <label className="block space-y-1">
                <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">UPI ID</span>
                <input
                  type="text" value={form.upi}
                  onChange={(e) => setForm({ ...form, upi: e.target.value })}
                  placeholder="name@bank"
                  className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm font-mono focus:border-[#4A0A13] focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
              </label>
            )}

            {(method === "NET_BANKING" || method === "WALLET") && (
              <label className="block space-y-1">
                <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">
                  {method === "WALLET" ? "Wallet provider" : "Bank"}
                </span>
                <input
                  type="text" value={form.bank}
                  onChange={(e) => setForm({ ...form, bank: e.target.value })}
                  placeholder={method === "WALLET" ? "e.g. Paytm" : "e.g. HDFC Bank"}
                  className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm focus:border-[#4A0A13] focus:outline-none"
                  style={{ fontSize: "16px" }}
                />
              </label>
            )}

            {error && (
              <p className="text-[0.7rem] font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit" disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#400A12] hover:bg-[#5C0F1A] text-[#F5D77F] font-extrabold text-sm cursor-pointer disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              <span>{busy ? "Processing…" : `Pay ${currencySymbol}${settings.price}`}</span>
            </button>

            <p className="text-[0.6rem] text-[#8C6D58] text-center">
              Simulated gateway — no real charge is made. Admin controls price, currency and methods from the Invoices tab.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
