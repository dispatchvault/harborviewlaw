/* Self-hosted cookie consent for harborviewlaw.com.
   Replaces the third-party widget previously loaded from an external
   agency server. Analytics (GA4 G-04WBEXGRWT) loads ONLY after the
   visitor chooses "Accept all". The choice is stored in localStorage
   for 180 days. The banner always reappears on /policy/cookies-settings
   so that page doubles as the manage-preferences surface. */
(function () {
  var KEY = "hvl-consent";
  var GA_ID = "G-04WBEXGRWT";
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.choice || Date.now() - (d.ts || 0) > MAX_AGE) return null;
      return d.choice;
    } catch (e) { return null; }
  }
  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, ts: Date.now() })); } catch (e) {}
  }
  function loadGA() {
    if (window.__hvlGA) return;
    window.__hvlGA = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  function showBanner(current) {
    if (document.getElementById("hvl-consent")) return;
    var box = document.createElement("section");
    box.id = "hvl-consent";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Cookie preferences");
    box.innerHTML =
      '<style>' +
      '#hvl-consent{position:fixed;left:16px;bottom:16px;z-index:99999;max-width:360px;' +
      'background:#fff;color:#011640;border:1px solid rgba(1,22,64,.15);border-radius:6px;' +
      'box-shadow:0 8px 30px rgba(1,22,64,.18);padding:1.1rem 1.2rem;font-size:14px;line-height:1.5}' +
      '@media (max-width:480px){#hvl-consent{left:10px;right:10px;max-width:none}}' +
      '#hvl-consent h2{font-size:15px;margin:0 0 .4rem;color:#011640}' +
      '#hvl-consent p{margin:0 0 .8rem;color:#394867}' +
      '#hvl-consent a{color:#011640;text-decoration:underline}' +
      '#hvl-consent .hvl-row{display:flex;gap:.5rem;flex-wrap:wrap}' +
      '#hvl-consent button{font:inherit;font-weight:600;border-radius:4px;padding:.55rem .95rem;cursor:pointer}' +
      '#hvl-consent .hvl-accept{background:#ff4900;border:1px solid #ff4900;color:#fff}' +
      '#hvl-consent .hvl-accept:hover{background:#e03e00}' +
      '#hvl-consent .hvl-essential{background:transparent;border:1px solid rgba(1,22,64,.35);color:#011640}' +
      '#hvl-consent button:focus-visible{outline:2px solid #ff4900;outline-offset:2px}' +
      '</style>' +
      '<h2>Cookies on this site</h2>' +
      '<p>We use essential cookies to run this site and, with your permission, analytics ' +
      'cookies to understand how it is used. See our <a href="/policy/privacy-policy">privacy ' +
      'policy</a> for details.</p>' +
      '<div class="hvl-row">' +
      '<button type="button" class="hvl-accept">Accept all</button>' +
      '<button type="button" class="hvl-essential">Essential only</button>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector(".hvl-accept").addEventListener("click", function () {
      saveChoice("all"); loadGA(); box.remove();
    });
    box.querySelector(".hvl-essential").addEventListener("click", function () {
      saveChoice("essential"); box.remove();
    });
  }

  function init() {
    var choice = readChoice();
    var managePage = location.pathname.indexOf("/policy/cookies-settings") === 0;
    if (choice === "all") loadGA();
    if (!choice || managePage) showBanner(choice);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
