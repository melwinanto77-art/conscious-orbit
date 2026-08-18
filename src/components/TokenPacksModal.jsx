import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Coins, Lock, Loader2, CheckCircle2, Calendar } from "lucide-react";
import { TOKEN_PACKS, buyTokenPack, getTokenBalance, subscribePayments } from "../paymentsStore.js";

const onlyDigits = (v) => v.replace(/\D+/g, "");

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function TokenPacksModal({ clientEmail, clientName, onClose }) {
  const [balance, setBalance] = useState(() => getTokenBalance(clientEmail));
  useEffect(() => subscribePayments(() => setBalance(getTokenBalance(clientEmail))), [clientEmail]);

  const [selected, setSelected] = useState("SEMI");
  const [method, setMethod] = useState("CARD"); // 'CARD' | 'UPI'
  const [form, setForm] = useState({ name: clientName || "", card: "", exp: "", cvc: "", upi: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const pack = TOKEN_PACKS.find((p) => p.id === selected);

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
    }

    setBusy(true);
    setTimeout(() => {
      try {
        const res = buyTokenPack({
          email: clientEmail,
          packId: selected,
          client: form.name || form.upi || clientName,
          cardLast4: last4,
          method,
        });
        setDone(res);
      } catch (err) {
        setError(err.message || "Purchase failed.");
      } finally {
        setBusy(false);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[#D4AF37] bg-[#FAF4E8] p-6 shadow-2xl space-y-4 text-[#4A0A13]"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase font-bold text-[#B8860B] tracking-wider">
              <Coins size={13} /> Report Tokens
            </div>
            <h2 className="text-lg font-serif font-extrabold text-[#400A12]">Buy a token pack</h2>
            <p className="text-[0.7rem] text-[#7A1C29]">Use 1 token to unlock any report. Alternative to paying per report.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5EAD4] text-[#8C6D58] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Current balance */}
        <div className={`rounded-xl border p-3 flex items-center justify-between ${
          balance.tokens > 0 ? "border-emerald-300 bg-emerald-50" : "border-[#D4AF37]/40 bg-white"
        }`}>
          <div>
            <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Your balance</span>
            <p className="text-sm font-semibold text-[#4A0A13]">
              {balance.tokens || 0} token{(balance.tokens || 0) === 1 ? "" : "s"}
              {balance.packLabel ? ` · ${balance.packLabel} pack` : ""}
            </p>
          </div>
          {balance.expiresAt && (
            <div className="text-right">
              <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">
                {balance.expired ? "Expired" : "Expires"}
              </span>
              <p className="text-xs text-[#4A0A13] flex items-center gap-1">
                <Calendar size={11} /> {fmtDate(balance.expiresAt)}
              </p>
            </div>
          )}
        </div>

        {done ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-700" />
            <p className="text-sm font-bold text-emerald-900">Pack purchased</p>
            <p className="text-xs text-emerald-800">
              You now have <b>{done.balance.tokens}</b> tokens · valid until {fmtDate(done.balance.expiresAt)}.
            </p>
            <p className="text-[0.7rem] text-emerald-700">Receipt <span className="font-mono">{done.invoice.id}</span> auto-issued.</p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-xl bg-[#400A12] text-[#F5D77F] text-xs font-bold cursor-pointer hover:bg-[#5C0F1A]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <p className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider mb-1.5">Choose a plan</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TOKEN_PACKS.map((p) => {
                  const active = selected === p.id;
                  return (
                    <button
                      key={p.id} type="button"
                      onClick={() => setSelected(p.id)}
                      className={`text-left rounded-xl border-2 p-3 cursor-pointer transition ${
                        active
                          ? "border-[#4A0A13] bg-[#4A0A13] text-[#F5D77F]"
                          : "border-[#D4AF37]/40 bg-white text-[#4A0A13] hover:bg-[#F5EAD4]"
                      }`}
                    >
                      <p className="text-[0.6rem] uppercase font-bold tracking-wider opacity-80">{p.label}</p>
                      <p className="font-serif text-xl font-extrabold mt-0.5">₹{p.price}</p>
                      <p className="text-[0.65rem] mt-0.5">{p.tokens} tokens · ~₹{p.perToken}/report</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/50 bg-white p-3 flex items-center justify-between">
              <span className="text-xs text-[#7A1C29]">{pack.label} · {pack.tokens} tokens</span>
              <span className="font-serif text-xl font-extrabold text-[#B8860B]">₹{pack.price}</span>
            </div>

            {/* Payment method */}
            <div className="space-y-1">
              <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Payment method</span>
              <div className="flex gap-1.5">
                {[["CARD", "Credit / Debit card"], ["UPI", "UPI"]].map(([id, label]) => (
                  <button
                    key={id} type="button"
                    onClick={() => setMethod(id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border ${
                      method === id
                        ? "bg-[#400A12] text-[#F5D77F] border-[#4A0A13]"
                        : "bg-white text-[#4A0A13] border-[#D4AF37]/40 hover:bg-[#F5EAD4]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {method === "CARD" && (
              <>
                <label className="block space-y-1">
                  <span className="text-[0.6rem] uppercase font-bold text-[#B8860B] tracking-wider">Name on card</span>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-[#D4AF37]/50 bg-white px-3 py-2 text-sm focus:border-[#4A0A13] focus:outline-none"
                    style={{ fontSize: "16px" }}
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
                <p className="text-[0.6rem] text-[#8C6D58]">Enter any UPI ID in the format name@bank.</p>
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
              <span>{busy ? "Processing…" : `Buy ${pack.label} — ₹${pack.price}`}</span>
            </button>
            <p className="text-[0.6rem] text-[#8C6D58] text-center">
              Simulated gateway — no real charge is made.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
