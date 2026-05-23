// GET  /api/history              → renvoie [{ weekKey, year, weekNum, dateStart, dateEnd, done, total, perfect }]
// POST /api/history { weekKey, year, weekNum, dateStart, dateEnd, done, total, perfect }

import { db, getUserFromAuth } from "./_lib/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function handler(req, res) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    const subcol = db.collection("muscu_progress").doc(user.phone).collection("history");

    if (req.method === "GET") {
      const snap = await subcol.orderBy("weekKey", "desc").limit(100).get();
      const history = snap.docs.map(d => {
        const data = d.data();
        return {
          weekKey: data.weekKey,
          year: data.year,
          weekNum: data.weekNum,
          dateStart: data.dateStart,
          dateEnd: data.dateEnd,
          done: data.done,
          total: data.total,
          perfect: data.perfect,
        };
      });
      return res.status(200).json({ history });
    }

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.weekKey) return res.status(400).json({ error: "weekKey requis" });
      await subcol.doc(b.weekKey).set({
        weekKey: b.weekKey,
        year: b.year,
        weekNum: b.weekNum,
        dateStart: b.dateStart,
        dateEnd: b.dateEnd,
        done: b.done,
        total: b.total,
        perfect: !!b.perfect,
        archivedAt: Timestamp.now(),
      }, { merge: true });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
