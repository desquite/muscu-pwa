// ─── Endpoint rappel WhatsApp via Wasender ───────────────────────────────────
// GET /api/rappel?type=programme         → cron 17h30 (programme du jour ou conseil OFF)
// GET /api/rappel?type=teaser            → cron 20h    (teaser du lendemain ou conseil)
// GET /api/rappel?type=programme&test=1  → test manuel depuis l'app

import { sendWhatsApp } from "./_lib/wasender.js";

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

// ─── Pool de conseils (rotation quotidienne) ─────────────────────────────────
// 6 variantes par jour OFF → tu reçois un conseil différent chaque mardi/jeudi/vendredi
const CONSEILS_POOL = {
  2: [ // ━━ MARDI ━━ Récupération active
    {
      titre: "🛌 *MARDI — Récupération active*",
      corps: ["Le muscle se construit au repos, pas pendant l'effort.", "",
        "✅ *Aujourd'hui :*",
        "• 30 min de marche tranquille",
        "• Étirements doux 10 min",
        "• 2L d'eau minimum", "",
        "❌ *À éviter :*",
        "• Re-solliciter les pecs/triceps",
        "• Sauter un repas"],
    },
    {
      titre: "🧘 *MARDI — Mobilité articulaire*",
      corps: ["Tes articulations méritent autant d'attention que tes muscles.", "",
        "✅ *Routine 10 min :*",
        "• Rotations épaules (1 min)",
        "• Cercles hanches (1 min)",
        "• Chevilles + poignets (1 min)",
        "• Cat-cow dos (2 min)",
        "• Pigeon yoga (2 min/côté)", "",
        "💡 Mobilité = prévention de blessure long terme."],
    },
    {
      titre: "💧 *MARDI — Hydratation pro*",
      corps: ["L'eau, c'est 75% de tes muscles. Sous-hydraté = -20% de perf.", "",
        "✅ *Objectif aujourd'hui :*",
        "• 1 grand verre au réveil",
        "• 500ml avant chaque repas",
        "• 30 ml/kg de poids corporel/jour", "",
        "💡 Test : ton pipi doit être jaune pâle. Sinon, bois plus."],
    },
    {
      titre: "🚶 *MARDI — Marche active 45 min*",
      corps: ["La marche brûle les graisses sans toucher au muscle.", "",
        "✅ *Pourquoi marcher aujourd'hui :*",
        "• Active la récupération sanguine",
        "• Brûle 200–300 kcal sans fatigue",
        "• Réduit le cortisol (stress)", "",
        "🎯 Cible : 7000 pas minimum."],
    },
    {
      titre: "🧊 *MARDI — Auto-massage*",
      corps: ["Foam roller ou balle de tennis = ton kiné de poche.", "",
        "✅ *Zones à masser après J1 :*",
        "• Pectoraux (5 min)",
        "• Triceps (3 min/bras)",
        "• Trapèzes (5 min)", "",
        "💡 Roule lentement. Si ça fait mal = c'est exactement là qu'il faut insister."],
    },
    {
      titre: "🧠 *MARDI — Repos mental*",
      corps: ["Surentraînement = burn-out garanti. Ton cerveau aussi a besoin de pause.", "",
        "✅ *Aujourd'hui :*",
        "• 0 réseaux sociaux pendant les repas",
        "• 10 min de méditation/respiration",
        "• Couche-toi à heure fixe", "",
        "💡 Un mental frais = des séances 2× plus efficaces."],
    },
  ],
  4: [ // ━━ JEUDI ━━ Nutrition
    {
      titre: "🥩 *JEUDI — Protéines*",
      corps: ["Cible : 1,6 à 2g de protéines par kg de poids corporel.", "",
        "✅ *Sources tops :*",
        "• Œufs (6-7g/œuf)",
        "• Poulet/dinde (25g/100g)",
        "• Thon en boîte (rapide)",
        "• Yaourt grec / fromage blanc", "",
        "💡 Répartis sur 4 repas — ton corps assimile mieux."],
    },
    {
      titre: "🍚 *JEUDI — Glucides intelligents*",
      corps: ["Les glucides ne font pas grossir. Le SURPLUS calorique, oui.", "",
        "✅ *Glucides à privilégier :*",
        "• Riz complet, patate douce",
        "• Avoine au petit-déj",
        "• Banane avant l'entraînement",
        "• Pain complet, légumineuses", "",
        "💡 Pic glucides 1h avant la séance = +15% d'énergie."],
    },
    {
      titre: "🥑 *JEUDI — Bonnes graisses*",
      corps: ["Les lipides régulent tes hormones (testostérone incluse).", "",
        "✅ *Sources clé :*",
        "• Huile d'olive (assaisonnement)",
        "• Avocat (1/2 par jour)",
        "• Noix, amandes (poignée)",
        "• Saumon, sardines (2×/sem)", "",
        "❌ Fuis : huiles raffinées, fritures, margarines."],
    },
    {
      titre: "⚡ *JEUDI — Repas pré-workout*",
      corps: ["Ce que tu manges 1h avant la séance fait toute la différence.", "",
        "✅ *Combo gagnant :*",
        "• Glucides lents (riz, avoine)",
        "• Protéines maigres (blanc d'œuf, dinde)",
        "• 1 banane 30 min avant", "",
        "❌ Évite : repas gras, fibres lourdes, lait."],
    },
    {
      titre: "🏋️ *JEUDI — Récup post-séance*",
      corps: ["La fenêtre anabolique = 30 min après la séance.", "",
        "✅ *Combo récup :*",
        "• Whey ou yaourt grec (20g prot)",
        "• Banane ou riz blanc (50g gluc)",
        "• Grand verre d'eau + 1 pincée de sel", "",
        "💡 Repas complet dans les 2h qui suivent."],
    },
    {
      titre: "🧂 *JEUDI — Compléments simples*",
      corps: ["80% des résultats viennent de ce que tu manges, pas des poudres.", "",
        "✅ *Vraiment utiles :*",
        "• Créatine monohydrate (3-5g/jour)",
        "• Whey (si tu n'atteins pas tes prot)",
        "• Magnésium (récup + sommeil)",
        "• Vit D (si peu de soleil)", "",
        "❌ *Inutile :* BCAA, brûleurs de graisse, pré-workout."],
    },
  ],
  5: [ // ━━ VENDREDI ━━ Mental & préparation
    {
      titre: "😴 *VENDREDI — Sommeil = gain*",
      corps: ["Demain Samedi : J3 Biceps & Dos & Épaules.", "",
        "✅ *Pour performer demain :*",
        "• Couche-toi avant 23h",
        "• Glucides lents au dîner (riz, patate)",
        "• Tisane ou eau chaude au lieu d'écrans", "",
        "❌ *À éviter ce soir :*",
        "• Alcool (annule la semaine)",
        "• Écrans bleus après 22h"],
    },
    {
      titre: "🧠 *VENDREDI — Visualisation*",
      corps: ["Les athlètes pros visualisent leurs perfs avant. Pourquoi pas toi ?", "",
        "✅ *Ce soir 5 min :*",
        "• Ferme les yeux",
        "• Visualise ta séance de demain",
        "• Vois-toi soulever facilement",
        "• Ressens la satisfaction post-séance", "",
        "💡 Le mental précède le physique."],
    },
    {
      titre: "🎒 *VENDREDI — Prépare ton matos*",
      corps: ["80% des séances ratées = manque de préparation.", "",
        "✅ *À préparer ce soir :*",
        "• Tenue sport sortie",
        "• Bouteille d'eau au frais",
        "• Shaker / collation",
        "• Playlist motivation", "",
        "💡 Ton 'toi' de demain te dira merci."],
    },
    {
      titre: "🎯 *VENDREDI — Objectifs de la séance*",
      corps: ["Sans objectif clair, la séance devient routine sans progrès.", "",
        "✅ *Définis 1 objectif précis :*",
        "• +2 reps sur le curl biceps ?",
        "• +2 kg sur le rowing ?",
        "• Forme parfaite sur les élévations ?", "",
        "💡 Note-le maintenant. Demain : exécution."],
    },
    {
      titre: "💤 *VENDREDI — Routine du soir*",
      corps: ["Un bon sommeil commence 2h avant de te coucher.", "",
        "✅ *Routine optimale :*",
        "• 21h : repas léger fini",
        "• 22h : douche tiède, lumière baissée",
        "• 22h30 : lecture (papier)",
        "• 23h : chambre fraîche (18°), au lit", "",
        "🎯 Cible : 7h30 à 9h de sommeil."],
    },
    {
      titre: "🔥 *VENDREDI — Mindset gagnant*",
      corps: ["Tu es à 2 jours du week-end. Mais aussi à 2 jours de progresser.", "",
        "✅ *Rappel important :*",
        "• Chaque rep compte",
        "• La constance bat la motivation",
        "• Tu construis le toi de dans 6 mois", "",
        "🏆 Champions ≠ talent. Champions = répétition."],
    },
  ],
};

// ─── Pool d'encouragements (1 ajouté à CHAQUE message) ───────────────────────
const ENCOURAGEMENTS = [
  "💪 Tu es plus fort que tes excuses.",
  "🔥 La douleur est temporaire, la fierté éternelle.",
  "⚡ Un jour, ou jour 1. À toi de choisir.",
  "🏆 Les champions s'entraînent quand les autres se reposent.",
  "💯 Le seul mauvais entraînement est celui que tu n'as pas fait.",
  "🚀 Dépasse-toi aujourd'hui, sois fier demain.",
  "👊 Si c'était facile, tout le monde le ferait.",
  "🌟 Ton seul concurrent : toi d'hier.",
  "💥 Les excuses ne font pas de muscle.",
  "🎯 La constance bat la motivation.",
  "⏰ 1% mieux chaque jour = 37× mieux dans 1 an.",
  "🔥 La sueur d'aujourd'hui = la force de demain.",
  "💪 Pas de raccourcis. Juste du travail.",
  "🏋️ Ton corps peut. C'est ton mental qu'il faut convaincre.",
  "⚡ Sois la version de toi que tu aurais voulu rencontrer enfant.",
  "🌟 Discipline > Motivation.",
  "🚀 La régularité fait les légendes.",
  "💯 Chaque rep compte. Chaque jour compte.",
  "🏆 Pas besoin d'être bon pour commencer. Commence pour devenir bon.",
  "👊 Les abdos se font dans la cuisine, pas seulement à la salle.",
  "🔥 Une séance ratée vaut mieux qu'une séance évitée.",
  "⚡ Si tu peux le penser, tu peux le devenir.",
  "💥 Pas de pression, pas de diamant.",
  "🎯 La meilleure heure pour s'entraîner, c'était hier. La 2e : maintenant.",
  "🌟 Ton corps est ton temple. Construis-le.",
  "💪 Le succès est la somme des petits efforts répétés.",
  "🔥 Sois affamé. Reste affamé.",
  "🚀 Le jour où tu lâches, quelqu'un d'autre s'entraîne pour te dépasser.",
  "💯 Tu n'es pas obligé de gagner — juste d'être meilleur qu'hier.",
  "⚡ Le corps réussit ce que l'esprit ose.",
];

// Rotation déterministe : index basé sur le nombre de jours depuis epoch
const dayIndex = () => Math.floor(Date.now() / 86400000);

function pickConseil(weekday) {
  const pool = CONSEILS_POOL[weekday];
  if (!pool || pool.length === 0) return null;
  return pool[dayIndex() % pool.length];
}

function pickEncouragement() {
  return ENCOURAGEMENTS[dayIndex() % ENCOURAGEMENTS.length];
}

function withEncouragement(lines) {
  return [...lines, "", "━━━━━━━━━━━━━━━", pickEncouragement()].join("\n");
}

function programmeMessage(jour) {
  const lignes = jour.exercises
    .map((ex, i) => `${i + 1}. *${ex.name}* — ${ex.sets}×${ex.reps} (repos ${ex.rest})`)
    .join("\n");
  return withEncouragement([
    `💪 *SÉANCE DU JOUR — ${jour.label}*`,
    `${jour.icon} *${jour.theme}*`,
    `📅 ${jour.day} · ${jour.exercises.length} exercices`,
    "",
    lignes,
    "",
    "👉 Ouvre l'app pour cocher tes exos :",
    "https://muscu-pwa.vercel.app",
  ]);
}

function teaserMessage(jourDemain) {
  return withEncouragement([
    `⏰ *RAPPEL — Séance demain*`,
    "",
    `${jourDemain.icon} Demain ${jourDemain.day} → *${jourDemain.theme}*`,
    `📋 ${jourDemain.exercises.length} exercices au programme`,
    "",
    "✅ *Prépare ton matos ce soir :*",
    "• Tenue sport prête",
    "• Bouteille d'eau au frais",
    "• Couche-toi tôt 💤",
  ]);
}

function conseilMessage(weekday) {
  const c = pickConseil(weekday);
  if (!c) return null;
  return withEncouragement([c.titre, "", ...c.corps]);
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
      if (!message) {
        message = withEncouragement(["🌙 *Bonne soirée !*", "", "Repos demain. Hydrate-toi bien et couche-toi tôt."]);
      }
    } else {
      // type=programme
      const jourAuj = WEEKDAY_TO_DAY[weekday];
      message = jourAuj ? programmeMessage(jourAuj) : conseilMessage(weekday);
      if (!message) {
        message = withEncouragement(["💪 *Journée OFF*", "", "Profite pour bien récupérer."]);
      }
    }

    await sendWhatsApp(message);
    return res.status(200).json({ success: true, type, weekday, test: isTest, message });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
