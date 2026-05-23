// POST /api/migrate { checked, currentWeekKey, history: [...] }
// Importe les données localStorage vers Firestore. N'écrase rien si le user a déjà des données plus récentes.

import { db, getUserFromAuth } from "./_lib/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const { checked = {}, currentWeekKey = null, history = [] } = req.body || {};

    const progressRef = db.collection("muscu_progress").doc(user.phone);
    const progressSnap = await progressRef.get();

    let imported = { progress: false, history: 0 };

    // N'écraser le progress que si Firestore est vide
    if (!progressSnap.exists) {
      await progressRef.set({
        checked,
        currentWeekKey,
        updatedAt: Timestamp.now(),
      });
      imported.progress = true;
    }

    // Historique : pour chaque entrée, on ne crée que si elle n'existe pas
    const historyCol = progressRef.collection("history");
    for (const w of history) {
      if (!w?.weekKey) continue;
      const docRef = historyCol.doc(w.weekKey);
      const exists = await docRef.get();
      if (exists.exists) continue;
      await docRef.set({
        weekKey: w.weekKey,
        year: w.year,
        weekNum: w.weekNum,
        dateStart: w.dateStart,
        dateEnd: w.dateEnd,
        done: w.done,
        total: w.total,
        perfect: !!w.perfect,
        archivedAt: Timestamp.now(),
      });
      imported.history += 1;
    }

    return res.status(200).json({ success: true, imported });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
