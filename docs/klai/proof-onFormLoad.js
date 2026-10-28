// Proof onFormLoad — function action. No draft (app.proof) → back to Customize or the catalogue.
model.approved = false;
var proof = (typeof app !== 'undefined' && app.proof) ? app.proof : model.proof;
if (!proof || !proof.code) {
  var hash = (window.location && window.location.hash) || '';
  var codeMatch = hash.match(/[?&]code=([^&]+)/);
  var code = codeMatch ? decodeURIComponent(codeMatch[1]) : '';
  var path = code ? ('/customize?code=' + encodeURIComponent(code)) : '/';
  if (typeof BF !== 'undefined' && BF.goto) { BF.goto(path); return; }
  if (window.location) window.location.hash = '#' + path;
  return;
}
model.proof = proof;
var editId = String((proof && proof.editLineId) || (typeof app !== 'undefined' && app.editLineId) || '').trim();
if (!editId) {
  var hashEdit = ((window.location && window.location.hash) || '').match(/[?&]lineId=([^&]+)/);
  if (hashEdit) editId = decodeURIComponent(hashEdit[1]);
}
if (editId) {
  model.editLineId = editId;
  if (typeof app !== 'undefined') app.editLineId = editId;
  if (proof && !proof.editLineId) proof.editLineId = editId;
}
var proofLang = String(proof.language || '');
var proofNameKey = 'label_colliers_product' + (/bilingual|bilin/i.test(proofLang) ? 'Bilingual' : /french|fran|^fr$/i.test(proofLang) ? 'French' : 'English');
model.product = { code: proof.code, language: proofLang, nameKey: proofNameKey, price: 63 };
var found = _.find(model.products || [], { code: proof.code });
if (found) model.product = found;
model.notFound = 0;
