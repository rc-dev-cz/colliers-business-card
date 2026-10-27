// Manage Titles (admintitles) namedAction saveEdit.
if (model.saving) return
// A title must fit the card's title line (141.52 pt) at 5.5 pt or more (Vue titleFitsOnCard,
// lineMinSize). Measured in Open Sans (the print font, loaded in onFormLoad); skipped until it loads.
function titleTooLong(text) {
  if (!window.__colliersTitleFontReady) return false
  window.__colliersMeasureCtx = window.__colliersMeasureCtx || document.createElement('canvas').getContext('2d')
  var ctx = window.__colliersMeasureCtx
  ctx.font = '400 100px "Colliers Open Sans"'
  return (ctx.measureText(String(text || '')).width * 5.5) / 100 > 141.52
}
var next = String(model.editValue || '').trim()
var row = _.find(model.titles || [], { id: model.editingId })
if (row && next && next !== row.title) {
  var clash = model.titles.some(function (other) { return other !== row && other.language === row.language && other.title.toLowerCase() === next.toLowerCase() })
  model.editError = clash ? BF.i18n('label_colliers_titleAlreadyExists') : titleTooLong(next) ? BF.i18n('label_colliers_titleTooLongForCard') : ''
  if (model.editError) return
}
model.editError = ''
model.editingId = ''
model.editValue = ''
if (!row || !next || next === row.title) return
row.title = next
function byTitle(a, b) { return a.title.localeCompare(b.title) }
model.titles.sort(byTitle)
model.payload = { id: row.id, title: next, language: row.language }
model.saving = true
BF.namedAction('persistTitle')
