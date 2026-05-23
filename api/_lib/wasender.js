// Helper d'envoi WhatsApp via Wasender API (utilisé par /api/rappel et /api/recap)
export async function sendWhatsApp(message) {
  const apiKey = process.env.WASENDER_API_KEY;
  const sessionId = process.env.WASENDER_SESSION_ID;
  const to = process.env.MY_PHONE_NUMBER;
  if (!apiKey || !sessionId || !to) {
    throw new Error("Variables d'env manquantes (WASENDER_API_KEY / WASENDER_SESSION_ID / MY_PHONE_NUMBER)");
  }
  const r = await fetch("https://wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ sessionId, to, text: message }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Wasender ${r.status}: ${txt}`);
  return txt;
}
