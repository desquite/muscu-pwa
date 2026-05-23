import { useState, useEffect } from "react";
import App from "./App.jsx";
import Login, { loadToken, clearToken, authedFetch } from "./Login.jsx";

export default function Root() {
  const [authState, setAuthState] = useState("loading"); // loading | logged-out | logged-in
  const [user, setUser] = useState(null);

  // Vérifie la session au démarrage
  useEffect(() => {
    const token = loadToken();
    if (!token) { setAuthState("logged-out"); return; }
    authedFetch("/api/auth/me")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setUser(data.user);
          setAuthState("logged-in");
        } else {
          // Token invalide ou expiré : on nettoie
          clearToken();
          setAuthState("logged-out");
        }
      })
      .catch(() => {
        // Erreur réseau : on laisse le user entrer (mode offline), il refera login si besoin
        setAuthState("logged-out");
      });
  }, []);

  const handleLogout = () => {
    authedFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    setUser(null);
    setAuthState("logged-out");
  };

  if (authState === "loading") {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d0d14", color: "#555",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💪</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 14, letterSpacing: "0.2em" }}>CHARGEMENT…</div>
        </div>
      </div>
    );
  }

  if (authState === "logged-out") {
    return <Login onSuccess={(u) => { setUser(u); setAuthState("logged-in"); }} />;
  }

  return <App user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
}
