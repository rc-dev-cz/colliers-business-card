// Add location modal (Vue LocationModal): search box, then My Addresses first and Office Addresses
// after. An address in both lists shows once, under My Addresses. A ship-to already on the group
// that is in neither list (renamed or deleted since) shows under Other so it can still be unticked.
if (!model.view) return
var opts = (action && action.options) || {}
var search = opts.search != null ? String(opts.search) : String(model.view.modalSearch || '')
var q = search.trim().toLowerCase()
var source = model.view.addressOptions || {}
var seen = {}
function toRow(opt) {
  var value = String((opt && opt.value) || '').trim()
  var label = String((opt && opt.label) || value)
  var named = label !== value && label.indexOf(' — ') !== -1
  var name = named ? label.split(' — ')[0] : value
  return {
    value: value,
    name: name,
    detail: named ? value : '',
    search: (name + ' ' + value).toLowerCase(),
  }
}
function rows(list) {
  var out = []
  ;(list || []).forEach(function (opt) {
    var row = toRow(opt)
    if (!row.value || seen[row.value]) return
    seen[row.value] = true
    out.push(row)
  })
  return out.sort(function (a, b) {
    return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' })
  })
}
var personal = rows(source.personal)
var offices = rows(source.offices)
var other = []
;(model.view.modalInitial || []).forEach(function (addr) {
  var value = String(addr || '').trim()
  if (!value || seen[value]) return
  seen[value] = true
  other.push({ value: value, name: value, detail: '', search: value.toLowerCase() })
})
function matches(row) {
  return !q || row.search.indexOf(q) !== -1
}
var groups = [
  { key: 'personal', title: 'label_colliers_myAddresses', options: personal.filter(matches) },
  { key: 'offices', title: 'label_colliers_officeAddresses', options: offices.filter(matches) },
  { key: 'other', title: 'label_colliers_otherAddresses', options: other.filter(matches) },
].filter(function (group) {
  // My Addresses stays first (with its hint) even when empty, so the order never changes.
  return group.options.length || (group.key === 'personal' && !q)
})
var count = groups.reduce(function (sum, group) {
  return sum + group.options.length
}, 0)
function setView(key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, key, value)
  else model.view[key] = value
}
setView('modalSearch', search)
setView('modalGroups', groups)
setView('modalMatchCount', count)
