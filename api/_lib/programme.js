// Programme miroir simplifié de src/App.jsx (juste ce dont les endpoints ont besoin).
// Garder synchro à la main si on modifie les exos côté App.jsx.
export const DAYS = [
  {
    id: 1, label: "JOUR 1", day: "Lundi", theme: "Poitrine & Triceps", icon: "💪",
    exercises: [
      { name: "Développé couché", sets: 4, reps: "10–12", rest: "90s" },
      { name: "Pompes larges", sets: 3, reps: "15–20", rest: "60s" },
      { name: "Écarté haltères", sets: 3, reps: "12", rest: "75s" },
      { name: "Extension triceps", sets: 3, reps: "12", rest: "60s" },
      { name: "Dips sur chaise", sets: 3, reps: "12–15", rest: "60s" },
    ],
  },
  {
    id: 2, label: "JOUR 2", day: "Mercredi", theme: "Abdos & Cardio", icon: "🔥",
    exercises: [
      { name: "Corde à sauter", sets: 3, reps: "1min", rest: "30s" },
      { name: "Crunch classique", sets: 4, reps: "20", rest: "45s" },
      { name: "Relevé de jambes", sets: 3, reps: "15", rest: "45s" },
      { name: "Planche (gainage)", sets: 4, reps: "45–60s", rest: "30s" },
      { name: "Crunch obliques", sets: 3, reps: "15/côté", rest: "45s" },
      { name: "Burpees", sets: 3, reps: "10", rest: "60s" },
      { name: "Mountain climbers", sets: 3, reps: "30s", rest: "30s" },
      { name: "Battle ropes", sets: 4, reps: "30s", rest: "45s" },
    ],
  },
  {
    id: 3, label: "JOUR 3", day: "Samedi", theme: "Biceps & Dos & Épaules", icon: "💥",
    exercises: [
      { name: "Curl biceps haltères", sets: 4, reps: "12", rest: "60s" },
      { name: "Curl marteau", sets: 3, reps: "12", rest: "60s" },
      { name: "Rowing haltère", sets: 3, reps: "10/côté", rest: "75s" },
      { name: "Élévations latérales", sets: 3, reps: "15", rest: "60s" },
      { name: "Développé militaire", sets: 3, reps: "12", rest: "75s" },
    ],
  },
  {
    id: 4, label: "JOUR 4", day: "Dimanche", theme: "Full Body & Abdos", icon: "⚡",
    exercises: [
      { name: "Pompes diamant", sets: 3, reps: "12–15", rest: "60s" },
      { name: "Squat au poids du corps", sets: 3, reps: "20", rest: "60s" },
      { name: "Planche latérale", sets: 3, reps: "30s/côté", rest: "30s" },
      { name: "Fentes avant haltères", sets: 3, reps: "12/jambe", rest: "60s" },
      { name: "Crunch bicycle", sets: 3, reps: "20", rest: "45s" },
      { name: "Gainage ventral final", sets: 3, reps: "60s", rest: "30s" },
    ],
  },
];

// JS Date.getUTCDay() : 0=Dim, 1=Lun, ..., 6=Sam
export const WEEKDAY_TO_DAY = {
  1: DAYS[0], // Lundi → J1
  3: DAYS[1], // Mercredi → J2
  6: DAYS[2], // Samedi → J3
  0: DAYS[3], // Dimanche → J4
};

// Retrouve un exo par exKey "dayId-exIdx" (ex: "1-0" → Développé couché)
export function getExerciseByKey(exKey) {
  const [dayId, exIdx] = exKey.split("-").map(Number);
  const day = DAYS.find(d => d.id === dayId);
  if (!day) return null;
  const ex = day.exercises[exIdx];
  if (!ex) return null;
  return { ...ex, dayLabel: day.label, dayTheme: day.theme };
}

// ISO week (même algo que côté client)
export function getISOWeek(date = new Date()) {
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
