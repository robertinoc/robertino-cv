// ATS-safe PDF generator: single column, standard headings, real text, Helvetica, no icons/emoji/tables.
import fs from 'node:fs'
import PDFDocument from 'pdfkit'
import { t, fmtRange } from './template.mjs'

const HEADINGS = {
  en: { summary: 'Summary', experience: 'Experience', projects: 'Projects', skills: 'Skills', education: 'Education', certifications: 'Certifications', languages: 'Languages', interests: 'Interests', present: 'Present', founder: 'Founder' },
  es: { summary: 'Resumen', experience: 'Experiencia', projects: 'Proyectos', skills: 'Habilidades', education: 'Formación', certifications: 'Certificaciones', languages: 'Idiomas', interests: 'Intereses', present: 'Actualidad', founder: 'Fundador' }
}

const FONT = 'Helvetica'
const BOLD = 'Helvetica-Bold'
const OBLIQUE = 'Helvetica-Oblique'
const MAX_PAGES = 2

export function buildPdf(data, lang, outPath) {
  const H = HEADINGS[lang]
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 44, bottom: 44, left: 50, right: 50 },
      bufferPages: true,
      pdfVersion: '1.5',
      lang,
      info: {
        Title: `${data.name} – ${t(data.jobTitle, lang)}`,
        Author: data.name,
        Subject: t(data.meta.description, lang),
        Keywords: data.skills.flatMap(g => g.items).join(', '),
        Creator: 'resume.robertino.world build'
      }
    })
    const stream = fs.createWriteStream(outPath)
    doc.pipe(stream)

    const x = doc.page.margins.left
    const w = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const bottom = () => doc.page.height - doc.page.margins.bottom
    const ensure = (h) => { if (doc.y + h > bottom()) doc.addPage() }

    const heading = (label) => {
      ensure(60)
      doc.moveDown(0.7)
      doc.font(BOLD).fontSize(10.5).fillColor('#000').text(label.toUpperCase(), x, doc.y, { width: w, characterSpacing: 0.6 })
      const y = doc.y + 2
      doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.6).strokeColor('#555').stroke()
      doc.y = y + 6
    }

    const bullet = (text) => {
      ensure(28)
      const y = doc.y
      doc.font(FONT).fontSize(9.4).fillColor('#111')
      doc.text('•', x + 4, y, { width: 10, lineBreak: false })
      doc.text(text, x + 14, y, { width: w - 14, lineGap: 1 })
      doc.y += 1.5
    }

    const entryHeader = (left, right, sub) => {
      ensure(40)
      const y = doc.y
      doc.font(BOLD).fontSize(10).fillColor('#000').text(left, x, y, { width: w - 120 })
      const yAfter = doc.y
      doc.font(FONT).fontSize(9).fillColor('#333').text(right, x + w - 120, y, { width: 120, align: 'right' })
      doc.y = Math.max(yAfter, doc.y)
      if (sub) {
        doc.font(OBLIQUE).fontSize(9).fillColor('#444').text(sub, x, doc.y, { width: w })
      }
      doc.y += 2
    }

    // ── Header ──
    doc.font(BOLD).fontSize(20).fillColor('#000').text(data.name, x, doc.y, { width: w })
    doc.font(FONT).fontSize(10.5).fillColor('#222').text(t(data.title, lang), x, doc.y + 2, { width: w })
    const contact = [
      data.contact.email,
      data.contact.linkedin.replace(/^https?:\/\//, ''),
      t(data.location, lang).replace(' · ', ' (') + ')'
    ].join('   |   ')
    doc.moveDown(0.3)
    doc.font(FONT).fontSize(9).fillColor('#333').text(contact, x, doc.y, { width: w })

    // ── Summary ──
    heading(H.summary)
    doc.font(FONT).fontSize(9.6).fillColor('#111').text(data.summary[lang].join(' '), x, doc.y, { width: w, lineGap: 1.5 })

    // ── Experience ──
    heading(H.experience)
    data.experience.forEach((e, i) => {
      if (i) doc.moveDown(0.45)
      const company = t(e.company, lang)
      entryHeader(`${t(e.role, lang)} — ${company}`, fmtRange(e.start, e.end, lang), t(e.location, lang))
      e.bullets[lang].forEach(bullet)
    })

    // ── Projects (founder) ──
    heading(H.projects)
    data.founderProjects.forEach((p, i) => {
      if (i) doc.moveDown(0.35)
      entryHeader(`${p.name} — ${t(p.role, lang)}`, fmtRange(p.start, p.end, lang), p.url.replace(/^https?:\/\//, ''))
      doc.font(FONT).fontSize(9.4).fillColor('#111').text(t(p.tagline, lang), x, doc.y, { width: w, lineGap: 1 })
    })

    // ── Skills ──
    heading(H.skills)
    data.skills.forEach(g => {
      ensure(24)
      const y = doc.y
      doc.font(BOLD).fontSize(9.4).fillColor('#000').text(`${t(g.group, lang)}: `, x, y, { width: w, continued: true })
      doc.font(FONT).fillColor('#111').text(g.items.join(', '), { width: w, lineGap: 1 })
      doc.y += 2
    })

    // ── Education ──
    heading(H.education)
    data.education.forEach(e => {
      entryHeader(`${t(e.degree, lang)} — ${e.school}`, fmtRange(e.start, e.end, lang), t(e.location, lang))
    })
    if (data.certifications?.length) {
      doc.moveDown(0.2)
      data.certifications.forEach(c => {
        doc.font(FONT).fontSize(9.4).fillColor('#111').text(`${H.certifications}: ${t(c.name, lang)}, ${c.year}`, x, doc.y, { width: w })
      })
    }

    // ── Languages ──
    heading(H.languages)
    doc.font(FONT).fontSize(9.4).fillColor('#111').text(
      data.languages.map(l => `${t(l.name, lang)} (${t(l.level, lang)})`).join(', '), x, doc.y, { width: w })

    // ── Interests ──
    heading(H.interests)
    doc.font(FONT).fontSize(9.4).fillColor('#111').text(t(data.beyondWork, lang), x, doc.y, { width: w })

    const pages = doc.bufferedPageRange().count
    if (pages > MAX_PAGES) {
      doc.end()
      reject(new Error(`PDF (${lang}) is ${pages} pages; max is ${MAX_PAGES}. Trim resume.json.`))
      return
    }
    doc.end()
    stream.on('finish', () => resolve({ pages }))
    stream.on('error', reject)
  })
}
