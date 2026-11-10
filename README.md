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
- `src/pages/*.astro` - home calculator + 7 software guides
- `src/styles/home.css`, `guide.css` - design tokens (`--navy: #12305A`, `--surface: #FFFFFF`, ...) and page styles
- `src/scripts/*.js` - calculator and per-page price logic
- `public/` - `robots.txt`, `llms.txt`, `pricing.md`, `_redirects`, favicon, `og-image.png`

## Deploy (Netlify)

Connect the GitHub repo; `netlify.toml` sets build command `npm run build` and publish dir `dist`. Pages use extensionless URLs (`/tally`) to match the existing site.

## Updating prices

Prices live in the scripts (`src/scripts/index.js` and each guide script) and in the copy, `public/llms.txt` and `public/pricing.md`. Keep them in sync.
