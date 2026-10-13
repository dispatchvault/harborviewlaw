// Vercel serverless function: receives form submissions from the site's
// Webflow-markup forms (via /wf/forms-bridge.js) and emails them through
// Resend. Replaces Webflow's form API ahead of the Webflow cancellation.
//
// Environment variables (Vercel project settings):
//   RESEND_API_KEY — Resend key with sending access on dispatchvault.com
//   CONTACT_TO     — destination inbox (defaults to info@harborviewlaw.com)
//
// Hardening:
//   - Origin allowlist (harborviewlaw.com and Vercel preview deployments)
//   - Honeypot (_hp) and submit-timing (_t) checks; failures are silently
//     accepted with {ok:true} so bots learn nothing
//   - Field count and length caps, loose email shape check
//   - Best-effort per-IP rate limit (in-memory per warm instance)

const RATE = new Map(); // ip -> [timestamps]
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function originAllowed(origin) {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return (
      host === "harborviewlaw.com" ||
      host === "www.harborviewlaw.com" ||
      host.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function rateLimited(ip) {
  const now = Date.now();
  const hits = (RATE.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  RATE.set(ip, hits);
  if (RATE.size > 5000) RATE.clear(); // crude memory guard
  return hits.length > RATE_MAX;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!originAllowed(req.headers.origin)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too many requests" });
  }

  const body = req.body || {};

  // Bot checks: filled honeypot, missing/implausible timing. Accept
  // silently so automated senders see success and stop probing.
  const hp = String(body._hp || "");
  const elapsed = Number(body._t);
  if (hp !== "" || !Number.isFinite(elapsed) || elapsed < 2500) {
    return res.status(200).json({ ok: true });
  }

  const entries = Object.entries(body).filter(([k]) => !k.startsWith("_"));
  if (entries.length === 0 || entries.length > 25) {
    return res.status(400).json({ ok: false, error: "Invalid submission" });
  }

  const formName = String(body._form || "Website Form").slice(0, 100);
  const page = String(body._page || "").slice(0, 200);

  const fields = entries
    .filter(([, v]) => String(v).trim() !== "")
    .map(([k, v]) => `${String(k).slice(0, 100)}: ${String(v).slice(0, 5000)}`);
  if (fields.length === 0) {
    return res.status(400).json({ ok: false, error: "Empty submission" });
  }

  const email = String(body.Email || body.email || "").slice(0, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }
  const name = String(body.Name || body.name || "").trim().slice(0, 150);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ ok: false, error: "Form delivery is not configured" });
  }
  const to = process.env.CONTACT_TO || "info@harborviewlaw.com";

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
    console.error("Resend error", r.status, (await r.text().catch(() => "")).slice(0, 300));
    return res.status(502).json({ ok: false, error: "Delivery failed" });
  }
  return res.status(200).json({ ok: true });
}
