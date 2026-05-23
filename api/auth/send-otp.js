// POST /api/auth/send-otp { phone: "2250709646096" }
// Génère un OTP, le stocke en Firestore (TTL 10 min), l'envoie via WhatsApp.

import { db, generateOtp, normalizePhone } from "../_lib/firebase.js";
import { sendWhatsApp } from "../_lib/wasender.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone || phone.length < 8) {
      return res.status(400).json({ error: "Numéro invalide" });
    }

    // Rate-limit basique : si un OTP a été envoyé dans les 60 dernières secondes, refuser
    const existing = await db.collection("muscu_otp").doc(phone).get();
    if (existing.exists) {
      const last = existing.data().createdAt?.toMillis() || 0;
      if (Date.now() - last < 60_000) {
        return res.status(429).json({ error: "Patiente 1 minute avant de redemander un code." });
      }
    }

    const code = generateOtp();
    const now = Date.now();
    await db.collection("muscu_otp").doc(phone).set({
      code,
      phone,
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + 10 * 60 * 1000), // 10 min
      attempts: 0,
    });

    const message = [
      "🔐 *Séance Sport DESQUITE*",
      "",
      `Ton code de connexion : *${code}*`,
      "",
      "Valable 10 minutes.",
      "Ne le partage avec personne.",
    ].join("\n");

    // Override temporaire : envoyer à CE numéro spécifiquement (pas le MY_PHONE_NUMBER global)
    const apiKey = process.env.WASENDER_API_KEY;
    const sessionId = process.env.WASENDER_SESSION_ID;
    if (!apiKey || !sessionId) throw new Error("Wasender non configuré");
    const r = await fetch("https://wasenderapi.com/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ sessionId, to: phone, text: message }),
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Wasender ${r.status}: ${txt}`);
    }

    return res.status(200).json({ success: true, expiresIn: 600 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
