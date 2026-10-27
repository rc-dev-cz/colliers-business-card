// Manage Titles (admintitles) namedAction addTitle.
// New title in the open tab's language. FileMaker returns payload.newId (persistTitle).
// One save at a time: model.payload is shared, so wait until FileMaker answers.
if (model.saving) return
var value = String(model.draft || '').trim()
if (!value) return
var language = model.activeTab === 'FR' ? 'FR' : 'EN'
if (!Array.isArray(model.titles)) model.titles = []
var exists = model.titles.some(function (row) { return row.language === language && row.title.toLowerCase() === value.toLowerCase() })
// A title must fit the card's title line (141.52 pt) at 5.5 pt or more (Vue titleFitsOnCard,
// lineMinSize). Measured in Open Sans (the print font, loaded in onFormLoad); skipped until it loads.
function titleTooLong(text) {
  if (!window.__colliersTitleFontReady) return false
  window.__colliersMeasureCtx = window.__colliersMeasureCtx || document.createElement('canvas').getContext('2d')
  var ctx = window.__colliersMeasureCtx
  ctx.font = '400 100px "Colliers Open Sans"'
  return (ctx.measureText(String(text || '')).width * 5.5) / 100 > 141.52
}
// Refused titles stay in the field with the reason, so they can be fixed (Vue AdminStringListPanel, BUG-18).
var addError = exists ? BF.i18n('label_colliers_titleAlreadyExists') : titleTooLong(value) ? BF.i18n('label_colliers_titleTooLongForCard') : ''
model.addError = addError
if (addError) return
model.draft = ''
var row = { id: 'title-' + Date.now(), title: value, language: language }
model.titles.push(row)
function byTitle(a, b) { return a.title.localeCompare(b.title) }
model.titles.sort(byTitle)
model.payload = { id: '', tempId: row.id, title: value, language: language }
model.saving = true
BF.namedAction('persistTitle')
