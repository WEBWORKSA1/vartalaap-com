# Vartalaap.com — Speak with confidence

Free, speaking-first conversation practice: spoken English for Hindi speakers, conversational Hindi for global learners, and interview & GD prep. Monetised with Google AdSense, a coach-matching lead funnel, sponsorships and supporter contributions.

- Static Jekyll site for **GitHub Pages (free plan)**. Shared header, footer and AdSense code live in `_layouts/default.html`; pages hold only their content.
- `assets/css/style.css` — design system (light/dark). `assets/js/main.js` — all interactivity. `assets/js/data.js` — phrases, scenes, error patterns.
- Speech features use the browser's Web Speech API — no backend, no audio stored.
- Forms post via AJAX to a form backend; the destination inbox is encoded in `main.js` and never appears in plain text. **The first submission sends a one-time activation email to the inbox — click it once** or forms won't deliver.
- `ads.txt`, `robots.txt`, `sitemap.xml`, `CNAME` (vartalaap.com) are at the root.

## Publish
1. Settings → Pages → Build and deployment → **Deploy from a branch** → `main` / `/ (root)`.
2. DNS for vartalaap.com: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; CNAME `www` → `webworksa1.github.io`. Then tick **Enforce HTTPS**.
3. Submit `https://vartalaap.com/sitemap.xml` in Google Search Console, then request AdSense review.

See `BUILD-PROMPTS.md` for the phase-wise build prompts and `RESEARCH.md` for idea selection and the 35-site benchmark.

Trademark: "Vartalaap" (वार्तालाप) is a common Hindi word meaning "conversation", used descriptively and as a domain identifier only; no exclusive rights are claimed. See `/trademark.html`.
