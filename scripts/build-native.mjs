// Compiles the captured Webflow IX2 config (scripts/ix2-config.cjs) into a
// compact data blob and prepends it to src/native/runtime.js, producing
// public/wf/native.js. Only events whose trigger element actually exists in
// the site's markup survive, and action lists are stripped to the fields the
// runtime reads, so the original 2.4MB Webflow runtime becomes one small file.
//
// Run after changing ix2-config.cjs, runtime.js, or page markup that adds or
// removes data-w-id elements:  node scripts/build-native.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cfg = require(path.join(root, "scripts/ix2-config.cjs"));

// ---- collect every data-w-id present in the site's markup
const wfids = new Set();
function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) scan(p);
    else if (f.name.endsWith(".html")) {
      const s = fs.readFileSync(p, "utf8");
      for (const m of s.matchAll(/data-w-id="([^"]+)"/g)) wfids.add(m[1]);
    }
  }
}
scan(path.join(root, "src/raw"));
scan(path.join(root, "src/templates"));

// ---- map event types to runtime codes
const TYPE = {
  SCROLL_INTO_VIEW: "siv",
  MOUSE_OVER: "mo",
  MOUSE_OUT: "mu",
  NAVBAR_OPEN: "no",
  NAVBAR_CLOSE: "nc",
};
const ACTION = {
  STYLE_OPACITY: "op",
  TRANSFORM_MOVE: "mv",
  TRANSFORM_SCALE: "sc",
  TRANSFORM_ROTATE: "rt",
  STYLE_SIZE: "sz",
  STYLE_BORDER: "bc",
  STYLE_TEXT_COLOR: "tc",
  GENERAL_DISPLAY: "dp",
  PLUGIN_LOTTIE: "lt",
};
const VALUE_KEYS = [
  "value", "unit", "xValue", "yValue", "zValue", "xUnit", "yUnit", "zUnit",
  "widthValue", "heightValue", "widthUnit", "heightUnit",
  "rValue", "gValue", "bValue", "aValue",
];

function compileList(al) {
  const groups = [];
  for (const g of al.actionItemGroups || []) {
    const items = [];
    for (const it of g.actionItems) {
      const t = ACTION[it.actionTypeId];
      if (!t) continue; // unsupported action type: skip
      const c = it.config;
      const item = { t, d: c.delay || 0, u: c.duration || 0, e: c.easing || "" };
      const tgt = c.target || {};
      if (tgt.useEventTarget === "CHILDREN" && tgt.selector) item.s = "c:" + tgt.selector;
      else if (!tgt.useEventTarget && tgt.selector) item.s = "s:" + tgt.selector;
      // (useEventTarget === true -> no selector; runtime uses the event element)
      const v = {};
      for (const k of VALUE_KEYS) if (c[k] !== undefined && c[k] !== null) v[k] = c[k];
      item.v = v;
      items.push(item);
    }
    if (items.length) groups.push(items);
  }
  return { f: al.useFirstGroupAsInitialState ? 1 : 0, g: groups };
}

const lists = [];
const listIndex = new Map(); // actionListId -> index
const events = [];
let dropped = 0;
for (const ev of Object.values(cfg.events)) {
  const type = TYPE[ev.eventTypeId];
  if (!type) { dropped++; continue; }
  const rawId = ev.target?.id || "";
  const wfid = rawId.split("|").pop();
  if (!wfids.has(wfid)) { dropped++; continue; }
  const alId = ev.action?.config?.actionListId;
  const al = cfg.actionLists?.[alId];
  if (!al) { dropped++; continue; }
  if (!listIndex.has(alId)) {
    listIndex.set(alId, lists.length);
    lists.push(compileList(al));
  }
  const mqs = ev.mediaQueries || [];
  let mq = 0; // all breakpoints
  if (mqs.length && mqs.length < 4) mq = mqs.includes("main") ? "m" : "s";
  const off = ev.config?.scrollOffsetValue || 0;
  const rec = [wfid, type, listIndex.get(alId)];
  if (off || mq) rec.push(off);
  if (mq) rec.push(mq);
  events.push(rec);
}

const data = JSON.stringify({ e: events, l: lists });
const runtime = fs.readFileSync(path.join(root, "src/native/runtime.js"), "utf8");
const out = "window.__IX=" + data + ";\n" + runtime;
fs.writeFileSync(path.join(root, "public/wf/native.js"), out);
console.log(
  `native.js: ${(out.length / 1024).toFixed(1)}KB ` +
  `(${events.length} events, ${lists.length} action lists, ${dropped} dropped as unused)`
);
