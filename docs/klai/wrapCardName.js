model.card = model.card || {}
var name = String(model.card.name || '')
if (name.length > 30) {
  model.card.name = name.slice(0, 30)
  name = model.card.name
}
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
packed = packCredentials(last, credText)
if (!trimmed) {
  model.card.nameWrapped = ''
  model.card.nameLines = []
  if (!credText) {
    model.card.inlineCredential = ', C.M.'
    model.card.credentialLine = ''
  } else {
    model.card.inlineCredential = packed.inline ? ', ' + packed.inline : ''
    model.card.credentialLine =
      packed.mode === 'own-row' || packed.mode === 'split' ? packed.row : ''
  }
} else {
  model.card.nameWrapped = nameLines.join('\n')
  model.card.nameLines = nameLines
  model.card.inlineCredential = packed.inline ? ', ' + packed.inline : ''
  model.card.credentialLine = packed.mode === 'own-row' || packed.mode === 'split' ? packed.row : ''
}
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
    model.card.email = local ? local + domain : ''
  }
}
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
var regionPart = String(model.card.region || '').trim()
var titleLine = titlePart && regionPart ? titlePart + ' | ' + regionPart : titlePart
if (!layoutError && titleLine && measure(titleLine, false, BODY) > TITLE_W)
  layoutError = i18nErr('label_colliers_layoutErrorTitle')
if (
  !layoutError &&
  String(model.card.specializedTeam || '').trim() &&
  measure(String(model.card.specializedTeam || ''), false, BODY) > IDENTITY_W
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
  if (local.length === 10) return local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6)
  return String(value)
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
// Empty team: close its unused row. Contacts remain bottom-locked at 43 / 35 / 27.
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
  Vue.set(model.card, 'previewEmailY', model.card.previewEmailY)
  Vue.set(model.card, 'previewPhoneY', model.card.previewPhoneY)
  Vue.set(model.card, 'previewWebY', model.card.previewWebY)
  Vue.set(model.card, 'displayPhone', model.card.displayPhone)
  Vue.set(model.card, 'printAddress', model.card.printAddress)
  Vue.set(model.card, 'addressWrapped', model.card.addressWrapped)
  Vue.set(model.card, 'displayAddress', model.card.displayAddress)
}
model.layoutError = layoutError
model.layoutReady = layoutError ? 0 : 1
var c = model.card || {}
model.canPreviewProof =
  !layoutError &&
  Boolean(String(c.name || '').trim()) &&
  Boolean(String(c.title || '').trim()) &&
  Boolean(String(c.email || '').trim()) &&
  Boolean(String(c.phone || '').trim()) &&
  Boolean(String(c.address || '').trim())
    ? 1
    : 0
