if (!model.product || !model.product.code) return;
function cloneDetails(src) {
  var details = Object.assign({}, src || {});
  if (Array.isArray(src && src.degree)) details.degree = src.degree.slice();
  else if (src && src.degree) details.degree = [src.degree];
  else details.degree = details.degree || [];
  return details;
}
function cartList() {
  if (typeof app === 'undefined') return [];
  if (Array.isArray(app.cart)) return app.cart;
  if (app.cart && Array.isArray(app.cart.items)) return app.cart.items;
  return [];
}
var editId = String(model.editLineId || '');
if (!editId) {
  var hash = (window.location && window.location.hash) || '';
  var lineMatch = hash.match(/[?&]lineId=([^&]+)/);
  if (lineMatch) editId = decodeURIComponent(lineMatch[1]);
}
var payload = null;
if (editId && typeof app !== 'undefined' && app.editCard && String(app.editCard.lineId) === String(editId)) {
  payload = app.editCard;
}
var line = null;
if (editId) {
  line = cartList().find(function (item) { return String(item.id) === String(editId); }) || null;
}
var details = null;
if (payload && payload.details) details = cloneDetails(payload.details);
else if (line && line.details) details = cloneDetails(line.details);
else if (typeof app !== 'undefined' && app.proof && app.proof.details && (!editId || String(app.proof.editLineId || '') === String(editId))) {
  details = cloneDetails(app.proof.details);
}
if (!details) return;
// A saved French title is the user's own: keep it instead of re-suggesting from the EN title
if (String(details.titleFr || '').trim()) details.titleFrEdited = 1;
if (editId && typeof app !== 'undefined') app.editLineId = editId;
model.editLineId = editId || model.editLineId;
model.card = Object.assign({}, model.card || {}, details);
// Other credential field starts from the saved credential (wrapCardName refuses a draft that does not fit).
model.card.otherCredentialDraft = String(model.card.additionalCredentials || '');
var lang = model.product.language || model.card.language;
model.card.language = lang;
model.card.company = 'Colliers Project Leaders';
function isBilin(s) { return /bilingual|bilin/i.test(String(s || '')); }
function isFrenchOnly(s) {
  var v = String(s || '');
  return (v === 'French' || v === 'Français' || v === 'FR' || /french|fran\w*|fr\b/i.test(v)) && !isBilin(v);
}
model.card.website = isFrenchOnly(lang) ? 'colliersprojectleaders.com/fr' : 'colliersprojectleaders.com';
if (!model.card.websiteFr) model.card.websiteFr = 'colliersprojectleaders.com/fr';
model.card.emailEdited = true;
if (!Array.isArray(model.card.degree)) model.card.degree = model.card.degree ? [model.card.degree] : [];
BF.namedAction('wrapCardName');
