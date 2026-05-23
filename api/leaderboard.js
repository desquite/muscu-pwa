// GET /api/leaderboard
// Renvoie le classement des users : { leaderboard: [{ name, perfectWeeks, totalExos, currentStreak, isCurrentUser }, ...] }
// Trié par semaines parfaites desc, puis par total exos desc.
// Exclut les users qui ont mis appearInLeaderboard: false.

import { db, getUserFromAuth } from "./_lib/firebase.js";
import { DAYS, getISOWeek } from "./_lib/programme.js";

const TOTAL_EXOS_PER_WEEK = DAYS.reduce((a, d) => a + d.exercises.length, 0);

export default async function handler(req, res) {
  try {
    const currentUser = await getUserFromAuth(req);
    if (!currentUser) return res.status(401).json({ error: "Non authentifié" });

    // 1. Récupère tous les users qui veulent apparaître (par défaut tout le monde)
    const usersSnap = await db.collection("muscu_users").get();
    const visibleUsers = usersSnap.docs
      .map(d => ({ phone: d.id, ...d.data() }))
      .filter(u => u.appearInLeaderboard !== false);

    if (visibleUsers.length === 0) return res.status(200).json({ leaderboard: [] });

    // 2. Pour chaque user, récupère son progress + history en parallèle
    const currentWeekKey = getISOWeek().key;
    const rows = await Promise.all(visibleUsers.map(async (u) => {
      try {
        const progressRef = db.collection("muscu_progress").doc(u.phone);
        const [progressSnap, historySnap] = await Promise.all([
          progressRef.get(),
          progressRef.collection("history").get(),
        ]);
        const progress = progressSnap.exists ? progressSnap.data() : {};
        const checked = progress.checked || {};
        const history = historySnap.docs.map(d => d.data());

        const currentDone = Object.values(checked).filter(Boolean).length;
        const currentPerfect = currentDone === TOTAL_EXOS_PER_WEEK && TOTAL_EXOS_PER_WEEK > 0;
        const currentWeekArchivedAlready = history.some(w => w.weekKey === currentWeekKey);

        // Semaines parfaites (history + semaine en cours si parfaite et pas déjà archivée)
        const perfectFromHistory = history.filter(w => w.perfect).length;
        const perfectWeeks = perfectFromHistory + (currentPerfect && !currentWeekArchivedAlready ? 1 : 0);

        // Total exos = somme des done de toutes les semaines passées + semaine courante (si pas déjà archivée)
        const totalFromHistory = history.reduce((a, w) => a + (w.done || 0), 0);
        const totalExos = totalFromHistory + (currentWeekArchivedAlready ? 0 : currentDone);

        // Série en cours : weeks parfaites consécutives en remontant depuis maintenant
        // History trié par weekKey desc
        const sortedHistory = [...history].sort((a, b) => (b.weekKey || "").localeCompare(a.weekKey || ""));
        let currentStreak = currentPerfect ? 1 : 0;
        for (const w of sortedHistory) {
          if (w.weekKey === currentWeekKey) continue; // évite double-count
          if (w.perfect) currentStreak++;
          else break;
        }

        return {
          name: u.name || `User ${u.phone.slice(-4)}`,
          perfectWeeks,
          totalExos,
          currentStreak,
          isCurrentUser: u.phone === currentUser.phone,
        };
      } catch {
        return null;
      }
    }));

    const leaderboard = rows
      .filter(Boolean)
      .sort((a, b) => {
        if (b.perfectWeeks !== a.perfectWeeks) return b.perfectWeeks - a.perfectWeeks;
        if (b.totalExos !== a.totalExos) return b.totalExos - a.totalExos;
        return b.currentStreak - a.currentStreak;
      });

    return res.status(200).json({ leaderboard, currentUserPhone: currentUser.phone });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
