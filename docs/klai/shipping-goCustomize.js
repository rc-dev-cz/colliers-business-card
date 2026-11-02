var opts = (action && action.options) || {}
var code = opts.code || (typeof app !== 'undefined' && app.editCard && app.editCard.code) || ''
var lineId =
  opts.lineId ||
  (typeof app !== 'undefined' && (app.editLineId || (app.editCard && app.editCard.lineId))) ||
  ''
if (!code && !lineId) return
var path = '/customize?code=' + encodeURIComponent(code || '')
if (lineId) path += '&lineId=' + encodeURIComponent(lineId)
// The edited line's language rides on the link: CPL-* codes do not say it (Bilingual stays Bilingual).
var lang = opts.lang || (typeof app !== 'undefined' && app.editCard && app.editCard.language) || ''
if (lang) path += '&lang=' + encodeURIComponent(lang)
if (window.location) window.location.hash = '#' + path
