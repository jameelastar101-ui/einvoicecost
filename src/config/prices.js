/**
 * SINGLE SOURCE OF TRUTH for every price on einvoicecost.ae.
 *
 * Used by: the home calculator + comparison table (src/scripts/index.js),
 * the shared price box (src/scripts/pricebox.js), the guide-page price tables
 * (src/components/PriceTable.astro) and the price text/FAQ/meta in the pages.
 *
 * To change a price, edit it HERE only. Then update the hand-written text files
 * public/llms.txt and public/pricing.md (they are plain text, not generated).
 * All prices are AED, excluding 5% VAT.
 */

export const WA = "971508759256";
export const PRICES_CHECKED = "11 November 2026";

export const PRICES = {
  onboarding: 1000, // Onboarding & ASP registration, one time
  setup: 1500, // Setup, one time, same for every software
  platform: 1000, // Platform fee, per year
  help: 1500, // "We do it" setup for Zoho / Tally / Wafeq, one time
  // Auto-send connector, one time. 0 = not needed, null = quoted on WhatsApp
  connector: { qbo: 2000, qbd: 3000, excel: 0, other: null },
  feeMin: 500, // e-invoicing per year up to feeCovered invoices
  feeCovered: 500,
  feePerExtra: 0.75, // per invoice above feeCovered
};

/** Invoice counts shown in the guide-page price tables. */
export const TABLE_INVOICES = [300, 500, 1000, 2000, 5000, 10000];

export const CONNECTOR_SUB =
  "Sends each invoice from your software to the FTA and your customer automatically.";

/** Software that needs an outside ASP (we charge) vs built-in ASP (Zoho, Tally, Wafeq). */
export const SOFTWARE = {
  qbo: { name: "QuickBooks Online", own: false, tag: "Needs an ASP", guide: "/quickbooks-online" },
  qbd: { name: "QuickBooks Desktop", own: false, tag: "Needs an ASP", guide: "/quickbooks-desktop" },
  excel: { name: "Excel / manual", own: false, tag: "No software", guide: "/excel" },
  other: { name: "Other software", own: false, other: true, tag: "Odoo, Sage, Xero and more", guide: "/other-software" },
  zoho: { name: "Zoho Books", own: true, tag: "Built-in", guide: "/zoho-books" },
  tally: { name: "Tally Prime", own: true, tag: "Built-in", guide: "/tally" },
  wafeq: { name: "Wafeq", own: true, tag: "Built-in", guide: "/wafeq" },
};

export const fmt = (n) => Math.round(n).toLocaleString("en-US");
export const aed = (n) => "AED " + fmt(n);

/** E-invoicing fee per year for n invoices (exact count above 500, no slabs). */
export const invoiceFee = (n) =>
  n <= PRICES.feeCovered ? PRICES.feeMin : PRICES.feeMin + PRICES.feePerExtra * (n - PRICES.feeCovered);

/** Zoho sells e-invoicing in prepaid packs; approximate yearly cost paid to Zoho. */
export const zohoFee = (n) => {
  if (n <= 0) return 0;
  if (n >= 10000) return n * 0.27;
  const rate = n >= 5000 ? 0.3 : n >= 1000 ? 0.33 : 0.37;
  const cap = n >= 5000 ? 2700 : n >= 1000 ? 1500 : 330;
  return Math.min(n * rate, cap);
};

const connectorOf = (k) => {
  const c = PRICES.connector[k];
  return typeof c === "number" ? c : 0;
};

/**
 * Full price breakdown for a software and invoice count.
 * For "other", firstYear EXCLUDES the connector (shown as "+ connector price").
 */
export function price(k, n, help = false) {
  const s = SOFTWARE[k];
  if (s.own) {
    const yearly = k === "zoho" ? zohoFee(n) : 0;
    return { onboarding: 0, setup: help ? PRICES.help : 0, connector: 0, platform: 0, yearly, firstYear: yearly + (help ? PRICES.help : 0), everyYear: yearly };
  }
  const yearly = invoiceFee(n);
  const connector = connectorOf(k);
  return {
    onboarding: PRICES.onboarding,
    setup: PRICES.setup,
    connector,
    platform: PRICES.platform,
    yearly,
    firstYear: PRICES.onboarding + PRICES.setup + connector + PRICES.platform + yearly,
    everyYear: PRICES.platform + yearly,
  };
}

/** Number formatted for use in copy, e.g. firstYearText("qbo") -> "6,000" (at 500 invoices). */
export const firstYearText = (k, n = PRICES.feeCovered) => fmt(price(k, n).firstYear);
export const everyYearText = (n = PRICES.feeCovered) => fmt(PRICES.platform + invoiceFee(n));
export const connectorText = (k) => fmt(PRICES.connector[k]);

/** Rows for a guide-page price table. */
export const tableRows = (k) =>
  TABLE_INVOICES.map((n) => {
    const p = price(k, n);
    return { n, ...p };
  });
