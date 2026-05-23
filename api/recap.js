// ─── Endpoint récap fin de semaine ───────────────────────────────────────────
// GET /api/recap?done=24&total=24&streak=3&record=5
// Appelé automatiquement par le frontend quand l'utilisateur atteint 24/24.

import { sendWhatsApp } from "./_lib/wasender.js";
import { db, getUserFromAuth } from "./_lib/firebase.js";
import { getExerciseByKey, getISOWeek } from "./_lib/programme.js";

const TROPHIES = [
  "🏆", "🥇", "🔥", "💪", "⚡", "🚀", "🌟", "💎", "👑", "🎯",
];

// Calcule les records battus cette semaine en comparant la dernière entrée à l'historique précédent
async function getWeeklyProgressions(phone) {
  try {
    const snap = await db.collection("muscu_loads").doc(phone).get();
    if (!snap.exists) return [];
    const data = snap.data() || {};
    const currentWeekKey = getISOWeek().key;
    const records = [];
    for (const [exKey, hist] of Object.entries(data)) {
      if (!Array.isArray(hist) || hist.length === 0) continue;
      const last = hist[hist.length - 1];
      if (last?.weekKey !== currentWeekKey) continue;
      const previous = hist.slice(0, -1);
      const prevBest = previous.reduce((b, e) => {
        if (!b) return e;
        if (e.weight > b.weight) return e;
        if (e.weight === b.weight && e.reps > b.reps) return e;
        return b;
      }, null);
      const isPR = !prevBest
        || last.weight > prevBest.weight
        || (last.weight === prevBest.weight && last.reps > prevBest.reps);
      if (isPR) {
        const ex = getExerciseByKey(exKey);
        records.push({
          name: ex?.name || exKey,
          weight: last.weight,
          reps: last.reps,
          prevWeight: prevBest?.weight,
          prevReps: prevBest?.reps,
        });
      }
    }
    return records;
  } catch {
    return [];
  }
}

function recapMessage({ done, total, streak, record, totalAllTime, progressions = [] }) {
  const perfect = done === total;
  const trophy = TROPHIES[(streak - 1) % TROPHIES.length] || "🏆";

  const lines = [];
  if (perfect) {
    lines.push(`${trophy} *SEMAINE PARFAITE !* ${trophy}`);
    lines.push("");
    lines.push(`✅ *${done}/${total} exercices*`);
    lines.push("");
    if (streak === 1) {
      lines.push(`🔥 Tu lances une nouvelle série !`);
    } else if (streak === record) {
      lines.push(`🔥 *${streak} semaines parfaites d'affilée*`);
      lines.push(`🏅 Nouveau record personnel !`);
    } else {
      lines.push(`🔥 *${streak} semaines parfaites d'affilée*`);
      lines.push(`🏅 Record perso : ${record} semaines`);
    }
  } else {
    lines.push(`💪 *Semaine terminée*`);
    lines.push("");
    lines.push(`✅ *${done}/${total} exercices*`);
    lines.push("");
    lines.push(`Tu y étais presque — la prochaine sera la bonne !`);
  }

  if (totalAllTime) {
    lines.push("");
    lines.push(`📊 Total depuis le début : *${totalAllTime} exos*`);
  }

  if (progressions.length > 0) {
    lines.push("");
    lines.push(`🔥 *Records battus cette semaine (${progressions.length})*`);
    progressions.slice(0, 5).forEach(p => {
      if (p.prevWeight) {
        lines.push(`• ${p.name} : ${p.prevWeight}kg → *${p.weight}kg* × ${p.reps}`);
      } else {
        lines.push(`• ${p.name} : *${p.weight}kg × ${p.reps}* (1ère perf 🎉)`);
      }
    });
    if (progressions.length > 5) lines.push(`...et ${progressions.length - 5} de plus`);
  }

  lines.push("");
  lines.push("━━━━━━━━━━━━━━━");
  lines.push("Lundi on remet ça 💥");
  lines.push("");
  lines.push("👉 Voir ton historique :");
  lines.push("https://muscu-pwa.vercel.app");

  return lines.join("\n");
}

export default async function handler(req, res) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const done = parseInt(req.query?.done, 10) || 0;
    const total = parseInt(req.query?.total, 10) || 0;
    const streak = parseInt(req.query?.streak, 10) || 0;
    const record = parseInt(req.query?.record, 10) || 0;
    const totalAllTime = parseInt(req.query?.totalAllTime, 10) || 0;

    if (total === 0) return res.status(400).json({ error: "Paramètre 'total' requis" });

    // Bonus : on regarde les records battus cette semaine
    const progressions = await getWeeklyProgressions(user.phone);

    const message = recapMessage({ done, total, streak, record, totalAllTime, progressions });
    await sendWhatsApp(message, user.phone);
    return res.status(200).json({ success: true, to: user.phone, progressionsCount: progressions.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
