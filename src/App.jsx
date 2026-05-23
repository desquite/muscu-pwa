import { useState, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const DAYS = [
  {
    id: 1,
    label: "JOUR 1",
    day: "Lundi",
    theme: "Poitrine & Triceps",
    icon: "🫁",
    accent: "#2979d4",
    glow: "rgba(41,121,212,0.25)",
    exercises: [
      { name: "Développé couché", sets: 4, reps: "10–12", rest: "90s", muscle: "Pectoraux", tip: "Descends la barre lentement jusqu'à la poitrine, pousse de manière explosive." },
      { name: "Pompes larges", sets: 3, reps: "15–20", rest: "60s", muscle: "Pecs ext.", tip: "Mains écartées au-delà des épaules pour cibler les pectoraux extérieurs." },
      { name: "Écarté haltères", sets: 3, reps: "12", rest: "75s", muscle: "Pecs int.", tip: "Légère flexion des coudes, contrôle absolu en descente." },
      { name: "Extension triceps", sets: 3, reps: "12", rest: "60s", muscle: "Triceps", tip: "Garde le coude fixe et haut, ne bouge que l'avant-bras." },
      { name: "Dips sur chaise", sets: 3, reps: "12–15", rest: "60s", muscle: "Triceps", tip: "Corps proche de la chaise, coudes vers l'arrière." },
    ],
  },
  {
    id: 2,
    label: "JOUR 2",
    day: "Mercredi",
    theme: "Abdos & Cardio",
    icon: "🔥",
    accent: "#d45a1a",
    glow: "rgba(212,90,26,0.25)",
    exercises: [
      { name: "Crunch classique", sets: 4, reps: "20", rest: "45s", muscle: "Abdos sup.", tip: "Ne tire pas sur la nuque, contracte le ventre à la montée." },
      { name: "Relevé de jambes", sets: 3, reps: "15", rest: "45s", muscle: "Abdos inf.", tip: "Dos plaqué au sol, jambes bien tendues tout le long." },
      { name: "Planche (gainage)", sets: 4, reps: "45–60s", rest: "30s", muscle: "Sangle abdo", tip: "Corps droit de la tête aux talons, respire normalement." },
      { name: "Crunch obliques", sets: 3, reps: "15/côté", rest: "45s", muscle: "Obliques", tip: "Tourne le coude vers le genou opposé, pause en haut." },
      { name: "Burpees", sets: 3, reps: "10", rest: "60s", muscle: "Cardio + full body", tip: "Enchaîne : squat → planche → pompe → saut les bras en l'air." },
      { name: "Mountain climbers", sets: 3, reps: "30s", rest: "30s", muscle: "Cardio + abdos", tip: "Cadence rapide, hanches basses, respire régulièrement." },
    ],
  },
  {
    id: 3,
    label: "JOUR 3",
    day: "Samedi",
    theme: "Biceps & Dos & Épaules",
    icon: "💪",
    accent: "#1aa86a",
    glow: "rgba(26,168,106,0.25)",
    exercises: [
      { name: "Curl biceps haltères", sets: 4, reps: "12", rest: "60s", muscle: "Biceps", tip: "Coudes collés au corps, supination complète en haut du mouvement." },
      { name: "Curl marteau", sets: 3, reps: "12", rest: "60s", muscle: "Biceps long", tip: "Prises neutres (paumes face à face), mouvement lent et contrôlé." },
      { name: "Rowing haltère", sets: 3, reps: "10/côté", rest: "75s", muscle: "Grand dorsal", tip: "Appuie un genou sur le banc, tire le coude vers le plafond." },
      { name: "Élévations latérales", sets: 3, reps: "15", rest: "60s", muscle: "Épaules", tip: "Légère flexion du coude, monte jusqu'à hauteur d'épaule max." },
      { name: "Développé militaire", sets: 3, reps: "12", rest: "75s", muscle: "Épaules + triceps", tip: "Pousse verticalement sans creuser le bas du dos." },
    ],
  },
  {
    id: 4,
    label: "JOUR 4",
    day: "Dimanche",
    theme: "Full Body & Abdos",
    icon: "⚡",
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.25)",
    exercises: [
      { name: "Pompes diamant", sets: 3, reps: "12–15", rest: "60s", muscle: "Triceps + pecs", tip: "Mains rapprochées formant un losange, coudes vers l'arrière." },
      { name: "Squat au poids du corps", sets: 3, reps: "20", rest: "60s", muscle: "Cuisses + fessiers", tip: "Dos droit, genoux dans l'axe des pieds, descends à 90°." },
      { name: "Planche latérale", sets: 3, reps: "30s/côté", rest: "30s", muscle: "Obliques", tip: "Hanche bien levée, corps parfaitement aligné de la tête aux pieds." },
      { name: "Fentes avant haltères", sets: 3, reps: "12/jambe", rest: "60s", muscle: "Cuisses + équilibre", tip: "Genou arrière proche du sol sans le toucher, torse droit." },
      { name: "Crunch bicycle", sets: 3, reps: "20", rest: "45s", muscle: "Abdos + obliques", tip: "Coude vers le genou opposé en alternance, cadence lente et contrôlée." },
      { name: "Gainage ventral final", sets: 3, reps: "60s", rest: "30s", muscle: "Sangle complète", tip: "Dernier effort de la semaine — tiens jusqu'au bout !" },
    ],
  },
];

const WEEK = [
  { d: "L", label: "Poitrine & Triceps", active: true, dayIdx: 0 },
  { d: "M", label: "Repos", active: false },
  { d: "M", label: "Abdos & Cardio", active: true, dayIdx: 1 },
  { d: "J", label: "Repos", active: false },
  { d: "V", label: "Repos", active: false },
  { d: "S", label: "Biceps & Dos", active: true, dayIdx: 2 },
  { d: "D", label: "Full Body", active: true, dayIdx: 3 },
];

const TIPS = [
  { icon: "🥩", text: "1,6–2g de protéines par kg de poids corporel par jour." },
  { icon: "💧", text: "2L d'eau minimum, surtout les jours de sport." },
  { icon: "😴", text: "Le muscle se construit au repos — vise 7 à 9h de sommeil." },
  { icon: "📈", text: "Augmente les charges progressivement toutes les 2–3 semaines." },
  { icon: "🚶", text: "30 min de marche rapide les jours OFF pour brûler les graisses." },
];

const STORAGE_KEY = "muscu_checked_v1";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function loadChecked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveChecked(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function ProgressRing({ pct, accent }) {
  const r = 28, cx = 34, cy = 34, stroke = 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={68} height={68} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={accent} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

function ExerciseCard({ ex, checked, onToggle, accent, glow, idx }) {
  return (
    <div
      className={`fade-up fade-up-${Math.min(idx + 1, 6)}`}
      onClick={onToggle}
      style={{
        background: checked ? `${glow}` : "rgba(255,255,255,0.03)",
        border: `1px solid ${checked ? accent + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Checkbox */}
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1,
          border: `2px solid ${checked ? accent : "rgba(255,255,255,0.18)"}`,
          background: checked ? accent : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          boxShadow: checked ? `0 0 12px ${accent}88` : "none",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 19, letterSpacing: "0.04em",
              color: checked ? "#666" : "#f0f0f0",
              textDecoration: checked ? "line-through" : "none",
              transition: "color 0.2s",
            }}>
              {ex.name}
            </span>
            <span style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              background: `${accent}22`, color: accent,
              padding: "3px 9px", borderRadius: 99,
              flexShrink: 0, fontWeight: 600,
            }}>
              {ex.muscle}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            {[["Séries", ex.sets], ["Rép.", ex.reps], ["Repos", ex.rest]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 17, fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", color: accent }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{
            marginTop: 10, fontSize: 12, color: "#777", lineHeight: 1.6,
            borderLeft: `2px solid ${accent}40`, paddingLeft: 9,
          }}>
            {ex.tip}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeDay, setActiveDay] = useState(0);
  const [checked, setChecked] = useState(loadChecked);
  const [tab, setTab] = useState("programme"); // programme | planning | conseils

  const day = DAYS[activeDay];

  const toggle = useCallback((dayId, exIdx) => {
    setChecked(prev => {
      const key = `${dayId}-${exIdx}`;
      const next = { ...prev, [key]: !prev[key] };
      saveChecked(next);
      return next;
    });
  }, []);

  const totalEx = DAYS.reduce((a, d) => a + d.exercises.length, 0);
  const totalDone = Object.values(checked).filter(Boolean).length;
  const globalPct = Math.round((totalDone / totalEx) * 100);

  const dayDone = day.exercises.filter((_, i) => checked[`${day.id}-${i}`]).length;
  const dayPct = Math.round((dayDone / day.exercises.length) * 100);

  const resetDay = () => {
    setChecked(prev => {
      const next = { ...prev };
      day.exercises.forEach((_, i) => { delete next[`${day.id}-${i}`]; });
      saveChecked(next);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column", background: "linear-gradient(160deg, #0d0d14 0%, #111120 100%)" }}>

      {/* ── HEADER ── */}
      <header style={{
        padding: "env(safe-area-inset-top, 16px) 20px 0",
        paddingTop: `max(env(safe-area-inset-top, 16px), 20px)`,
        background: "linear-gradient(180deg, rgba(13,13,20,1) 0%, rgba(13,13,20,0) 100%)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, letterSpacing: "0.08em", lineHeight: 1, color: "#fff" }}>
              SÉANCE SPORT
            </div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 2 }}>
              DESQUITE · 4 jours / semaine
            </div>
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProgressRing pct={globalPct} accent={day.accent} />
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color: day.accent }}>{globalPct}%</div>
            </div>
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
          {[["programme", "Programme"], ["planning", "Planning"], ["conseils", "Conseils"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, border: "none",
              background: tab === key ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === key ? "#fff" : "#666",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, padding: "16px 16px calc(env(safe-area-inset-bottom, 16px) + 16px)", overflowY: "auto" }}>

        {/* ═══ PROGRAMME TAB ═══ */}
        {tab === "programme" && (
          <>
            {/* Day selector */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
              {DAYS.map((d, i) => (
                <button key={d.id} onClick={() => setActiveDay(i)} style={{
                  flexShrink: 0,
                  width: 72, padding: "10px 0", borderRadius: 14,
                  border: `2px solid ${activeDay === i ? d.accent : "rgba(255,255,255,0.07)"}`,
                  background: activeDay === i ? `${d.accent}18` : "rgba(255,255,255,0.02)",
                  color: activeDay === i ? d.accent : "#555",
                  transition: "all 0.2s",
                  boxShadow: activeDay === i ? `0 0 20px ${d.glow}` : "none",
                }}>
                  <div style={{ fontSize: 22 }}>{d.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginTop: 3 }}>{d.label}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>{d.day}</div>
                </button>
              ))}
            </div>

            {/* Day hero */}
            <div style={{
              background: `linear-gradient(135deg, ${day.glow}, transparent)`,
              border: `1px solid ${day.accent}30`,
              borderRadius: 18, padding: "16px 18px", marginBottom: 14,
              boxShadow: `0 8px 40px ${day.glow}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 40 }}>{day.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", color: day.accent, textTransform: "uppercase", marginBottom: 2 }}>
                      {day.label} · {day.day}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: "0.06em", color: "#fff" }}>
                      {day.theme}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: day.accent }}>{dayDone}/{day.exercises.length}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>FAIT</div>
                </div>
              </div>
              {/* Day progress bar */}
              <div style={{ marginTop: 12, background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${dayPct}%`,
                  background: `linear-gradient(90deg, ${day.accent}, ${day.accent}bb)`,
                  borderRadius: 99, transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* Exercises */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {day.exercises.map((ex, i) => (
                <ExerciseCard
                  key={i} ex={ex} idx={i}
                  checked={!!checked[`${day.id}-${i}`]}
                  onToggle={() => toggle(day.id, i)}
                  accent={day.accent} glow={day.glow}
                />
              ))}
            </div>

            {/* Reset button */}
            {dayDone > 0 && (
              <button onClick={resetDay} style={{
                marginTop: 16, width: "100%", padding: "12px",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#555", fontSize: 13,
                transition: "all 0.2s",
              }}>
                ↺ Réinitialiser ce jour
              </button>
            )}
          </>
        )}

        {/* ═══ PLANNING TAB ═══ */}
        {tab === "planning" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: "0.08em", marginBottom: 4, color: "#fff" }}>
              SEMAINE TYPE
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Appuie sur un jour actif pour y accéder.</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {WEEK.map(({ d, label, active, dayIdx }, i) => (
                <div
                  key={i}
                  onClick={() => { if (active && dayIdx !== undefined) { setActiveDay(dayIdx); setTab("programme"); } }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: active ? `${DAYS[dayIdx]?.glow || "rgba(255,255,255,0.04)"}` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${active ? (DAYS[dayIdx]?.accent + "30" || "transparent") : "rgba(255,255,255,0.05)"}`,
                    borderRadius: 14, padding: "14px 16px",
                    cursor: active ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: active ? (DAYS[dayIdx]?.accent + "22") : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? (DAYS[dayIdx]?.accent + "50") : "rgba(255,255,255,0.06)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bebas Neue', cursive", fontSize: 16,
                    color: active ? DAYS[dayIdx]?.accent : "#444",
                  }}>{d}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: active ? "#fff" : "#444" }}>{label}</div>
                    {active && <div style={{ fontSize: 11, color: DAYS[dayIdx]?.accent, marginTop: 2 }}>{DAYS[dayIdx]?.icon} {DAYS[dayIdx]?.exercises.length} exercices</div>}
                  </div>
                  {active && <div style={{ fontSize: 18, color: DAYS[dayIdx]?.accent }}>›</div>}
                  {!active && <div style={{ fontSize: 12, color: "#333" }}>😴</div>}
                </div>
              ))}
            </div>

            {/* Global progress */}
            <div style={{
              marginTop: 20, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>Progression globale</div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: "#fff" }}>{totalDone}/{totalEx}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${globalPct}%`,
                  background: "linear-gradient(90deg, #2979d4, #d45a1a, #1aa86a, #a855f7)",
                  borderRadius: 99, transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: "#555", marginTop: 6 }}>{globalPct}% complété</div>
            </div>
          </div>
        )}

        {/* ═══ CONSEILS TAB ═══ */}
        {tab === "conseils" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: "0.08em", marginBottom: 4, color: "#fff" }}>
              CONSEILS CLÉS
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>Pour maximiser tes résultats.</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {TIPS.map(({ icon, text }, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
                  <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.6 }}>{text}</div>
                </div>
              ))}
            </div>

            {/* Nutrition quick guide */}
            <div style={{
              marginTop: 20, background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 18px",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.06em", color: "#fff", marginBottom: 12 }}>
                NUTRITION RAPIDE
              </div>
              {[
                ["Protéines", "Poulet, œufs, thon, yaourt grec, whey"],
                ["Glucides", "Riz, patate douce, avoine, pain complet"],
                ["Lipides", "Huile d'olive, avocat, noix, amandes"],
                ["Récupération", "Banane + protéines dans les 30 min après le sport"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", width: 90, flexShrink: 0, paddingTop: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
