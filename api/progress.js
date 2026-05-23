// GET  /api/progress              → renvoie { checked, currentWeekKey, recapSent }
// POST /api/progress { checked, currentWeekKey?, recapSent? } → upsert (remplace les champs fournis)

import { db, getUserFromAuth } from "./_lib/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function handler(req, res) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const ref = db.collection("muscu_progress").doc(user.phone);

    if (req.method === "GET") {
      const snap = await ref.get();
      if (!snap.exists) {
        return res.status(200).json({ checked: {}, currentWeekKey: null, recapSent: null });
      }
      const data = snap.data();
      return res.status(200).json({
        checked: data.checked || {},
        currentWeekKey: data.currentWeekKey || null,
        recapSent: data.recapSent || null,
      });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const updates = { updatedAt: Timestamp.now() };
      if (body.checked && typeof body.checked === "object") updates.checked = body.checked;
      if (typeof body.currentWeekKey === "string") updates.currentWeekKey = body.currentWeekKey;
      if (typeof body.recapSent === "string") updates.recapSent = body.recapSent;
      await ref.set(updates, { merge: true });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
