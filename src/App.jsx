import { useState, useEffect, useCallback, useRef } from "react";
import { authedFetch } from "./Login.jsx";

// ─── DATA ────────────────────────────────────────────────────────────────────
// Pour ajouter une vidéo démo à un exercice : ajoute `video: "VIDEO_ID"`
// où VIDEO_ID est l'ID YouTube (ex: pour https://youtu.be/dQw4w9WgXcQ → "dQw4w9WgXcQ")
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
      { name: "Développé couché", sets: 4, reps: "10–12", rest: "90s", muscle: "Pectoraux", tip: "Descends la barre lentement jusqu'à la poitrine, pousse de manière explosive.", hasLoad: true },
      { name: "Pompes larges", sets: 3, reps: "15–20", rest: "60s", muscle: "Pecs ext.", tip: "Mains écartées au-delà des épaules pour cibler les pectoraux extérieurs." },
      { name: "Écarté haltères", sets: 3, reps: "12", rest: "75s", muscle: "Pecs int.", tip: "Légère flexion des coudes, contrôle absolu en descente.", hasLoad: true },
      { name: "Extension triceps", sets: 3, reps: "12", rest: "60s", muscle: "Triceps", tip: "Garde le coude fixe et haut, ne bouge que l'avant-bras.", hasLoad: true },
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
      { name: "Corde à sauter", sets: 3, reps: "1min", rest: "30s", muscle: "Échauffement cardio", tip: "Reste sur la pointe des pieds, sauts bas et rapides, coudes près du corps." },
      { name: "Crunch classique", sets: 4, reps: "20", rest: "45s", muscle: "Abdos sup.", tip: "Ne tire pas sur la nuque, contracte le ventre à la montée." },
      { name: "Relevé de jambes", sets: 3, reps: "15", rest: "45s", muscle: "Abdos inf.", tip: "Dos plaqué au sol, jambes bien tendues tout le long." },
      { name: "Planche (gainage)", sets: 4, reps: "45–60s", rest: "30s", muscle: "Sangle abdo", tip: "Corps droit de la tête aux talons, respire normalement." },
      { name: "Crunch obliques", sets: 3, reps: "15/côté", rest: "45s", muscle: "Obliques", tip: "Tourne le coude vers le genou opposé, pause en haut." },
      { name: "Burpees", sets: 3, reps: "10", rest: "60s", muscle: "Cardio + full body", tip: "Enchaîne : squat → planche → pompe → saut les bras en l'air." },
      { name: "Mountain climbers", sets: 3, reps: "30s", rest: "30s", muscle: "Cardio + abdos", tip: "Cadence rapide, hanches basses, respire régulièrement." },
      { name: "Battle ropes", sets: 4, reps: "30s", rest: "45s", muscle: "Finisher full body", tip: "Pieds écartés largeur des épaules, genoux fléchis, alterne ondes rapides bras gauche/droit." },
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
      { name: "Curl biceps haltères", sets: 4, reps: "12", rest: "60s", muscle: "Biceps", tip: "Coudes collés au corps, supination complète en haut du mouvement.", hasLoad: true },
      { name: "Curl marteau", sets: 3, reps: "12", rest: "60s", muscle: "Biceps long", tip: "Prises neutres (paumes face à face), mouvement lent et contrôlé.", hasLoad: true },
      { name: "Rowing haltère", sets: 3, reps: "10/côté", rest: "75s", muscle: "Grand dorsal", tip: "Appuie un genou sur le banc, tire le coude vers le plafond.", hasLoad: true },
      { name: "Élévations latérales", sets: 3, reps: "15", rest: "60s", muscle: "Épaules", tip: "Légère flexion du coude, monte jusqu'à hauteur d'épaule max.", hasLoad: true },
      { name: "Développé militaire", sets: 3, reps: "12", rest: "75s", muscle: "Épaules + triceps", tip: "Pousse verticalement sans creuser le bas du dos.", hasLoad: true },
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
      { name: "Fentes avant haltères", sets: 3, reps: "12/jambe", rest: "60s", muscle: "Cuisses + équilibre", tip: "Genou arrière proche du sol sans le toucher, torse droit.", hasLoad: true },
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
const META_KEY = "muscu_meta_v1";
const HISTORY_KEY = "muscu_history_v1";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function safeLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function safeSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const loadChecked = () => safeLoad(STORAGE_KEY, {});
const saveChecked = (d) => safeSave(STORAGE_KEY, d);
const loadMeta = () => safeLoad(META_KEY, {});
const saveMeta = (d) => safeSave(META_KEY, d);
const loadHistory = () => safeLoad(HISTORY_KEY, []);
const saveHistory = (d) => safeSave(HISTORY_KEY, d);

// ─── ISO WEEK ────────────────────────────────────────────────────────────────
function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    weekNum,
    key: `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`,
  };
}

function getWeekRange(year, weekNum) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNum - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: monday, end: sunday };
}

function formatDateShort(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── RESET AUTO + ARCHIVAGE (Firestore-aware) ────────────────────────────────
// Calcule s'il faut archiver l'ancienne semaine + retourne le nouveau state.
// `serverState` vient de /api/progress + /api/history (sans cache local prioritaire).
function computeWeekRollover(serverChecked, serverCurrentWeekKey, serverHistory, DAYS) {
  const currentWeek = getISOWeek();
  // Aucune semaine enregistrée encore (premier login) : on init juste la semaine actuelle
  if (!serverCurrentWeekKey) {
    return {
      needSync: true,
      newChecked: serverChecked || {},
      newCurrentWeekKey: currentWeek.key,
      newHistoryEntry: null,
      shouldResetRecap: true,
    };
  }
  // Même semaine : rien à faire
  if (serverCurrentWeekKey === currentWeek.key) {
    return {
      needSync: false,
      newChecked: serverChecked || {},
      newCurrentWeekKey: serverCurrentWeekKey,
      newHistoryEntry: null,
      shouldResetRecap: false,
    };
  }
  // Nouvelle semaine : archiver l'ancienne (si quelque chose a été fait) + reset
  const totalExos = DAYS.reduce((a, d) => a + d.exercises.length, 0);
  const doneCount = Object.values(serverChecked || {}).filter(Boolean).length;
  let newHistoryEntry = null;
  if (doneCount > 0) {
    const [oldYear, oldWeekStr] = serverCurrentWeekKey.split("-W");
    const oldWeekNum = parseInt(oldWeekStr, 10);
    const range = getWeekRange(parseInt(oldYear, 10), oldWeekNum);
    newHistoryEntry = {
      weekKey: serverCurrentWeekKey,
      year: parseInt(oldYear, 10),
      weekNum: oldWeekNum,
      dateStart: range.start.toISOString().slice(0, 10),
      dateEnd: range.end.toISOString().slice(0, 10),
      done: doneCount,
      total: totalExos,
      perfect: doneCount === totalExos,
    };
  }
  return {
    needSync: true,
    newChecked: {},
    newCurrentWeekKey: currentWeek.key,
    newHistoryEntry,
    shouldResetRecap: true,
  };
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function computeStats(history, currentChecked, DAYS) {
  const totalExos = DAYS.reduce((a, d) => a + d.exercises.length, 0);
  const currentDone = Object.values(currentChecked).filter(Boolean).length;
  const currentPerfect = currentDone === totalExos && totalExos > 0;

  // Série en cours : semaines parfaites consécutives à partir de maintenant
  let currentStreak = currentPerfect ? 1 : 0;
  for (const w of history) {
    if (w.perfect) currentStreak++;
    else break;
  }

  // Record : plus longue série jamais
  let bestStreak = 0, temp = 0;
  const fullList = currentPerfect ? [{ perfect: true }, ...history] : [...history];
  for (const w of fullList) {
    if (w.perfect) { temp++; bestStreak = Math.max(bestStreak, temp); }
    else temp = 0;
  }

  const totalExoFaits = currentDone + history.reduce((a, w) => a + w.done, 0);
  const totalSemaines = history.length + (currentDone > 0 ? 1 : 0);
  const semainesParfaites = history.filter(w => w.perfect).length + (currentPerfect ? 1 : 0);

  return { currentStreak, bestStreak, totalExoFaits, totalSemaines, semainesParfaites, currentPerfect };
}

// ─── REST TIMER HELPERS ──────────────────────────────────────────────────────
function parseRestSeconds(s) {
  if (!s) return 0;
  const match = String(s).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function playBeep(times = 2) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    for (let i = 0; i < times; i++) {
      const t0 = ctx.currentTime + i * 0.4;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, t0);
      osc.frequency.setValueAtTime(1320, t0 + 0.12);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.start(t0); osc.stop(t0 + 0.3);
    }
  } catch {}
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

function RestTimer({ timer, onSkip, onAdd, onComplete }) {
  const [remaining, setRemaining] = useState(timer ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000)) : 0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!timer) return;
    completedRef.current = false;
    const tick = () => {
      const left = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !completedRef.current) {
        completedRef.current = true;
        playBeep(2);
        vibrate([300, 120, 300]);
        // Laisser 4s pour afficher "GO !" puis auto-close
        setTimeout(() => onComplete?.(), 4000);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [timer, onComplete]);

  if (!timer) return null;

  const done = remaining === 0;
  const pct = Math.max(0, Math.min(100, (remaining / timer.totalSeconds) * 100));
  const color = done ? "#1aa86a" : remaining <= 5 ? "#ff5252" : remaining <= 10 ? "#ffa726" : "#2979d4";

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
      padding: "0 12px calc(env(safe-area-inset-bottom, 12px) + 12px)",
      pointerEvents: "none",
    }}>
      <div style={{
        maxWidth: 456, margin: "0 auto",
        background: `linear-gradient(135deg, ${color}25, rgba(13,13,20,0.95))`,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${color}55`,
        borderRadius: 18, padding: "14px 16px",
        boxShadow: `0 12px 40px ${color}40, 0 0 0 1px rgba(0,0,0,0.3)`,
        pointerEvents: "auto",
        animation: done ? "pulse 0.6s ease infinite" : "fadeUp 0.3s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 2 }}>
              {done ? "🔥 GO !" : "Repos en cours"}
            </div>
            <div style={{ fontSize: 13, color: "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {done
                ? (timer.nextExerciseName ? `Prochain : ${timer.nextExerciseName}` : "C'est reparti !")
                : `Après "${timer.exerciseName}"`}
            </div>
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: 36, color, lineHeight: 1, minWidth: 60, textAlign: "right",
          }}>
            {done ? "GO" : `${remaining}s`}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`, background: color,
            transition: "width 0.25s linear",
          }} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button
            onClick={() => onAdd(10)}
            disabled={done}
            style={{
              flex: 1, padding: "8px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "#ccc",
              fontSize: 12, fontWeight: 600,
              opacity: done ? 0.3 : 1,
            }}
          >+10s</button>
          <button
            onClick={() => onAdd(-10)}
            disabled={done || remaining <= 10}
            style={{
              flex: 1, padding: "8px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)", color: "#ccc",
              fontSize: 12, fontWeight: 600,
              opacity: (done || remaining <= 10) ? 0.3 : 1,
            }}
          >-10s</button>
          <button
            onClick={onSkip}
            style={{
              flex: 2, padding: "8px", borderRadius: 10,
              border: `1px solid ${color}60`,
              background: `${color}25`, color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            }}
          >{done ? "FERMER" : "PASSER"}</button>
        </div>
      </div>
    </div>
  );
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

function VideoModal({ exercise, onClose }) {
  useEffect(() => {
    if (!exercise) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [exercise, onClose]);

  if (!exercise) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      animation: "fadeUp 0.2s ease both",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 720, background: "#0d0d14",
        borderRadius: 16, overflow: "hidden",
        border: `1px solid ${exercise.accent}40`,
        boxShadow: `0 20px 60px ${exercise.glow || "rgba(0,0,0,0.5)"}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: exercise.accent, textTransform: "uppercase", marginBottom: 2 }}>
              Démonstration
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.05em", color: "#fff" }}>
              {exercise.name}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "#fff", width: 34, height: 34, borderRadius: 10,
            fontSize: 20, lineHeight: 1, flexShrink: 0,
          }}>×</button>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${exercise.video}?autoplay=1&rel=0&modestbranding=1`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ ex, checked, onToggle, onPlayVideo, accent, glow, idx, loadHistoryEntries, currentLoad, onLoadChange, exKey }) {
  // Calcul dernière perf et record (si hasLoad)
  let last = null, best = null;
  if (ex.hasLoad && loadHistoryEntries?.length) {
    last = loadHistoryEntries[loadHistoryEntries.length - 1];
    best = loadHistoryEntries.reduce((b, e) => {
      if (!b) return e;
      if (e.weight > b.weight) return e;
      if (e.weight === b.weight && e.reps > b.reps) return e;
      return b;
    }, null);
  }
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

          {/* Tracking des charges (uniquement si hasLoad) */}
          {ex.hasLoad && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: 10, padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Dernière perf + record */}
              {(last || best) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8, fontSize: 11, color: "#888" }}>
                  {last && (
                    <div>
                      <span style={{ color: "#666" }}>📊 Dernière : </span>
                      <span style={{ color: "#ccc", fontWeight: 600 }}>{last.weight}kg × {last.reps}</span>
                    </div>
                  )}
                  {best && (best.weight !== last?.weight || best.reps !== last?.reps) && (
                    <div>
                      <span style={{ color: "#666" }}>🏆 Record : </span>
                      <span style={{ color: "#ffd700", fontWeight: 600 }}>{best.weight}kg × {best.reps}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Inputs poids + reps */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text" inputMode="decimal"
                    value={currentLoad?.weight ?? ""}
                    onChange={(e) => { e.stopPropagation(); onLoadChange?.(exKey, "weight", e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    style={{
                      width: "100%", padding: "8px 32px 8px 10px",
                      background: "rgba(0,0,0,0.3)", border: `1px solid ${accent}30`,
                      borderRadius: 8, color: "#fff", fontSize: 15, fontFamily: "inherit",
                      outline: "none", textAlign: "right",
                    }}
                  />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#666", pointerEvents: "none" }}>kg</span>
                </div>
                <span style={{ color: "#444", fontSize: 14 }}>×</span>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text" inputMode="numeric"
                    value={currentLoad?.reps ?? ""}
                    onChange={(e) => { e.stopPropagation(); onLoadChange?.(exKey, "reps", e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="0"
                    style={{
                      width: "100%", padding: "8px 38px 8px 10px",
                      background: "rgba(0,0,0,0.3)", border: `1px solid ${accent}30`,
                      borderRadius: 8, color: "#fff", fontSize: 15, fontFamily: "inherit",
                      outline: "none", textAlign: "right",
                    }}
                  />
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#666", pointerEvents: "none" }}>reps</span>
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 10, color: "#555", textAlign: "center" }}>
                Coche l'exo pour enregistrer ta perf
              </div>
            </div>
          )}

          {/* Demo button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlayVideo(); }}
            style={{
              marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 99,
              border: `1px solid ${accent}55`,
              background: `${accent}15`, color: accent,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 10 }}>▶</span>
            {ex.video ? "Voir la démo" : "Chercher démo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App({ user, onLogout, onUserUpdate }) {
  const [activeDay, setActiveDay] = useState(0);
  const [checked, setChecked] = useState({});
  const [history, setHistory] = useState([]);
  const [loadHistory, setLoadHistory] = useState({}); // { "1-0": [{weight,reps,weekKey,...}, ...] }
  const [loads, setLoads] = useState({}); // valeurs en cours dans les inputs : { "1-0": { weight: "50", reps: "12" } }
  const [tab, setTab] = useState("programme"); // programme | planning | conseils | historique
  const [videoExercise, setVideoExercise] = useState(null);
  const [restTimer, setRestTimer] = useState(null); // { endsAt, totalSeconds, exerciseName, nextExerciseName }
  const [testStatus, setTestStatus] = useState({}); // { programme: "idle|loading|ok|err", teaser: ... }
  const [loadingData, setLoadingData] = useState(true);
  const [syncError, setSyncError] = useState("");
  const recapSentRef = useRef(null); // weekKey pour lequel le recap a déjà été envoyé

  // ── Chargement initial depuis Firestore (avec migration localStorage si Firestore vide) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1. Fetch progress + history + loads
        let [pRes, hRes, lRes] = await Promise.all([
          authedFetch("/api/progress"),
          authedFetch("/api/history"),
          authedFetch("/api/loads"),
        ]);
        if (!pRes.ok || !hRes.ok) throw new Error("Erreur de chargement");
        let progress = await pRes.json();
        let historyData = (await hRes.json()).history || [];
        const loadsData = lRes.ok ? ((await lRes.json()).loads || {}) : {};
        // Pré-remplir les inputs avec les dernières valeurs connues
        const initialLoads = {};
        for (const [exKey, hist] of Object.entries(loadsData)) {
          const last = hist[hist.length - 1];
          if (last) initialLoads[exKey] = { weight: String(last.weight), reps: String(last.reps) };
        }
        setLoadHistory(loadsData);
        setLoads(initialLoads);

        // 2. Migration : si Firestore est vide ET localStorage a quelque chose, on importe
        const localChecked = loadChecked();
        const localHistory = loadHistory();
        const localMeta = loadMeta();
        const firestoreEmpty = !progress.currentWeekKey && Object.keys(progress.checked || {}).length === 0;
        const hasLocalData = Object.keys(localChecked).length > 0 || localHistory.length > 0;
        if (firestoreEmpty && hasLocalData) {
          await authedFetch("/api/migrate", {
            method: "POST",
            body: JSON.stringify({
              checked: localChecked,
              currentWeekKey: localMeta.currentWeekKey,
              history: localHistory,
            }),
          });
          // Re-fetch après migration
          [pRes, hRes] = await Promise.all([
            authedFetch("/api/progress"),
            authedFetch("/api/history"),
          ]);
          progress = await pRes.json();
          historyData = (await hRes.json()).history || [];
        }

        // 3. Roll-over hebdo : si la semaine a changé, archiver + reset
        const ro = computeWeekRollover(progress.checked, progress.currentWeekKey, historyData, DAYS);
        let finalChecked = ro.newChecked;
        let finalHistory = historyData;
        if (ro.needSync) {
          if (ro.newHistoryEntry) {
            await authedFetch("/api/history", {
              method: "POST",
              body: JSON.stringify(ro.newHistoryEntry),
            });
            finalHistory = [ro.newHistoryEntry, ...historyData];
          }
          await authedFetch("/api/progress", {
            method: "POST",
            body: JSON.stringify({
              checked: ro.newChecked,
              currentWeekKey: ro.newCurrentWeekKey,
              ...(ro.shouldResetRecap ? { recapSent: "" } : {}),
            }),
          });
        }
        recapSentRef.current = ro.shouldResetRecap ? "" : (progress.recapSent || "");

        if (!cancelled) {
          setChecked(finalChecked);
          setHistory(finalHistory);
          setLoadingData(false);
        }
      } catch (e) {
        // Fallback offline : on utilise localStorage
        if (!cancelled) {
          setChecked(loadChecked());
          setHistory(loadHistory());
          setSyncError("Mode offline — sync à la reconnexion");
          setLoadingData(false);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone]);

  // Stats globales (cumul history + semaine courante)
  const stats = computeStats(history, checked, DAYS);

  // ── Trigger récap WhatsApp automatique quand 24/24 atteint (une seule fois par semaine)
  useEffect(() => {
    if (loadingData) return;
    const totalEx = DAYS.reduce((a, d) => a + d.exercises.length, 0);
    const totalDone = Object.values(checked).filter(Boolean).length;
    if (totalDone !== totalEx || totalEx === 0) return;
    const currentWeekKey = getISOWeek().key;
    if (recapSentRef.current === currentWeekKey) return; // déjà envoyé pour cette semaine
    recapSentRef.current = currentWeekKey; // marque immédiatement pour éviter double-envoi
    authedFetch(`/api/recap?done=${totalDone}&total=${totalEx}`
      + `&streak=${stats.currentStreak}`
      + `&record=${stats.bestStreak}`
      + `&totalAllTime=${stats.totalExoFaits}`)
      .then(r => {
        if (r.ok) {
          authedFetch("/api/progress", {
            method: "POST",
            body: JSON.stringify({ recapSent: currentWeekKey }),
          }).catch(() => {});
        } else {
          recapSentRef.current = ""; // rollback : on pourra réessayer plus tard
        }
      })
      .catch(() => { recapSentRef.current = ""; });
  }, [checked, stats.currentStreak, stats.bestStreak, stats.totalExoFaits, loadingData]);

  const testRappel = useCallback(async (type) => {
    setTestStatus(s => ({ ...s, [type]: "loading" }));
    try {
      const r = await authedFetch(`/api/rappel?type=${type}&test=1`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setTestStatus(s => ({ ...s, [type]: "ok" }));
      setTimeout(() => setTestStatus(s => ({ ...s, [type]: "idle" })), 3000);
    } catch (e) {
      setTestStatus(s => ({ ...s, [type]: "err", [`${type}_msg`]: e.message }));
      setTimeout(() => setTestStatus(s => ({ ...s, [type]: "idle" })), 5000);
    }
  }, []);

  const day = DAYS[activeDay];

  const playVideo = useCallback((ex) => {
    if (ex.video) {
      setVideoExercise({ ...ex, accent: day.accent, glow: day.glow });
    } else {
      const q = encodeURIComponent(`${ex.name} musculation tutoriel`);
      window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank", "noopener,noreferrer");
    }
  }, [day.accent, day.glow]);

  const toggle = useCallback((dayId, exIdx, exercise, nextExercise) => {
    setChecked(prev => {
      const key = `${dayId}-${exIdx}`;
      const wasChecked = !!prev[key];
      const next = { ...prev, [key]: !wasChecked };
      saveChecked(next); // cache local
      // Sync Firestore en background (best effort)
      authedFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ checked: next }),
      }).catch(() => { /* offline : sera repris au prochain login */ });

      // Si on COCHE un exo avec poids ET que les inputs sont remplis → push la perf
      if (!wasChecked && exercise?.hasLoad) {
        const load = loads[key];
        const w = parseFloat(load?.weight);
        const r = parseInt(load?.reps, 10);
        if (Number.isFinite(w) && w > 0 && Number.isFinite(r) && r > 0) {
          const weekKey = getISOWeek().key;
          authedFetch("/api/loads", {
            method: "POST",
            body: JSON.stringify({ exKey: key, weight: w, reps: r, weekKey }),
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data?.success && data.entry) {
                setLoadHistory(prev => {
                  const existing = prev[key] || [];
                  const last = existing[existing.length - 1];
                  const newEntry = { weight: data.entry.weight, reps: data.entry.reps, weekKey };
                  const newArr = (last && last.weekKey === weekKey)
                    ? [...existing.slice(0, -1), newEntry]
                    : [...existing, newEntry];
                  return { ...prev, [key]: newArr };
                });
              }
            })
            .catch(() => {});
        }
      }

      // Démarre le timer de repos uniquement quand on COCHE (et qu'il y a un repos défini)
      if (!wasChecked && exercise) {
        const seconds = parseRestSeconds(exercise.rest);
        if (seconds > 0) {
          setRestTimer({
            endsAt: Date.now() + seconds * 1000,
            totalSeconds: seconds,
            exerciseName: exercise.name,
            nextExerciseName: nextExercise?.name,
          });
        }
      }
      return next;
    });
  }, [loads]);

  const updateLoad = useCallback((exKey, field, value) => {
    // Filtre : que des chiffres (et 1 point pour weight)
    const clean = field === "weight"
      ? value.replace(/[^\d.]/g, "").replace(/(\..*?)\..*/g, "$1")
      : value.replace(/\D/g, "");
    setLoads(prev => ({
      ...prev,
      [exKey]: { ...prev[exKey], [field]: clean },
    }));
  }, []);

  const adjustTimer = useCallback((delta) => {
    setRestTimer(t => {
      if (!t) return t;
      const newEnds = t.endsAt + delta * 1000;
      const newTotal = Math.max(t.totalSeconds + delta, 5);
      return { ...t, endsAt: newEnds, totalSeconds: newTotal };
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
      authedFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ checked: next }),
      }).catch(() => {});
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
          {[["programme", "Programme"], ["planning", "Planning"], ["historique", "Historique"], ["conseils", "Conseils"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, border: "none",
              background: tab === key ? "rgba(255,255,255,0.1)" : "transparent",
              color: tab === key ? "#fff" : "#666",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
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
              {day.exercises.map((ex, i) => {
                const exKey = `${day.id}-${i}`;
                return (
                  <ExerciseCard
                    key={i} ex={ex} idx={i}
                    checked={!!checked[exKey]}
                    onToggle={() => toggle(day.id, i, ex, day.exercises[i + 1])}
                    onPlayVideo={() => playVideo(ex)}
                    accent={day.accent} glow={day.glow}
                    exKey={exKey}
                    loadHistoryEntries={loadHistory[exKey]}
                    currentLoad={loads[exKey]}
                    onLoadChange={updateLoad}
                  />
                );
              })}
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

        {/* ═══ HISTORIQUE TAB ═══ */}
        {tab === "historique" && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, letterSpacing: "0.08em", marginBottom: 4, color: "#fff" }}>
              HISTORIQUE
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>
              Tes performances semaine par semaine. Reset auto chaque lundi.
            </div>

            {/* ── Cartes stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Série en cours", value: stats.currentStreak, suffix: stats.currentStreak > 1 ? "semaines" : "semaine", icon: "🔥", color: "#ff6b35" },
                { label: "Record perso", value: stats.bestStreak, suffix: stats.bestStreak > 1 ? "semaines" : "semaine", icon: "🏆", color: "#ffd700" },
                { label: "Semaines parfaites", value: stats.semainesParfaites, suffix: `/ ${stats.totalSemaines || 0}`, icon: "✅", color: "#1aa86a" },
                { label: "Total exos", value: stats.totalExoFaits, suffix: "faits", icon: "💪", color: "#2979d4" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: `${s.color}10`,
                  border: `1px solid ${s.color}30`,
                  borderRadius: 14, padding: "14px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#666" }}>{s.suffix}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Semaine en cours ── */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                Semaine en cours
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: "#fff" }}>
                  {totalDone}/{totalEx} exercices
                </div>
                <div style={{ fontSize: 11, color: stats.currentPerfect ? "#1aa86a" : "#888" }}>
                  {stats.currentPerfect ? "✓ Parfait !" : `${Math.round((totalDone / totalEx) * 100)}%`}
                </div>
              </div>
              <div style={{ marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.round((totalDone / totalEx) * 100)}%`,
                  background: stats.currentPerfect ? "#1aa86a" : "linear-gradient(90deg, #2979d4, #d45a1a)",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* ── Records par exercice ── */}
            {(() => {
              const records = [];
              DAYS.forEach((d) => {
                d.exercises.forEach((ex, i) => {
                  if (!ex.hasLoad) return;
                  const key = `${d.id}-${i}`;
                  const hist = loadHistory[key];
                  if (!hist?.length) return;
                  const best = hist.reduce((b, e) => {
                    if (!b) return e;
                    if (e.weight > b.weight) return e;
                    if (e.weight === b.weight && e.reps > b.reps) return e;
                    return b;
                  }, null);
                  const last = hist[hist.length - 1];
                  records.push({ exName: ex.name, dayLabel: d.label, dayAccent: d.accent, best, last, sessions: hist.length });
                });
              });
              if (records.length === 0) return null;
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 14 }}>🏆</span>
                    <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase" }}>
                      Records personnels
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {records.map((r, i) => (
                      <div key={i} style={{
                        background: "rgba(255,215,0,0.04)",
                        border: "1px solid rgba(255,215,0,0.15)",
                        borderRadius: 10, padding: "10px 12px",
                        display: "flex", alignItems: "center", gap: 10,
                      }}>
                        <div style={{
                          fontSize: 9, color: r.dayAccent, padding: "2px 6px", borderRadius: 6,
                          background: `${r.dayAccent}15`, border: `1px solid ${r.dayAccent}30`,
                          fontWeight: 700, letterSpacing: "0.08em", flexShrink: 0,
                        }}>{r.dayLabel}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.exName}
                          </div>
                          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                            Dernière : <span style={{ color: "#aaa" }}>{r.last.weight}kg × {r.last.reps}</span> · {r.sessions} séance{r.sessions > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: "#ffd700", lineHeight: 1 }}>
                            {r.best.weight}<span style={{ fontSize: 11, color: "#aaa" }}>kg</span>
                          </div>
                          <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>× {r.best.reps} reps</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Liste des semaines passées ── */}
            {history.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "30px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 14, color: "#555", fontSize: 13, lineHeight: 1.6,
              }}>
                📅 Pas encore d'historique<br/>
                <span style={{ fontSize: 11, color: "#444" }}>Tes semaines termin&eacute;es appara&icirc;tront ici.</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>
                  Semaines passées
                </div>
                {history.map((w) => {
                  const pct = Math.round((w.done / w.total) * 100);
                  const color = w.perfect ? "#1aa86a" : pct >= 75 ? "#d4b41a" : "#d45a1a";
                  return (
                    <div key={w.weekKey} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${color}30`,
                      borderRadius: 12, padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `${color}15`, border: `1px solid ${color}40`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontSize: 8, color: "#888", letterSpacing: "0.1em" }}>S</div>
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 16, color }}>{w.weekNum}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                          <div style={{ fontSize: 13, color: "#ccc", fontWeight: 600 }}>
                            {formatDateShort(w.dateStart)} – {formatDateShort(w.dateEnd)}
                          </div>
                          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color }}>
                            {w.done}/{w.total}
                          </div>
                        </div>
                        <div style={{ marginTop: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: color }} />
                        </div>
                        <div style={{ marginTop: 4, fontSize: 10, color: "#666" }}>
                          {w.perfect ? "🏆 Semaine parfaite" : `${pct}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

            {/* ── Mon profil ── */}
            {user && (
              <div style={{
                marginTop: 20, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>👤</span>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.06em", color: "#fff" }}>
                    MON PROFIL
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", width: 90, flexShrink: 0, paddingTop: 2 }}>Nom</div>
                  <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{user.name || "—"}</div>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", width: 90, flexShrink: 0, paddingTop: 2 }}>WhatsApp</div>
                  <div style={{ fontSize: 13, color: "#aaa", fontFamily: "monospace" }}>+{user.phone}</div>
                </div>

                {/* Toggle rappels actifs */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", marginBottom: 10,
                  background: "rgba(255,255,255,0.03)", borderRadius: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Rappels WhatsApp</div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      {user.rappelsActifs ? "Activés (17h30 + 20h)" : "Désactivés"}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const next = !user.rappelsActifs;
                      try {
                        const r = await authedFetch("/api/auth/me", {
                          method: "POST",
                          body: JSON.stringify({ rappelsActifs: next }),
                        });
                        if (r.ok) {
                          const d = await r.json();
                          onUserUpdate?.(d.user);
                        }
                      } catch {}
                    }}
                    style={{
                      width: 48, height: 26, borderRadius: 99, border: "none",
                      background: user.rappelsActifs ? "#25D366" : "rgba(255,255,255,0.15)",
                      position: "relative", transition: "all 0.2s", cursor: "pointer",
                    }}
                    aria-label="Activer/désactiver les rappels"
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      position: "absolute", top: 3, left: user.rappelsActifs ? 25 : 3,
                      transition: "left 0.2s",
                    }} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm("Te déconnecter ? Tes données restent sauvegardées dans le cloud.")) {
                      onLogout?.();
                    }
                  }}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 10,
                    border: "1px solid rgba(255,82,82,0.3)",
                    background: "rgba(255,82,82,0.08)", color: "#ff8a8a",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", transition: "all 0.2s",
                  }}
                >
                  🚪 Se déconnecter
                </button>
              </div>
            )}

            {/* ── Rappels WhatsApp ── */}
            <div style={{
              marginTop: 20, background: "rgba(37,211,102,0.06)",
              border: "1px solid rgba(37,211,102,0.25)", borderRadius: 16, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 22 }}>💬</span>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.06em", color: "#25D366" }}>
                  RAPPELS WHATSAPP
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 14 }}>
                Tu reçois chaque jour à <b>17h30</b> le programme du jour (ou un conseil OFF),
                et la veille à <b>20h</b> un teaser de la séance du lendemain.
              </div>
              {[
                ["programme", "Tester programme du jour", "📋"],
                ["teaser", "Tester teaser de demain", "⏰"],
              ].map(([key, label, icon]) => {
                const status = testStatus[key] || "idle";
                const bg = status === "ok" ? "rgba(37,211,102,0.2)"
                         : status === "err" ? "rgba(255,82,82,0.15)"
                         : "rgba(255,255,255,0.04)";
                const border = status === "ok" ? "#25D366"
                             : status === "err" ? "#ff5252"
                             : "rgba(255,255,255,0.1)";
                return (
                  <button
                    key={key}
                    disabled={status === "loading"}
                    onClick={() => testRappel(key)}
                    style={{
                      width: "100%", marginBottom: 8,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 12,
                      background: bg, border: `1px solid ${border}`,
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      transition: "all 0.2s", cursor: status === "loading" ? "wait" : "pointer",
                      opacity: status === "loading" ? 0.6 : 1,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      {label}
                    </span>
                    <span style={{ fontSize: 11, color: status === "ok" ? "#25D366" : status === "err" ? "#ff5252" : "#666" }}>
                      {status === "loading" ? "Envoi…"
                        : status === "ok" ? "✓ Envoyé !"
                        : status === "err" ? "✗ Erreur"
                        : "Envoyer"}
                    </span>
                  </button>
                );
              })}
              {(testStatus.programme === "err" || testStatus.teaser === "err") && (
                <div style={{ fontSize: 11, color: "#ff5252", marginTop: 6, lineHeight: 1.5 }}>
                  {testStatus.programme_msg || testStatus.teaser_msg || "Erreur inconnue"}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <VideoModal exercise={videoExercise} onClose={() => setVideoExercise(null)} />

      <RestTimer
        timer={restTimer}
        onSkip={() => setRestTimer(null)}
        onAdd={adjustTimer}
        onComplete={() => setRestTimer(null)}
      />
    </div>
  );
}
