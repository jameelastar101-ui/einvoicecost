/* Shared behaviour for every guide page: WhatsApp links, bottom bar, "other software" form.
   Prices are NOT calculated here: the price box (pricebox.js) and the price tables use src/config/prices.js. */
import { WA, PRICES, fmt } from "../config/prices.js";

export function initGuide(C) {
  const wa = (t) => "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
  const $ = (id) => document.getElementById(id);

  if ($("topWa")) $("topWa").href = wa(C.topMsg);
  if ($("dockWa")) $("dockWa").href = wa("Hi, I need help with UAE e-invoicing.");
  ["finalWa", "helpWa"].forEach((id) => {
    const el = $(id);
    if (el) el.href = wa(id === "helpWa" && C.helpMsg ? C.helpMsg : C.ctaMsg);
  });
  const big = $("bigWa");
  if (big) big.href = wa("Hi, I use " + C.name + " and send more than 10,000 invoices a year. Please send me the e-invoicing price.");

  // "We do it" box on Zoho / Tally / Wafeq pages
  if (C.helpMsg === undefined && $("helpWa")) $("helpWa").href = wa("Hi, I use " + C.name + ". I'd like you to set up e-invoicing for AED " + fmt(PRICES.help) + ".");

  // "Other software" request form
  const form = $("priceForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const sw = $("fSw").value.trim() || "[software name]";
      const ni = $("fInv").value.trim() || "[number]";
      const nm = $("fName").value.trim();
      const msg = "Hi" + (nm ? ", I'm " + nm : "") + ". I use " + sw + " and send about " + ni + " invoices a year. Please send me the connector price.";
      window.open(wa(msg), "_blank", "noopener");
    });
    document.querySelectorAll("[data-sw]").forEach((a) => {
      if (a.classList.contains("pbox")) return;
      a.href = wa("Hi, I use " + a.getAttribute("data-sw") + ". Please send me the connector price.");
    });
  }

  // switching links with WhatsApp prefilled text
  document.querySelectorAll("[data-wa]").forEach((a) => { a.href = wa(a.getAttribute("data-wa")); });

  const cur = document.querySelector('.gscroll [aria-current="page"]');
  if (cur && cur.parentNode.scrollWidth > cur.parentNode.clientWidth) cur.parentNode.scrollLeft = cur.offsetLeft - 60;
}
