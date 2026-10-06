/**
 * Klai Customize named action: viewPrintPdf
 * Mirror of Vue src/helpers/printPdf.js + cardLayout.js — keep in sync with Studio.
 *
 * Print file (not a screenshot): 3.75×2.25 in media, 3.5×2 in trim, 0.125 in bleed.
 * pdf-lib embeds PNG. Preview and download use the mark plus EN/FR wordmark PNGs
 * from Klai file assets. Body type is Open Sans.
 */
async function viewPrintPdfBody() {
  try {
  var PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  var FONTKIT_URL = 'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js';
  var FONT_REG_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Regular.ttf';
  var FONT_BOLD_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Bold.ttf';
  var LOGO_MARK_URL = 'https://5t61ut5p19.ucarecd.net/56be9cc0-c8e8-4203-b43f-02a1ba2e1be3/';
  var WORDS_EN_URL = 'https://5t61ut5p19.ucarecd.net/90e9de45-e966-414c-a05f-d7b537acfb35/';
  var WORDS_FR_URL = 'https://5t61ut5p19.ucarecd.net/e4267105-701e-4bd0-a30e-4d7360eef476/';

  var IN = 72;
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
    taglineX: 79.11,
    taglineY1: 123.61,
    taglineY2: 111.51,
    taglineSize: 12.6,
    identityX: 113.03,
    identityWidth: 130,
    emailMaxWidth: 132,
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
    addressX: 27,
    addressBottomY: 27,
    addressMaxWidth: 80,
    addressMaxLines: 5,
    maxDegrees: 2
  };
  var PAGE_W = L.pageW;
  var PAGE_H = L.pageH;
  var BLEED = L.bleed;
  var TRIM_W = L.trimW;
  var TRIM_H = L.trimH;
  var EMAIL_MAX = 50;
  var COLLIERS_BLUE = null;
  var WHITE = null;
  var GRAY = null;
  var CARD_BACK_LEGAL = 'Colliers International Group Inc.';
  var WEBSITE_EN = 'colliersprojectleaders.com';
  var WEBSITE_FR = 'colliersprojectleaders.com/fr';
  var SAMPLE_EN = {
    name: 'Firstname Lastname',
    title: 'Title',
    region: 'Region',
    team: 'Specialized team',
    email: 'first.lastname@colliersprojectleaders.com',
    phone: '555 555 5555',
    address: 'Address name\nUnit, Street\nCity, Province\nPostal Code, Country',
    website: WEBSITE_EN
  };
  var SAMPLE_FR = {
    name: 'Prénom Nom',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'prenom.nom@colliersprojectleaders.com',
    phone: '555 555 5555',
    address: "Nom de l'adresse\nUnité, Rue\nVille, Province\nCode postal, Pays",
    website: WEBSITE_FR
  };

  async function loadScript(url) {
    if (typeof BF !== 'undefined' && BF.libraryLoadOnce) {
      await BF.libraryLoadOnce(url, { type: 'script', moduleType: 'classic' });
      return;
    }
    await new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Failed to load ' + url)); };
      document.head.appendChild(s);
    });
  }

  if (typeof PDFLib === 'undefined') await loadScript(PDF_LIB_URL);
  if (typeof PDFLib === 'undefined') throw new Error('pdf-lib failed to load');
  var fk = typeof fontkit !== 'undefined' ? fontkit : (typeof Fontkit !== 'undefined' ? Fontkit : null);
  if (!fk) {
    await loadScript(FONTKIT_URL);
    fk = typeof fontkit !== 'undefined' ? fontkit : (typeof Fontkit !== 'undefined' ? Fontkit : null);
  }
  if (!fk) throw new Error('fontkit failed to load');

  var PDFDocument = PDFLib.PDFDocument;
  var rgb = PDFLib.rgb;
  COLLIERS_BLUE = rgb(3 / 255, 67 / 255, 140 / 255);
  WHITE = rgb(1, 1, 1);
  GRAY = rgb(95 / 255, 99 / 255, 106 / 255);

  async function fetchBytes(url) {
    var res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('Failed to fetch ' + url + ' (' + res.status + ')');
    return new Uint8Array(await res.arrayBuffer());
  }

  function isFrenchLanguage(language) {
    var lang = String(language || '');
    return lang === 'French' || lang === 'Français' || lang === 'FR' || /french|fran\w*|fr\b/i.test(lang);
  }
  function isBilingualLanguage(language) {
    return /bilingual|bilin/i.test(String(language || ''));
  }
  function formatCredentialSuffix(degree, extra) {
    var parts = [];
    if (Array.isArray(degree)) {
      degree.forEach(function (item) {
        var text = String(item || '').trim();
        if (text) parts.push(text);
      });
    } else if (degree != null && degree !== '') {
      var single = String(degree).trim();
      if (single) parts.push(single);
    }
    var credentials = extra != null ? String(extra).trim() : '';
    if (credentials) parts.push(credentials);
    return parts.join(', ');
  }
  function formatTitleLine(title, region, sampleTitle, sampleRegion) {
    var titlePart = '';
    if (Array.isArray(title) && title.length) {
      titlePart = title.map(function (item) { return String(item || '').trim(); }).filter(Boolean).join(' | ');
    } else if (typeof title === 'string' && title.trim()) {
      titlePart = title.trim();
    }
    if (titlePart.indexOf('|') !== -1) titlePart = titlePart.split('|')[0].trim();
    var regionPart = region != null ? String(region).trim() : '';
    if (titlePart && regionPart) return titlePart + ' | ' + regionPart;
    if (titlePart) return titlePart;
    if (regionPart) return (sampleTitle || 'Title') + ' | ' + regionPart;
    return sampleTitle || 'Title';
  }
  function formatCardPhone(value) {
    if (!value) return '';
    var cleaned = String(value).replace(/\D/g, '');
    var local = cleaned;
    if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1);
    if (local.length === 10) {
      return local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6);
    }
    return String(value);
  }
  function snapshotCardDetails(details) {
    var src = details || {};
    var out = {};
    Object.keys(src).forEach(function (key) { out[key] = src[key]; });
    if (Array.isArray(src.degree)) out.degree = src.degree.slice();
    else if (src.degree) out.degree = [src.degree];
    else out.degree = [];
    return out;
  }
  function degreeCount(details) {
    var n = 0;
    (snapshotCardDetails(details).degree || []).forEach(function (item) {
      if (String(item || '').trim()) n += 1;
    });
    return n;
  }
  function resolveCardFields(details, language) {
    var card = details || {};
    var isFrench = isFrenchLanguage(language || card.language);
    var sample = isFrench ? SAMPLE_FR : SAMPLE_EN;
    var rawName = String(card.name || '').trim();
    var phoneRaw = String(card.phone || '').trim();
    var website = String(card.website || '').trim();
    if (!website || website === 'colliers.com/canada') website = sample.website;
    return {
      isFrench: isFrench,
      name: rawName || sample.name,
      credentialSuffix: formatCredentialSuffix(card.degree, card.additionalCredentials),
      title: formatTitleLine(card.title, card.region, sample.title, sample.region),
      team: String(card.specializedTeam || '').trim(),
      email: String(card.email || '').trim() || sample.email,
      phone: phoneRaw ? formatCardPhone(phoneRaw) : sample.phone,
      website: website,
      address: String(card.address || '').trim() || sample.address,
      tagline1: isFrench ? 'Maîtres' : 'Project',
      tagline2: isFrench ? 'de projets' : 'Leaders'
    };
  }
  function fitsLine(font, text, size, maxWidth) {
    return font.widthOfTextAtSize(String(text || ''), size) <= maxWidth;
  }
  function wrapByWords(font, text, size, maxWidth) {
    var words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return { ok: true, lines: [''] };
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (!fitsLine(font, w, size, maxWidth)) return { ok: false, lines: [] };
      var next = cur ? cur + ' ' + w : w;
      if (fitsLine(font, next, size, maxWidth)) cur = next;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return { ok: true, lines: lines };
  }
  function wrapAddress(font, text, size, maxWidth) {
    var paragraphs = String(text || '').split(/\n/);
    var lines = [];
    for (var p = 0; p < paragraphs.length; p++) {
      var chunk = paragraphs[p].trim();
      if (!chunk) continue;
      var wrapped = wrapByWords(font, chunk, size, maxWidth);
      if (!wrapped.ok) lines.push(chunk);
      else lines = lines.concat(wrapped.lines);
    }
    if (!lines.length) lines = [''];
    return { ok: true, lines: lines };
  }
  function fitsAfterName(fontBold, lastNameLine, credentialText) {
    var used = fontBold.widthOfTextAtSize(lastNameLine, L.nameSize);
    var credW = fontBold.widthOfTextAtSize(', ' + credentialText, L.credentialSize);
    return used + credW <= L.identityWidth;
  }
  function packCredentials(fontBold, lastNameLine, credText) {
    var parts = String(credText || '')
      .split(/,\s*/)
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean);
    if (!parts.length) return { mode: 'none', inline: '', row: '' };
    var joined = parts.join(', ');
    if (fitsAfterName(fontBold, lastNameLine, joined)) return { mode: 'inline', inline: joined, row: '' };
    var order = parts.map(function (text, index) {
      return { text: text, index: index, w: fontBold.widthOfTextAtSize(text, L.credentialSize) };
    });
    order.sort(function (a, b) {
      if (a.w !== b.w) return a.w - b.w;
      return a.index - b.index;
    });
    var inlineItems = [];
    var taken = {};
    order.forEach(function (item) {
      var trial = inlineItems
        .map(function (row) {
          return row.text;
        })
        .concat([item.text])
        .join(', ');
      if (fitsAfterName(fontBold, lastNameLine, trial)) {
        inlineItems.push(item);
        taken[item.index] = true;
      }
    });
    var inline = inlineItems
      .map(function (item) {
        return item.text;
      })
      .join(', ');
    var row = parts
      .filter(function (_text, index) {
        return !taken[index];
      })
      .join(', ');
    if (!row) return { mode: 'inline', inline: inline, row: '' };
    if (!inline) {
      if (fitsLine(fontBold, joined, L.credentialSize, L.identityWidth)) return { mode: 'own-row', inline: '', row: joined };
      return { mode: 'error', inline: '', row: '' };
    }
    if (!fitsLine(fontBold, row, L.credentialSize, L.identityWidth)) return { mode: 'error', inline: '', row: '' };
    return { mode: 'split', inline: inline, row: row };
  }
  function planCardLayout(fields, fonts, opts) {
    var font = fonts.font;
    var fontBold = fonts.fontBold;
    var errors = [];
    var count = (opts && opts.degreeCount) || 0;
    if (count > L.maxDegrees) errors.push('degrees');
    var nameWrap = wrapByWords(fontBold, fields.name, L.nameSize, L.identityWidth);
    if (!nameWrap.ok || nameWrap.lines.length > L.nameMaxLines) errors.push('name');
    var nameLines = nameWrap.ok ? nameWrap.lines : [fields.name];
    if (nameLines.length > L.nameMaxLines) nameLines = nameLines.slice(0, L.nameMaxLines);
    var lastNameLine = nameLines[nameLines.length - 1] || '';
    var credText = String(fields.credentialSuffix || '').trim();
    var packed = packCredentials(fontBold, lastNameLine, credText);
    var credMode = packed.mode === 'error' ? 'none' : packed.mode;
    if (packed.mode === 'error') errors.push('credentials');
    if (!fitsLine(font, fields.website, L.bodySize, L.identityWidth)) errors.push('website');
    if (!fitsLine(font, fields.email, L.bodySize, L.emailMaxWidth)) errors.push('email');
    if (String(fields.email || '').length > EMAIL_MAX) errors.push('email');
    var addressWrap = wrapAddress(font, fields.address, L.bodySize, L.addressMaxWidth);
    var ownCred = credMode === 'own-row' || credMode === 'split';
    var titleY = ownCred ? L.titleYWithCred : L.titleYNoCred;
    var teamY = ownCred ? L.teamYWithCred : L.teamYNoCred;
    var lastNameY = L.nameY;
    var nameLineYs = [];
    for (var n = 0; n < nameLines.length; n++) {
      nameLineYs.push(lastNameY + (nameLines.length - 1 - n) * L.nameLineHeight);
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
      credentialY: ownCred ? L.credentialY : null,
      title: fields.title,
      titleY: titleY,
      team: fields.team,
      teamY: teamY,
      email: fields.email,
      emailY: L.emailY,
      phone: 'Mobile: ' + fields.phone,
      phoneY: L.phoneY,
      website: fields.website,
      websiteY: L.websiteY,
      address: {
        lines: addressWrap.ok ? addressWrap.lines : [],
        x: L.addressX,
        bottomY: L.addressBottomY,
        lineHeight: L.bodyLineHeight
      },
      fields: fields
    };
  }
  function planProductLayout(details, language, fonts) {
    var snapshot = snapshotCardDetails(details);
    var count = degreeCount(snapshot);
    var langs = isBilingualLanguage(language) ? ['English', 'French'] : [language || 'English'];
    var pages = langs.map(function (lang) {
      var pageDetails = snapshot;
      if (isFrenchLanguage(lang)) pageDetails = Object.assign({}, snapshot, { website: WEBSITE_FR });
      var fields = resolveCardFields(pageDetails, lang);
      return { language: lang, fields: fields, layout: planCardLayout(fields, fonts, { degreeCount: count }) };
    });
    var errors = [];
    pages.forEach(function (page) {
      page.layout.errors.forEach(function (code) {
        if (errors.indexOf(code) === -1) errors.push(code);
      });
    });
    return { valid: errors.length === 0, errors: errors, pages: pages };
  }
  function printAddressLines(address, language) {
    var text = address != null ? String(address).trim() : '';
    if (text) return null;
    var sample = isFrenchLanguage(language) ? SAMPLE_FR : SAMPLE_EN;
    return sample.address.split(/\n/);
  }
  function printInlineCredential(details) {
    if (formatCredentialSuffix(details && details.degree, details && details.additionalCredentials)) return null;
    return ', C.M.';
  }
  function applyPrintPlaceholders(productPlan, details) {
    productPlan.pages.forEach(function (page) {
      var inline = printInlineCredential(details);
      if (inline && page.layout) {
        if (page.layout.credentialLine) page.layout.credentialLine = inline.replace(/^, /, '');
        else {
          page.layout.inlineCredential = inline;
          page.layout.credentialLine = '';
          page.layout.credMode = 'inline';
          if (page.fields) page.fields.credentialSuffix = inline.replace(/^, /, '');
        }
      }
      var lines = printAddressLines(details && details.address, page.language);
      if (lines && page.layout && page.layout.address) {
        page.layout.address.lines = lines;
        if (page.fields) page.fields.address = lines.join('\n');
      }
    });
  }
  var LAYOUT_MSG = {
    name: 'This name is too long to fit on two lines of the card.',
    credentials: 'These degrees and credentials are too long for the card.',
    title: 'This title and region are too long for the card.',
    team: 'This specialized team is too long for the card.',
    email: 'This email is too long to fit on one line of the card.',
    phone: 'This mobile number is too long for the card.',
    website: 'This website is too long for the card.',
    address: 'This office address is too long for the card.',
    degrees: 'You can select up to 2 degrees or certifications.'
  };

  function applyPrintPageBoxes(page) {
    page.setMediaBox(0, 0, PAGE_W, PAGE_H);
    page.setCropBox(0, 0, PAGE_W, PAGE_H);
    page.setBleedBox(0, 0, PAGE_W, PAGE_H);
    page.setTrimBox(BLEED, BLEED, TRIM_W, TRIM_H);
    page.setArtBox(BLEED, BLEED, TRIM_W, TRIM_H);
  }
  function drawText(page, text, opts) {
    if (!text) return;
    page.drawText(String(text), {
      x: opts.x,
      y: opts.y,
      size: opts.size,
      font: opts.font,
      color: opts.color
    });
  }
  function drawLinesUpFromBottom(page, lines, opts) {
    var list = Array.isArray(lines) ? lines : [];
    var y = opts.bottomY + (list.length - 1) * opts.lineHeight;
    list.forEach(function (line, idx) {
      drawText(page, line, {
        x: opts.x,
        y: y - idx * opts.lineHeight,
        size: opts.size,
        font: opts.font,
        color: opts.color
      });
    });
  }
  function drawCardPage(pdfDoc, pagePlan, assets) {
    var fields = pagePlan.fields;
    var layout = pagePlan.layout;
    var font = assets.font;
    var fontBold = assets.fontBold;
    var page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    applyPrintPageBoxes(page);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) });

    var markAspect = 227.8 / 126.4;
    var logoDrawH = L.logoW / markAspect;
    var logoDrawY = L.logoY + (L.logoH - logoDrawH) / 2;
    page.drawImage(assets.logo, {
      x: L.logoX,
      y: logoDrawY,
      width: L.logoW,
      height: logoDrawH
    });
    var words = fields.isFrench ? L.wordmarkFr : L.wordmarkEn;
    page.drawImage(fields.isFrench ? assets.wordsFr : assets.wordsEn, {
      x: words.x,
      y: words.y,
      width: words.w,
      height: words.h
    });

    var identityX = L.identityX;
    layout.nameLines.forEach(function (line, idx) {
      drawText(page, line, { x: identityX, y: layout.nameLineYs[idx], size: L.nameSize, font: fontBold, color: COLLIERS_BLUE });
    });
    if (layout.inlineCredential) {
      var last = layout.nameLines[layout.nameLines.length - 1] || '';
      var used = fontBold.widthOfTextAtSize(last, L.nameSize);
      drawText(page, layout.inlineCredential, {
        x: identityX + used,
        y: layout.lastNameY,
        size: L.credentialSize,
        font: fontBold,
        color: COLLIERS_BLUE
      });
    }
    if (layout.credentialLine) {
      drawText(page, layout.credentialLine, {
        x: identityX,
        y: layout.credentialY,
        size: L.credentialSize,
        font: fontBold,
        color: COLLIERS_BLUE
      });
    }
    drawText(page, layout.title, { x: identityX, y: layout.titleY, size: L.bodySize, font: font, color: GRAY });
    if (layout.team) {
      drawText(page, layout.team, { x: identityX, y: layout.teamY, size: L.bodySize, font: font, color: GRAY });
    }
    drawText(page, layout.email, { x: identityX, y: layout.emailY, size: L.bodySize, font: font, color: GRAY });
    drawText(page, layout.phone, { x: identityX, y: layout.phoneY, size: L.bodySize, font: font, color: GRAY });
    drawText(page, layout.website, { x: identityX, y: layout.websiteY, size: L.bodySize, font: font, color: GRAY });
    drawLinesUpFromBottom(page, layout.address.lines, {
      x: layout.address.x,
      bottomY: layout.address.bottomY,
      lineHeight: layout.address.lineHeight,
      size: L.bodySize,
      font: font,
      color: GRAY
    });
  }
  function drawCardBack(pdfDoc, assets) {
    var page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    applyPrintPageBoxes(page);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLLIERS_BLUE });
    var inset = 18;
    var x = BLEED + inset;
    var y = BLEED + inset;
    var top = BLEED + TRIM_H;
    var right = BLEED + TRIM_W;
    page.drawLine({ start: { x: x, y: top }, end: { x: x, y: y }, thickness: 0.5, color: WHITE });
    page.drawLine({ start: { x: x, y: y }, end: { x: right, y: y }, thickness: 0.5, color: WHITE });
    var size = 6.5;
    var textWidth = assets.font.widthOfTextAtSize(CARD_BACK_LEGAL, size);
    drawText(page, CARD_BACK_LEGAL, {
      x: right - inset - textWidth,
      y: top - 23.36,
      size: size,
      font: assets.font,
      color: WHITE
    });
  }

  model.card = model.card || {};
  var card = model.card;
  var language = String(card.language || (model.product && model.product.language) || 'English');
  var snapshot = snapshotCardDetails(card);

  var pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fk);
  var fontBytes = await Promise.all([fetchBytes(FONT_REG_URL), fetchBytes(FONT_BOLD_URL)]);
  var font = await pdfDoc.embedFont(fontBytes[0]);
  var fontBold = await pdfDoc.embedFont(fontBytes[1]);
  var logoBytes = await fetchBytes(LOGO_MARK_URL);
  var wordsEnBytes = await fetchBytes(WORDS_EN_URL);
  var wordsFrBytes = await fetchBytes(WORDS_FR_URL);
  var assets = {
    font: font,
    fontBold: fontBold,
    logo: await pdfDoc.embedPng(logoBytes),
    wordsEn: await pdfDoc.embedPng(wordsEnBytes),
    wordsFr: await pdfDoc.embedPng(wordsFrBytes)
  };

  var productPlan = planProductLayout(snapshot, language, assets);
  applyPrintPlaceholders(productPlan, snapshot);
  if (!productPlan.valid) {
    throw new Error(LAYOUT_MSG[productPlan.errors[0]] || productPlan.errors[0]);
  }

  var bilingual = isBilingualLanguage(language);
  productPlan.pages.forEach(function (pagePlan) {
    drawCardPage(pdfDoc, pagePlan, assets);
    if (!bilingual) drawCardBack(pdfDoc, assets);
  });

  var bytes = await pdfDoc.save();
  var blob = new Blob([bytes], { type: 'application/pdf' });
  var url = URL.createObjectURL(blob);
  var stamp = Date.now();
  var safeName = String(card.name || 'card').trim().replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'card';
  var fileName = 'Colliers-Business-Card-' + safeName + '-' + stamp + '.pdf';
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 120000);
  if (typeof BF !== 'undefined' && BF.showAlert) {
    BF.showAlert({ type: 'success', title: 'Print PDF', text: 'Download started: ' + fileName });
  }
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    if (typeof console !== 'undefined' && console.error) console.error('[viewPrintPdf]', err);
    if (typeof BF !== 'undefined' && BF.showAlert) {
      BF.showAlert({ type: 'error', title: 'Print PDF', text: msg });
    } else {
      throw err;
    }
  }
}
