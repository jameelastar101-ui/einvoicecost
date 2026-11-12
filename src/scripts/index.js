/* Home page calculator + comparison table.
   Every price comes from src/config/prices.js (single source of truth). */
import { WA, PRICES, SOFTWARE as SW, CONNECTOR_SUB, fmt, price } from "../config/prices.js";

(function(){
  const LOCK_END = new Date("2026-11-30T23:59:59+04:00");
  const HELP = PRICES.help;
  const ORDER = ["qbo","qbd","excel","zoho","tally","wafeq","other"];

  const st = {sw:"qbo", n:500, help:false};
  try{
    const saved = JSON.parse(localStorage.getItem("eic-state") || "null");
    if (saved && SW[saved.sw]) { st.sw = saved.sw; st.n = Math.max(0, +saved.n || 500); st.help = !!saved.help; }
  }catch(e){}
  let touched = false; // bottom bar shows a CTA until the visitor makes a selection
  const touch = () => { touched = true; };
  const save = () => { try{ localStorage.setItem("eic-state", JSON.stringify(st)); }catch(e){} };

  const $ = id => document.getElementById(id);
  const tiles = $("tiles");
  ORDER.forEach(k => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tile"; b.id = "tile-" + k; b.dataset.k = k;
    b.innerHTML = `<span class="t-name">${SW[k].name}</span><span class="t-tag">${SW[k].tag}</span>`;
    b.addEventListener("click", () => { touch(); st.sw = k; render(); save(); });
    tiles.appendChild(b);
  });
  [500,1000,2000,5000].forEach(v => {
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.textContent = fmt(v); c.dataset.v = v;
    c.addEventListener("click", () => { touch(); st.n = v; $("inv").value = fmt(v); render(); save(); });
    $("chips").appendChild(c);
  });
  $("inv").value = fmt(st.n);
  $("inv").addEventListener("input", e => {
    touch();
    const raw = e.target.value.replace(/[^0-9]/g, "").slice(0,7);
    st.n = raw === "" ? 0 : parseInt(raw,10);
    render(); save();
  });
  $("inv").addEventListener("blur", e => { e.target.value = fmt(st.n); });
  $("helpChk").checked = st.help;
  $("helpChk").addEventListener("change", e => { touch(); st.help = e.target.checked; render(); save(); });

  const wa = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const otherMsg = n => `Hi, I use [software name], about ${fmt(n)} invoices a year. Please send me the connector price.`;
  const quoteMsg = (s, n, p) => `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. Your site shows AED ${fmt(p.firstYear)} for the first year and AED ${fmt(p.everyYear)} a year after. I'd like to discuss more.`;

  // gentle number tween
  const tweens = {};
  function tween(el, to){
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = parseFloat((el.dataset.v || "0")) || 0;
    el.dataset.v = to;
    if (reduce || Math.abs(to-from) < 1){ el.textContent = fmt(to); return; }
    cancelAnimationFrame(tweens[el.id]);
    const t0 = performance.now(), d = 320;
    const step = t => { const p = Math.min(1,(t-t0)/d), e = 1-Math.pow(1-p,3);
      el.textContent = fmt(from + (to-from)*e); if (p<1) tweens[el.id] = requestAnimationFrame(step); };
    tweens[el.id] = requestAnimationFrame(step);
  }

  function li(k, v, o = {}){
    return `<li class="${o.hi ? "hi" : ""}"><span class="k">${k}${o.sub ? `<em>${o.sub}</em>` : ""}</span><span class="v${o.txt ? " txt" : ""}">${v}</span></li>`;
  }

  function render(){
    const k = st.sw, s = SW[k], n = st.n;
    document.querySelectorAll("button.tile").forEach(t => t.setAttribute("aria-pressed", t.dataset.k === k ? "true" : "false"));
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", +c.dataset.v === n));
    $("slipSw").textContent = s.name;
    $("guideLink").href = s.guide;
    $("guideLink").textContent = "Read the full " + s.name + " guide →";
    const badge = $("slipBadge");
    badge.textContent = s.own ? "Built-in e-invoicing" : "Needs an ASP";
    badge.className = "badge " + (s.own ? "own" : "need");
    $("helpRow").hidden = !s.own;
    $("switchLine").hidden = s.own;      // "Thinking of switching" only for QuickBooks, Excel and Other
    $("fyPlus").hidden = !s.other;       // "+ connector price" under First year for Other software

    const dayMs = 86400000, left = Math.ceil((LOCK_END - new Date())/dayMs);
    const lockOpen = left > 0;
    $("daysLeft").textContent = lockOpen ? ` (${left} day${left===1?"":"s"} left)` : "";
    $("lockLine").hidden = !lockOpen || (s.own && !st.help);

    const p = price(k, n, st.help);
    tween($("fy"), p.firstYear); tween($("ny"), p.everyYear);
    let L = "", msg, label = "Let's discuss on WhatsApp";
    if (s.own){
      L += li("ASP registration", `Included in ${s.name}`, {txt:1});
      L += li("Auto-send connector", "Built in, free", {txt:1});
      L += li("Platform fee", "Not needed", {txt:1});
      L += li("Setup", st.help ? "AED " + fmt(HELP) : "You do it (steps below)", {txt:!st.help});
      L += li("E-invoicing per year", k === "zoho" ? "AED " + fmt(p.yearly) + " (Zoho packs)" : "AED 0, included", {txt:1});
      $("slipNote").textContent = (k === "zoho"
          ? "Zoho sells e-invoicing in prepaid packs. This is the approximate yearly cost, paid to Zoho."
          : k === "tally" ? "E-invoicing is free in TallyPrime with an active TSS subscription."
          : "E-invoicing is included in paid Wafeq plans.") + " You only pay our setup if you want us to do it.";
      if (st.help){
        msg = `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I'd like you to set up e-invoicing for AED ${fmt(HELP)}. I'd like to discuss more.`;
      } else {
        msg = `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I have a question about e-invoicing setup.`;
        label = "I have a question";
      }
    } else {
      L += li("Onboarding & ASP registration (one time)", "AED " + fmt(p.onboarding));
      L += li("Setup (one time)", "AED " + fmt(p.setup));
      L += k === "excel" ? li("Auto-send connector", "Not needed, you upload", {txt:1})
        : s.other ? li("Auto-send connector (one time)", "Ask us on WhatsApp", {hi:1, sub:"Price depends on your software. " + CONNECTOR_SUB})
        : li("Auto-send connector (one time)", "AED " + fmt(p.connector), {hi:1, sub:CONNECTOR_SUB});
      L += li("Platform fee (per year)", "AED " + fmt(p.platform));
      L += li(`E-invoicing per year (${fmt(n)} invoices)`, "AED " + fmt(p.yearly));
      if (s.other){
        $("slipNote").textContent = "Same prices as every software. Only the connector price depends on your software, so ask us on WhatsApp.";
        msg = otherMsg(n);
        label = "Get my connector price";
      } else {
        $("slipNote").textContent = "Pay for exactly the invoices you send. Paid yearly in advance. Supplier invoices are free.";
        msg = quoteMsg(s, n, p);
      }
    }
    $("lines").innerHTML = L;
    const dockPrice = `<small>${s.name} · first year</small>AED ${fmt(p.firstYear)}${s.other ? " + connector" : ""}`;
    $("ctaLbl").textContent = label;
    $("ctaWa").href = wa(msg);
    const dockFy = $("dockFy");
    if (touched){
      dockFy.classList.remove("cta");
      dockFy.innerHTML = dockPrice;
      $("dockWa").href = wa(msg);
      $("dockWa").textContent = label.replace(" on WhatsApp","");
    } else {
      dockFy.classList.add("cta");
      dockFy.textContent = "Need e-invoice support?";
      $("dockWa").href = wa("Hi, I need help with UAE e-invoicing.");
      $("dockWa").textContent = "WhatsApp Now";
    }
    $("topWa").href = wa("Hi, I have a question about UAE e-invoicing.");
    $("finalWa").href = wa(s.other ? otherMsg(n) : `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. What are the next steps for e-invoicing?`);
    $("switchWa").href = wa(`Hi, I use ${s.own ? "[QuickBooks / Excel]" : s.other ? "[software name]" : s.name}, about ${fmt(n)} invoices a year. I want to switch to Zoho / Tally / Wafeq. Please send me the migration price.`);

    renderCompare();
  }

  // ----- live comparison: spec sheet -----
  const CK = ["tally","zoho","wafeq","qbo","qbd","excel","other"];
  const STEPS5 = {
    tally:["Check: latest TallyPrime release, active TSS, Tally.NET ID, TRN, VAT codes",
      "In TallyPrime, log in to e-Invoicing → press V to open EmaraTax",
      "EmaraTax → E-Invoicing → select “Tally Software Solutions FZCO”",
      "Back in Tally, press S → PEPPOL ID is created",
      "Fix missing customer TRNs and VAT codes, trade licence details, locations"],
    zoho:["Check your plan, TRN, customer TRNs and VAT codes",
      "Settings → E-Invoicing: business name, TIN, TRN, address, EmaraTax email",
      "Log in → E-Invoicing → select “Zoho Software Trading LLC” → verify",
      "Click “Verify & Complete Setup”",
      "Fix missing customer TRNs and VAT codes, trade licence details, locations"],
    wafeq:["Check plan (Starter or above), TRN, customer TRNs and VAT codes",
      "In Wafeq, follow the “Switch on e-invoicing” prompt",
      "EmaraTax → E-Invoicing → select Wafeq → verify",
      "Back in Wafeq, check the status shows “Active”",
      "Fix missing customer TRNs and VAT codes, trade licence details, locations"]
  };
  const ctaLabel = k => SW[k].own ? "Do it for me" : SW[k].other ? "Ask for price" : "Let's discuss";
  (function buildCompare(){
    const t = $("ct");
    const cols = `<colgroup><col class="c-lab">${CK.map(()=>"<col>").join("")}</colgroup>`;
    const grp = `<thead><tr class="grp"><th></th><th colspan="3" class="g-own"><span>Built-in e-invoicing</span></th><th colspan="4" class="g-need"><span>Needs an accredited provider · we handle it</span></th></tr>`;
    const names = `<tr class="names"><th>Description</th>${CK.map((k,i)=>`<th class="sw c${i}" data-k="${k}" tabindex="0" role="button" aria-label="Show ${SW[k].name} estimate"><span class="n">${SW[k].name}</span><span class="t">${SW[k].own ? "Do it yourself" : "Done for you"}</span><span class="pick">See estimate ↑</span></th>`).join("")}</tr></thead>`;
    const td = (i, html, cls) => `<td class="c${i} ${cls||""}">${html}</td>`;
    const row = (lab, f, cls) => `<tr class="${cls||""}"><td>${lab}</td>${CK.map((k,i)=>f(k,i)).join("")}</tr>`;
    let body = "<tbody>";
    body += row("Onboarding & ASP registration · one time", (k,i)=> SW[k].own ? td(i,"Included","t") : td(i,`<span id="ca-${k}">0</span>`,"v"));
    body += row("Our setup · one time", (k,i)=> SW[k].own ? td(i,"Do it yourself<br>(steps below)","t") : td(i,`<span id="cs-${k}">0</span>`,"v"));
    body += row("Auto-send connector · one time", (k,i)=> SW[k].own ? td(i,"Built in, free","t") : k === "excel" ? td(i,"Not needed, you upload","t") : SW[k].other ? td(i,"Ask us on WhatsApp","t") : td(i,`<span id="cc-${k}">0</span>`,"v"));
    body += row("Platform fee · per year", (k,i)=> SW[k].own ? td(i,"Not needed","t") : td(i,`<span id="cp-${k}">0</span>`,"v"));
    body += row("E-invoicing · per year", (k,i)=> td(i,`<span id="cy-${k}">0</span>`,"v"));
    body += row("Total first year", (k,i)=> td(i,`<small>AED</small><span id="cfy-${k}">0</span>${SW[k].other ? '<small class="plus2">+ connector</small>' : ""}`,"v"), "tot");
    body += row("Want us to do it?", (k,i)=> SW[k].own ? td(i,`+ AED ${fmt(HELP)}`,"t") : td(i,"✓ Included","t ok"), "offer");
    body += row("Total from second year", (k,i)=> td(i,`<small>AED</small><span id="cny-${k}">0</span>`,"v"), "tot");
    body += `<tr class="sect"><td colspan="8">Steps to set up</td></tr>`;
    for (let s = 0; s < 5; s++){
      body += `<tr class="st"><td>${s+1}</td>` + ["tally","zoho","wafeq"].map((k,i)=> td(i, STEPS5[k][s])).join("");
      if (s === 0) body += `<td colspan="4" rowspan="5" class="handle c-handle">
          <p class="handle-big">We handle it<br>for you.</p></td>`;
      body += `</tr>`;
    }
    body += `<tr class="ctarow"><td></td>${CK.map((k,i)=> td(i, `<a class="mini ${SW[k].own ? "line" : "solid"}" id="cl-${k}" href="#" target="_blank" rel="noopener">${ctaLabel(k)}</a><a class="glink" href="${SW[k].guide}">Full guide →</a>`)).join("")}</tr>`;
    body += "</tbody>";
    t.innerHTML = cols + grp + names + body;
    $("cmpCards").innerHTML = ORDER.map(k => `<div class="mc"><div class="mc-head"><span class="mc-name">${SW[k].name}</span><span class="badge ${SW[k].own ? "own" : "need"}">${SW[k].own ? "Built-in" : "Needs an ASP"}</span></div><div class="mc-tot"><div><p class="lab">First year</p><p class="mval"><small>AED</small><span id="mfy-${k}">0</span></p>${SW[k].other ? '<p class="plus">+ connector price</p>' : ""}</div><div><p class="lab">Every year after</p><p class="mval"><small>AED</small><span id="mny-${k}">0</span></p></div></div><p class="mc-note" id="mnote-${k}"></p><div class="mc-cta"><a class="mini ${SW[k].own ? "line" : "solid"}" id="ml-${k}" href="#" target="_blank" rel="noopener">${ctaLabel(k)}</a><a class="glink" href="${SW[k].guide}">Full guide →</a></div></div>`).join("");

    // column hover + select
    const colOf = el => { const m = (el.className.match(/\bc(\d)\b/)||[])[1]; return m === undefined ? -1 : +m; };
    t.addEventListener("mouseover", e => {
      const cell = e.target.closest("td,th"); if (!cell) return;
      const c = colOf(cell);
      t.querySelectorAll(".is-hov").forEach(x => x.classList.remove("is-hov"));
      if (c >= 0) t.querySelectorAll(".c" + c).forEach(x => x.classList.add("is-hov"));
    });
    t.addEventListener("mouseleave", () => t.querySelectorAll(".is-hov").forEach(x => x.classList.remove("is-hov")));
    const pick = th => { touch(); st.sw = th.dataset.k; save(); render();
      document.querySelector(".calc").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); };
    t.querySelectorAll("th.sw").forEach(th => {
      th.addEventListener("click", () => pick(th));
      th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(th); } });
    });

    $("cmpInv").addEventListener("input", e => {
      touch();
      const raw = e.target.value.replace(/[^0-9]/g, "").slice(0,7);
      st.n = raw === "" ? 0 : parseInt(raw,10);
      $("inv").value = fmt(st.n); render(); save();
    });
    $("cmpInv").addEventListener("blur", e => { e.target.value = fmt(st.n); });
    $("cmpRange").addEventListener("input", e => {
      touch();
      st.n = parseInt(e.target.value,10);
      $("inv").value = fmt(st.n); $("cmpInv").value = fmt(st.n); render(); save();
    });
  })();

  let lastN = null;
  function renderCompare(){
    const n = st.n;
    if (document.activeElement !== $("cmpInv")) $("cmpInv").value = fmt(n);
    if (document.activeElement !== $("cmpRange")) $("cmpRange").value = Math.min(10000, n);
    const t = $("ct");
    CK.forEach(k => {
      const p = price(k, n, false), s = SW[k];
      if (!s.own){
        tween($("ca-"+k), p.onboarding); tween($("cs-"+k), p.setup); tween($("cp-"+k), p.platform);
        if (k !== "excel" && !s.other) tween($("cc-"+k), p.connector);
      }
      tween($("cy-"+k), p.yearly); tween($("cfy-"+k), p.firstYear); tween($("cny-"+k), p.everyYear);
      if (lastN !== null && lastN !== n){
        [$("cfy-"+k).parentElement, $("cny-"+k).parentElement].forEach(c => { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); });
      }
      const msg = s.other ? otherMsg(n)
        : s.own ? `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I'd like you to set up e-invoicing for AED ${fmt(HELP)}.`
        : quoteMsg(s, n, p);
      $("cl-"+k).href = wa(msg);
      $("mfy-"+k).textContent = fmt(p.firstYear); $("mny-"+k).textContent = fmt(p.everyYear);
      $("mnote-"+k).textContent = s.own
        ? (k === "zoho" ? "Zoho packs about AED " + fmt(p.yearly) + " a year. Set it up yourself free, or we do it for AED " + fmt(HELP) + "." : "No e-invoicing fee. Set it up yourself free, or we do it for AED " + fmt(HELP) + ".")
        : s.other ? "Same prices as every software. Only the connector price depends on your software. Ask us on WhatsApp."
        : "Onboarding & ASP AED " + fmt(p.onboarding) + " + setup AED " + fmt(p.setup) + (k === "excel" ? "" : " + connector AED " + fmt(p.connector)) + " + platform fee AED " + fmt(p.platform) + " + AED " + fmt(p.yearly) + " a year. We handle everything.";
      $("ml-"+k).href = wa(msg);
    });
    lastN = n;
  }

  render();
})();
