# einvoicecost.ae

UAE e-invoicing cost calculator and software guides, built with [Astro](https://astro.build) and deployed on Netlify.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `dist/` (also generates `sitemap-index.xml`) |
| `npm run preview` | Preview the production build |

## Structure

- `src/layouts/BaseLayout.astro` - head, SEO, Open Graph/Twitter, canonical, JSON-LD (ProfessionalService always; FAQPage and BreadcrumbList from `faqs` / `breadcrumbs` props)
- `src/pages/*.astro` - home calculator + 7 software guides + the switch-software page
- `src/styles/home.css`, `guide.css` - design tokens (`--navy: #12305A`, `--surface: #FFFFFF`, ...) and page styles
- `src/config/prices.js` - single source of truth for every price
- `src/components/PriceBox.astro`, `PriceTable.astro` - shared price box and price tables used on every guide page
- `src/scripts/*.js` - calculator, price box and per-page behaviour
- `public/` - `robots.txt`, `llms.txt`, `pricing.md`, `_redirects`, favicon, `og-image.png`

## Deploy (Netlify)

Connect the GitHub repo; `netlify.toml` sets build command `npm run build` and publish dir `dist`. Pages use extensionless URLs (`/tally`) to match the existing site.

## Updating prices

All prices live in ONE file: `src/config/prices.js`. It feeds the home calculator and comparison table (`src/scripts/index.js`), the shared price box (`src/components/PriceBox.astro` + `src/scripts/pricebox.js`), the guide-page price tables (`src/components/PriceTable.astro`) and the price text, FAQ schema and meta descriptions in the pages. Change a price there, rebuild, then update the two hand-written text files `public/llms.txt` and `public/pricing.md` and the "Prices checked" date (`PRICES_CHECKED`).
