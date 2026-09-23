export function uniqueLabels(rows) {
  var seen = {}
  var out = []
  ;(rows || []).forEach(function (row) {
    var label = String(row || '').trim()
    if (!label || seen[label]) return
    seen[label] = 1
    out.push(label)
  })
  return out
}
