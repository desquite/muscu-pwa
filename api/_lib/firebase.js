// Init firebase-admin (singleton). Utilisé par tous les endpoints serverless.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();

// Génère un token aléatoire (hex 32 chars = 16 bytes)
export function generateToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

// Génère un code OTP à 6 chiffres
export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Normalise un numéro : supprime espaces, +, tirets. Garde uniquement chiffres.
export function normalizePhone(raw) {
  if (!raw) return "";
  return String(raw).replace(/\D/g, "");
}

// Récupère le user à partir du header Authorization (Bearer <token>).
// Retourne { phone, name } ou null.
export async function getUserFromAuth(req) {
  const auth = req.headers?.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;
  const sessionSnap = await db.collection("muscu_sessions").doc(token).get();
  if (!sessionSnap.exists) return null;
  const session = sessionSnap.data();
  if (session.expiresAt && session.expiresAt.toMillis() < Date.now()) return null;
  const userSnap = await db.collection("muscu_users").doc(session.phone).get();
  if (!userSnap.exists) return null;
  return { phone: session.phone, ...userSnap.data() };
}
