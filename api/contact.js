// Vercel serverless function: receives form submissions from the site's
// Webflow-markup forms (via /wf/forms-bridge.js) and emails them through
// Resend. Replaces Webflow's form API ahead of the Webflow cancellation.
//
// Environment variables (Vercel project settings):
//   RESEND_API_KEY — Resend key with sending access on dispatchvault.com
//   CONTACT_TO     — destination inbox (defaults to info@harborviewlaw.com)
//
// Until RESEND_API_KEY is set, submissions return 503 and the form shows
// the Webflow error state.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = req.body || {};
  const formName = String(body._form || "Website Form").slice(0, 100);
  const page = String(body._page || "").slice(0, 200);

  const fields = Object.entries(body)
    .filter(([k, v]) => !k.startsWith("_") && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${String(v).slice(0, 2000)}`);

  if (fields.length === 0) {
    return res.status(400).json({ ok: false, error: "Empty submission" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ ok: false, error: "Form delivery is not configured" });
  }

  const to = process.env.CONTACT_TO || "info@harborviewlaw.com";
  const email = String(body.Email || body.email || "").slice(0, 200);
  const name = String(body.Name || body.name || "").trim();

  const text = [
    `Form: ${formName}`,
    page && `Page: ${page}`,
    "",
    ...fields,
  ]
    .filter(Boolean)
    .join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Harborview Law Website <forms@dispatchvault.com>",
      to: [to],
      ...(email ? { reply_to: email } : {}),
      subject: `${formName}${name ? ` from ${name}` : ""} — harborviewlaw.com`,
      text,
    }),
  });

  if (!r.ok) {
    return res.status(502).json({ ok: false, error: "Delivery failed" });
  }
  return res.status(200).json({ ok: true });
}
