// POST /api/auth/verify-otp { phone, code, name? }
// Vérifie l'OTP. Si OK, crée le user (si nouveau) + session token, retourne le token.

import { db, generateToken, normalizePhone } from "../_lib/firebase.js";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const phone = normalizePhone(req.body?.phone);
    const code = String(req.body?.code || "").trim();
    const name = String(req.body?.name || "").trim().slice(0, 60);

    if (!phone || !code) return res.status(400).json({ error: "Numéro et code requis" });

    const otpRef = db.collection("muscu_otp").doc(phone);
    const otpSnap = await otpRef.get();
    if (!otpSnap.exists) return res.status(400).json({ error: "Aucun code en attente. Redemande un code." });

    const otp = otpSnap.data();
    if (otp.expiresAt.toMillis() < Date.now()) {
      await otpRef.delete().catch(() => {});
      return res.status(400).json({ error: "Code expiré. Redemande-en un." });
    }
    if ((otp.attempts || 0) >= 5) {
      await otpRef.delete().catch(() => {});
      return res.status(429).json({ error: "Trop d'essais. Redemande un code." });
    }
    if (otp.code !== code) {
      await otpRef.update({ attempts: FieldValue.increment(1) });
      return res.status(401).json({ error: "Code incorrect." });
    }

    // OK : on supprime l'OTP, on upsert le user, on crée la session
    await otpRef.delete().catch(() => {});

    const userRef = db.collection("muscu_users").doc(phone);
    const userSnap = await userRef.get();
    const isNew = !userSnap.exists;
    if (isNew) {
      await userRef.set({
        phone,
        name: name || `User ${phone.slice(-4)}`,
        rappelsActifs: true,
        createdAt: Timestamp.now(),
      });
    } else if (name && !userSnap.data().name) {
      await userRef.update({ name });
    }

    const token = generateToken();
    const now = Date.now();
    await db.collection("muscu_sessions").doc(token).set({
      phone,
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + SESSION_TTL_MS),
    });

    const userFinal = (await userRef.get()).data();
    return res.status(200).json({
      success: true,
      token,
      user: { phone, name: userFinal.name, rappelsActifs: userFinal.rappelsActifs ?? true },
      isNew,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
