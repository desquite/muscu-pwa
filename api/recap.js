// ─── Endpoint récap fin de semaine ───────────────────────────────────────────
// GET /api/recap?done=24&total=24&streak=3&record=5
// Appelé automatiquement par le frontend quand l'utilisateur atteint 24/24.

import { sendWhatsApp } from "./_lib/wasender.js";

const TROPHIES = [
  "🏆", "🥇", "🔥", "💪", "⚡", "🚀", "🌟", "💎", "👑", "🎯",
];

function recapMessage({ done, total, streak, record, totalAllTime }) {
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
    const done = parseInt(req.query?.done, 10) || 0;
    const total = parseInt(req.query?.total, 10) || 0;
    const streak = parseInt(req.query?.streak, 10) || 0;
    const record = parseInt(req.query?.record, 10) || 0;
    const totalAllTime = parseInt(req.query?.totalAllTime, 10) || 0;

    if (total === 0) {
      return res.status(400).json({ error: "Paramètre 'total' requis" });
    }

    const message = recapMessage({ done, total, streak, record, totalAllTime });
    await sendWhatsApp(message);
    return res.status(200).json({ success: true, message });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
