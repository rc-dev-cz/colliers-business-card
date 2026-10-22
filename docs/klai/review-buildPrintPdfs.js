function setModel(key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, key, value)
  else model[key] = value
}
try {
  var PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
  var FONTKIT_URL = 'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js'
  var FONT_REG_URL =
    'https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Regular.ttf'
  var FONT_BOLD_URL =
    'https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Bold.ttf'
  var LOGO_MARK_URL = 'https://5t61ut5p19.ucarecd.net/66049ddf-e639-4104-9b94-5f1d96fc29a5/'
  var WORDS_EN_URL = 'https://5t61ut5p19.ucarecd.net/5c2ce46d-e9a5-441c-ad9a-8010efc9c9bf/'
  var WORDS_FR_URL = 'https://5t61ut5p19.ucarecd.net/701d97ba-48e3-4b7b-a448-1ecee3b72a6e/'
  var IN = 72
  var L = {
    trimWIn: 3.5,
    trimHIn: 2,
    bleedIn: 0.125,
    pageW: (3.5 + 0.125 * 2) * IN,
    pageH: (2 + 0.125 * 2) * IN,
    bleed: 0.125 * IN,
    trimW: 3.5 * IN,
    trimH: 2 * IN,
    logoX: 26.56,
    logoY: 108.8,
    logoW: 46.59,
    logoH: 26.52,
    lockupX: 26.2,
    lockupY: 108.0,
    lockupW: 87.3,
    lockupH: 27.8,
    wordmarkEn: { x: 79.35, y: 112.86, w: 35.18, h: 18.84 },
    wordmarkFr: { x: 79.24, y: 110.3, w: 45.47, h: 21.72 },
    identityX: 113.03,
    identityWidth: 141.52,
    emailMaxWidth: 141.52,
    titleMaxWidth: 141.52,
    nameY: 75.49,
    nameSize: 10,
    nameLineHeight: 11,
    nameMaxLines: 2,
    credentialSize: 7,
    credentialY: 66.99,
    titleYNoCred: 66.99,
    teamYNoCred: 58.99,
    titleYWithCred: 58.99,
    teamYWithCred: 50.99,
    bodySize: 6.5,
    bodyLineHeight: 8,
    emailY: 43,
    phoneY: 35,
    websiteY: 27,
    emailGapMin: 15.99,
    addressX: 27,
    addressBottomY: 27,
    addressMaxWidth: 80,
    addressMaxLines: 5,
  }
  var PAGE_W = L.pageW,
    PAGE_H = L.pageH,
    BLEED = L.bleed,
    TRIM_W = L.trimW,
    TRIM_H = L.trimH,
    EMAIL_MAX = 50
  var COLLIERS_BLUE = null,
    WHITE = null,
    GRAY = null
  var CARD_BACK_LEGAL = 'Colliers International Group Inc.'
  var WEBSITE_EN = 'colliersprojectleaders.com'
  var WEBSITE_FR = 'colliersprojectleaders.com/fr'
  var SAMPLE_EN = {
    name: 'Firstname Lastname',
    title: 'Title',
    region: 'Region',
    team: 'Specialized team',
    email: 'first.lastname@colliersprojectleaders.com',
    phone: '+1 555 555 5555',
    address: 'Address name\nUnit, Street\nCity, Province\nPostal Code, Country',
    website: WEBSITE_EN,
  }
  var SAMPLE_FR = {
    name: 'Prénom Nom',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'prenom.nom@colliersprojectleaders.com',
    phone: '+1 555 555 5555',
    address: "Nom de l'adresse\nUnité, Rue\nVille, Province\nCode postal, Pays",
    website: WEBSITE_FR,
  }
  async function loadScript(url) {
    if (typeof BF !== 'undefined' && BF.libraryLoadOnce) {
      await BF.libraryLoadOnce(url, { type: 'script', moduleType: 'classic' })
      return
    }
    await new Promise(function (resolve, reject) {
      var s = document.createElement('script')
      s.src = url
      s.onload = resolve
      s.onerror = function () {
        reject(new Error('Failed to load ' + url))
      }
      document.head.appendChild(s)
    })
  }
  if (typeof PDFLib === 'undefined') await loadScript(PDF_LIB_URL)
  if (typeof PDFLib === 'undefined') throw new Error('pdf-lib failed to load')
  var fk =
    typeof fontkit !== 'undefined' ? fontkit : typeof Fontkit !== 'undefined' ? Fontkit : null
  if (!fk) {
    await loadScript(FONTKIT_URL)
    fk = typeof fontkit !== 'undefined' ? fontkit : typeof Fontkit !== 'undefined' ? Fontkit : null
  }
  if (!fk) throw new Error('fontkit failed to load')
  var PDFDocument = PDFLib.PDFDocument,
    rgb = PDFLib.rgb
  COLLIERS_BLUE = rgb(3 / 255, 67 / 255, 140 / 255)
  WHITE = rgb(1, 1, 1)
  GRAY = rgb(95 / 255, 99 / 255, 106 / 255)
  async function fetchBytes(url) {
    var res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error('Failed to fetch ' + url + ' (' + res.status + ')')
    return new Uint8Array(await res.arrayBuffer())
  }
  function isFrenchLanguage(language) {
    var lang = String(language || '')
    return (
      lang === 'French' || lang === 'Français' || lang === 'FR' || /french|fran\w*|fr\b/i.test(lang)
    )
  }
  function isBilingualLanguage(language) {
    return /bilingual|bilin/i.test(String(language || ''))
  }
  function formatCredentialSuffix(degree, extra) {
    var parts = []
    if (Array.isArray(degree)) {
      degree.forEach(function (item) {
        var text = String(item || '').trim()
        if (text) parts.push(text)
      })
    } else if (degree != null && degree !== '') {
      var single = String(degree).trim()
      if (single) parts.push(single)
    }
    var credentials = extra != null ? String(extra).trim() : ''
    if (credentials) parts.push(credentials)
    return parts.join(', ')
  }
  function formatTitleLine(title, region, sampleTitle, sampleRegion) {
    var titlePart = ''
    if (Array.isArray(title) && title.length)
      titlePart = title
        .map(function (item) {
          return String(item || '').trim()
        })
        .filter(Boolean)
        .join(' | ')
    else if (typeof title === 'string' && title.trim()) titlePart = title.trim()
    if (titlePart.indexOf('|') !== -1) titlePart = titlePart.split('|')[0].trim()
    var regionPart = region != null ? String(region).trim() : ''
    if (titlePart && regionPart) return titlePart + ' | ' + regionPart
    if (titlePart) return titlePart
    if (regionPart) return (sampleTitle || 'Title') + ' | ' + regionPart
    return sampleTitle || 'Title'
  }
  function formatCardPhone(value) {
    if (!value) return ''
    var cleaned = String(value).replace(/\D/g, '')
    var local = cleaned
    if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1)
    if (local.length === 10)
      return local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6)
    return String(value)
  }
  function snapshotCardDetails(details) {
    var src = details || {},
      out = {}
    Object.keys(src).forEach(function (key) {
      out[key] = src[key]
    })
    if (Array.isArray(src.degree)) out.degree = src.degree.slice()
    else if (src.degree) out.degree = [src.degree]
    else out.degree = []
    return out
  }
  function degreeCount(details) {
    var n = 0
    ;(snapshotCardDetails(details).degree || []).forEach(function (item) {
      if (String(item || '').trim()) n += 1
    })
    return n
  }
  function resolveCardFields(details, language) {
    var card = details || {}
    var isFrench = isFrenchLanguage(language || card.language)
    var sample = isFrench ? SAMPLE_FR : SAMPLE_EN
    var rawName = String(card.name || '').trim()
    var phoneRaw = String(card.phone || '').trim()
    var website = String(card.website || '').trim()
    if (!website || website === 'colliers.com/canada') website = sample.website
    return {
      isFrench: isFrench,
      name: rawName || sample.name,
      credentialSuffix: formatCredentialSuffix(card.degree, card.additionalCredentials),
      title: formatTitleLine(card.title, card.region, sample.title, sample.region),
      titleOnly: formatTitleLine(card.title, '', sample.title, ''),
      region: String(card.region || '').trim(),
      team: String(card.specializedTeam || '').trim(),
      email: String(card.email || '').trim() || sample.email,
      phone: phoneRaw ? formatCardPhone(phoneRaw) : sample.phone,
      website: website,
      address: String(card.printAddress || card.address || '').trim() || sample.address,
    }
  }
  function fitsLine(font, text, size, maxWidth) {
    return font.widthOfTextAtSize(String(text || ''), size) <= maxWidth
  }
  function wrapByWords(font, text, size, maxWidth) {
    var words = String(text || '')
      .split(/\s+/)
      .filter(Boolean)
    if (!words.length) return { ok: true, lines: [''] }
    var lines = [],
      cur = ''
    for (var i = 0; i < words.length; i++) {
      var w = words[i]
      if (!fitsLine(font, w, size, maxWidth)) return { ok: false, lines: [] }
      var next = cur ? cur + ' ' + w : w
      if (fitsLine(font, next, size, maxWidth)) cur = next
      else {
        lines.push(cur)
        cur = w
      }
    }
    if (cur) lines.push(cur)
    return { ok: true, lines: lines }
  }
  function wrapAddress(font, text, size, maxWidth) {
    var paragraphs = String(text || '').split(/\n/),
      lines = []
    for (var p = 0; p < paragraphs.length; p++) {
      var chunk = paragraphs[p].trim()
      if (!chunk) continue
      var wrapped = wrapByWords(font, chunk, size, maxWidth)
      if (!wrapped.ok) lines.push(chunk)
      else lines = lines.concat(wrapped.lines)
    }
    if (!lines.length) lines = ['']
    return { ok: true, lines: lines }
  }
  function fitsAfterName(fontBold, lastNameLine, credentialText) {
    return (
      fontBold.widthOfTextAtSize(lastNameLine, L.nameSize) +
        fontBold.widthOfTextAtSize(', ' + credentialText, L.credentialSize) <=
      L.identityWidth
    )
  }
  function packCredentials(fontBold, lastNameLine, credText) {
    var parts = String(credText || '')
      .split(/,\s*/)
      .map(function (part) {
        return part.trim()
      })
      .filter(Boolean)
    if (!parts.length) return { mode: 'none', inline: '', row: '' }
    var joined = parts.join(', ')
    if (fitsAfterName(fontBold, lastNameLine, joined))
      return { mode: 'inline', inline: joined, row: '' }
    var order = parts.map(function (text, index) {
      return { text: text, index: index, w: fontBold.widthOfTextAtSize(text, L.credentialSize) }
    })
    order.sort(function (a, b) {
      if (a.w !== b.w) return a.w - b.w
      return a.index - b.index
    })
    var inlineItems = []
    var taken = {}
    order.forEach(function (item) {
      var trial = inlineItems
        .map(function (row) {
          return row.text
        })
        .concat([item.text])
        .join(', ')
      if (fitsAfterName(fontBold, lastNameLine, trial)) {
        inlineItems.push(item)
        taken[item.index] = true
      }
    })
    var inline = inlineItems
      .map(function (item) {
        return item.text
      })
      .join(', ')
    var row = parts
      .filter(function (_text, index) {
        return !taken[index]
      })
      .join(', ')
    if (!row) return { mode: 'inline', inline: inline, row: '' }
    if (!inline) {
      if (fitsLine(fontBold, joined, L.credentialSize, L.identityWidth))
        return { mode: 'own-row', inline: '', row: joined }
      return { mode: 'error', inline: '', row: '' }
    }
    if (!fitsLine(fontBold, row, L.credentialSize, L.identityWidth))
      return { mode: 'error', inline: '', row: '' }
    return { mode: 'split', inline: inline, row: row }
  }
  function planCardLayout(fields, fonts, opts) {
    var font = fonts.font,
      fontBold = fonts.fontBold,
      errors = []
    var nameWrap = wrapByWords(fontBold, fields.name, L.nameSize, L.identityWidth)
    if (!nameWrap.ok || nameWrap.lines.length > L.nameMaxLines) errors.push('name')
    var nameLines = nameWrap.ok ? nameWrap.lines : [fields.name]
    if (nameLines.length > L.nameMaxLines) nameLines = nameLines.slice(0, L.nameMaxLines)
    var lastNameLine = nameLines[nameLines.length - 1] || ''
    var credText = String(fields.credentialSuffix || '').trim()
    var packed = packCredentials(fontBold, lastNameLine, credText)
    var credMode = packed.mode === 'error' ? 'none' : packed.mode
    if (packed.mode === 'error') errors.push('credentials')
    if (!fitsLine(font, fields.website, L.bodySize, L.identityWidth)) errors.push('website')
    var TA_FR = "Partenaire d'affaires sénior en acquisition de talent"
    var titleSize =
      fields.titleOnly === TA_FR && !fitsLine(font, TA_FR, L.bodySize, L.titleMaxWidth)
        ? (function () {
            var sz = Number(
              ((L.bodySize * L.titleMaxWidth) / font.widthOfTextAtSize(TA_FR, L.bodySize)).toFixed(
                2
              )
            )
            while (sz > 1 && !fitsLine(font, TA_FR, sz, L.titleMaxWidth))
              sz = Number((sz - 0.01).toFixed(2))
            return sz
          })()
        : L.bodySize
    if (!fitsLine(font, fields.titleOnly || fields.title, titleSize, L.titleMaxWidth))
      errors.push('title')
    if (
      String(fields.team || '').trim() &&
      !fitsLine(font, fields.team, L.bodySize, L.identityWidth)
    )
      errors.push('team')
    if (!fitsLine(font, fields.email, L.bodySize, L.emailMaxWidth)) errors.push('email')
    if (String(fields.email || '').length > EMAIL_MAX) errors.push('email')
    var addressWrap = wrapAddress(font, fields.address, L.bodySize, L.addressMaxWidth)
    var ownCred = credMode === 'own-row' || credMode === 'split'
    var titleY = ownCred ? L.titleYWithCred : L.titleYNoCred
    var teamY = ownCred ? L.teamYWithCred : L.teamYNoCred
    var lastNameY = L.nameY
    var nameLineYs = []
    for (var n = 0; n < nameLines.length; n++)
      nameLineYs.push(lastNameY + (nameLines.length - 1 - n) * L.nameLineHeight)
    var lastIdentityY = fields.team ? teamY : titleY
    var minLastY = L.emailY + L.emailGapMin
    var lift = lastIdentityY < minLastY ? Number((minLastY - lastIdentityY).toFixed(2)) : 0
    if (lift) {
      titleY += lift
      teamY += lift
      lastNameY += lift
      for (n = 0; n < nameLineYs.length; n++) nameLineYs[n] += lift
    }
    var credentialY = ownCred ? L.credentialY + lift : null
    if (!fields.team) {
      var shiftDown = Number((titleY - L.teamYNoCred).toFixed(2))
      if (shiftDown > 0) {
        titleY -= shiftDown
        teamY -= shiftDown
        lastNameY -= shiftDown
        for (n = 0; n < nameLineYs.length; n++) nameLineYs[n] -= shiftDown
        if (credentialY != null) credentialY -= shiftDown
      }
    }
    return {
      valid: errors.length === 0,
      errors: errors,
      credMode: credMode,
      nameLines: nameLines,
      nameLineYs: nameLineYs,
      lastNameY: lastNameY,
      inlineCredential: packed.inline ? ', ' + packed.inline : '',
      credentialLine: ownCred ? packed.row : '',
      credentialY: credentialY,
      title: fields.title,
      titleSize: titleSize,
      titleY: titleY,
      team: fields.team,
      teamY: teamY,
      email: fields.email,
      emailY: L.emailY,
      phone: fields.phone,
      phoneY: L.phoneY,
      website: fields.website,
      websiteY: L.websiteY,
      address: {
        lines: addressWrap.ok ? addressWrap.lines : [],
        x: L.addressX,
        bottomY: L.addressBottomY,
        lineHeight: L.bodyLineHeight,
      },
      fields: fields,
    }
  }
  var TITLE_EN_TO_FR = {
    'Business Development Manager': 'Responsable du développement commercial',
    Director: 'Directrice',
    'Senior Project Manager': 'Gestionnaire de projets Senior',
    'Team Lead': "Chef d'équipe",
    'Project Manager': 'Gestionnaire de Projet',
    'Project Director': 'Gestionnaire de projets principal',
    'Assistant Project Manager': 'Gestionnaire de projet adjoint',
    'Talent Acquisition Business Partner': "Partenaire d'affaires sénior en acquisition de talent",
  }
  // Region (Vue cardLayout.js, Oct 2026): team -> 'team | region'; otherwise (or too wide) 'Title | Region'
  // when it fits on every page (bilingual EN and FR together), else region on its own line.
  function applyRegionRule(productPlan, fonts) {
    var pages = productPlan.pages
    if (!pages.length) return
    var region = pages[0].fields.region,
      team = String(pages[0].fields.team || '').trim()
    if (!region) return
    var mode = 'own'
    if (team && fitsLine(fonts.font, team + ' | ' + region, L.bodySize, L.identityWidth))
      mode = 'team'
    else if (
      pages.every(function (pg) {
        return fitsLine(
          fonts.font,
          pg.fields.titleOnly + ' | ' + region,
          L.bodySize,
          L.titleMaxWidth
        )
      })
    )
      mode = 'title'
    pages.forEach(function (pg) {
      var ly = pg.layout
      if (mode === 'title') return
      ly.title = pg.fields.titleOnly
      if (mode === 'team') {
        ly.team = team + ' | ' + region
        return
      }
      ly.regionLine = region
      ly.regionY = ly.titleY
      ly.titleY += L.bodyLineHeight
      ly.lastNameY += L.bodyLineHeight
      ly.nameLineYs = ly.nameLineYs.map(function (y) {
        return y + L.bodyLineHeight
      })
      if (ly.credentialY != null) ly.credentialY += L.bodyLineHeight
    })
  }
  function planProductLayout(details, language, fonts) {
    var snapshot = snapshotCardDetails(details),
      count = degreeCount(snapshot)
    var langs = isBilingualLanguage(language) ? ['English', 'French'] : [language || 'English']
    var pages = langs.map(function (lang) {
      var pageDetails = snapshot
      if (isFrenchLanguage(lang)) pageDetails = Object.assign({}, snapshot, { website: WEBSITE_FR })
      if (isFrenchLanguage(lang) && isBilingualLanguage(language)) {
        var frTitle =
          String(snapshot.titleFr || '').trim() ||
          TITLE_EN_TO_FR[
            String(snapshot.title || '')
              .split('|')[0]
              .trim()
          ] ||
          snapshot.title
        pageDetails = Object.assign({}, pageDetails, { title: frTitle })
      }
      var fields = resolveCardFields(pageDetails, lang)
      return {
        language: lang,
        fields: fields,
        layout: planCardLayout(fields, fonts, { degreeCount: count }),
      }
    })
    var errors = []
    pages.forEach(function (page) {
      page.layout.errors.forEach(function (code) {
        if (errors.indexOf(code) === -1) errors.push(code)
      })
    })
    return { valid: errors.length === 0, errors: errors, pages: pages }
  }
  function printAddressLines(address, language) {
    var text = address != null ? String(address).trim() : ''
    if (text) return null
    return (isFrenchLanguage(language) ? SAMPLE_FR : SAMPLE_EN).address.split(/\n/)
  }
  function printInlineCredential(details) {
    if (formatCredentialSuffix(details && details.degree, details && details.additionalCredentials))
      return null
    return ', C.M.'
  }
  function applyPrintPlaceholders(productPlan, details) {
    productPlan.pages.forEach(function (page) {
      var inline = printInlineCredential(details)
      if (inline && page.layout) {
        if (page.layout.credentialLine) page.layout.credentialLine = inline.replace(/^, /, '')
        else {
          page.layout.inlineCredential = inline
          page.layout.credentialLine = ''
          page.layout.credMode = 'inline'
          if (page.fields) page.fields.credentialSuffix = inline.replace(/^, /, '')
        }
      }
      var lines = printAddressLines(details && details.address, page.language)
      if (lines && page.layout && page.layout.address) {
        page.layout.address.lines = lines
        if (page.fields) page.fields.address = lines.join('\n')
      }
    })
  }
  var LAYOUT_MSG = {
    name: 'Full name is too long for the business card.',
    credentials: 'Selected degrees and credentials are too long for the business card.',
    title: 'The selected title and region are too long.',
    team: 'The specialized team is too long.',
    email: 'The email address is too long for the card.',
    phone: 'The mobile number is too long for the card.',
    website: 'The website is too long for the card.',
    address: 'The office address is too long for the card.',
    degrees: 'A maximum of 2 degrees/certifications can be selected.',
  }
  function applyPrintPageBoxes(page) {
    page.setMediaBox(0, 0, PAGE_W, PAGE_H)
    page.setCropBox(0, 0, PAGE_W, PAGE_H)
    page.setBleedBox(0, 0, PAGE_W, PAGE_H)
    page.setTrimBox(BLEED, BLEED, TRIM_W, TRIM_H)
    page.setArtBox(BLEED, BLEED, TRIM_W, TRIM_H)
  }
  function drawText(page, text, opts) {
    if (!text) return
    page.drawText(String(text), {
      x: opts.x,
      y: opts.y,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    })
  }
  function drawLinesUpFromBottom(page, lines, opts) {
    var list = Array.isArray(lines) ? lines : []
    var y = opts.bottomY + (list.length - 1) * opts.lineHeight
    list.forEach(function (line, idx) {
      drawText(page, line, {
        x: opts.x,
        y: y - idx * opts.lineHeight,
        size: opts.size,
        font: opts.font,
        color: opts.color,
      })
    })
  }
  function drawCardPage(pdfDoc, pagePlan, assets) {
    var fields = pagePlan.fields,
      layout = pagePlan.layout,
      font = assets.font,
      fontBold = assets.fontBold
    var page = pdfDoc.addPage([PAGE_W, PAGE_H])
    applyPrintPageBoxes(page)
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) })
    var markAspect = 227.8 / 126.4
    var logoDrawH = L.logoW / markAspect
    var logoDrawY = L.logoY + (L.logoH - logoDrawH) / 2
    page.drawImage(assets.logo, { x: L.logoX, y: logoDrawY, width: L.logoW, height: logoDrawH })
    var words = fields.isFrench ? L.wordmarkFr : L.wordmarkEn
    page.drawImage(fields.isFrench ? assets.wordsFr : assets.wordsEn, {
      x: words.x,
      y: words.y,
      width: words.w,
      height: words.h,
    })
    var identityX = L.identityX
    layout.nameLines.forEach(function (line, idx) {
      drawText(page, line, {
        x: identityX,
        y: layout.nameLineYs[idx],
        size: L.nameSize,
        font: fontBold,
        color: COLLIERS_BLUE,
      })
    })
    if (layout.inlineCredential) {
      var last = layout.nameLines[layout.nameLines.length - 1] || ''
      drawText(page, layout.inlineCredential, {
        x: identityX + fontBold.widthOfTextAtSize(last, L.nameSize),
        y: layout.lastNameY,
        size: L.credentialSize,
        font: fontBold,
        color: COLLIERS_BLUE,
      })
    }
    if (layout.credentialLine)
      drawText(page, layout.credentialLine, {
        x: identityX,
        y: layout.credentialY,
        size: L.credentialSize,
        font: fontBold,
        color: COLLIERS_BLUE,
      })
    drawText(page, layout.title, {
      x: identityX,
      y: layout.titleY,
      size: layout.titleSize || L.bodySize,
      font: font,
      color: GRAY,
    })
    if (layout.regionLine)
      drawText(page, layout.regionLine, {
        x: identityX,
        y: layout.regionY,
        size: L.bodySize,
        font: font,
        color: GRAY,
      })
    if (layout.team)
      drawText(page, layout.team, {
        x: identityX,
        y: layout.teamY,
        size: L.bodySize,
        font: font,
        color: GRAY,
      })
    drawText(page, layout.email, {
      x: identityX,
      y: layout.emailY,
      size: L.bodySize,
      font: font,
      color: GRAY,
    })
    drawText(page, layout.phone, {
      x: identityX,
      y: layout.phoneY,
      size: L.bodySize,
      font: font,
      color: GRAY,
    })
    drawText(page, layout.website, {
      x: identityX,
      y: layout.websiteY,
      size: L.bodySize,
      font: font,
      color: GRAY,
    })
    drawLinesUpFromBottom(page, layout.address.lines, {
      x: layout.address.x,
      bottomY: layout.address.bottomY,
      lineHeight: layout.address.lineHeight,
      size: L.bodySize,
      font: font,
      color: GRAY,
    })
  }
  function drawCardBack(pdfDoc, assets) {
    var page = pdfDoc.addPage([PAGE_W, PAGE_H])
    applyPrintPageBoxes(page)
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLLIERS_BLUE })
    var inset = 18,
      x = BLEED + inset,
      y = BLEED + inset,
      top = BLEED + TRIM_H,
      right = BLEED + TRIM_W
    page.drawLine({ start: { x: x, y: top }, end: { x: x, y: y }, thickness: 0.5, color: WHITE })
    page.drawLine({ start: { x: x, y: y }, end: { x: right, y: y }, thickness: 0.5, color: WHITE })
    var size = 6.5,
      textWidth = assets.font.widthOfTextAtSize(CARD_BACK_LEGAL, size)
    drawText(page, CARD_BACK_LEGAL, {
      x: right - inset - textWidth,
      y: top - 23.36,
      size: size,
      font: assets.font,
      color: WHITE,
    })
  }
  // Place Order: build the print-ready PDF of every ordered card (once per card, however many
  // shipping groups use it) and add it to model.orderPayload.cards[] as base64, linked to the items
  // by line_ref. Nothing is stored in the browser (the PDFs hold names and addresses). A PDF problem
  // never blocks the order: order.print_pdf_status says what happened.
  var SEND_PDFS_TO_FILEMAKER = true // false = do not build or send the print PDFs
  // Leftovers from earlier versions that kept the PDFs in localStorage.
  try {
    localStorage.removeItem('colliers-print-pdfs')
  } catch (e) {}
  var cart = Array.isArray(app.cart) ? app.cart : Array.isArray(model.cart) ? model.cart : []
  var payload = model.orderPayload
  if (!payload || !Array.isArray(payload.groups)) return
  if (!SEND_PDFS_TO_FILEMAKER) {
    payload.order.print_pdf_status = 'disabled'
    return
  }
  var lineIds = {}
  payload.groups.forEach(function (group) {
    ;(group.items || []).forEach(function (item) {
      lineIds[String(item.line_ref)] = true
    })
  })
  var lines = cart.filter(function (row) {
    return lineIds[String(row.id)]
  })
  if (!lines.length) return
  var fontBytes = await Promise.all([fetchBytes(FONT_REG_URL), fetchBytes(FONT_BOLD_URL)])
  var logoBytes = await fetchBytes(LOGO_MARK_URL)
  var wordsEnBytes = await fetchBytes(WORDS_EN_URL)
  var wordsFrBytes = await fetchBytes(WORDS_FR_URL)
  function toBase64(bytes) {
    var out = ''
    var chunk = 0x8000
    for (var at = 0; at < bytes.length; at += chunk) {
      out += String.fromCharCode.apply(null, bytes.subarray(at, at + chunk))
    }
    return btoa(out)
  }
  var pdfs = {}
  for (var n = 0; n < lines.length; n++) {
    var line = lines[n]
    var details = line.details || {}
    var language = String(line.language || details.language || 'English')
    var snapshot = snapshotCardDetails(details)
    var pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fk)
    var assets = {
      font: await pdfDoc.embedFont(fontBytes[0], { subset: true }),
      fontBold: await pdfDoc.embedFont(fontBytes[1], { subset: true }),
      logo: await pdfDoc.embedPng(logoBytes),
      wordsEn: await pdfDoc.embedPng(wordsEnBytes),
      wordsFr: await pdfDoc.embedPng(wordsFrBytes),
    }
    var productPlan = planProductLayout(snapshot, language, assets)
    applyRegionRule(productPlan, assets)
    if (!productPlan.valid) {
      throw new Error(
        String(details.name || 'A card').trim() +
          ': ' +
          (LAYOUT_MSG[productPlan.errors[0]] || productPlan.errors[0])
      )
    }
    productPlan.pages.forEach(function (pagePlan) {
      drawCardPage(pdfDoc, pagePlan, assets)
      drawCardBack(pdfDoc, assets)
    })
    var bytes = await pdfDoc.save()
    var safeName =
      String(details.name || 'card')
        .trim()
        .replace(/[^\w\-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40) || 'card'
    pdfs[String(line.id)] = {
      file_name: 'Colliers-Business-Card-' + safeName + '-' + line.id + '.pdf',
      base64: toBase64(bytes),
    }
  }
  payload.cards = lines.map(function (row) {
    var pdf = pdfs[String(row.id)]
    return {
      line_ref: String(row.id),
      language: String(row.language || (row.details && row.details.language) || ''),
      print_pdf_file_name: pdf.file_name,
      print_pdf_base64: pdf.base64,
    }
  })
  payload.order.print_pdf_status = 'ok'
  if (typeof console !== 'undefined' && console.info)
    console.info(
      '[Colliers order] Print PDFs added to the order: ' + payload.cards.length + ' card(s)'
    )
} catch (err) {
  // Never block Place Order because of a PDF problem.
  if (typeof console !== 'undefined' && console.warn)
    console.warn('[buildPrintPdfs] print PDF not saved', err)
  if (model.orderPayload && model.orderPayload.order) {
    model.orderPayload.cards = []
    model.orderPayload.order.print_pdf_status =
      'failed: ' + (err && err.message ? err.message : String(err))
  }
}
