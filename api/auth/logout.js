// POST /api/auth/logout  → supprime la session courante

import { db } from "../_lib/firebase.js";

export default async function handler(req, res) {
  try {
    const auth = req.headers?.authorization || "";
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (match) {
      const token = match[1].trim();
      await db.collection("muscu_sessions").doc(token).delete().catch(() => {});
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
