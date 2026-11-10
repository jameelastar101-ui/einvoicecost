(function(){
  const WA = "971508759256";
  const LOCK_END = new Date("2026-11-30T23:59:59+04:00");
  const FEE = {min:500, covered:500, perExtra:0.75};
  const SW = {
    tally:{name:"Tally Prime", own:true, tag:"Built-in"},
    zoho:{name:"Zoho Books", own:true, tag:"Built-in"},
    wafeq:{name:"Wafeq", own:true, tag:"Built-in"},
    qbo:{name:"QuickBooks Online", own:false, asp:1000, setup:3000, tag:"Needs an ASP"},
    qbd:{name:"QuickBooks Desktop", own:false, asp:1000, setup:4000, tag:"Needs an ASP"},
    excel:{name:"Excel / manual", own:false, asp:1000, setup:2000, tag:"No software"},
    other:{name:"Other software", other:true, tag:"Get a price"}
  };
  const ORDER = ["qbo","qbd","excel","zoho","tally","wafeq"];
  const GUIDE = {"qbo": "quickbooks-online", "qbd": "quickbooks-desktop", "xero": "other-software", "excel": "excel", "zoho": "zoho-books", "tally": "tally", "wafeq": "wafeq", "other": "other-software"};

  const HELP = 1500;
  const DIY = {
    tally:["Check you have the latest TallyPrime release, active TSS, a Tally.NET ID, your TRN and VAT codes.",
      "Press F11, turn on VAT and e-Invoicing, and enter your TRN, start date and trade licence.",
      "In TallyPrime, log in to e-Invoicing and press V to open EmaraTax.",
      "On EmaraTax, open E-Invoicing, select “Tally Software Solutions FZCO”, verify your email and TIN, and submit.",
      "Back in Tally, press S. Your PEPPOL ID is created. Fix any missing customer TRNs and items.",
      "Send a test invoice and a credit note, then go live."],
    zoho:["Check your plan (Professional or higher), TRN, customer TRNs and VAT codes.",
      "In Zoho Books, go to Settings → E-Invoicing and enter your business name, TIN, TRN, address and EmaraTax email.",
      "On EmaraTax, open E-Invoicing, select “Zoho Software Trading LLC” and verify.",
      "Back in Zoho, click “Verify & Complete Setup”.",
      "Fix any missing customer TRNs and VAT codes.",
      "Send a test invoice and a credit note, then go live."],
    wafeq:["Check your plan (Starter or higher), TRN, customer TRNs and VAT codes.",
      "In Wafeq, follow the “Switch on e-invoicing” prompt.",
      "On EmaraTax, open E-Invoicing, select Wafeq and verify.",
      "Back in Wafeq, check the status shows “Active”.",
      "Fix any missing customer TRNs and VAT codes.",
      "Send a test invoice and a credit note, then go live."]
  };
  const YOU = {
    qbo:["Appoint our accredited partner on EmaraTax. It takes 15 minutes and we guide you on a call.","Log in to QuickBooks once and click “Allow” so we can connect it. Nothing to install."],
    qbd:["Appoint our accredited partner on EmaraTax. It takes 15 minutes and we guide you on a call.","Give us remote access once, so we can install the connector on the computer that runs QuickBooks."],
    xero:["Appoint our accredited partner on EmaraTax. It takes 15 minutes and we guide you on a call.","Log in to Xero once and click “Allow” so we can connect it. Nothing to install."],
    excel:["Appoint our accredited partner on EmaraTax. It takes 15 minutes and we guide you on a call.","Send us a few recent invoices and your customer list."]
  };
  const WE = {
    qbo:["Open your e-invoicing account","Match your VAT codes and items to the government format","Send test invoices and a credit note","Go live, then fix any rejected invoice"],
    qbd:["Open your e-invoicing account","Install and set up the connector","Match your VAT codes and items to the government format","Send test invoices and a credit note, then go live"],
    xero:["Open your e-invoicing account","Match your VAT codes and items to the government format","Send test invoices and a credit note","Go live, then fix any rejected invoice"],
    excel:["Open your e-invoicing account","Build your ready Excel invoice template","Load your customers and items","Test uploads, then show you how to upload each month"]
  };
  const TIME = {qbo:"About 1–2 weeks",qbd:"About 2–3 weeks",xero:"About 1–2 weeks",excel:"About 1 week",tally:"About 1–2 days",zoho:"About 1–2 days",wafeq:"About 1 day"};
  const DAILY = {
    qbo:"Invoice in QuickBooks as usual. Each invoice goes out automatically.",
    qbd:"Invoice in QuickBooks as usual. Keep the QuickBooks computer on and online.",
    xero:"Invoice in Xero as usual. Each invoice goes out automatically.",
    excel:"Fill our template and upload it. Accepted and rejected invoices show in your portal.",
    tally:"Invoice in Tally as usual. Supplier e-invoices are not yet received in Tally.",
    zoho:"Invoice in Zoho as usual. Supplier e-invoices arrive as draft bills.",
    wafeq:"Invoice in Wafeq as usual."
  };

  const fmt = n => Math.round(n).toLocaleString("en-US");
  const ourFee = n => n <= FEE.covered ? FEE.min : FEE.min + FEE.perExtra*(n - FEE.covered);
  const zohoFee = n => {
    if (n <= 0) return 0;
    if (n >= 10000) return n*0.27;
    const rate = n >= 5000 ? 0.30 : n >= 1000 ? 0.33 : 0.37;
    const cap = n >= 5000 ? 2700 : n >= 1000 ? 1500 : 330;
    return Math.min(n*rate, cap);
  };
  function price(key, n, help){
    const s = SW[key];
    if (s.own){
      const yearly = key === "zoho" ? zohoFee(n) : 0;
      return {asp:0, setup: help ? HELP : 0, yearly, fy: yearly + (help ? HELP : 0), ny: yearly};
    }
    const yearly = ourFee(n);
    return {asp:s.asp, setup:s.setup, yearly, fy:s.asp + s.setup + yearly, ny:yearly};
  }

  const st = {sw:"qbo", n:500, help:false};
  try{
    const saved = JSON.parse(localStorage.getItem("eic-state") || "null");
    if (saved && SW[saved.sw] && !SW[saved.sw].other) { st.sw = saved.sw; st.n = Math.max(0, +saved.n || 500); st.help = !!saved.help; }
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
  const ot = document.createElement("a");
  ot.className = "tile wa-tile"; ot.id = "tile-other"; ot.target = "_blank"; ot.rel = "noopener";
  ot.href = `https://wa.me/${WA}?text=${encodeURIComponent("Hi, I use another accounting software: [software name]. Please send me the e-invoicing cost.")}`;
  ot.innerHTML = `<span class="t-name">Other software?</span><span class="t-tag">Message us for the cost →</span>`;
  tiles.appendChild(ot);
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

  function li(k, v, txt){ return `<li><span class="k">${k}</span><span class="v${txt?" txt":""}">${v}</span></li>`; }

  function render(){
    const k = st.sw, s = SW[k], n = st.n;
    document.querySelectorAll("button.tile").forEach(t => t.setAttribute("aria-pressed", t.dataset.k === k ? "true" : "false"));
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", +c.dataset.v === n));
    $("invWrap").hidden = !!s.other;
    $("slipSw").textContent = s.name;
    if (!s.other){ $("guideLink").href = "/" + GUIDE[k]; $("guideLink").textContent = k === "xero" ? "Read about Xero e-invoicing →" : "Read the full " + s.name + " guide →"; }
    const badge = $("slipBadge");
    badge.textContent = s.other ? "Price on request" : s.own ? "Built-in e-invoicing" : "Needs an ASP";
    badge.className = "badge " + (s.own ? "own" : "need");
    $("priceView").hidden = !!s.other;
    $("otherView").hidden = !s.other;
    $("helpRow").hidden = !s.own;

    const dayMs = 86400000, left = Math.ceil((LOCK_END - new Date())/dayMs);
    const lockOpen = left > 0;
    $("daysLeft").textContent = lockOpen ? ` (${left} day${left===1?"":"s"} left)` : "";
    $("lockLine").hidden = !lockOpen || !!s.other || (s.own && !st.help);

    let dockPrice = "";
    let msg, label, checkMsg = `Hi, I use ${s.other ? "my accounting software" : s.name}. I'd like a free e-invoicing check.`;
    if (s.other){
      msg = `Hi, I use another accounting software: [software name]. Please send me the e-invoicing cost.`;
      label = "Get my price on WhatsApp";
      dockPrice = `<small>${s.name}</small>Price on request`;
    } else {
      const p = price(k, n, st.help);
      tween($("fy"), p.fy); tween($("ny"), p.ny);
      let L = "";
      if (s.own){
        L += li("ASP registration", `Included in ${s.name}`, true);
        L += li("Setup", st.help ? "AED " + fmt(HELP) : "You do it (steps below)", !st.help);
        L += li("E-invoicing per year", k === "zoho" ? "AED " + fmt(p.yearly) + " (Zoho packs)" : "AED 0, included", true);
        $("slipNote").textContent = k === "zoho"
          ? "Zoho sells e-invoicing in prepaid packs. This is the approximate yearly cost, paid to Zoho."
          : k === "xero" ? "E-invoicing is included at no extra cost on Xero Starter, Standard and Premium plans, with Casim as the ASP." : k === "tally" ? "E-invoicing is free in TallyPrime with an active TSS subscription."
          : "E-invoicing is included in paid Wafeq plans.";
        if (st.help){
          msg = `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I'd like you to set up e-invoicing for AED ${fmt(HELP)}. I'd like to discuss more.`;
          label = "Let's discuss on WhatsApp";
        } else {
          msg = `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I have a question about e-invoicing setup.`;
          label = "I have a question";
        }
      } else {
        L += li("ASP registration (one time)", "AED " + fmt(p.asp));
        L += li("Setup, connection & matching (one time)", "AED " + fmt(p.setup));
        L += li(`E-invoicing per year (${fmt(n)} invoices)`, "AED " + fmt(p.yearly));
        $("slipNote").textContent = "Pay for exactly the invoices you send. Paid yearly in advance. Supplier invoices are free.";
        msg = `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. Your site shows AED ${fmt(p.fy)} for the first year and AED ${fmt(p.ny)} a year after. I'd like to discuss more.`;
        label = "Let's discuss on WhatsApp";
      }
      $("lines").innerHTML = L;
      dockPrice = `<small>${s.name} · first year</small>AED ${fmt(p.fy)}`;
    }
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
    $("finalWa").href = wa(s.other ? msg : `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. What are the next steps for e-invoicing?`);

    renderCompare();
  }

  function renderHow(k, s){
    if (s.other){
      $("howTitle").textContent = "How it works for other software";
      $("howSub").textContent = "Sage, Odoo, Busy or your own system can usually connect too. We check your software first, then give you a fixed price.";
      $("howMain").innerHTML = `<ol class="steps"><li><span>Message us your software name and invoice count.</span></li><li><span>We check how it can connect and send you a fixed price.</span></li><li><span>You approve, and we set it up like any other software.</span></li></ol>`;
      $("howFacts").innerHTML = "";
      return;
    }
    $("howTitle").textContent = "How it works for " + s.name;
    if (s.own){
      $("howSub").textContent = `${s.name} has e-invoicing built in, so you can set it up yourself with these steps. If you'd rather not, we do it for AED ${fmt(HELP)}.`;
      $("howMain").innerHTML = `<ol class="steps">${DIY[k].map(x => `<li><span>${x}</span></li>`).join("")}</ol>`;
    } else {
      $("howSub").textContent = `${s.name} has no built-in e-invoicing, so it needs an accredited service provider. You do two small things. We do the rest.`;
      $("howMain").innerHTML = `<div class="split">
        <div class="who"><h3>You do</h3><ul>${YOU[k].map(x=>`<li>${x}</li>`).join("")}</ul></div>
        <div class="who us"><h3>We do</h3><ul>${WE[k].map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`;
    }
    $("howFacts").innerHTML =
      `<div class="fact"><span class="k">Time to go live</span><span class="v">${TIME[k]}</span></div>
       <div class="fact"><span class="k">Your time</span><span class="v">${s.own ? (st.help ? "Under 30 minutes" : "A few hours") : "Under 1 hour"}</span></div>
       <div class="fact"><span class="k">After go-live</span><span class="v">${DAILY[k]}</span></div>`;
  }

  // ----- live comparison: spec sheet -----
  const CK = ["tally","zoho","wafeq","qbo","qbd","excel"];
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
    xero:["Check plan (Starter, Standard or Premium), TRN, customer TRNs and tax rates",
      "Sign in to Invoici with your Xero login",
      "Connect the Xero organisation you want to register",
      "EmaraTax → E-Invoicing → select Casim → verify",
      "Finish setup in Invoici, then send a test invoice and credit note"],
    wafeq:["Check plan (Starter or above), TRN, customer TRNs and VAT codes",
      "In Wafeq, follow the “Switch on e-invoicing” prompt",
      "EmaraTax → E-Invoicing → select Wafeq → verify",
      "Back in Wafeq, check the status shows “Active”",
      "Fix missing customer TRNs and VAT codes, trade licence details, locations"]
  };
  (function buildCompare(){
    const t = $("ct");
    const cols = `<colgroup><col class="c-lab">${CK.map(()=>"<col>").join("")}</colgroup>`;
    const grp = `<thead><tr class="grp"><th></th><th colspan="3" class="g-own"><span>Built-in e-invoicing</span></th><th colspan="3" class="g-need"><span>Needs an accredited provider · we handle it</span></th></tr>`;
    const names = `<tr class="names"><th>Description</th>${CK.map((k,i)=>`<th class="sw c${i}" data-k="${k}" tabindex="0" role="button" aria-label="Show ${SW[k].name} estimate"><span class="n">${SW[k].name}</span><span class="t">${SW[k].own ? "Do it yourself" : "Done for you"}</span><span class="pick">See estimate ↑</span></th>`).join("")}</tr></thead>`;
    const td = (i, html, cls) => `<td class="c${i} ${cls||""}">${html}</td>`;
    const row = (lab, f, cls) => `<tr class="${cls||""}"><td>${lab}</td>${CK.map((k,i)=>f(k,i)).join("")}</tr>`;
    let body = "<tbody>";
    body += row("ASP registration · one time", (k,i)=> SW[k].own ? td(i,"Included","t") : td(i,`<span id="ca-${k}">0</span>`,"v"));
    body += row("Our setup · one time", (k,i)=> SW[k].own ? td(i,"Do it yourself<br>(steps below)","t") : td(i,`<span id="cs-${k}">0</span>`,"v"));
    body += row("E-invoicing · per year", (k,i)=> td(i,`<span id="cy-${k}">0</span>`,"v"));
    body += row("Total first year", (k,i)=> td(i,`<small>AED</small><span id="cfy-${k}">0</span>`,"v"), "tot");
    body += row("Want us to do it?", (k,i)=> SW[k].own ? td(i,`+ AED ${fmt(HELP)}`,"t") : td(i,"✓ Included","t ok"), "offer");
    body += row("Total from second year", (k,i)=> td(i,`<small>AED</small><span id="cny-${k}">0</span>`,"v"), "tot");
    body += `<tr class="sect"><td colspan="7">Steps to set up</td></tr>`;
    for (let s = 0; s < 5; s++){
      body += `<tr class="st"><td>${s+1}</td>` + ["tally","zoho","wafeq"].map((k,i)=> td(i, STEPS5[k][s])).join("");
      if (s === 0) body += `<td colspan="3" rowspan="5" class="handle c-handle">
          <p class="handle-big">We handle it<br>for you.</p></td>`;
      body += `</tr>`;
    }
    body += `<tr class="ctarow"><td></td>${CK.map((k,i)=> td(i, `<a class="mini ${SW[k].own ? "line" : "solid"}" id="cl-${k}" href="#" target="_blank" rel="noopener">${SW[k].own ? "Do it for me" : "Let's discuss"}</a><a class="glink" href="/${GUIDE[k]}">Full guide →</a>`)).join("")}</tr>`;
    body += "</tbody>";
    t.innerHTML = cols + grp + names + body;
    $("cmpCards").innerHTML = ORDER.map(k => `<div class="mc"><div class="mc-head"><span class="mc-name">${SW[k].name}</span><span class="badge ${SW[k].own ? "own" : "need"}">${SW[k].own ? "Built-in" : "Needs an ASP"}</span></div><div class="mc-tot"><div><p class="lab">First year</p><p class="mval"><small>AED</small><span id="mfy-${k}">0</span></p></div><div><p class="lab">Every year after</p><p class="mval"><small>AED</small><span id="mny-${k}">0</span></p></div></div><p class="mc-note" id="mnote-${k}"></p><div class="mc-cta"><a class="mini ${SW[k].own ? "line" : "solid"}" id="ml-${k}" href="#" target="_blank" rel="noopener">${SW[k].own ? "Do it for me" : "Let's discuss"}</a><a class="glink" href="/${GUIDE[k]}">Full guide →</a></div></div>`).join("");


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
    const n = st.n, sel = st.sw;
    if (document.activeElement !== $("cmpInv")) $("cmpInv").value = fmt(n);
    if (document.activeElement !== $("cmpRange")) $("cmpRange").value = Math.min(10000, n);
    const t = $("ct"), selIdx = CK.indexOf(sel);
    t.querySelectorAll(".is-sel").forEach(x => x.classList.remove("is-sel"));
    CK.forEach(k => {
      const p = price(k, n, false), s = SW[k];
      if (!s.own){ tween($("ca-"+k), p.asp); tween($("cs-"+k), p.setup); }
      tween($("cy-"+k), p.yearly); tween($("cfy-"+k), p.fy); tween($("cny-"+k), p.ny);
      if (lastN !== null && lastN !== n){
        [$("cfy-"+k).parentElement, $("cny-"+k).parentElement].forEach(c => { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); });
      }
      const msg = s.own
        ? `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. I'd like you to set up e-invoicing for AED ${fmt(HELP)}.`
        : `Hi, I use ${s.name}, about ${fmt(n)} invoices a year. Your site shows AED ${fmt(p.fy)} for the first year and AED ${fmt(p.ny)} a year after. I'd like to discuss more.`;
      $("cl-"+k).href = wa(msg);
      $("mfy-"+k).textContent = fmt(p.fy); $("mny-"+k).textContent = fmt(p.ny);
      $("mnote-"+k).textContent = s.own
        ? (k === "zoho" ? "Zoho packs about AED " + fmt(p.yearly) + " a year. Set it up yourself free, or we do it for AED 1,500." : "No e-invoicing fee. Set it up yourself free, or we do it for AED 1,500.")
        : "ASP registration AED 1,000 + setup AED " + fmt(p.setup) + " + AED " + fmt(p.yearly) + " a year. We handle everything.";
      $("ml-"+k).href = wa(msg);
    });
    lastN = n;
  }

  render();
})();
