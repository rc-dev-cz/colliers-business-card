/**
 * Klai Customize named action: viewPrintPdf
 * Mirror of form.namedActions.viewPrintPdf[0].function — keep in sync with Studio.
 *
 * Generates print PDF (3.75×2.25 in with 0.125 in bleed) and triggers an
 * <a download> (Studio-safe; window.open is blocked in Klai iframes).
 * Layout mirrors Vue printPdf.js / CardPreview (trim %, name+cred wrap, bottom contact).
 *
 * Requires pdf-lib (loaded on demand via BF.libraryLoadOnce).
 */
async function viewPrintPdfBody() {
  try {
  var PDF_LIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  var IN = 72;
  var TRIM_W_IN = 3.5;
  var TRIM_H_IN = 2;
  var BLEED_IN = 0.125;
  var PAGE_W = (TRIM_W_IN + BLEED_IN * 2) * IN;
  var PAGE_H = (TRIM_H_IN + BLEED_IN * 2) * IN;
  var BLEED = BLEED_IN * IN;
  var TRIM_W = TRIM_W_IN * IN;
  var TRIM_H = TRIM_H_IN * IN;
  var NAME_LINE_MAX = 20;
  var COLLIERS_BLUE = null;
  var GRAY = null;
  var MARK = null;

  if (typeof PDFLib === 'undefined') {
    if (typeof BF === 'undefined' || !BF.libraryLoadOnce) {
      throw new Error('pdf-lib is not loaded and BF.libraryLoadOnce is unavailable');
    }
    await BF.libraryLoadOnce(PDF_LIB_URL, { type: 'script', moduleType: 'classic' });
  }
  if (typeof PDFLib === 'undefined') {
    throw new Error('pdf-lib failed to load');
  }

  var PDFDocument = PDFLib.PDFDocument;
  var StandardFonts = PDFLib.StandardFonts;
  var rgb = PDFLib.rgb;
  COLLIERS_BLUE = rgb(36 / 255, 65 / 255, 138 / 255);
  GRAY = rgb(122 / 255, 122 / 255, 122 / 255);
  MARK = rgb(0.2, 0.2, 0.2);

  function wrapCardName(value) {
    var name = String(value || '').trim();
    if (!name) return '';
    if (name.length <= NAME_LINE_MAX) return name;
    var breakAt = name.lastIndexOf(' ', NAME_LINE_MAX);
    if (breakAt < 1) breakAt = NAME_LINE_MAX;
    return name.slice(0, breakAt).replace(/\s+$/, '') + '\n' + name.slice(breakAt).replace(/^\s+/, '');
  }

  function formatPhone(value) {
    if (!value) return '';
    var cleaned = String(value).replace(/\D/g, '');
    var local = cleaned;
    if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1);
    if (local.length === 10) {
      return '+1 ' + local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6);
    }
    return String(value);
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

  model.card = model.card || {};
  var card = model.card;
  var language = String(card.language || (model.product && model.product.language) || 'English');
  var isBilingual = /bilingual|bilin/i.test(language);

  function resolveFields(lang, detailsOverride) {
    var c = Object.assign({}, card, detailsOverride || {});
    var isFrench = /french|fran|fr\b/i.test(String(lang));
    var sample = isFrench
      ? {
          name: 'Nom complet',
          title: 'Titre | Region',
          team: 'Equipe specialisee',
          email: 'Courriel:',
          phone: 'Numero de telephone',
          address: 'Adresse',
          website: 'colliersprojectleaders.com/fr'
        }
      : {
          name: 'Full Name',
          title: 'Title | Region',
          team: 'Specialized Team',
          email: 'Email:',
          phone: 'Phone Number',
          address: 'Address',
          website: 'colliersprojectleaders.com'
        };
    var rawName = String(c.name || '').trim();
    var credentialSuffix = formatCredentialSuffix(c.degree, c.additionalCredentials);
    var title = '';
    if (Array.isArray(c.title) && c.title.length) {
      title = String(c.title[0] || '').split('|')[0].trim();
    } else if (typeof c.title === 'string' && c.title.trim()) {
      title = c.title.trim().split('|')[0].trim();
    }
    var regionPart = c.region ? String(c.region).trim() : '';
    if (title && regionPart) title = title + ' | ' + regionPart;
    else if (!title && regionPart) title = (isFrench ? 'Titre' : 'Title') + ' | ' + regionPart;
    else if (!title) title = sample.title;
    var website = String(c.website || '').trim();
    if (!website || website === 'colliers.com/canada') website = sample.website;
    var phoneRaw = String(c.phone || '').trim();
    return {
      isFrench: isFrench,
      name: rawName || sample.name,
      credentialSuffix: credentialSuffix,
      title: title,
      team: String(c.specializedTeam || '').trim(),
      email: String(c.email || '').trim() || sample.email,
      phone: phoneRaw ? formatPhone(phoneRaw) : sample.phone,
      website: website,
      address: String(c.address || '').trim() || sample.address,
      tagline1: isFrench ? 'Maitres' : 'Project',
      tagline2: isFrench ? 'de projets' : 'Leaders'
    };
  }

  if (typeof console !== 'undefined' && console.debug) {
    console.debug('[viewPrintPdf] card snapshot', {
      name: card.name,
      nameWrapped: card.nameWrapped,
      title: card.title,
      email: card.email,
      phone: card.phone,
      specializedTeam: card.specializedTeam,
      address: card.address,
      website: card.website,
      degree: card.degree
    });
  }

  function drawCropMarks(page) {
    var markLen = 6;
    var gap = 1.5;
    var corners = [
      { x: BLEED, y: BLEED + TRIM_H },
      { x: BLEED + TRIM_W, y: BLEED + TRIM_H },
      { x: BLEED, y: BLEED },
      { x: BLEED + TRIM_W, y: BLEED }
    ];
    corners.forEach(function (c, i) {
      var left = i % 2 === 0;
      var top = i < 2;
      page.drawLine({
        start: { x: left ? c.x - gap - markLen : c.x + gap, y: c.y },
        end: { x: left ? c.x - gap : c.x + gap + markLen, y: c.y },
        thickness: 0.4,
        color: MARK
      });
      page.drawLine({
        start: { x: c.x, y: top ? c.y + gap : c.y - gap - markLen },
        end: { x: c.x, y: top ? c.y + gap + markLen : c.y - gap },
        thickness: 0.4,
        color: MARK
      });
    });
  }

  function drawLines(page, lines, opts) {
    var font = opts.font;
    var size = opts.size;
    var x = opts.x;
    var y = opts.y;
    var lineHeight = opts.lineHeight || size * 1.25;
    var color = opts.color;
    var list = Array.isArray(lines) ? lines : String(lines || '').split(/\n/);
    list.forEach(function (line, idx) {
      page.drawText(String(line), {
        x: x,
        y: y - idx * lineHeight,
        size: size,
        font: font,
        color: color
      });
    });
    return list.length * lineHeight;
  }

  function wrapLines(font, text, size, maxWidth) {
    var lines = String(text || '').split(/\n/);
    var out = [];
    lines.forEach(function (line) {
      var words = String(line).split(/\s+/);
      var cur = '';
      words.forEach(function (w) {
        if (!w) return;
        var next = cur ? cur + ' ' + w : w;
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
          cur = next;
        } else {
          if (cur) out.push(cur);
          if (font.widthOfTextAtSize(w, size) > maxWidth) {
            var chunk = '';
            for (var i = 0; i < w.length; i++) {
              var trial = chunk + w.charAt(i);
              if (chunk && font.widthOfTextAtSize(trial, size) > maxWidth) {
                out.push(chunk);
                chunk = w.charAt(i);
              } else {
                chunk = trial;
              }
            }
            cur = chunk;
          } else {
            cur = w;
          }
        }
      });
      if (cur) out.push(cur);
    });
    return out.length ? out : [''];
  }

  /**
   * Plan name + credentials (mirror printPdf.js). Credential wrap uses credLh, not nameLh.
   */
  function planNameAndCredentials(fontBold, nameText, credSuffix, opts) {
    var maxW = opts.maxWidth;
    var nameSize = opts.nameSize;
    var credSize = opts.credSize;
    var nameLh = opts.lineHeight;
    var credLh = opts.credLineHeight != null ? opts.credLineHeight : credSize + 2;
    var titleGap = opts.titleGap != null ? opts.titleGap : 8.5;

    var rawName = String(nameText || '').trim() || 'Full Name';
    var nameLines = wrapLines(fontBold, wrapCardName(rawName) || rawName, nameSize, maxW);
    var last = nameLines[nameLines.length - 1] || '';
    var cred = credSuffix ? String(credSuffix).trim() : '';
    var onLast = '';
    var credLines = [];

    if (cred) {
      var prefix = ', ';
      var used = fontBold.widthOfTextAtSize(last, nameSize);
      var avail = maxW - used;
      var words = cred.split(/\s+/).filter(Boolean);
      var fitted = 0;

      if (avail > fontBold.widthOfTextAtSize(prefix, credSize)) {
        for (var w = 0; w < words.length; w++) {
          var trial = prefix + words.slice(0, w + 1).join(' ');
          if (fontBold.widthOfTextAtSize(trial, credSize) <= avail) {
            onLast = trial;
            fitted = w + 1;
          } else {
            break;
          }
        }
      }

      var remaining = words.slice(fitted).join(' ');
      if (remaining) {
        var restText = onLast ? remaining : prefix + remaining;
        credLines = wrapLines(fontBold, restText, credSize, maxW);
      }
    }

    return {
      nameLines: nameLines,
      last: last,
      onLast: onLast,
      credLines: credLines,
      drop: (nameLines.length - 1) * nameLh + credLines.length * credLh + titleGap,
      nameLh: nameLh,
      credLh: credLh,
      titleGap: titleGap
    };
  }

  function drawNameAndCredentials(page, fontBold, plan, opts) {
    var x = opts.x;
    var y = opts.y;
    var nameSize = opts.nameSize;
    var credSize = opts.credSize;
    var color = opts.color;
    var nameLh = plan.nameLh;
    var credLh = plan.credLh;

    for (var i = 0; i < plan.nameLines.length - 1; i++) {
      page.drawText(plan.nameLines[i], {
        x: x,
        y: y,
        size: nameSize,
        font: fontBold,
        color: color
      });
      y -= nameLh;
    }

    page.drawText(plan.last, {
      x: x,
      y: y,
      size: nameSize,
      font: fontBold,
      color: color
    });

    if (plan.onLast) {
      var used = fontBold.widthOfTextAtSize(plan.last, nameSize);
      page.drawText(plan.onLast, {
        x: x + used,
        y: y,
        size: credSize,
        font: fontBold,
        color: color
      });
    }

    if (!plan.credLines.length) {
      return y - plan.titleGap;
    }

    for (var c = 0; c < plan.credLines.length; c++) {
      y -= credLh;
      page.drawText(plan.credLines[c], {
        x: x,
        y: y,
        size: credSize,
        font: fontBold,
        color: color
      });
    }

    return y - plan.titleGap;
  }

  function drawCardPage(pdfDoc, font, fontBold, fields) {
    var page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    page.setMediaBox(0, 0, PAGE_W, PAGE_H);
    page.setCropBox(0, 0, PAGE_W, PAGE_H);
    page.setBleedBox(0, 0, PAGE_W, PAGE_H);
    page.setTrimBox(BLEED, BLEED, TRIM_W, TRIM_H);
    page.setArtBox(BLEED, BLEED, TRIM_W, TRIM_H);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_W,
      height: PAGE_H,
      color: rgb(1, 1, 1)
    });

    // Match CardPreview / printPdf.js: brand left 7.5%/13%, identity column 44%, bottom 14%.
    var logoX = BLEED + TRIM_W * 0.075;
    var logoTop = BLEED + TRIM_H * (1 - 0.13);
    page.drawText('Colliers', {
      x: logoX,
      y: logoTop - 11,
      size: 10,
      font: fontBold,
      color: COLLIERS_BLUE
    });
    page.drawText(fields.tagline1, {
      x: logoX + 48,
      y: logoTop - 7,
      size: 8,
      font: font,
      color: COLLIERS_BLUE
    });
    page.drawText(fields.tagline2, {
      x: logoX + 48,
      y: logoTop - 16,
      size: 8,
      font: font,
      color: COLLIERS_BLUE
    });

    var identityX = BLEED + TRIM_W * 0.44;
    var identityMaxW = TRIM_W * 0.5;
    var bottomPad = BLEED + TRIM_H * 0.14;
    var bodySize = 7;
    var bodyLh = 9;
    var nameSize = 10;
    var nameLh = 12;
    var credSize = 7;
    var credLh = 9;
    var titleGap = 8.5;
    var identityFloor = bottomPad + bodyLh * 3 + 6;
    var defaultNameY = BLEED + TRIM_H * (1 - 0.3);
    var maxNameY = logoTop - 20;

    var titleLines = wrapLines(font, fields.title, bodySize, identityMaxW);
    var teamLines = fields.team ? wrapLines(font, fields.team, bodySize, identityMaxW) : [''];
    var emailLines = wrapLines(font, fields.email, bodySize, identityMaxW);
    var phoneLines = wrapLines(font, 'Mobile: ' + fields.phone, bodySize, identityMaxW);
    var websiteLines = wrapLines(font, fields.website, bodySize, identityMaxW);
    var addressLines = String(fields.address || '')
      .split(/\n/)
      .reduce(function (acc, line) {
        return acc.concat(wrapLines(font, line, bodySize, TRIM_W * 0.345));
      }, []);

    // Contact + address share bottom baseline (preview bottom-[14%]).
    var contactY = bottomPad;
    contactY += (websiteLines.length - 1) * bodyLh;
    drawLines(page, websiteLines, {
      x: identityX,
      y: contactY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });
    contactY += bodyLh + 1;
    contactY += (phoneLines.length - 1) * bodyLh;
    drawLines(page, phoneLines, {
      x: identityX,
      y: contactY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });
    contactY += bodyLh + 1;
    contactY += (emailLines.length - 1) * bodyLh;
    drawLines(page, emailLines, {
      x: identityX,
      y: contactY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });

    var addressY = bottomPad + (addressLines.length - 1) * bodyLh;
    drawLines(page, addressLines, {
      x: BLEED + TRIM_W * 0.075,
      y: addressY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });

    var namePlan = planNameAndCredentials(fontBold, fields.name, fields.credentialSuffix, {
      maxWidth: identityMaxW,
      nameSize: nameSize,
      credSize: credSize,
      lineHeight: nameLh,
      credLineHeight: credLh,
      titleGap: titleGap
    });
    var belowName =
      titleLines.length * bodyLh + (fields.team ? 2 + teamLines.length * bodyLh : 0);
    var nameStartY = defaultNameY;
    if (nameStartY - namePlan.drop - belowName < identityFloor) {
      nameStartY = identityFloor + namePlan.drop + belowName;
    }
    if (nameStartY > maxNameY) nameStartY = maxNameY;

    var cursorY = drawNameAndCredentials(page, fontBold, namePlan, {
      x: identityX,
      y: nameStartY,
      nameSize: nameSize,
      credSize: credSize,
      color: COLLIERS_BLUE
    });
    cursorY -= drawLines(page, titleLines, {
      x: identityX,
      y: cursorY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });
    cursorY -= 2;
    drawLines(page, teamLines, {
      x: identityX,
      y: cursorY,
      size: bodySize,
      font: font,
      color: GRAY,
      lineHeight: bodyLh
    });
  }

  var pdfDoc = await PDFDocument.create();
  var font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  var fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (isBilingual) {
    drawCardPage(pdfDoc, font, fontBold, resolveFields('English'));
    drawCardPage(pdfDoc, font, fontBold, resolveFields('French', { website: 'colliersprojectleaders.com/fr' }));
  } else {
    drawCardPage(pdfDoc, font, fontBold, resolveFields(language));
  }

  var bytes = await pdfDoc.save();
  var blob = new Blob([bytes], { type: 'application/pdf' });
  var url = URL.createObjectURL(blob);
  var stamp = Date.now();
  var safeName = String(card.name || 'card')
    .trim()
    .replace(/[^\w\-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'card';
  var fileName = 'Colliers-Business-Card-' + safeName + '-' + stamp + '.pdf';
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {}
  }, 120000);
  if (typeof BF !== 'undefined' && BF.showAlert) {
    BF.showAlert({
      type: 'success',
      title: 'Print PDF',
      text: 'Download started: ' + fileName
    });
  }
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    if (typeof console !== 'undefined' && console.error) {
      console.error('[viewPrintPdf]', err);
    }
    if (typeof BF !== 'undefined' && BF.showAlert) {
      BF.showAlert({
        type: 'error',
        title: 'Print PDF',
        text: msg
      });
    } else {
      throw err;
    }
  }
}
