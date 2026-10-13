/* Forms bridge: reroutes the site's Webflow-markup forms to /api/contact
   (Vercel function + Resend) instead of Webflow's form API, which goes away
   with the Webflow subscription. Intercepts in the capture phase so
   webflow.js never sees the submit, then drives Webflow's own success
   (.w-form-done) and error (.w-form-fail) blocks, so the user experience is
   identical to the original site.

   Spam hardening: a hidden honeypot field (_hp) is injected into every
   form, and the time from page load to submit is sent as _t. The server
   silently drops submissions with a filled honeypot or an implausibly
   fast submit. */
(function () {
  var t0 = Date.now();

  function show(el) { if (el) el.style.display = "block"; }

  function addHoneypots() {
    document.querySelectorAll(".w-form form").forEach(function (form) {
      if (form.querySelector('input[name="_hp"]')) return;
      var hp = document.createElement("input");
      hp.type = "text";
      hp.name = "_hp";
      hp.tabIndex = -1;
      hp.autocomplete = "off";
      hp.setAttribute("aria-hidden", "true");
      hp.style.cssText = "position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0";
      form.appendChild(hp);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addHoneypots);
  } else {
    addHoneypots();
  }

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;
      var wrap = form.closest(".w-form");
      if (!wrap) return; // not a Webflow form (leave anything else alone)
      if (form.classList.contains("w-password-page")) return; // Webflow utility

      e.preventDefault();
      e.stopPropagation();

      var btn = form.querySelector('input[type="submit"], button[type="submit"]');
      var prevVal = btn && (btn.getAttribute("data-wait") || null);
      if (btn && prevVal) {
        btn.dataset._orig = btn.value || btn.textContent;
        if ("value" in btn) btn.value = prevVal; else btn.textContent = prevVal;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data._form = form.getAttribute("data-name") || form.getAttribute("name") || "Website Form";
      data._page = location.pathname;
      data._t = Date.now() - t0;

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("send failed");
          form.style.display = "none";
          show(wrap.querySelector(".w-form-done"));
        })
        .catch(function () {
          show(wrap.querySelector(".w-form-fail"));
          if (btn && btn.dataset._orig) {
            if ("value" in btn) btn.value = btn.dataset._orig; else btn.textContent = btn.dataset._orig;
          }
        });
    },
    true
  );
})();
