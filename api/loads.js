// GET  /api/loads                                         → renvoie { "1-0": [...], "1-1": [...], ... }
// POST /api/loads { exKey, weight, reps, weekKey }        → ajoute une entrée à l'historique de l'exo
//
// Structure Firestore : muscu_loads/{phone} = { [exKey]: [{weight, reps, weekKey, completedAt}, ...] }
// 1 doc par user, max 1 MB → largement assez pour ~25 exos × ~150 semaines.

import { db, getUserFromAuth } from "./_lib/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function handler(req, res) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const ref = db.collection("muscu_loads").doc(user.phone);

    if (req.method === "GET") {
      const snap = await ref.get();
      if (!snap.exists) return res.status(200).json({ loads: {} });
      const data = snap.data() || {};
      // On retourne tout sauf les champs internes (ex: updatedAt)
      const { updatedAt, ...loads } = data;
      return res.status(200).json({ loads });
    }

    if (req.method === "POST") {
      const { exKey, weight, reps, weekKey } = req.body || {};
      if (!exKey) return res.status(400).json({ error: "exKey requis" });
      const w = parseFloat(weight);
      const r = parseInt(reps, 10);
      if (!Number.isFinite(w) || w <= 0 || w > 1000) return res.status(400).json({ error: "Poids invalide (0–1000 kg)" });
      if (!Number.isFinite(r) || r <= 0 || r > 200) return res.status(400).json({ error: "Reps invalides (1–200)" });

      const entry = {
        weight: Math.round(w * 10) / 10, // arrondi à 0.1 près
        reps: r,
        weekKey: weekKey || null,
        completedAt: Timestamp.now(),
      };

      const snap = await ref.get();
      const existing = snap.exists ? (snap.data()[exKey] || []) : [];
      // Si la dernière entrée date de la même semaine, on l'écrase (re-cochage)
      const last = existing[existing.length - 1];
      let next;
      if (last && weekKey && last.weekKey === weekKey) {
        next = [...existing.slice(0, -1), entry];
      } else {
        next = [...existing, entry];
      }
      // Limite : on garde max 200 entrées par exo (largement assez)
      if (next.length > 200) next = next.slice(-200);

      await ref.set({ [exKey]: next, updatedAt: Timestamp.now() }, { merge: true });
      return res.status(200).json({ success: true, entry, totalEntries: next.length });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
