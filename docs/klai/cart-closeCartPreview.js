model.previewCard = null
model.previewSlots = []
if (typeof app !== 'undefined') {
  app.previewCard = null
  app.previewSlots = []
}
document.removeEventListener('keydown', window.__colliersCartPreviewEsc, true)
var dlg = document.getElementById('colliersCartPreview')
if (dlg) {
  if (dlg.close) {
    try {
      dlg.close()
    } catch (err) {}
  }
  if (dlg.parentNode) dlg.parentNode.removeChild(dlg)
}
