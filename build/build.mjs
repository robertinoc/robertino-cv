// Build: resume.json -> dist/ (index.html [EN], es/index.html [ES], PDFs, static assets)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderPage } from './template.mjs'
import { buildPdf } from './pdf.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const data = JSON.parse(fs.readFileSync(path.join(root, 'resume.json'), 'utf8'))
const css = fs.readFileSync(path.join(root, 'build', 'styles.css'), 'utf8')

const MAX_DESC = 155
for (const lang of ['en', 'es']) {
  const len = data.meta.description[lang].length
  if (len >= MAX_DESC) throw new Error(`meta.description.${lang} is ${len} chars; must be under ${MAX_DESC}`)
}

fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(path.join(dist, 'es'), { recursive: true })
fs.cpSync(path.join(root, 'public'), dist, { recursive: true })

const pages = { en: 'index.html', es: path.join('es', 'index.html') }
for (const lang of ['en', 'es']) {
  const html = renderPage(data, lang, { css, pdfFile: data.site.pdf[lang] })
  fs.writeFileSync(path.join(dist, pages[lang]), html)
  console.log(`html  ${pages[lang]}  ${(html.length / 1024).toFixed(1)} KB`)
}

for (const lang of ['en', 'es']) {
  const out = path.join(dist, data.site.pdf[lang])
  const { pages: n } = await buildPdf(data, lang, out)
  console.log(`pdf   ${data.site.pdf[lang]}  ${n} page(s)  ${(fs.statSync(out).size / 1024).toFixed(1)} KB`)
}

fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${data.site.url}/sitemap.xml\n`)
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${data.site.url}/</loc><xhtml:link rel="alternate" hreflang="es" href="${data.site.url}/es/"/><xhtml:link rel="alternate" hreflang="en" href="${data.site.url}/"/></url>
  <url><loc>${data.site.url}/es/</loc><xhtml:link rel="alternate" hreflang="en" href="${data.site.url}/"/><xhtml:link rel="alternate" hreflang="es" href="${data.site.url}/es/"/></url>
</urlset>
`)
console.log('done  dist/')
