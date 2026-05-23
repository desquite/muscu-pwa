// ─── Endpoint rappel WhatsApp via Wasender ───────────────────────────────────
// GET /api/rappel?type=programme         → cron 17h30 (programme du jour ou conseil OFF)
// GET /api/rappel?type=teaser            → cron 20h    (teaser du lendemain ou conseil)
// GET /api/rappel?type=programme&test=1  → test manuel depuis l'app

// Programme miroir de src/App.jsx (gardé synchro à la main pour éviter un import)
const DAYS = [
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

// JavaScript Date.getDay() : 0=Dimanche, 1=Lundi, ..., 6=Samedi
const WEEKDAY_TO_DAY = {
  1: DAYS[0], // Lundi → J1
  3: DAYS[1], // Mercredi → J2
  6: DAYS[2], // Samedi → J3
  0: DAYS[3], // Dimanche → J4
};

// Conseils pour les jours OFF (et bonus repos)
const CONSEILS = {
  2: { // Mardi
    titre: "🛌 *MARDI — Jour de récupération*",
    corps: [
      "Le muscle se construit pendant le repos, pas pendant l'entraînement.",
      "",
      "✅ *À faire :*",
      "• 30 min de marche tranquille",
      "• Étirements doux 10 min",
      "• 2L d'eau minimum",
      "",
      "❌ *À éviter :*",
      "• Re-solliciter les pecs/triceps (encore courbaturés)",
      "• Sauter un repas",
      "• Dormir moins de 7h",
    ],
  },
  4: { // Jeudi
    titre: "🥩 *JEUDI — Focus nutrition*",
    corps: [
      "Cible : 1,6 à 2g de protéines par kg de poids corporel.",
      "",
      "✅ *Sources tops :*",
      "• Œufs (6-7g de prot par œuf)",
      "• Poulet/dinde (25g pour 100g)",
      "• Thon en boîte (rapide)",
      "• Yaourt grec / fromage blanc",
      "",
      "💡 *Astuce :* Répartis sur 4 repas plutôt que 2 énormes — ton corps assimile mieux.",
    ],
  },
  5: { // Vendredi
    titre: "😴 *VENDREDI — Prépare le week-end*",
    corps: [
      "Demain Samedi : Jour 3 Biceps & Dos & Épaules.",
      "",
      "✅ *Pour bien performer demain :*",
      "• Couche-toi avant 23h ce soir",
      "• Repas du soir riche en glucides lents (riz, patate douce)",
      "• Hydrate-toi dès le réveil demain",
      "",
      "❌ *À éviter ce soir :*",
      "• Alcool (annule les gains de la semaine)",
      "• Écrans bleus après 22h",
    ],
  },
};

function programmeMessage(jour) {
  const lignes = jour.exercises
    .map((ex, i) => `${i + 1}. *${ex.name}* — ${ex.sets}×${ex.reps} (repos ${ex.rest})`)
    .join("\n");
  return [
    `💪 *SÉANCE DU JOUR — ${jour.label}*`,
    `${jour.icon} *${jour.theme}*`,
    `📅 ${jour.day} · ${jour.exercises.length} exercices`,
    "",
    lignes,
    "",
    "👉 Ouvre l'app pour cocher tes exos :",
    "https://muscu-pwa.vercel.app",
  ].join("\n");
}

function teaserMessage(jourDemain) {
  return [
    `⏰ *RAPPEL — Séance demain*`,
    "",
    `${jourDemain.icon} Demain ${jourDemain.day} → *${jourDemain.theme}*`,
    `📋 ${jourDemain.exercises.length} exercices au programme`,
    "",
    "✅ *Prépare ton matos ce soir :*",
    "• Tenue sport prête",
    "• Bouteille d'eau au frais",
    "• Couche-toi tôt 💤",
    "",
    "Demain on déchire 🔥",
  ].join("\n");
}

function conseilMessage(weekday) {
  const c = CONSEILS[weekday];
  if (!c) return null;
  return [c.titre, "", ...c.corps].join("\n");
}

async function sendWhatsApp(message) {
  const apiKey = process.env.WASENDER_API_KEY;
  const sessionId = process.env.WASENDER_SESSION_ID;
  const to = process.env.MY_PHONE_NUMBER;
  if (!apiKey || !sessionId || !to) {
    throw new Error("Variables d'env manquantes (WASENDER_API_KEY / WASENDER_SESSION_ID / MY_PHONE_NUMBER)");
  }
  const r = await fetch("https://wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ sessionId, to, text: message }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Wasender ${r.status}: ${txt}`);
  return txt;
}

export default async function handler(req, res) {
  try {
    // Auth optionnelle : si CRON_SECRET est défini, on l'exige (sauf en mode test=1)
    const isTest = req.query?.test === "1";
    const secret = process.env.CRON_SECRET;
    if (secret && !isTest) {
      const auth = req.headers?.authorization || "";
      if (auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const type = req.query?.type || "programme";

    // Date en GMT+0 (Côte d'Ivoire = UTC, pas de DST)
    const now = new Date();
    const weekday = now.getUTCDay(); // 0=Dim, 1=Lun, ..., 6=Sam

    let message;
    if (type === "teaser") {
      const tomorrow = (weekday + 1) % 7;
      const jourDemain = WEEKDAY_TO_DAY[tomorrow];
      message = jourDemain ? teaserMessage(jourDemain) : conseilMessage(tomorrow);
      // Fallback si pas de conseil pour ce jour OFF
      if (!message) {
        message = "🌙 *Bonne soirée !*\n\nRepos demain. Hydrate-toi bien et couche-toi tôt.";
      }
    } else {
      // type=programme
      const jourAuj = WEEKDAY_TO_DAY[weekday];
      message = jourAuj ? programmeMessage(jourAuj) : conseilMessage(weekday);
      if (!message) {
        message = "💪 *Journée OFF*\n\nProfite pour bien récupérer.";
      }
    }

    await sendWhatsApp(message);
    return res.status(200).json({ success: true, type, weekday, test: isTest, message });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
