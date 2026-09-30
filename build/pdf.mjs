// ATS-safe PDF that shares the web page's look: single column, standard headings, real text,
// embedded Sora + Inter, no icons, no emoji, no tables. Colour and shapes are decoration only.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import { t, fmtRange } from './template.mjs'

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fonts')
const FONTS = {
  display: 'Sora-Bold.woff',
  displaySemi: 'Sora-SemiBold.woff',
  body: 'Inter-Regular.woff',
  medium: 'Inter-Medium.woff',
  semi: 'Inter-SemiBold.woff',
  italic: 'Inter-Italic.woff'
}

// "Indigo Nights" tokens (same as build/styles.css)
const C = {
  ink: '#0d1117', text: '#1e293b', muted: '#64748b', faint: '#94a3b8',
  indigo: '#7c3aed', indigoLight: '#a78bfa', teal: '#14b8a6', amber: '#d97706',
  light: '#f8fafc', light2: '#eef2ff', border: '#e2e8f0', pillFill: '#f1f5f9'
}
const GROUP_COLORS = { indigo: C.indigo, teal: C.teal, amber: C.amber, white: C.muted }
// light tints for chip backgrounds (pdfkit has no alpha hex, so tints are explicit)
const TINTS = {
  indigo: { fill: '#f3eefe', stroke: '#dcd0fb' },
  teal:   { fill: '#e6faf6', stroke: '#b9ece3' },
  amber:  { fill: '#fdf3e2', stroke: '#f6dcae' },
  white:  { fill: '#f8fafc', stroke: '#e2e8f0' }
}

const HEADINGS = {
  en: { summary: 'Summary', experience: 'Experience', projects: 'Projects', skills: 'Skills', education: 'Education', certifications: 'Certifications', languages: 'Languages', interests: 'Interests', langInterests: 'Languages & Interests', founder: 'Founder', page: 'Page' },
  es: { summary: 'Resumen', experience: 'Experiencia', projects: 'Proyectos', skills: 'Habilidades', education: 'Formación', certifications: 'Certificaciones', languages: 'Idiomas', interests: 'Intereses', langInterests: 'Idiomas e intereses', founder: 'Fundador', page: 'Página' }
}

const MAX_PAGES = Number(process.env.PDF_MAX_PAGES || 2)

export function buildPdf(data, lang, outPath) {
  const H = HEADINGS[lang]
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 46, left: 48, right: 48 },
      bufferPages: true,
      pdfVersion: '1.5',
      lang,
      displayTitle: true,
      info: {
        Title: `${data.name} – ${t(data.jobTitle, lang)}`,
        Author: data.name,
        Subject: t(data.meta.description, lang),
        Keywords: data.skills.flatMap(g => g.items || g.lines.flatMap(l => l.items)).join(', '),
        Creator: 'resume.robertino.world build'
      }
    })
    for (const [key, file] of Object.entries(FONTS)) doc.registerFont(key, path.join(FONT_DIR, file))

    const stream = fs.createWriteStream(outPath)
    doc.pipe(stream)

    const x = doc.page.margins.left
    const w = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const bottom = () => doc.page.height - doc.page.margins.bottom
    const ensure = (h) => { if (doc.y + h > bottom()) doc.addPage() }
    const strip = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

    // ── primitives ──────────────────────────────────────────────────────────
    const heading = (label) => {
      ensure(40)
      doc.moveDown(0.35)
      const y = doc.y + 3
      doc.rect(x, y, 18, 2).fill(C.indigo)                     // eyebrow bar (like .section-eyebrow::before)
      doc.font('displaySemi').fontSize(9.2).fillColor(C.indigo)
        .text(label.toUpperCase(), x + 26, y - 4, { width: w - 26, characterSpacing: 0.8, lineBreak: false })
      const ry = y + 12
      doc.moveTo(x, ry).lineTo(x + w, ry).lineWidth(0.6).strokeColor(C.border).stroke()
      doc.y = ry + 8
    }

    const pill = (text, rightX, y) => {
      doc.font('medium').fontSize(7.6)
      const tw = doc.widthOfString(text)
      const pw = tw + 14, ph = 14
      const px = rightX - pw
      doc.roundedRect(px, y - 1, pw, ph, 7).fillAndStroke(C.pillFill, C.border)
      doc.fillColor(C.muted).text(text, px + 7, y + 2.4, { lineBreak: false })
      return pw
    }

    const chips = (items, { color = C.muted, fill = C.light, stroke = C.border, font = 'medium', size = 7.2, x0 = x, width = w } = {}) => {
      const padX = 5, h = 12, gap = 3
      doc.font(font).fontSize(size)
      let cx = x0
      ensure(h + 4)
      let rowY = doc.y
      for (const item of items) {
        const cw = doc.widthOfString(item) + padX * 2
        if (cx + cw > x0 + width) {                              // wrap
          cx = x0; rowY += h + gap
          if (rowY + h > bottom()) { doc.addPage(); rowY = doc.y }
        }
        doc.roundedRect(cx, rowY, cw, h, 4).fillAndStroke(fill, stroke)
        doc.fillColor(color).text(item, cx + padX, rowY + 2.7, { lineBreak: false })
        cx += cw + gap
      }
      doc.y = rowY + h + 4
    }

    const bullet = (text) => {
      ensure(26)
      const y = doc.y
      doc.font('semi').fontSize(9).fillColor(C.indigo).text('•', x + 3, y, { lineBreak: false })
      doc.font('body').fontSize(8.7).fillColor(C.text).text(text, x + 14, y, { width: w - 14, lineGap: 0.45 })
      doc.y += 0.8
    }

    // role (bold) + date pill on the right; then company · location
    const entry = ({ role, org, orgLink, location, dates }) => {
      ensure(48)
      const y = doc.y
      doc.font('medium').fontSize(7.6)
      const pw = doc.widthOfString(dates) + 14
      doc.font('displaySemi').fontSize(10.4).fillColor(C.ink).text(role, x, y, { width: w - pw - 10 })
      const yAfterRole = doc.y
      pill(dates, x + w, y + 1)
      doc.y = yAfterRole + 1
      doc.font('semi').fontSize(8.8).fillColor(C.indigo)
        .text(org, x, doc.y, { continued: !!location, link: orgLink || null, underline: false })
      if (location) {
        doc.font('italic').fontSize(8.4).fillColor(C.muted).text(`   ${location}`, { link: null })
      }
      doc.y += 3
    }


    // chips row count for a given width (used to size the featured box before drawing it)
    const chipRows = (items, width, { font = 'medium', size = 7.2 } = {}) => {
      const padX = 5, gap = 3
      doc.font(font).fontSize(size)
      let cx = 0, rows = 1
      for (const item of items) {
        const cw = doc.widthOfString(item) + padX * 2
        if (cx + cw > width && cx > 0) { cx = 0; rows++ }
        cx += cw + gap
      }
      return rows
    }

    // Founder project as a featured timeline entry: tinted box with a left accent bar,
    // FOUNDER label + date pill, tagline, focus chips and the URL. All real text.
    const featuredEntry = (p) => {
      const pad = 9, innerX = x + pad + 4, innerW = w - pad * 2 - 4
      const dates = fmtRange(p.start, p.end, lang)
      const tagline = t(p.tagline, lang)
      // measure
      doc.font('displaySemi').fontSize(10.4)
      const roleH = doc.heightOfString(p.name, { width: innerW - 150 })
      doc.font('body').fontSize(8.8)
      const tagH = doc.heightOfString(tagline, { width: innerW, lineGap: 1 })
      const rows = p.focus?.length ? chipRows(p.focus, innerW) : 0
      const chipsH = rows ? rows * (12 + 3) + 4 : 0
      const boxH = pad + roleH + 13 + 3 + tagH + 5 + chipsH + 12 + pad - 2
      ensure(boxH + 4)
      const y0 = doc.y
      // box + accent bar
      doc.roundedRect(x, y0, w, boxH, 6).fillAndStroke(TINTS.indigo.fill, TINTS.indigo.stroke)
      const bar = doc.linearGradient(x, y0, x, y0 + boxH)
      bar.stop(0, C.indigo).stop(1, C.teal)
      doc.roundedRect(x, y0, 3.5, boxH, 1.5).fill(bar)
      // header: name + pills
      let cy = y0 + pad
      doc.font('medium').fontSize(7.6)
      const dw = doc.widthOfString(dates) + 14
      const fw = doc.widthOfString(H.founder.toUpperCase()) + 14
      doc.font('displaySemi').fontSize(10.4).fillColor(C.ink).text(p.name, innerX, cy, { width: innerW - dw - fw - 14, lineBreak: false })
      pill(dates, x + w - pad, cy + 1)
      // founder label pill (teal)
      const fx = x + w - pad - dw - 5 - fw
      doc.roundedRect(fx, cy, fw, 14, 7).fillAndStroke(TINTS.teal.fill, TINTS.teal.stroke)
      doc.font('semi').fontSize(6.8).fillColor(C.teal).text(H.founder.toUpperCase(), fx + 7, cy + 3.6, { lineBreak: false, characterSpacing: 0.6 })
      cy += roleH + 2
      doc.font('semi').fontSize(8.8).fillColor(C.indigo)
        .text(t(p.role, lang), innerX, cy, { continued: true, lineBreak: false })
        .fillColor(C.faint).text('   ·   ', { continued: true, link: null })
        .fillColor(C.indigo).text(p.display || strip(p.url), { link: p.url, underline: false, lineBreak: false })
      cy += 14
      doc.font('body').fontSize(8.8).fillColor(C.text).text(tagline, innerX, cy, { width: innerW, lineGap: 1 })
      cy = doc.y + 5
      if (rows) {
        doc.y = cy
        const savedX = x
        // draw chips inside the box using the shared helper on a narrower column
        const padX = 5, h = 12, gap = 3
        doc.font('medium').fontSize(7.2)
        let cx = innerX, rowY = cy
        for (const item of p.focus) {
          const cw = doc.widthOfString(item) + padX * 2
          if (cx + cw > innerX + innerW) { cx = innerX; rowY += h + gap }
          doc.roundedRect(cx, rowY, cw, h, 4).fillAndStroke('#ffffff', TINTS.teal.stroke)
          doc.fillColor(C.teal).text(item, cx + padX, rowY + 2.7, { lineBreak: false })
          cx += cw + gap
        }
        void savedX
      }
      doc.y = y0 + boxH + 5
    }

    // ── header ──────────────────────────────────────────────────────────────
    const [first, ...rest] = data.name.split(' ')
    doc.font('display').fontSize(26).fillColor(C.ink)
      .text(`${first} `, x, doc.y, { continued: true, characterSpacing: -0.4 })
      .fillColor(C.indigo).text(rest.join(' '), { characterSpacing: -0.4 })
    doc.moveDown(0.25)
    doc.font('displaySemi').fontSize(9.8).fillColor(C.text).text(t(data.title, lang), x, doc.y, { width: w, lineGap: 1 })
    doc.moveDown(0.35)
    doc.font('body').fontSize(8.6).fillColor(C.muted).text(t(data.headline, lang), x, doc.y, { width: w, lineGap: 1 })
    doc.moveDown(0.55)

    // contact row: email · linkedin · location (links are real text + link annotations)
    const cy = doc.y
    doc.font('medium').fontSize(8.4).fillColor(C.indigo)
      .text(data.contact.email, x, cy, { continued: true, link: `mailto:${data.contact.email}`, underline: false })
      .fillColor(C.faint).text('   ·   ', { continued: true, link: null })
      .fillColor(C.indigo).text(strip(data.contact.linkedin), { continued: true, link: data.contact.linkedin, underline: false })
      .fillColor(C.faint).text('   ·   ', { continued: true, link: null })
      .fillColor(C.muted).text(t(data.location, lang).replace(' · ', ' (') + ')', { link: null })
    doc.moveDown(0.6)

    // gradient bar under the header (indigo → teal, like .hero-name .line-2)
    const grad = doc.linearGradient(x, doc.y, x + w, doc.y)
    grad.stop(0, C.indigo).stop(1, C.teal)
    doc.rect(x, doc.y, w, 2.5).fill(grad)
    doc.y += 4

    // ── Summary ─────────────────────────────────────────────────────────────
    heading(H.summary)
    const [lead, ...more] = data.summary[lang]
    doc.font('medium').fontSize(9.4).fillColor(C.ink).text(lead, x, doc.y, { width: w, lineGap: 1.3 })
    doc.moveDown(0.3)
    doc.font('body').fontSize(8.9).fillColor(C.text).text(more.join(' '), x, doc.y, { width: w, lineGap: 1.2 })

    // ── Experience ──────────────────────────────────────────────────────────
    heading(H.experience)
    data.experience.forEach((e, i) => {
      if (i) doc.moveDown(0.22)
      entry({
        role: t(e.role, lang),
        org: t(e.company, lang),
        orgLink: e.url,
        location: t(e.location, lang),
        dates: fmtRange(e.start, e.end, lang)
      })
      e.bullets[lang].forEach(bullet)
      if (e.tools?.length) {
        ensure(14)
        doc.font('medium').fontSize(7.6).fillColor(C.faint).text(e.tools.join('  ·  '), x + 14, doc.y + 0.5, { width: w - 14, lineGap: 0.5 })
      }
      // founder projects right after the current role, as featured entries
      if (i === 0) {
        doc.moveDown(0.5)
        data.founderProjects.forEach(featuredEntry)
      }
    })

    // ── Skills ──────────────────────────────────────────────────────────────
    heading(H.skills)
    data.skills.forEach((g, i) => {
      const col = GROUP_COLORS[g.color] || C.muted
      const tint = TINTS[g.color] || TINTS.white
      if (g.featured) {
        // tinted box: title, then one compact text line per family ("Label: item, item, …")
        const pad = 9, innerX = x + pad + 4, innerW = w - pad * 2 - 4, labelW = 74
        doc.font('body').fontSize(8.4)
        const linesH = g.lines.reduce((acc, l) => acc + doc.heightOfString(l.items.join(', '), { width: innerW - labelW, lineGap: 0.5 }) + 3, 0)
        const boxH = pad + 14 + linesH + pad - 3
        ensure(boxH + 6)
        if (i) doc.y += 3
        const y0 = doc.y
        doc.roundedRect(x, y0, w, boxH, 6).fillAndStroke(tint.fill, tint.stroke)
        const bar = doc.linearGradient(x, y0, x, y0 + boxH)
        bar.stop(0, C.indigo).stop(1, C.teal)
        doc.roundedRect(x, y0, 3.5, boxH, 1.5).fill(bar)
        doc.font('displaySemi').fontSize(7.8).fillColor(col)
          .text(t(g.group, lang).toUpperCase(), innerX, y0 + pad, { characterSpacing: 1, lineBreak: false })
        let ly = y0 + pad + 14
        g.lines.forEach(l => {
          doc.font('semi').fontSize(8.2).fillColor(col).text(t(l.label, lang), innerX, ly, { width: labelW - 6, lineBreak: false })
          doc.font('body').fontSize(8.4).fillColor(C.text).text(l.items.join(', '), innerX + labelW, ly, { width: innerW - labelW, lineGap: 0.5 })
          ly = doc.y + 3
        })
        doc.y = y0 + boxH + 5
        return
      }
      ensure(40)
      if (i) doc.y += 2
      doc.font('displaySemi').fontSize(7.8).fillColor(col)
        .text(t(g.group, lang).toUpperCase(), x, doc.y, { characterSpacing: 1, lineBreak: false })
      doc.y += 11
      chips(g.items, { color: col, fill: tint.fill, stroke: tint.stroke })
    })

    // ── Education ───────────────────────────────────────────────────────────
    heading(H.education)
    data.education.forEach(e => {
      entry({ role: t(e.degree, lang), org: e.school, orgLink: null, location: t(e.location, lang), dates: fmtRange(e.start, e.end, lang) })
    })
    if (data.certifications?.length) {
      doc.font('semi').fontSize(8.6).fillColor(C.text).text(`${H.certifications}: `, x, doc.y, { continued: true })
      doc.font('body').fillColor(C.text).text(data.certifications.map(c => `${t(c.name, lang)}, ${c.year}`).join(' · '))
    }

    // ── Languages & Interests (one compact section) ─────────────────────────
    heading(H.langInterests)
    doc.font('semi').fontSize(8.8).fillColor(C.text).text(`${H.languages}: `, x, doc.y, { continued: true })
    doc.font('body').fillColor(C.text).text(data.languages.map(l => `${t(l.name, lang)} (${t(l.level, lang)})`).join('  ·  '))
    doc.y += 2
    doc.font('semi').fontSize(8.8).fillColor(C.text).text(`${H.interests}: `, x, doc.y, { continued: true })
    // {LABEL} placeholders in the text become inline links
    const links = data.beyondWork.links || []
    const parts = t(data.beyondWork, lang).split(/(\{[^}]+\})/)
    parts.forEach(part => {
      const m = part.match(/^\{(.+)\}$/)
      const l = m && links.find(k => k.label === m[1])
      if (l) doc.font('semi').fillColor(C.indigo).text(l.label, { continued: true, link: l.url, underline: false })
      else if (part) doc.font('body').fillColor(C.text).text(part, { continued: true, link: null })
    })
    doc.text('', { continued: false, link: null })

    // ── page count guard + footers ──────────────────────────────────────────
    const range = doc.bufferedPageRange()
    if (range.count > MAX_PAGES) {
      doc.end()
      reject(new Error(`PDF (${lang}) is ${range.count} pages; max is ${MAX_PAGES}. Trim resume.json.`))
      return
    }
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i)
      const saved = doc.page.margins.bottom
      doc.page.margins.bottom = 0                                // let us write inside the margin
      const fy = doc.page.height - 32
      doc.moveTo(x, fy - 8).lineTo(x + w, fy - 8).lineWidth(0.5).strokeColor(C.border).stroke()
      doc.font('medium').fontSize(7.4).fillColor(C.faint)
        .text(`${data.name}  ·  `, x, fy, { continued: true, lineBreak: false })
        .fillColor(C.indigo).text(strip(data.site.url), { link: data.site.url, underline: false, lineBreak: false })
      doc.fillColor(C.faint).text(`${H.page} ${i + 1} / ${range.count}`, x, fy, { width: w, align: 'right', lineBreak: false })
      doc.page.margins.bottom = saved
    }

    doc.end()
    stream.on('finish', () => resolve({ pages: range.count }))
    stream.on('error', reject)
  })
}
