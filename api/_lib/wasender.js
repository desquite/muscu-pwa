// Helper d'envoi WhatsApp via Wasender API (utilisé par /api/rappel et /api/recap)
// Si `to` est omis, fallback sur process.env.MY_PHONE_NUMBER (compat).
export async function sendWhatsApp(message, to) {
  const apiKey = process.env.WASENDER_API_KEY;
  const sessionId = process.env.WASENDER_SESSION_ID;
  const recipient = to || process.env.MY_PHONE_NUMBER;
  if (!apiKey || !sessionId || !recipient) {
    throw new Error("Wasender mal configuré (API key / session / destinataire manquant)");
  }
  const r = await fetch("https://wasenderapi.com/api/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ sessionId, to: recipient, text: message }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Wasender ${r.status} pour ${recipient}: ${txt}`);
  return txt;
}
