var opts = (action && action.options) || {}
var code = opts.code || (typeof app !== 'undefined' && app.editCard && app.editCard.code) || ''
var lineId =
  opts.lineId ||
  (typeof app !== 'undefined' && (app.editLineId || (app.editCard && app.editCard.lineId))) ||
  ''
if (!code && !lineId) return
var path = '/customize?code=' + encodeURIComponent(code || '')
if (lineId) path += '&lineId=' + encodeURIComponent(lineId)
if (window.location) window.location.hash = '#' + path
