/* Shared price box: the same breakdown as the home page estimate.
   Markup: <div class="pbox" data-sw="qbo|qbd|excel|other|zoho|tally|wafeq"></div>  (see src/components/PriceBox.astro)
   All prices come from src/config/prices.js. */
import { WA, PRICES, SOFTWARE, CONNECTOR_SUB, fmt, price } from "../config/prices.js";

const wa = (t) => "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
const li = (k, v, o = {}) =>
  '<li class="' + (o.hi ? "hi" : "") + '"><span class="k">' + k + (o.sub ? "<em>" + o.sub + "</em>" : "") +
  '</span><span class="v' + (o.t ? " t" : "") + '">' + v + "</span></li>";

document.querySelectorAll(".pbox").forEach((box, idx) => {
  const k = box.dataset.sw, s = SOFTWARE[k];
  if (!s) return;
  const id = (p) => "pb" + idx + "-" + p;
  box.innerHTML =
    '<div class="pbox-in"><label class="lab" for="' + id("inv") + '">Your invoices per year</label>' +
    '<div class="inv-box"><input id="' + id("inv") + '" type="text" inputmode="numeric" value="500"><span>invoices / year</span></div>' +
    '<div class="chips" id="' + id("chips") + '"></div>' +
    '<p class="hint">Count sales invoices and credit notes. Above 500, you pay for your exact number of invoices, with no slabs or brackets. Invoices you receive from suppliers are not counted.</p></div>' +
    '<div class="pbox-est" aria-live="polite"><div class="est-head"><div><p class="eyebrow">Estimate · AED · excl. VAT</p><p class="est-sw">' + s.name + "</p></div>" +
    '<span class="badge ' + (s.own ? "own" : "need") + '">' + (s.own ? "Built-in e-invoicing" : "Needs an ASP") + "</span></div>" +
    '<div class="totals"><div><p class="lab">First year</p><p class="val"><small>AED</small><span id="' + id("fy") + '"></span></p>' +
    (s.other ? '<p class="plus">+ connector price</p>' : "") + "</div>" +
    '<div><p class="lab">Every year after</p><p class="val"><small>AED</small><span id="' + id("ny") + '"></span></p></div></div>' +
    '<ul class="lines" id="' + id("lines") + '"></ul>' +
    (s.own ? '<div class="help"><label for="' + id("help") + '"><input type="checkbox" id="' + id("help") + '">Want us to do it?</label><span class="v">+ AED ' + fmt(PRICES.help) + "</span></div>" : "") +
    '<p class="note" id="' + id("note") + '"></p>' +
    '<a class="btn-wa" id="' + id("wa") + '" href="#" target="_blank" rel="noopener"></a></div>';

  let n = 500, help = false;
  const $ = (p) => document.getElementById(id(p));
  [500, 1000, 2000, 5000].forEach((v) => {
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.textContent = fmt(v); c.dataset.v = v;
    c.addEventListener("click", () => { n = v; $("inv").value = fmt(v); render(); });
    $("chips").appendChild(c);
  });
  $("inv").addEventListener("input", (e) => {
    const r = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
    n = r === "" ? 0 : parseInt(r, 10);
    render();
  });
  $("inv").addEventListener("blur", (e) => { e.target.value = fmt(n); });
  if (s.own) $("help").addEventListener("change", (e) => { help = e.target.checked; render(); });

  function render() {
    const p = price(k, n, help);
    let L = "", msg, label = "Let's discuss on WhatsApp";
    if (s.own) {
      L += li("ASP registration", "Included in " + s.name, { t: 1 });
      L += li("Auto-send connector", "Built in, free", { t: 1 });
      L += li("Platform fee", "Not needed", { t: 1 });
      L += li("Setup", help ? "AED " + fmt(PRICES.help) : "You do it (steps below)", { t: !help });
      L += li("E-invoicing per year", k === "zoho" ? "AED " + fmt(p.yearly) + " (Zoho packs)" : "AED 0, included", { t: 1 });
      $("note").textContent =
        (k === "zoho" ? "Zoho sells e-invoicing in prepaid packs. This is the approximate yearly cost, paid to Zoho."
          : k === "tally" ? "E-invoicing is free in TallyPrime with an active TSS subscription."
          : "E-invoicing is included in paid Wafeq plans.") + " You only pay our setup if you want us to do it.";
      msg = help
        ? "Hi, I use " + s.name + ", about " + fmt(n) + " invoices a year. I'd like you to set up e-invoicing for AED " + fmt(PRICES.help) + "."
        : "Hi, I use " + s.name + ", about " + fmt(n) + " invoices a year. I have a question about e-invoicing setup.";
      if (!help) label = "I have a question";
    } else {
      L += li("Onboarding & ASP registration (one time)", "AED " + fmt(p.onboarding));
      L += li("Setup (one time)", "AED " + fmt(p.setup));
      L += k === "excel" ? li("Auto-send connector", "Not needed, you upload", { t: 1 })
        : s.other ? li("Auto-send connector (one time)", "Ask us on WhatsApp", { hi: 1, sub: "Price depends on your software. " + CONNECTOR_SUB })
        : li("Auto-send connector (one time)", "AED " + fmt(p.connector), { hi: 1, sub: CONNECTOR_SUB });
      L += li("Platform fee (per year)", "AED " + fmt(p.platform));
      L += li("E-invoicing per year (" + fmt(n) + " invoices)", "AED " + fmt(p.yearly));
      $("note").textContent = s.other
        ? "Same prices as every software. Only the connector price depends on your software, so ask us on WhatsApp."
        : "Pay for exactly the invoices you send. Paid yearly in advance. Supplier invoices are free.";
      msg = s.other
        ? "Hi, I use [software name], about " + fmt(n) + " invoices a year. Please send me the connector price."
        : "Hi, I use " + s.name + ", about " + fmt(n) + " invoices a year. Your site shows AED " + fmt(p.firstYear) + " for the first year and AED " + fmt(p.everyYear) + " a year after. I'd like to discuss more.";
      if (s.other) label = "Get my connector price";
    }
    $("fy").textContent = fmt(p.firstYear);
    $("ny").textContent = fmt(p.everyYear);
    $("lines").innerHTML = L;
    $("wa").textContent = label;
    $("wa").href = wa(msg);
    $("chips").querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", +c.dataset.v === n));
  }
  render();
});
