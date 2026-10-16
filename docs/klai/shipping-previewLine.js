function cartList() {
  if (model.cart && model.cart.length) return model.cart;
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart;
  if (typeof app !== 'undefined' && app.cart && Array.isArray(app.cart.items)) return app.cart.items;
  if (Array.isArray(model.cart)) return model.cart;
  return [];
}
function isBilin(lang) { return /bilingual|bilin/i.test(String(lang || '')); }
function isFrenchOnly(lang) {
  var s = String(lang || '');
  return (s === 'French' || s === 'Français' || s === 'FR' || /french|fran\w*|fr\b/i.test(s)) && !isBilin(s);
}
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// Same face as the Customize / Proof preview (positions + sizes from wrapCardName, saved on the line).
// 252 pt trim: name 10pt = 3.968cqw, credentials 7pt = 2.778cqw, body 6.5pt = 2.579cqw.
function cardHtml(slot) {
  var fr = isFrenchOnly(slot.language);
  function cardEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function at(v, fallback) { return v === '' || v == null ? fallback : v; }
  function row(bottom, size, inner, bold) {
    return '<div style="position:absolute;white-space:nowrap;line-height:1;left:41.28%;right:2.56%;bottom:' + bottom + '%;font-size:' + size + ';' +
      (bold ? 'font-weight:700;color:#03438C' : 'color:#5F636A') + '">' + inner + '</div>';
  }
  var hasCred = (Array.isArray(slot.degree) ? slot.degree.filter(Boolean).length : slot.degree) || String(slot.additionalCredentials || '').trim();
  var inlineCred = slot.inlineCredential || (!slot.credentialLine && !hasCred ? ', C.M.' : '');
  var nameLines = (slot.nameLines && slot.nameLines.length) ? slot.nameLines : [String(slot.name || '').trim() || (fr ? 'Prénom Nom' : 'Firstname Lastname')];
  var nameYs = slot.previewNameYs || [];
  var html = '';
  nameLines.forEach(function (line, idx) {
    var y = nameYs[idx] != null ? nameYs[idx] : 46.17 + (nameLines.length - 1 - idx) * 7.64;
    var cred = idx === nameLines.length - 1 && inlineCred ? '<span style="font-size:0.7em">' + cardEsc(inlineCred) + '</span>' : '';
    html += row(y, '3.968cqw', '<span>' + cardEsc(line) + '</span>' + cred, true);
  });
  if (slot.credentialLine) html += row(at(slot.previewCredY, 40.27), '2.778cqw', cardEsc(slot.credentialLine), true);
  var region = String(slot.region || '').trim();
  var mode = slot.previewRegionMode || (region ? 'title' : 'none');
  var frTitle = fr ? String(slot.titleFr || '').trim() : '';
  var title = frTitle || String(slot.title || '').split('|')[0].trim() || (fr ? 'Titre' : 'Title');
  if (mode === 'title' && region) title += ' | ' + region;
  html += row(at(slot.previewTitleY, 40.27), (frTitle ? slot.previewTitleFrSize : slot.previewTitleSize) || '2.579cqw', cardEsc(title));
  var team = String(slot.specializedTeam || '').trim();
  if (team) html += row(at(slot.previewTeamY, 34.72), '2.579cqw', cardEsc(team + (mode === 'team' && region ? ' | ' + region : '')));
  if (mode === 'own' && region) html += row(at(slot.previewRegionY, 34.72), '2.579cqw', cardEsc(region));
  var email = String(slot.email || '').trim() || (fr ? 'prenom.nom@colliersprojectleaders.com' : 'first.lastname@colliersprojectleaders.com');
  var digits = String(slot.phone || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  var phone = digits ? [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(' ') : '555 555 5555';
  var website = fr ? (slot.websiteFr || 'colliersprojectleaders.com/fr') : (slot.website || 'colliersprojectleaders.com');
  html += row(at(slot.previewEmailY, 23.61), '2.579cqw', cardEsc(email));
  html += row(at(slot.previewPhoneY, 18.06), '2.579cqw', cardEsc(phone));
  html += row(at(slot.previewWebY, 12.5), '2.579cqw', cardEsc(website));
  var address = String(slot.addressWrapped || slot.printAddress || slot.address || '').trim() ||
    (fr ? "Nom de l'adresse\nUnité, Rue\nVille, Province\nCode postal, Pays" : 'Address name\nUnit, Street\nCity, Province\nPostal Code, Country');
  var words = fr ? 'https://5t61ut5p19.ucarecd.net/701d97ba-48e3-4b7b-a448-1ecee3b72a6e/' : 'https://5t61ut5p19.ucarecd.net/5c2ce46d-e9a5-441c-ad9a-8010efc9c9bf/';
  var wstyle = fr ? 'left:27.873%;bottom:70.347%;width:18.044%;height:15.083%' : 'left:27.917%;bottom:72.125%;width:13.96%;height:13.083%';
  return '<div style="position:relative;width:100%;max-width:480px;margin:0 auto 1rem;aspect-ratio:1.75/1;overflow:hidden;border:1px solid #e5e7eb;border-radius:6px;background:#fff;container-type:inline-size;font-family:\'Open Sans\',sans-serif">' +
    '<img src="https://5t61ut5p19.ucarecd.net/66049ddf-e639-4104-9b94-5f1d96fc29a5/" alt="Colliers" style="position:absolute;object-fit:contain;left:6.968%;bottom:69.306%;width:18.488%;height:18.417%">' +
    '<img src="' + words + '" alt="' + (fr ? 'Maîtres de projets' : 'Project Leaders') + '" style="position:absolute;object-fit:contain;' + wstyle + '">' +
    html +
    '<div style="position:absolute;white-space:pre-wrap;color:#5F636A;left:7.14%;right:58.72%;bottom:12.5%;font-size:2.579cqw;line-height:1.230769">' + cardEsc(address) + '</div></div>';
}
panel.innerHTML = '<div style="padding:1.25rem 1.5rem;background:#f8f9fa;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:1.25rem;color:#0a1a3a">' + escapeHtml(heading) + '</div><div style="padding:1.25rem 1.5rem">' + slots.map(cardHtml).join('') + '</div>';
overlay.appendChild(panel);
document.body.appendChild(overlay);
if (overlay.showModal) overlay.showModal();
overlay.style.display = 'flex';
document.addEventListener('keydown', window.__colliersCartPreviewEsc, true);
