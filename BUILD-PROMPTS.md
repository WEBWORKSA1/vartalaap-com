# Vartalaap.com — Phase-wise Build Prompts

Use these prompts in order to rebuild, extend or hand off the site. Each phase is self-contained and testable.

**Global constraints for every phase**
- Static site for **GitHub Pages free plan** (Jekyll layout, no server code). Repo: `WEBWORKSA1/vartalaap-com`. Custom domain `vartalaap.com` via `CNAME`.
- AdSense in `<head>` of every page: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`; `ads.txt` = `google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`.
- Top of every page: "Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership" linked to `https://web.works/contact`.
- All forms post to one private inbox via FormSubmit AJAX; the address is **encoded in `main.js` and never appears in HTML, text or `mailto:` markup**. No other email anywhere.
- Trademark/copyright disclosure in the footer and at `/trademark.html`: "vartalaap" is a common Hindi word used descriptively; no exclusive rights claimed; no affiliation.
- Responsive (mobile-first, 16px gutters, no horizontal scroll), light/dark themes, WCAG AA contrast, keyboard accessible, reduced-motion support.

---

## Phase 1 — Strategy & information architecture
> Define Vartalaap.com as a speaking-first conversation-practice hub with three tracks: spoken English for Hindi speakers, conversational Hindi for global learners, interview & GD prep. Produce a sitemap: Home, Phrasebook, Conversation Lab, Tools, Interview & GD, Level Test, Find a Coach (lead gen), Learn (guides hub + 8 guides), Videos, Speak-Off (contest), Support (donations), Careers, Advertise & Partner, About, Contact, Privacy, Terms, Cookies, Disclaimer, Trademark, 404. Document monetisation (AdSense auto ads, coach leads, institute partnerships, sponsorships, supporters) and benchmark 35 competitor sites in `RESEARCH.md`.

## Phase 2 — Design system & shared layout
> Create `_layouts/default.html` with SEO meta, Open Graph, canonical, JSON-LD (WebSite + optional per-page schema via front matter), Google Fonts (Fraunces display, Plus Jakarta Sans body, Mukta for Devanagari), AdSense script, the web.works contact top bar, sticky header with speech-bubble logo, mobile menu, footer with newsletter, link columns and trademark disclosure, mobile sticky CTA bar and cookie banner. Build `assets/css/style.css` with tokens on `:root`, dark mode via `prefers-color-scheme` and `[data-theme]`, cards, bands, forms, chips, multistep, quiz, flashcards, video facades, tables, countdown and responsive breakpoints at 980px and 640px.

## Phase 3 — Content data
> Write `assets/js/data.js` with (a) 140+ original English–Hindi phrases across 13 categories, each with Devanagari and readable romanisation; (b) 9 role-play scenes (5 English workplace/daily, 4 Hindi family/travel) with translations for Hindi lines; (c) 30 regex patterns for common Indian-English slips with plain-language fixes.

## Phase 4 — Interactive engine (`assets/js/main.js`)
> Implement: theme toggle, mobile menu, active nav, reveal-on-scroll, cookie consent, encoded-inbox AJAX forms with honeypot and success states, 3-step lead form with validation, `?goal=` prefill, level-result attachment to leads, YouTube click-to-load facades with category filter, animated hero chat, phrase of the day, phrasebook search/categories/favourites/audio (Web Speech synthesis en-IN/hi-IN), flashcards (both directions, shuffle), Conversation Lab (TTS for partner lines, SpeechRecognition for learner lines, order-aware LCS match score, scene score saved locally), pace & filler meter, transcript filler counter, Indian-English fixer, IELTS band estimator with official rounding, just-a-minute timer, 28-day streak tracker, 12-question CEFR-style level test, Tell-me-about-yourself builder with audio, GD topic generator, contest countdown to last Sunday 18:00 IST.

## Phase 5 — Core pages
> Build Home (hero, phrase of day, three tracks, how it works, tool cards, coach band, video teaser, contest teaser, FAQ with FAQPage schema), Phrasebook, Conversation Lab, Tools (6 tabs, deep-linkable by hash), Interview & GD (builder, 30 questions in accordions, GD generator and phrases), Level Test (intro → quiz → result with coach CTA and CEFR table), Videos (10 verified YouTube talks with practice tasks + Hindi channel links).

## Phase 6 — Lead generation (conversion core)
> Build `/coach.html`: benefit-led hero, 3-step form (goal + level → timeline + budget + slots + medium → contact + consent), trust microcopy, "how matching works", track cards, FAQ, Service schema. Every CTA across the site routes here, with `?goal=` prefill from interview/IELTS/Hindi contexts. Partner side: institute lead partnership on `/advertise.html#institutes`.

## Phase 7 — Community & revenue pages
> Build Speak-Off contest (live countdown, monthly topic, prize tiers funded by pool, judging rubric, rules, entry form with consent and guardian checkbox), Support (where money goes, ₹ tiers with $ equivalents, sponsor-a-learner, pledge form that triggers a secure payment link — never collects card data), Careers (9 roles, hiring steps, anti-fraud note, application form), Advertise & Partner (6 packages, standards, enquiry form incl. "buying the domain").

## Phase 8 — Content for AdSense approval
> Write 8 original, people-first guides (600–1,000 words each, tables, internal links into tools): improve spoken English at home, 25 Indian-English mistakes, Tell me about yourself, GD tips, basic Hindi conversation, Hindi travel phrases, IELTS speaking, stop hesitating. Add a searchable guides hub. Avoid thin pages, scraped text and fake testimonials.

## Phase 9 — Compliance & SEO
> Add Privacy (AdSense cookie disclosure, opt-out links, speech-data handling, DPDP/GDPR rights, under-13 policy), Terms (incl. contest rules and contribution terms), Cookies, Disclaimer, Trademark & Copyright, About, Contact, 404. Generate `sitemap.xml`, `robots.txt` (allow Mediapartners-Google), `ads.txt`, `site.webmanifest`, favicon and OG image.

## Phase 10 — QA, deploy, grow
> Validate every page renders, no console errors, forms submit, no plain-text email anywhere (`grep -r "@gmail"` must return nothing). Push to `main`, enable Pages (Deploy from branch → `main` / root), set DNS (A: 185.199.108–111.153; CNAME www → webworksa1.github.io), enforce HTTPS, then apply to AdSense. Post-launch: add 2 guides/week, a new Lab scene/month, Search Console, and run the Speak-Off monthly.
