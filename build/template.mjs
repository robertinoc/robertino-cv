// HTML generator for resume.robertino.world. Pure functions: (data, lang) -> HTML string.
// UI chrome strings live here; resume content lives in resume.json.

export const UI = {
  en: {
    htmlLang: 'en',
    nav: { about: 'About', experience: 'Experience', skills: 'Skills', education: 'Education', contact: 'Contact' },
    download: 'Download PDF', downloadHint: 'ATS-friendly, 2 pages',
    linkedin: 'LinkedIn', email: 'Email',
    present: 'Present',
    aboutEyebrow: 'Summary', aboutTitle: 'Growth, content and developer experience<br>for B2B tech',
    workingStyleLabel: 'Working style', languagesLabel: 'Languages',
    expEyebrow: 'Career', expTitle: 'Experience', expSub: 'Reverse chronological. Every line is a thing that changed, not a job description. Highlighted cards are the products I founded and run alongside my role at Migbirds.',
    founderBadge: 'Founder',
    skillsEyebrow: 'Toolkit', skillsTitle: 'Skills', skillsSub: 'Grouped by what they are for.',
    eduEyebrow: 'Education', eduTitle: 'Education', certLabel: 'Certification',
    beyondEyebrow: 'Beyond work', beyondTitle: 'Beyond work',
    contactEyebrow: 'Contact', contactTitle: 'Let\'s talk', contactSub: 'Email and LinkedIn are the two channels I check every day.',
    footerBuilt: 'Generated from a single resume.json at build time.',
    switchLang: 'ES', switchLangTitle: 'Ver en español', switchHref: '/es/',
    themeLabel: 'Toggle light/dark mode', menuLabel: 'Menu',
    home: 'robertino.world',
    seeOnWeb: 'Web version'
  },
  es: {
    htmlLang: 'es',
    nav: { about: 'Sobre mí', experience: 'Experiencia', skills: 'Habilidades', education: 'Formación', contact: 'Contacto' },
    download: 'Descargar PDF', downloadHint: 'Compatible con ATS, 2 páginas',
    linkedin: 'LinkedIn', email: 'Email',
    present: 'Actualidad',
    aboutEyebrow: 'Resumen', aboutTitle: 'Growth, contenido y developer experience<br>para B2B tech',
    workingStyleLabel: 'Estilo de trabajo', languagesLabel: 'Idiomas',
    expEyebrow: 'Trayectoria', expTitle: 'Experiencia', expSub: 'En orden cronológico inverso. Cada línea es algo que cambió, no una descripción del puesto. Las tarjetas destacadas son los productos que fundé y dirijo en paralelo a mi rol en Migbirds.',
    founderBadge: 'Fundador',
    skillsEyebrow: 'Herramientas', skillsTitle: 'Habilidades', skillsSub: 'Agrupadas según para qué sirven.',
    eduEyebrow: 'Formación', eduTitle: 'Formación', certLabel: 'Certificación',
    beyondEyebrow: 'Más allá del trabajo', beyondTitle: 'Más allá del trabajo',
    contactEyebrow: 'Contacto', contactTitle: 'Hablemos', contactSub: 'Email y LinkedIn son los dos canales que reviso todos los días.',
    footerBuilt: 'Generado desde un único resume.json en el build.',
    switchLang: 'EN', switchLangTitle: 'View in English', switchHref: '/',
    themeLabel: 'Cambiar modo claro/oscuro', menuLabel: 'Menú',
    home: 'robertino.world',
    seeOnWeb: 'Versión web'
  }
}

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
}

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// t(value, lang): resolves {en, es} objects, passes plain strings through.
export function t(v, lang) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] ?? v.en ?? ''
  return v ?? ''
}

export function fmtDate(d, lang) {
  if (!d) return UI[lang].present
  const [y, m] = String(d).split('-')
  if (!m) return y
  return `${MONTHS[lang][parseInt(m, 10) - 1]} ${y}`
}

export function fmtRange(start, end, lang) {
  return `${fmtDate(start, lang)} – ${fmtDate(end, lang)}`
}

function initials(name) {
  return String(name).split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function logoOrInitials(logo, name) {
  if (logo) return `<img src="${esc(logo)}" alt="${esc(name)}" loading="lazy">`
  return `<span class="tl-initials">${esc(initials(name))}</span>`
}

const ICON = {
  download: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>',
  linkedin: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  mail: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  external: '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5m0 0v5m0-5L10 14M19 14v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5"/></svg>',
  pin: '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  sun: '<svg class="icon-sun" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg class="icon-moon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
}

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23a78bfa'/%3E%3Cstop offset='1' stop-color='%2314b8a6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='%230d1117'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-family='Sora,Inter,Arial,sans-serif' font-weight='800' font-size='30' fill='url(%23g)'%3ERC%3C/text%3E%3C/svg%3E"

function jsonLd(data, lang) {
  // One entity shared with robertino.world: same @id, url, sameAs and
  // knowsAbout (see resume.json → entity). This page is the main page ABOUT
  // the person, so it goes in mainEntityOfPage, never in sameAs.
  const e = data.entity
  const schools = data.education.map(ed => ({ '@type': 'CollegeOrUniversity', name: ed.school }))
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': e.id,
    name: data.name,
    givenName: e.givenName,
    familyName: e.familyName,
    url: e.url,
    mainEntityOfPage: data.site.url + (lang === 'es' ? '/es/' : '/'),
    image: data.site.url + data.site.ogImage,
    jobTitle: t(data.jobTitle, lang),
    description: t(data.meta.description, lang),
    email: `mailto:${data.contact.email}`,
    worksFor: { '@type': 'Organization', name: 'Migbirds', url: 'https://migbirds.com' },
    alumniOf: schools.length === 1 ? schools[0] : schools,
    knowsAbout: e.knowsAbout,
    address: { '@type': 'PostalAddress', addressLocality: 'Corrientes', addressCountry: 'AR' },
    sameAs: e.sameAs
  }
  return JSON.stringify(ld)
}

function langScript(lang) {
  // Auto-select language on first visit from the browser's primary language; a manual choice (localStorage) wins.
  const other = lang === 'en' ? 'es' : 'en'
  const otherHref = lang === 'en' ? '/es/' : '/'
  return `(function(){try{var p=localStorage.getItem('cv_lang');if(p==='${other}'){location.replace('${otherHref}');return}if(p)return;${
    lang === 'en'
      ? "var l=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();if(/^es(-|$)/.test(l)){location.replace('/es/')}"
      : ''
  }}catch(e){}})();`
}


// ── Founder projects inside the timeline ──────────────────────────────────
function founderBadge(ui) { return `<span class="tl-badge">${esc(ui.founderBadge)}</span>` }

// Founder projects render as featured timeline cards right after the current role.
function renderFounderTimelineCard(p, lang, ui, delay) {
  return `
      <article class="tl-item reveal${delay ? ` reveal-delay-${delay}` : ''}">
        <div class="tl-dot featured">${logoOrInitials(p.logo, p.name)}</div>
        <div class="tl-card featured">
          <div class="tl-header">
            <div class="tl-company"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a></div>
            <div class="tl-meta">${founderBadge(ui)}<span class="tl-period">${esc(fmtRange(p.start, p.end, lang))}</span></div>
          </div>
          <div class="tl-role">${esc(t(p.role, lang))}</div>
          <p class="tl-desc">${esc(t(p.tagline, lang))}</p>
          ${p.focus?.length ? `<div class="tl-tools">${p.focus.map(x => `<span class="tl-tool">${esc(x)}</span>`).join('')}</div>` : ''}
          <a class="tl-link" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.display || p.url)} ${ICON.external}</a>
        </div>
      </article>`
}

export function renderPage(data, lang, { css, pdfFile }) {
  const ui = UI[lang]
  const title = t(data.meta.title, lang)
  const description = t(data.meta.description, lang)
  const canonical = data.site.url + (lang === 'es' ? '/es/' : '/')
  const ogImage = data.site.url + data.site.ogImage
  const [first, ...rest] = data.name.split(' ')
  const last = rest.join(' ')
  const nav = ui.nav

  const experienceCards = data.experience.map((e, i) => {
    const company = t(e.company, lang)
    return `
      <article class="tl-item reveal${i ? ` reveal-delay-${Math.min(i, 3)}` : ''}">
        <div class="tl-dot">${logoOrInitials(e.logo, company)}</div>
        <div class="tl-card">
          <div class="tl-header">
            <div class="tl-company">${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(company)}</a>` : esc(company)}</div>
            <div class="tl-period">${esc(fmtRange(e.start, e.end, lang))}</div>
          </div>
          <div class="tl-role">${esc(t(e.role, lang))}</div>
          <div class="tl-location">${ICON.pin} ${esc(t(e.location, lang))}</div>
          <ul class="tl-bullets">
            ${e.bullets[lang].map(b => `<li>${esc(b)}</li>`).join('\n            ')}
          </ul>
          ${e.tools?.length ? `<div class="tl-tools">${e.tools.map(x => `<span class="tl-tool">${esc(x)}</span>`).join('')}</div>` : ''}
        </div>
      </article>`
  })
  // Founder projects sit right after the current role (same period), featured.
  experienceCards.splice(1, 0, ...data.founderProjects.map((p, i) => renderFounderTimelineCard(p, lang, ui, i + 1)))
  const experience = experienceCards.join('\n')

  const skills = data.skills.map((g, i) => {
    const delay = i ? ` reveal-delay-${Math.min(i, 3)}` : ''
    if (g.featured) {
      // Full-width featured group with labelled chip rows (e.g. AI tools & know-how)
      return `
      <div class="skill-group featured reveal${delay}">
        <div class="sg-title c-${esc(g.color)}">${esc(t(g.group, lang))}</div>
        ${g.lines.map(l => `
        <div class="sg-line">
          <div class="sg-line-label">${esc(t(l.label, lang))}</div>
          <div class="sk-chips">${l.items.map(x => `<span class="sk-chip c-${esc(g.color)}">${esc(x)}</span>`).join('')}</div>
        </div>`).join('')}
      </div>`
    }
    return `
      <div class="skill-group reveal${delay}">
        <div class="sg-title c-${esc(g.color)}">${esc(t(g.group, lang))}</div>
        <div class="sk-chips">${g.items.map(x => `<span class="sk-chip c-${esc(g.color)}">${esc(x)}</span>`).join('')}</div>
      </div>`
  }).join('\n')

  const education = data.education.map(e => `
      <div class="edu-card reveal">
        <div class="edu-icon" aria-hidden="true">${logoOrInitials('/logos/utn.jpg', e.school)}</div>
        <div>
          <div class="edu-degree">${esc(t(e.degree, lang))}</div>
          <div class="edu-school">${esc(e.school)}</div>
          <div class="edu-years">${esc(fmtRange(e.start, e.end, lang))} · ${esc(t(e.location, lang))}</div>
        </div>
      </div>`).join('\n')

  const certifications = (data.certifications || []).map(c => `
      <div class="edu-card edu-card--cert reveal reveal-delay-1">
        <div class="edu-icon" aria-hidden="true"><span class="tl-initials">✓</span></div>
        <div>
          <div class="edu-degree">${esc(t(c.name, lang))}</div>
          <div class="edu-years">${esc(ui.certLabel)} · ${esc(c.year)}</div>
        </div>
      </div>`).join('\n')

  // beyondWork text carries {LABEL} placeholders that become links (see resume.json)
  const beyondHtml = (data.beyondWork.links || []).reduce((html, l) =>
    html.split(`{${l.label}}`).join(`<a href="${esc(l.url)}" target="_blank" rel="noopener" class="beyond-link">${esc(l.label)} ${ICON.external}</a>`),
    esc(t(data.beyondWork, lang)))

  const languages = data.languages.map(l =>
    `<span class="chip gray">${esc(t(l.name, lang))} (${esc(t(l.level, lang))})</span>`).join('')

  const summaryHtml = data.summary[lang].map(p => `<p>${esc(p)}</p>`).join('\n          ')


  return `<!DOCTYPE html>
<html lang="${ui.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${esc(data.name)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" hreflang="en" href="${esc(data.site.url)}/">
  <link rel="alternate" hreflang="es" href="${esc(data.site.url)}/es/">
  <link rel="alternate" hreflang="x-default" href="${esc(data.site.url)}/">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:alt" content="${esc(data.name)}">
  <meta property="og:site_name" content="${esc(data.name)}">
  <meta property="og:locale" content="${lang === 'es' ? 'es_AR' : 'en_US'}">
  <meta property="og:locale:alternate" content="${lang === 'es' ? 'en_US' : 'es_AR'}">
  <meta property="profile:first_name" content="${esc(first)}">
  <meta property="profile:last_name" content="${esc(last)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">
  <link rel="icon" type="image/svg+xml" href="${FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script>${langScript(lang)}</script>
  <script>(function(){try{if(localStorage.getItem('cv_theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}})();</script>
  <style>
${css}
  </style>
  <script type="application/ld+json">${jsonLd(data, lang)}</script>
</head>
<body>

<nav id="navbar" aria-label="Main">
  <a class="nav-logo" href="${lang === 'es' ? '/es/' : '/'}">RC<span>.</span></a>
  <div class="nav-right">
    <ul class="nav-links" id="navLinks">
      <li><a href="#about">${esc(nav.about)}</a></li>
      <li><a href="#experience">${esc(nav.experience)}</a></li>
      <li><a href="#skills">${esc(nav.skills)}</a></li>
      <li><a href="#education">${esc(nav.education)}</a></li>
      <li><a href="#contact">${esc(nav.contact)}</a></li>
      <li><a href="/${esc(pdfFile)}" class="nav-cta" download>${esc(ui.download)}</a></li>
    </ul>
    <a class="lang-toggle" href="${ui.switchHref}" hreflang="${lang === 'en' ? 'es' : 'en'}" title="${esc(ui.switchLangTitle)}" onclick="setLang('${lang === 'en' ? 'es' : 'en'}')">${ui.switchLang}</a>
    <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" aria-label="${esc(ui.themeLabel)}">${ICON.sun}${ICON.moon}</button>
    <button class="nav-hamburger" id="hamburger" onclick="toggleMenu()" aria-label="${esc(ui.menuLabel)}" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</nav>

<header id="hero">
  <div class="hero-glow-right"></div>
  <div class="hero-inner">
    <div class="hero-badge"><div class="hero-badge-dot"></div><span>${esc(t(data.jobTitle, lang))} · B2B tech</span></div>
    <h1 class="hero-name">${esc(first)}<br><span class="line-2">${esc(last)}</span></h1>
    <p class="hero-title">${esc(t(data.title, lang))}</p>
    <p class="hero-desc">${esc(t(data.headline, lang))}</p>
    <p class="hero-location">${ICON.pin} ${esc(t(data.location, lang))}</p>
    <div class="hero-actions">
      <a href="/${esc(pdfFile)}" class="btn btn-primary" download>${ICON.download} <span>${esc(ui.download)}</span><small>${esc(ui.downloadHint)}</small></a>
      <a href="${esc(data.contact.linkedin)}" target="_blank" rel="noopener" class="btn btn-outline">${ICON.linkedin} <span>${esc(ui.linkedin)}</span></a>
      <a href="mailto:${esc(data.contact.email)}" class="btn btn-outline">${ICON.mail} <span>${esc(ui.email)}</span></a>
    </div>
  </div>
  <div class="hero-scroll"><div class="hero-scroll-line"></div><span>Scroll</span></div>
</header>

<main>
<section id="about">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.aboutEyebrow)}</div>
    <h2 class="section-title">${ui.aboutTitle}</h2>
    <div class="about-grid reveal">
      <div class="about-photo-wrap">
        <div class="about-photo"><img src="/profile.jpg" alt="${esc(data.name)}" width="600" height="800"></div>
        <div class="about-location">${ICON.pin} <span>${esc(t(data.location, lang))}</span></div>
      </div>
      <div>
        <div class="about-bio">
          ${summaryHtml}
        </div>
        ${data.workingStyle ? `
        <div class="working-style">
          <div class="chips-label">${esc(ui.workingStyleLabel)}</div>
          <p>${esc(t(data.workingStyle, lang))}</p>
          <div class="ws-source">${esc(t(data.workingStyle.source, lang))}</div>
        </div>` : ''}
        <div class="chips-label">${esc(ui.languagesLabel)}</div>
        <div class="chips">${languages}</div>
      </div>
    </div>
  </div>
</section>

<section id="experience">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.expEyebrow)}</div>
    <h2 class="section-title">${esc(ui.expTitle)}</h2>
    <p class="section-sub">${esc(ui.expSub)}</p>
    <div class="timeline">
${experience}
    </div>
  </div>
</section>


<section id="skills">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.skillsEyebrow)}</div>
    <h2 class="section-title">${esc(ui.skillsTitle)}</h2>
    <p class="section-sub">${esc(ui.skillsSub)}</p>
    <div class="skills-grid">
${skills}
    </div>
  </div>
</section>

<section id="education">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.eduEyebrow)}</div>
    <h2 class="section-title">${esc(ui.eduTitle)}</h2>
    <div class="edu-grid">
${education}
${certifications}
    </div>
  </div>
</section>

<section id="beyond">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.beyondEyebrow)}</div>
    <p class="beyond-line reveal">${beyondHtml}</p>
  </div>
</section>

<section id="contact">
  <div class="section-inner">
    <div class="section-eyebrow">${esc(ui.contactEyebrow)}</div>
    <h2 class="section-title">${esc(ui.contactTitle)}</h2>
    <p class="section-sub">${esc(ui.contactSub)}</p>
    <div class="contact-links reveal">
      <a href="mailto:${esc(data.contact.email)}" class="contact-link"><span class="cl-icon">${ICON.mail}</span><span><div class="cl-label">${esc(ui.email)}</div>${esc(data.contact.email)}</span></a>
      <a href="${esc(data.contact.linkedin)}" target="_blank" rel="noopener" class="contact-link"><span class="cl-icon">${ICON.linkedin}</span><span><div class="cl-label">${esc(ui.linkedin)}</div>${esc(data.contact.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</span></a>
      <a href="/${esc(pdfFile)}" class="contact-link" download><span class="cl-icon">${ICON.download}</span><span><div class="cl-label">${esc(ui.download)}</div>${esc(pdfFile)}</span></a>
    </div>
  </div>
</section>
</main>

<footer>
  <div class="footer-name">${esc(first)} ${esc(last)}<span>.</span></div>
  <div class="footer-copy">© ${new Date().getFullYear()} · ${esc(ui.footerBuilt)}</div>
  <div class="footer-socials">
    <a href="${esc(data.site.home)}" target="_blank" rel="noopener">${esc(ui.home)}</a>
    <a href="${esc(data.contact.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
  </div>
</footer>

<script>
  function setLang(l) { try { localStorage.setItem('cv_lang', l) } catch (e) {} }
  function toggleTheme() {
    var root = document.documentElement;
    var light = root.getAttribute('data-theme') === 'light';
    if (light) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    try { localStorage.setItem('cv_theme', light ? 'dark' : 'light') } catch (e) {}
  }
  function toggleMenu() {
    var links = document.getElementById('navLinks');
    var open = links.classList.toggle('open');
    document.getElementById('hamburger').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () { document.getElementById('navLinks').classList.remove('open') });
  });
  var nav = document.getElementById('navbar');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40) }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target) } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el) });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in') });
  }
</script>
</body>
</html>
`
}
