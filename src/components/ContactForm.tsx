"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

// Mirrors the live Webflow forms: Name, Company, Phone, Email, Message + terms.
// The free-consultation variant adds an "area of interest" select.
const AREAS = [
  "General Counsel Services",
  "Corporate Law",
  "Commercial Contracts & Transactions",
  "Real Estate Law",
  "Telecommunications",
  "Legal Consultation",
];

export default function ContactForm({ withArea = false }: { withArea?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="form-status form-status--ok" role="status">
        Thank you! Your message has been received. We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {withArea && (
        <div className="field field--wide">
          <label htmlFor="area">Select area of interest</label>
          <select id="area" name="area" required defaultValue="">
            <option value="" disabled>
              Select one...
            </option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>
      )}
      <div className="field field--wide">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" placeholder="Tell us how we can help..." required />
      </div>
      <div className="field field--wide field--check">
        <input id="terms" name="terms" type="checkbox" required />
        <label htmlFor="terms">
          I accept the <a href="/policy/terms-of-service">Terms</a>
        </label>
      </div>
      <div className="field field--wide">
        <button className="btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit"}
        </button>
        {status === "error" && (
          <p className="form-status form-status--err" role="alert">
            Oops! Something went wrong sending your message. Please try again, or email
            info@harborviewlaw.com directly.
          </p>
        )}
      </div>
    </form>
  );
}
