function cartList() {
  if (model.cart && model.cart.length) return model.cart
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  if (typeof app !== 'undefined' && app.cart && Array.isArray(app.cart.items)) return app.cart.items
  if (Array.isArray(model.cart)) return model.cart
  return []
}
function isBilin(lang) {
  return /bilingual|bilin/i.test(String(lang || ''))
}
function isFrenchOnly(lang) {
  var s = String(lang || '')
  return (
    (s === 'French' || s === 'Français' || s === 'FR' || /french|fran\w*|fr\b/i.test(s)) &&
    !isBilin(s)
  )
}
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function cardHtml(slot) {
  var fr = isFrenchOnly(slot.language)
  var name =
    String(slot.nameWrapped || slot.name || '').trim() || (fr ? 'Prénom Nom' : 'Firstname Lastname')
  var title =
    String(slot.displayTitle || slot.title || '')
      .split('|')[0]
      .trim() || (fr ? 'Titre' : 'Title')
  var email =
    String(slot.displayEmail || slot.email || '').trim() ||
    (fr ? 'prenom.nom@colliersprojectleaders.com' : 'first.lastname@colliersprojectleaders.com')
  var phone = String(slot.displayPhone || slot.phone || '').trim() || '555 555 5555'
  var website = fr
    ? slot.websiteFr || slot.website || 'colliersprojectleaders.com/fr'
    : slot.website || 'colliersprojectleaders.com'
  var address =
    String(slot.displayAddress || slot.addressWrapped || slot.address || '').trim() ||
    (fr
      ? "Nom de l'adresse\nUnité, Rue\nVille, Province\nCode postal, Pays"
      : 'Address name\nUnit, Street\nCity, Province\nPostal Code, Country')
  var words = fr
    ? 'https://5t61ut5p19.ucarecd.net/701d97ba-48e3-4b7b-a448-1ecee3b72a6e/'
    : 'https://5t61ut5p19.ucarecd.net/5c2ce46d-e9a5-441c-ad9a-8010efc9c9bf/'
  var wordsStyle = fr
    ? 'left:27.873%;bottom:70.347%;width:18.044%;height:15.083%'
    : 'left:27.917%;bottom:72.125%;width:13.96%;height:13.083%'
  var hasTeam = Boolean(String(slot.specializedTeam || '').trim())
  var cred = String(slot.credentialLine || '').trim()
  var inline = String(slot.inlineCredential || '').trim()
  var lines =
    slot.nameLines && slot.nameLines.length
      ? slot.nameLines.slice()
      : String(slot.nameWrapped || name)
          .split(/\n/)
          .map(function (ln) {
            return ln.trim()
          })
          .filter(Boolean)
  if (!lines.length) lines = [name]
  var nameYs = slot.previewNameYs
  var nameHtml = ''
  var extra = !hasTeam && cred ? 1 : 0
  for (var i = 0; i < lines.length; i++) {
    var nameBase = !hasTeam && !cred ? 40.62 : 46.17
    var nameBottom =
      nameYs && nameYs[i] != null && nameYs[i] !== ''
        ? nameYs[i]
        : Math.round((nameBase + (lines.length - 1 - i + extra) * 7.64) * 100) / 100
    var suffix =
      i === lines.length - 1 && inline
        ? '<span style="font-size:70%">' + escapeHtml(inline) + '</span>'
        : ''
    nameHtml +=
      '<div style="position:absolute;overflow:hidden;white-space:nowrap;font-weight:700;line-height:1;color:#03438C;left:41.28%;right:4%;bottom:' +
      nameBottom +
      '%;font-size:3.7cqw">' +
      escapeHtml(lines[i]) +
      suffix +
      '</div>'
  }
  var credHtml = ''
  if (cred) {
    var credY =
      slot.previewCredY != null && slot.previewCredY !== ''
        ? slot.previewCredY
        : hasTeam
          ? 40.27
          : 46.17
    credHtml =
      '<div style="position:absolute;overflow:hidden;white-space:nowrap;font-weight:700;line-height:1;color:#03438C;left:41.28%;right:4%;bottom:' +
      credY +
      '%;font-size:2.8cqw">' +
      escapeHtml(cred) +
      '</div>'
  }
  var titleBottom = hasTeam
    ? slot.previewTitleY != null && slot.previewTitleY !== ''
      ? slot.previewTitleY
      : cred
        ? 34.72
        : 40.27
    : 34.72
  var emailBottom = 23.61
  var phoneBottom = 18.06
  var webBottom = 12.5
  var teamHtml = hasTeam
    ? '<div style="position:absolute;overflow:hidden;white-space:nowrap;line-height:1;color:#5F636A;left:41.28%;right:4%;bottom:' +
      (slot.previewTeamY != null && slot.previewTeamY !== ''
        ? slot.previewTeamY
        : cred
          ? 29.16
          : 34.72) +
      '%;font-size:2.4cqw">' +
      escapeHtml(slot.specializedTeam) +
      '</div>'
    : ''
  return (
    '<div style="position:relative;width:100%;max-width:480px;margin:0 auto 1rem;aspect-ratio:1.75/1;overflow:hidden;border:1px solid #e5e7eb;border-radius:6px;background:#fff;container-type:inline-size">' +
    '<img src="https://5t61ut5p19.ucarecd.net/66049ddf-e639-4104-9b94-5f1d96fc29a5/" alt="Colliers" style="position:absolute;object-fit:contain;left:6.968%;bottom:69.306%;width:18.488%;height:18.417%">' +
    '<img src="' +
    words +
    '" alt="' +
    (fr ? 'Maîtres de projets' : 'Project Leaders') +
    '" style="position:absolute;object-fit:contain;' +
    wordsStyle +
    '">' +
    nameHtml +
    credHtml +
    '<div style="position:absolute;overflow:hidden;white-space:nowrap;line-height:1;color:#5F636A;left:41.28%;right:4%;bottom:' +
    titleBottom +
    '%;font-size:2.4cqw">' +
    escapeHtml(title) +
    '</div>' +
    teamHtml +
    '<div style="position:absolute;overflow:hidden;white-space:nowrap;line-height:1;color:#5F636A;left:41.28%;right:4%;bottom:' +
    emailBottom +
    '%;font-size:2.4cqw">' +
    escapeHtml(email) +
    '</div>' +
    '<div style="position:absolute;overflow:hidden;white-space:nowrap;line-height:1;color:#5F636A;left:41.28%;right:4%;bottom:' +
    phoneBottom +
    '%;font-size:2.4cqw">' +
    escapeHtml(phone) +
    '</div>' +
    '<div style="position:absolute;overflow:hidden;white-space:nowrap;line-height:1;color:#5F636A;left:41.28%;right:4%;bottom:' +
    webBottom +
    '%;font-size:2.4cqw">' +
    escapeHtml(website) +
    '</div>' +
    '<div style="position:absolute;white-space:pre-wrap;line-height:1.25;color:#5F636A;left:7.14%;right:58.72%;bottom:12.5%;font-size:2.4cqw">' +
    escapeHtml(address) +
    '</div>' +
    '</div>'
  )
}
var opts = action.options || {}
var cart = cartList()
var line = opts.lineId
  ? _.find(cart, function (row) {
      return String(row.id) === String(opts.lineId)
    })
  : cart[opts.index]
if (!line) return
var details = Object.assign({}, line.details || {})
if (details.language !== undefined) delete details.language
var lang = line.language || ''
if (
  !isFrenchOnly(lang) &&
  /PL-FR|-FR/i.test(String(line.code || '')) &&
  !isBilin(line.language)
) {
  lang = 'French'
}
details.company = 'Colliers Project Leaders'
if (!details.website || details.website === 'colliers.com/canada') {
  details.website = isFrenchOnly(lang)
    ? 'colliersprojectleaders.com/fr'
    : 'colliersprojectleaders.com'
}
if (!details.websiteFr) details.websiteFr = 'colliersprojectleaders.com/fr'
var slots = isBilin(line.language)
  ? [
      Object.assign({}, details, { language: 'English', website: 'colliersprojectleaders.com' }),
      Object.assign({}, details, { language: 'French', website: 'colliersprojectleaders.com/fr' }),
    ]
  : [Object.assign({}, details, { language: lang })]
model.previewCard = details
model.previewSlots = slots
if (typeof app !== 'undefined') {
  app.previewCard = details
  app.previewSlots = slots
}
var old = document.getElementById('colliersCartPreview')
if (old && old.parentNode) old.parentNode.removeChild(old)
document.removeEventListener('keydown', window.__colliersCartPreviewEsc, true)
window.__colliersCartPreviewEsc = function (event) {
  if (event.key !== 'Escape') return
  event.preventDefault()
  var dlg = document.getElementById('colliersCartPreview')
  if (dlg && dlg.parentNode) dlg.parentNode.removeChild(dlg)
  document.removeEventListener('keydown', window.__colliersCartPreviewEsc, true)
}
var overlay = document.createElement('dialog')
overlay.id = 'colliersCartPreview'
overlay.setAttribute('aria-modal', 'true')
overlay.style.cssText =
  'position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:1rem;border:none;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:10000'
overlay.addEventListener('click', function (e) {
  if (e.target !== overlay) return
  if (overlay.close) {
    try {
      overlay.close()
    } catch (err) {}
  }
  if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  document.removeEventListener('keydown', window.__colliersCartPreviewEsc, true)
})
overlay.addEventListener('cancel', function () {
  if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  document.removeEventListener('keydown', window.__colliersCartPreviewEsc, true)
})
var heading =
  typeof BF !== 'undefined' && BF.i18n
    ? BF.i18n('label_colliers_businessCardPreview')
    : 'Business Card Preview'
var panel = document.createElement('div')
panel.style.cssText =
  'max-width:36rem;width:100%;background:#fff;border-radius:.5rem;overflow:auto;max-height:92vh'
panel.innerHTML =
  '<div style="padding:1.25rem 1.5rem;background:#f8f9fa;border-bottom:1px solid #e5e7eb;font-weight:700;font-size:1.25rem;color:#0a1a3a">' +
  escapeHtml(heading) +
  '</div><div style="padding:1.25rem 1.5rem">' +
  slots.map(cardHtml).join('') +
  '</div>'
overlay.appendChild(panel)
document.body.appendChild(overlay)
if (overlay.showModal) overlay.showModal()
overlay.style.display = 'flex'
document.addEventListener('keydown', window.__colliersCartPreviewEsc, true)
