if (!model.canPreviewProof || !model.product || !model.product.code) return
var card = model.card || {}
var degree = Array.isArray(card.degree) ? card.degree.slice() : card.degree ? [card.degree] : []
var details = {
  name: card.name || '',
  title: card.title || '',
  degree: degree,
  additionalCredentials: card.additionalCredentials || '',
  region: card.region || '',
  specializedTeam: card.specializedTeam || '',
  email: card.email || '',
  phone: card.phone || '',
  company: card.company || '',
  address: card.address || '',
  website: card.website || '',
  websiteFr: card.websiteFr || '',
  language: card.language || model.product.language || '',
  nameLines: card.nameLines || [],
  inlineCredential: card.inlineCredential || '',
  credentialLine: card.credentialLine || '',
  printAddress: card.printAddress || '',
  addressWrapped: card.addressWrapped || '',
  displayPhone: card.displayPhone || '',
  previewNameYs: card.previewNameYs || [],
  previewCredY: card.previewCredY,
  previewTitleY: card.previewTitleY,
  previewTeamY: card.previewTeamY,
  previewEmailY: card.previewEmailY,
  previewPhoneY: card.previewPhoneY,
  previewWebY: card.previewWebY,
}
var editId = String(
  (model && model.editLineId) ||
    (typeof app !== 'undefined' && (app.editLineId || (app.proof && app.proof.editLineId))) ||
    ''
).trim()
var proof = {
  code: model.product.code,
  language: model.product.language,
  details: details,
  price: model.product.price || 63,
}
if (editId) proof.editLineId = editId
if (typeof app !== 'undefined') {
  app.proof = proof
  if (editId) app.editLineId = editId
}
model.proof = proof
if (editId) model.editLineId = editId
var path = '/proof?code=' + encodeURIComponent(model.product.code)
if (editId) path += '&lineId=' + encodeURIComponent(editId)
if (window.location) window.location.hash = '#' + path
