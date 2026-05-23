// GET /api/auth/me  → renvoie l'utilisateur connecté ou 401
// POST /api/auth/me { name?, rappelsActifs? } → met à jour le profil

import { db, getUserFromAuth } from "../_lib/firebase.js";

export default async function handler(req, res) {
  try {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    if (req.method === "POST") {
      const updates = {};
      if (typeof req.body?.name === "string") updates.name = req.body.name.trim().slice(0, 60);
      if (typeof req.body?.rappelsActifs === "boolean") updates.rappelsActifs = req.body.rappelsActifs;
      if (typeof req.body?.appearInLeaderboard === "boolean") updates.appearInLeaderboard = req.body.appearInLeaderboard;
      if (Object.keys(updates).length > 0) {
        await db.collection("muscu_users").doc(user.phone).update(updates);
      }
      const updated = (await db.collection("muscu_users").doc(user.phone).get()).data();
      return res.status(200).json({ user: {
        phone: user.phone, name: updated.name,
        rappelsActifs: updated.rappelsActifs ?? true,
        appearInLeaderboard: updated.appearInLeaderboard ?? true,
      } });
    }

    return res.status(200).json({
      user: {
        phone: user.phone, name: user.name,
        rappelsActifs: user.rappelsActifs ?? true,
        appearInLeaderboard: user.appearInLeaderboard ?? true,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
