# resume.robertino.world

Robertino Calcaterra's resume: a web page (English + Spanish) and an ATS-safe PDF, both generated at build time from **one data file**.

```
resume.json          ← the only file you edit for content (EN + ES)
build/build.mjs      ← orchestrator: JSON → dist/
build/template.mjs   ← HTML generator (UI chrome strings live here)
build/styles.css     ← "Indigo Nights" design system (dark by default, light toggle)
build/pdf.mjs        ← ATS PDF generator (pdfkit, Helvetica, single column)
public/              ← static assets copied as-is (profile photo, company logos)
dist/                ← build output (git-ignored, served by Vercel)
```

## Editing the resume

1. Edit `resume.json`. Every translatable string is an `{ "en": "…", "es": "…" }` object; facts (dates, URLs, names) are shared.
   Dates are `YYYY-MM` or `YYYY`; `"end": null` renders as *Present* / *Actualidad*.
2. Run `npm run build`. The build fails if a meta description reaches 155 characters or a PDF exceeds 2 pages.
3. Commit `resume.json` (and nothing under `dist/`).

## Build output

| File | What it is |
|---|---|
| `dist/index.html` | English page (`https://resume.robertino.world/`) |
| `dist/es/index.html` | Spanish page (`/es/`) |
| `dist/Robertino-Calcaterra-Resume.pdf` | ATS-safe English PDF (2 pages max) |
| `dist/Robertino-Calcaterra-CV-ES.pdf` | ATS-safe Spanish PDF |
| `dist/sitemap.xml`, `dist/robots.txt` | SEO plumbing with `hreflang` alternates |

Language selection: the English page is the default. On first visit, if the browser's primary language is Spanish the page redirects to `/es/`. Choosing a language with the ES/EN toggle is remembered in `localStorage` (`cv_lang`) and wins over the browser language. Theme choice is stored under `cv_theme`.

## Local preview

```bash
npm install
npm run build
npm run preview   # http://localhost:8081
```

## Deployment

Vercel builds the site from `main` using `vercel.json` (`npm run build`, output `dist/`). No browser binaries are required: the PDF is produced with `pdfkit`, so the build runs anywhere Node 18+ runs.

## Privacy

The page and the PDFs expose email and LinkedIn only. Do not add phone numbers or street addresses to `resume.json`.
