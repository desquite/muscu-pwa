import { useState } from "react";

const TOKEN_KEY = "muscu_token_v1";

export function saveToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch {} }
export function loadToken() { try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; } }
export function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch {} }

export async function authedFetch(url, opts = {}) {
  const token = loadToken();
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...opts, headers });
}

export default function Login({ onSuccess }) {
  const [step, setStep] = useState("phone"); // phone | code
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const normalizePhone = (s) => s.replace(/\D/g, "");

  const sendOtp = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      const cleanPhone = normalizePhone(phone);
      if (cleanPhone.length < 8) throw new Error("Numéro invalide (au moins 8 chiffres avec indicatif pays)");
      const r = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erreur d'envoi");
      setStep("code");
      setInfo("Code envoyé sur WhatsApp 📱");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setError(""); setLoading(true);
    try {
      if (code.length !== 6) throw new Error("Le code fait 6 chiffres");
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), code, name }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Code incorrect");
      saveToken(data.token);
      onSuccess?.(data.user, data.isNew);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep("phone"); setCode(""); setError(""); setInfo(""); };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "env(safe-area-inset-top, 20px) 20px env(safe-area-inset-bottom, 20px)",
      background: "linear-gradient(160deg, #0d0d14 0%, #111120 100%)",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 22, padding: "32px 24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 6 }}>💪</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: "0.08em", color: "#fff", lineHeight: 1 }}>
            SÉANCE SPORT
          </div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 4 }}>
            DESQUITE · Connexion
          </div>
        </div>

        {step === "phone" && (
          <div className="fade-up">
            <label style={{ display: "block", fontSize: 11, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Ton prénom (optionnel)
            </label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Jean"
              style={{
                width: "100%", padding: "12px 14px", marginBottom: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 15, outline: "none",
                fontFamily: "inherit",
              }}
            />

            <label style={{ display: "block", fontSize: 11, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Numéro WhatsApp (avec indicatif pays)
            </label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="2250709646096"
              inputMode="numeric"
              style={{
                width: "100%", padding: "12px 14px", marginBottom: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 16, outline: "none",
                fontFamily: "inherit", letterSpacing: "0.05em",
              }}
              autoFocus
            />
            <div style={{ fontSize: 11, color: "#555", marginBottom: 20 }}>
              Ex : 225XXXXXXXX (CI), 336XXXXXXXX (FR). Pas de +, pas d'espaces.
            </div>

            <button
              onClick={sendOtp} disabled={loading || !phone}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(37,211,102,0.3)" : "linear-gradient(135deg, #25D366, #1aa86a)",
                color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
                opacity: !phone ? 0.4 : 1, transition: "all 0.2s",
              }}
            >
              {loading ? "Envoi…" : "💬 Recevoir mon code"}
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="fade-up">
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6, lineHeight: 1.5 }}>
              Code envoyé sur WhatsApp à <b style={{ color: "#fff" }}>+{phone}</b>
            </div>
            <button
              onClick={reset}
              style={{
                background: "none", border: "none", color: "#25D366",
                fontSize: 11, marginBottom: 20, padding: 0, cursor: "pointer", textDecoration: "underline",
              }}
            >
              Changer de numéro
            </button>

            <label style={{ display: "block", fontSize: 11, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Code à 6 chiffres
            </label>
            <input
              type="text" value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric" autoFocus
              style={{
                width: "100%", padding: "14px", marginBottom: 16,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 24, outline: "none",
                fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.4em", textAlign: "center",
              }}
            />

            <button
              onClick={verifyOtp} disabled={loading || code.length !== 6}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(41,121,212,0.3)" : "linear-gradient(135deg, #2979d4, #1a5fa8)",
                color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
                opacity: code.length !== 6 ? 0.4 : 1, transition: "all 0.2s",
              }}
            >
              {loading ? "Vérification…" : "✓ Valider et entrer"}
            </button>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "rgba(255,82,82,0.1)", border: "1px solid rgba(255,82,82,0.3)",
            borderRadius: 10, color: "#ff8a8a", fontSize: 12, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}
        {info && !error && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
            borderRadius: 10, color: "#7be8a8", fontSize: 12, lineHeight: 1.5,
          }}>
            {info}
          </div>
        )}
      </div>
    </div>
  );
}
