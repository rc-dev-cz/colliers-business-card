model.card = model.card || {}
// Same rules as Vue validate.js: name = letters (any language), spaces, - ' . only.
// Emoji, digits and symbols cannot print on the card (Open Sans has no glyphs).
var NAME_DISALLOWED = /[^\p{L}\p{M}\s.'\u2019-]/gu
var CARD_TEXT_DISALLOWED =
  /[\p{Extended_Pictographic}\p{So}\p{Cs}\p{Co}\p{Cc}\u200d]|\ufe0e|\ufe0f|\u20e3/gu
var name = String(model.card.name || '')
  .replace(NAME_DISALLOWED, '')
  .replace(/\s+/g, ' ')
  .replace(/^ /, '')
  .slice(0, 50)
if (name !== model.card.name) model.card.name = name
;['additionalCredentials', 'specializedTeam', 'titleFr'].forEach(function (key) {
  if (typeof model.card[key] !== 'string') return
  var cleaned = model.card[key].replace(CARD_TEXT_DISALLOWED, '')
  if (cleaned !== model.card[key]) model.card[key] = cleaned
})
var isBilingualCard = /bilingual|bilin/i.test(
  String((model.product && model.product.language) || model.card.language || '')
)
// Bilingual French title dropdown: FileMaker's French titles (onFormLoad titleFrChoices), plus a saved value that is not on the list.
// The user picks the French title; there is no English → French mapping.
var titleFrList = (Array.isArray(model.titleFrChoices) ? model.titleFrChoices : []).slice()
var currentFr = String(model.card.titleFr || '').trim()
if (currentFr && titleFrList.indexOf(currentFr) === -1) titleFrList.unshift(currentFr)
function setModel(key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, key, value)
  else model[key] = value
}
if ((model.titleFrOptions || []).join('|') !== titleFrList.join('|'))
  setModel('titleFrOptions', titleFrList)
var trimmed = name.trim()
function measure(text, bold, size) {
  window.__colliersMeasureCtx =
    window.__colliersMeasureCtx || document.createElement('canvas').getContext('2d')
  var ctx = window.__colliersMeasureCtx
  ctx.font = (bold ? '700 ' : '400 ') + size + 'px "Open Sans", sans-serif'
  return ctx.measureText(String(text || '')).width
}
function fitsLine(text, bold, size, maxWidth) {
  return measure(text, bold, size) <= maxWidth
}
function wrapByWordsAt(text, bold, size, maxWidth) {
  var words = String(text || '')
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return { ok: true, lines: [''] }
  var lines = []
  var cur = ''
  for (var i = 0; i < words.length; i++) {
    var w = words[i]
    if (!fitsLine(w, bold, size, maxWidth)) return { ok: false, lines: [] }
    var next = cur ? cur + ' ' + w : w
    if (!cur || fitsLine(next, bold, size, maxWidth)) cur = next
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return { ok: true, lines: lines }
}
function wrapByWords(text, size, maxWidth) {
  return wrapByWordsAt(text, true, size, maxWidth)
}
function wrapAddress(text) {
  var paragraphs = String(text || '').split(/\n/)
  var lines = []
  for (var p = 0; p < paragraphs.length; p++) {
    var chunk = paragraphs[p].trim()
    if (!chunk) continue
    var wrapped = wrapByWordsAt(chunk, false, BODY, 80)
    if (!wrapped.ok) lines.push(chunk)
    else lines = lines.concat(wrapped.lines)
  }
  return lines
}
function packCredentials(lastNameLine, credText) {
  var parts = String(credText || '')
    .split(/,\s*/)
    .map(function (part) {
      return part.trim()
    })
    .filter(Boolean)
  if (!parts.length) return { mode: 'none', inline: '', row: '' }
  var joined = parts.join(', ')
  function fitsAfter(last, cred) {
    return measure(last, true, 10) + measure(', ' + cred, true, 7) <= IDENTITY_W
  }
  if (fitsAfter(lastNameLine, joined)) return { mode: 'inline', inline: joined, row: '' }
  var order = parts.map(function (text, index) {
    return { text: text, index: index, w: measure(text, true, 7) }
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
    if (fitsAfter(lastNameLine, trial)) {
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
    if (fitsLine(joined, true, 7, IDENTITY_W)) return { mode: 'own-row', inline: '', row: joined }
    return { mode: 'error', inline: '', row: '' }
  }
  if (!fitsLine(row, true, 7, IDENTITY_W)) return { mode: 'error', inline: '', row: '' }
  return { mode: 'split', inline: inline, row: row }
}
var IDENTITY_W = 141.52
var EMAIL_W = 141.52
var TITLE_W = 141.52
var BODY = 6.5
var degrees = []
  .concat(
    Array.isArray(model.card.degree)
      ? model.card.degree
      : model.card.degree
        ? [model.card.degree]
        : []
  )
  .filter(Boolean)
var extra = String(model.card.additionalCredentials || '').trim()
var credParts = degrees.slice()
if (extra) credParts.push(extra)
var credText = credParts.join(', ')
var packed = { mode: 'none', inline: '', row: '' }
var planName = trimmed || 'Firstname Lastname'
var nameWrap = wrapByWords(planName, 10, IDENTITY_W)
var nameLines = nameWrap.ok ? nameWrap.lines.slice(0, 2) : [planName]
if (!nameLines.length) nameLines = [planName]
var last = nameLines[nameLines.length - 1] || ''
// Name stops at the measured card space (Vue nameFitsOnCard): two lines of the identity column
// that still leave room for the chosen credentials.
function nameFits(candidate) {
  var t = String(candidate || '').trim()
  if (!t) return true
  var w = wrapByWords(t, 10, IDENTITY_W)
  if (!w.ok || w.lines.length > 2) return false
  return !credText || packCredentials(w.lines[w.lines.length - 1] || '', credText).mode !== 'error'
}
var namePrev = typeof model.namePrev === 'string' ? model.namePrev : ''
var nameNow = String(model.card.name || '')
if (!nameFits(nameNow) && nameNow.length >= namePrev.length) {
  // Typing or pasting past the room left: keep what still fits and say why.
  while (nameNow.length > namePrev.length && !nameFits(nameNow)) nameNow = nameNow.slice(0, -1)
  model.card.name = nameNow
  name = nameNow
  trimmed = nameNow.trim()
  planName = trimmed || 'Firstname Lastname'
  nameWrap = wrapByWords(planName, 10, IDENTITY_W)
  nameLines = nameWrap.ok ? nameWrap.lines.slice(0, 2) : [planName]
  if (!nameLines.length) nameLines = [planName]
  last = nameLines[nameLines.length - 1] || ''
  setModel('nameRefusedAt', nameNow)
}
setModel('namePrev', String(model.card.name || ''))
// "Limit reached for card" stays while it is true (Vue nameLimitReached, BUG-08): at 49 characters,
// right after a letter was refused for card width, or when not even one more narrow letter fits.
var nameShown = String(model.card.name || '')
setModel(
  'nameNotice',
  nameShown &&
    (nameShown.length >= 49 || model.nameRefusedAt === nameShown || !nameFits(nameShown + 'i'))
    ? 1
    : 0
)
// Credentials stop at the measured card space (Vue credentialsFitOnCard / lockedDegreeValues):
// an added degree or a longer credential that no longer fits is undone, and options that cannot fit are disabled.
function credsFit(degreeList, extraText) {
  var list = degreeList.slice()
  var e = String(extraText || '').trim()
  if (e) list.push(e)
  return !list.length || packCredentials(last, list.join(', ')).mode !== 'error'
}
function flashCredentialNotice(field) {
  setModel('credentialNotice', field)
  clearTimeout(window.__colliersCredNoticeTimer)
  window.__colliersCredNoticeTimer = setTimeout(function () {
    setModel('credentialNotice', '')
  }, 3000)
}
var credPrev = model.credPrev && typeof model.credPrev === 'object' ? model.credPrev : null
if (
  credPrev &&
  !credsFit(degrees, extra) &&
  credsFit(credPrev.degree || [], credPrev.extra || '')
) {
  var prevDegrees = (credPrev.degree || []).slice()
  var prevExtra = String(credPrev.extra || '')
  var addedDegree =
    degrees.length === prevDegrees.length + 1 &&
    prevDegrees.every(function (d) {
      return degrees.indexOf(d) !== -1
    })
  // Other credential is refused whole below, never clipped as typed (Vue onAdditionalCredentials, BUG-05).
  var grewExtra = false
  if (addedDegree || grewExtra) {
    if (typeof Vue !== 'undefined' && Vue.set) {
      Vue.set(model.card, 'degree', prevDegrees.slice())
      Vue.set(model.card, 'additionalCredentials', prevExtra)
    } else {
      model.card.degree = prevDegrees.slice()
      model.card.additionalCredentials = prevExtra
    }
    degrees = prevDegrees.slice()
    extra = prevExtra.trim()
    credParts = degrees.slice()
    if (extra) credParts.push(extra)
    credText = credParts.join(', ')
    flashCredentialNotice(addedDegree ? 'degree' : 'additional')
  }
}
if (Number(model.credentialLockedClick) === 1) {
  setModel('credentialLockedClick', 0)
  flashCredentialNotice('degree')
}
// Other credential is refused whole (Vue onAdditionalCredentials, BUG-05): text that does not fit stays
// in the field with the no-space message and the card shows none of it. It goes on the card once
// something else frees the room.
if (typeof model.card.otherCredentialDraft !== 'string') {
  if (typeof Vue !== 'undefined' && Vue.set)
    Vue.set(model.card, 'otherCredentialDraft', String(model.card.additionalCredentials || ''))
  else model.card.otherCredentialDraft = String(model.card.additionalCredentials || '')
}
var draft = model.card.otherCredentialDraft.replace(CARD_TEXT_DISALLOWED, '')
if (draft !== model.card.otherCredentialDraft) model.card.otherCredentialDraft = draft
var draftFits = credsFit(degrees, draft)
var committed = draftFits ? draft : ''
if (String(model.card.additionalCredentials || '') !== committed) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.card, 'additionalCredentials', committed)
  else model.card.additionalCredentials = committed
}
extra = committed.trim()
credParts = degrees.slice()
if (extra) credParts.push(extra)
credText = credParts.join(', ')
var otherRejected = Boolean(draft.trim()) && !draftFits
setModel('otherRejected', otherRejected ? 1 : 0)
setModel('credPrev', {
  degree: degrees.slice(),
  extra: String(model.card.additionalCredentials || ''),
})
var lockedDegrees = (model.degreeOptions || []).filter(function (opt) {
  return degrees.indexOf(opt) === -1 && !credsFit(degrees.concat([opt]), extra)
})
if ((model.lockedDegrees || []).join('|') !== lockedDegrees.join('|'))
  setModel('lockedDegrees', lockedDegrees)
// Nothing more fits after the name: lock the empty Additional Credentials field too.
// Every option left is locked: the card is full, red "No more space" (Vue degreesFull, CU-02).
// Some locked: yellow "Little space left" (BUG-09).
var unselectedDegrees = (model.degreeOptions || []).filter(function (opt) {
  return degrees.indexOf(opt) === -1
})
var degreesFull = unselectedDegrees.length > 0 && lockedDegrees.length === unselectedDegrees.length
setModel('degreesFull', degreesFull ? 1 : 0)
// Link and empty field are off while the card is full or not one letter fits; a field with text stays editable.
setModel('additionalLocked', !draft.trim() && (degreesFull || !credsFit(degrees, 'i')) ? 1 : 0)
// Only chosen credentials print after the name; an empty card shows none.
packed = packCredentials(last, credText)
model.card.nameWrapped = trimmed ? nameLines.join('\n') : ''
model.card.nameLines = trimmed ? nameLines : []
model.card.inlineCredential = packed.inline ? ', ' + packed.inline : ''
model.card.credentialLine = packed.mode === 'own-row' || packed.mode === 'split' ? packed.row : ''
if (typeof Vue !== 'undefined' && Vue.set) {
  Vue.set(model.card, 'nameLines', model.card.nameLines || [])
  Vue.set(model.card, 'inlineCredential', model.card.inlineCredential || '')
  Vue.set(model.card, 'credentialLine', model.card.credentialLine || '')
}
if (!model.card.emailEdited) {
  var parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length < 2) {
    model.card.email = ''
  } else {
    var slug = function (s) {
      return String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '')
    }
    var first = slug(parts[0])
    var lastName = slug(parts[parts.length - 1])
    var domain = '@colliersprojectleaders.com'
    var local = first && lastName ? first + '.' + lastName : ''
    if (local.length > 50 - domain.length)
      local = local.slice(0, 50 - domain.length).replace(/\.+$/, '')
    // Shortened to fit its card line, so a long name never leaves an email the card cannot print.
    while (local && measure(local + domain, false, BODY) > EMAIL_W)
      local = local.slice(0, -1).replace(/\.+$/, '')
    model.card.email = local ? local + domain : ''
  }
}
// Specialized team prints on one line: stop typing once it no longer fits (Vue teamFitsOnCard).
function teamTooWide(text) {
  var t = String(text || '').trim()
  return Boolean(t) && measure(t, false, BODY) > IDENTITY_W
}
var teamNow = String(model.card.specializedTeam || '')
var teamPrev = typeof model.teamPrev === 'string' ? model.teamPrev : ''
if (teamTooWide(teamNow) && teamNow.length >= teamPrev.length && !teamTooWide(teamPrev)) {
  model.card.specializedTeam = teamPrev
  setModel('teamNotice', 1)
  clearTimeout(window.__colliersTeamNoticeTimer)
  window.__colliersTeamNoticeTimer = setTimeout(function () {
    setModel('teamNotice', 0)
  }, 3000)
} else if (teamNow !== teamPrev && Number(model.teamNotice) === 1) {
  setModel('teamNotice', 0)
}
setModel('teamPrev', String(model.card.specializedTeam || ''))
function i18nErr(key) {
  return typeof BF !== 'undefined' && BF.i18n ? BF.i18n(key) : key
}
var layoutError = ''
if (packed && packed.mode === 'error')
  layoutError = i18nErr('label_colliers_layoutErrorCredentials')
var probe = wrapByWords(trimmed, 10, IDENTITY_W)
if (!layoutError && trimmed && (!probe.ok || probe.lines.length > 2))
  layoutError = i18nErr('label_colliers_layoutErrorName')
if (!layoutError && measure(String(model.card.email || ''), false, BODY) > EMAIL_W)
  layoutError = i18nErr('label_colliers_layoutErrorEmail')
var titlePart = String(model.card.title || '')
  .split('|')[0]
  .trim()
var titleFrPart = isBilingualCard ? String(model.card.titleFr || '').trim() : ''
var regionPart = String(model.card.region || '').trim()
// French faces print the French region name (Vue regionForCard, BUG-10); the saved value stays English.
var REGION_FR = {
  'British Columbia': 'Colombie-Britannique',
  'New Brunswick': 'Nouveau-Brunswick',
  'Newfoundland and Labrador': 'Terre-Neuve-et-Labrador',
  'Nova Scotia': 'Nouvelle-Écosse',
  'Prince Edward Island': 'Île-du-Prince-Édouard',
  Quebec: 'Québec',
  'Northwest Territories': 'Territoires du Nord-Ouest',
}
var regionFrPart = REGION_FR[regionPart] || regionPart
var isFrenchCard =
  !isBilingualCard &&
  /french|fran/i.test(
    String((model.product && model.product.language) || model.card.language || '')
  )
// Region list in the card's language: English Quebec, French Québec, bilingual "Quebec / Québec" (Vue regionOptions).
var regionChoices = (
  Array.isArray(model.regionOptions) && model.regionOptions.length ? model.regionOptions : []
).map(function (r) {
  var frName = REGION_FR[r] || r
  return {
    value: r,
    label: isFrenchCard ? frName : isBilingualCard && frName !== r ? r + ' / ' + frName : r,
  }
})
if (JSON.stringify(model.regionChoices || null) !== JSON.stringify(regionChoices))
  setModel('regionChoices', regionChoices)
// Each face as it prints: [title, region].
var regionFaces = isFrenchCard
  ? [[titlePart || 'Titre', regionFrPart]]
  : [[titlePart || 'Title', regionPart]]
if (isBilingualCard && titleFrPart) regionFaces.push([titleFrPart, regionFrPart])
var teamPart = String(model.card.specializedTeam || '').trim()
// Region placement (Vue cardLayout.js applyPreviewTitleRegionSplit, Oct 2026):
// team filled -> 'team | region'; otherwise (or 'team | region' too wide) 'Title | Region' on one line
// when it fits on every face (bilingual EN and FR together), else region on its own line under the title.
var regionMode = 'none'
if (regionPart) {
  if (
    teamPart &&
    regionFaces.every(function (f) {
      return fitsLine(teamPart + ' | ' + f[1], false, BODY, IDENTITY_W)
    })
  )
    regionMode = 'team'
  else if (
    regionFaces.every(function (f) {
      return fitsLine(f[0] + ' | ' + f[1], false, BODY, TITLE_W)
    })
  )
    regionMode = 'title'
  else regionMode = 'own'
}
// A title too long for its lane shrinks to fit, down to 5.5 pt; one that would need less stays 6.5 pt
// and reports too long (Vue cardLayout.js titleSizeFor / shrinkToFitSize, lineMinSize 5.5).
var TITLE_MIN = 5.5
function titleSizeFor(t) {
  t = String(t || '').trim()
  if (!t || fitsLine(t, false, BODY, TITLE_W)) return BODY
  var size = Number(((BODY * TITLE_W) / measure(t, false, BODY)).toFixed(2))
  while (size > 1 && !fitsLine(t, false, size, TITLE_W)) size = Number((size - 0.01).toFixed(2))
  return size >= TITLE_MIN ? size : BODY
}
var titleSize = titleSizeFor(titlePart)
var titleFrSize = titleSizeFor(titleFrPart)
// Shown once, under the title field that is too long (Vue titleFieldError, BUG-12); "title and region"
// only when a region is chosen.
var titleErrKey = regionPart
  ? 'label_colliers_layoutErrorTitle'
  : 'label_colliers_layoutErrorTitleOnly'
var layoutErrorField = ''
if (!layoutError && titlePart && measure(titlePart, false, titleSize) > TITLE_W) {
  layoutError = i18nErr(titleErrKey)
  layoutErrorField = 'title'
}
if (!layoutError && titleFrPart && measure(titleFrPart, false, titleFrSize) > TITLE_W) {
  layoutError = i18nErr(titleErrKey)
  layoutErrorField = 'titleFr'
}
// 6.5 pt on the 252 pt trim = 2.579cqw; shrunk titles scale the same way
model.card.previewTitleSize = ((titleSize / 252) * 100).toFixed(3) + 'cqw'
model.card.previewTitleFrSize = ((titleFrSize / 252) * 100).toFixed(3) + 'cqw'
if (
  !layoutError &&
  String(model.card.specializedTeam || '').trim() &&
  measure(String(model.card.specializedTeam || '').trim(), false, BODY) > IDENTITY_W
)
  layoutError = i18nErr('label_colliers_layoutErrorTeam')
if (!layoutError && measure(String(model.card.phone || ''), false, BODY) > IDENTITY_W)
  layoutError = i18nErr('label_colliers_layoutErrorPhone')
var site = String(model.card.website || '')
if (!layoutError && site && measure(site, false, BODY) > IDENTITY_W)
  layoutError = i18nErr('label_colliers_layoutErrorWebsite')
function formatCardPhone(value) {
  if (!value) return ''
  var cleaned = String(value).replace(/\D/g, '')
  var local = cleaned
  if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1)
  // Card style is spaces only, even for a partial number (never the form's '416 555-1234' hyphen)
  return [local.slice(0, 3), local.slice(3, 6), local.slice(6)].filter(Boolean).join(' ')
}
function streetAddress(text) {
  var lines = String(text || '')
    .split(/\n/)
    .map(function (ln) {
      return ln.trim()
    })
    .filter(Boolean)
  if (lines[0] && /office\s*$/i.test(lines[0])) lines.shift()
  return lines.join('\n')
}
function pct(y) {
  return ((y - 9) / 144) * 100
}
var ownCred = packed.mode === 'own-row' || packed.mode === 'split'
var titleY = ownCred ? 58.99 : 66.99
var teamY = ownCred ? 50.99 : 58.99
var lastNameY = 75.49
var planLines =
  model.card.nameLines && model.card.nameLines.length ? model.card.nameLines : [planName]
var nameLineYs = []
for (var ni = 0; ni < planLines.length; ni++) {
  nameLineYs.push(lastNameY + (planLines.length - 1 - ni) * 11)
}
var team = String(model.card.specializedTeam || '').trim()
var lastIdentityY = team ? teamY : titleY
var minLastY = 43 + 15.99
var lift = lastIdentityY < minLastY ? Number((minLastY - lastIdentityY).toFixed(2)) : 0
if (lift) {
  titleY += lift
  teamY += lift
  lastNameY += lift
  for (ni = 0; ni < nameLineYs.length; ni++) nameLineYs[ni] += lift
}
var credentialY = ownCred ? 66.99 + lift : null
if (!team) {
  var shiftDown = Number((titleY - 58.99).toFixed(2))
  if (shiftDown > 0) {
    titleY -= shiftDown
    teamY -= shiftDown
    lastNameY -= shiftDown
    for (ni = 0; ni < nameLineYs.length; ni++) nameLineYs[ni] -= shiftDown
    if (credentialY != null) credentialY -= shiftDown
  }
}
var regionY = null
if (regionMode === 'own') {
  // Region takes the title's slot; title, credentials and name lift one body line (8 pt)
  regionY = titleY
  titleY += 8
  lastNameY += 8
  for (ni = 0; ni < nameLineYs.length; ni++) nameLineYs[ni] += 8
  if (credentialY != null) credentialY += 8
}
model.card.previewRegionMode = regionMode
model.card.previewRegionY = regionY != null ? pct(regionY) : ''
model.card.previewNameYs = nameLineYs.map(pct)
model.card.previewCredY = credentialY != null ? pct(credentialY) : ''
model.card.previewTitleY = pct(titleY)
model.card.previewTeamY = pct(teamY)
model.card.previewEmailY = pct(43)
model.card.previewPhoneY = pct(35)
model.card.previewWebY = pct(27)
model.card.displayPhone = formatCardPhone(model.card.phone)
var addr = streetAddress(model.card.address)
model.card.printAddress = addr
var addrLines = wrapAddress(addr)
model.card.addressWrapped = addrLines.join('\n')
model.card.displayAddress = model.card.addressWrapped
if (typeof Vue !== 'undefined' && Vue.set) {
  Vue.set(model.card, 'previewNameYs', model.card.previewNameYs)
  Vue.set(model.card, 'previewCredY', model.card.previewCredY)
  Vue.set(model.card, 'previewTitleY', model.card.previewTitleY)
  Vue.set(model.card, 'previewTeamY', model.card.previewTeamY)
  Vue.set(model.card, 'previewRegionMode', model.card.previewRegionMode)
  Vue.set(model.card, 'previewTitleSize', model.card.previewTitleSize)
  Vue.set(model.card, 'previewTitleFrSize', model.card.previewTitleFrSize)
  Vue.set(model.card, 'previewRegionY', model.card.previewRegionY)
  Vue.set(model.card, 'previewEmailY', model.card.previewEmailY)
  Vue.set(model.card, 'previewPhoneY', model.card.previewPhoneY)
  Vue.set(model.card, 'previewWebY', model.card.previewWebY)
  Vue.set(model.card, 'displayPhone', model.card.displayPhone)
  Vue.set(model.card, 'printAddress', model.card.printAddress)
  Vue.set(model.card, 'addressWrapped', model.card.addressWrapped)
  Vue.set(model.card, 'displayAddress', model.card.displayAddress)
}
model.layoutError = layoutError
setModel('layoutErrorField', layoutError ? layoutErrorField : '')
model.layoutReady = layoutError ? 0 : 1
var c = model.card || {}
// Mobile must be a valid 10-digit Canadian number: area code and exchange start 2-9 (Vue
// isCompletePhone, BUG-26). Bilingual cards need the French title (Vue canPreviewProof).
var phoneDigits = String(c.phone || '')
  .replace(/\D/g, '')
  .replace(/^1(?=\d{10}$)/, '')
var phoneOk = /^[2-9]\d{2}[2-9]\d{6}$/.test(phoneDigits)
setModel(
  'phoneError',
  phoneDigits && !phoneOk
    ? i18nErr(
        phoneDigits.length < 10
          ? 'label_colliers_mobilePhoneIncomplete'
          : 'label_colliers_mobilePhoneInvalid'
      )
    : ''
)
// Email format is checked once the field is left, then live while it is fixed (Vue isValidEmail).
var EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
var emailText = String(c.email || '').trim()
var emailFormatOk = EMAIL_FORMAT.test(emailText)
setModel(
  'emailFormatError',
  Number(c.emailTouched) === 1 && emailText && !emailFormatOk
    ? i18nErr('label_colliers_emailInvalid')
    : ''
)
model.canPreviewProof =
  !layoutError &&
  !otherRejected &&
  Boolean(String(c.name || '').trim()) &&
  Boolean(String(c.title || '').trim()) &&
  (!isBilingualCard || Boolean(String(c.titleFr || '').trim())) &&
  emailFormatOk &&
  phoneOk &&
  Boolean(String(c.address || '').trim())
    ? 1
    : 0
model.phoneIncomplete = phoneDigits.length > 0 && phoneDigits.length !== 10 ? 1 : 0
