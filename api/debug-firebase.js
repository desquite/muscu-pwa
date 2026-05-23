// Endpoint DEBUG TEMPORAIRE — à supprimer après diagnostic.
// GET /api/debug-firebase
// Affiche le format des env vars Firebase et tente une opération Firestore minimale.

export default async function handler(req, res) {
  const result = {
    env: {},
    privateKey: {},
    firebase: null,
  };

  // 1. État des env vars (sans révéler les valeurs sensibles complètes)
  const pid = process.env.FIREBASE_PROJECT_ID || "";
  const mail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const raw = process.env.FIREBASE_PRIVATE_KEY || "";

  result.env.FIREBASE_PROJECT_ID = pid ? `"${pid}" (${pid.length} chars)` : "MISSING";
  result.env.FIREBASE_CLIENT_EMAIL = mail ? `"${mail}" (${mail.length} chars)` : "MISSING";
  result.env.FIREBASE_PRIVATE_KEY = raw ? `present (${raw.length} chars raw)` : "MISSING";

  // 2. Analyse format de la clé privée
  if (raw) {
    result.privateKey.rawLength = raw.length;
    result.privateKey.hasLiteralBackslashN = raw.includes("\\n");
    result.privateKey.hasRealNewlines = raw.includes("\n");
    result.privateKey.first40 = raw.substring(0, 40).replace(/\n/g, "[NEWLINE]").replace(/\\n/g, "[LIT-\\n]");
    result.privateKey.last40 = raw.substring(raw.length - 40).replace(/\n/g, "[NEWLINE]").replace(/\\n/g, "[LIT-\\n]");

    const decoded = raw.replace(/\\n/g, "\n");
    result.privateKey.decodedLength = decoded.length;
    result.privateKey.decodedHasBeginHeader = decoded.includes("-----BEGIN PRIVATE KEY-----");
    result.privateKey.decodedHasEndHeader = decoded.includes("-----END PRIVATE KEY-----");
    result.privateKey.decodedNewlineCount = (decoded.match(/\n/g) || []).length;
  }

  // 3. Tentative d'init Firebase + opération réelle
  try {
    const { initializeApp, cert, getApps, deleteApp } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    // App nommée pour pouvoir recréer à chaque appel debug
    const appName = `debug-${Date.now()}`;
    const app = initializeApp({
      credential: cert({
        projectId: pid,
        clientEmail: mail,
        privateKey: raw.replace(/\\n/g, "\n"),
      }),
    }, appName);

    const db = getFirestore(app);
    // Test minimal : un read sur un doc qui peut ne pas exister (ok = pas d'erreur)
    const testRef = db.collection("muscu_users").limit(1);
    const snap = await testRef.get();
    result.firebase = {
      ok: true,
      message: "Connexion Firestore réussie",
      muscu_users_count_sample: snap.size,
    };
    await deleteApp(app).catch(() => {});
  } catch (e) {
    result.firebase = {
      ok: false,
      errorMessage: e.message,
      errorCode: e.code,
      errorStack: e.stack?.split("\n").slice(0, 3).join(" | "),
    };
  }

  return res.status(200).json(result);
}
