if (typeof app === 'undefined') return
if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart)) {
  app.cart = app.cart.items
}
if (!Array.isArray(app.cart)) app.cart = []
app.cart.forEach(function (line) {
  if (!line || !line.details || typeof line.details !== 'object') return
  var lang = line.language || line.details.language || ''
  if (!lang && /PL-FR|-FR/i.test(String(line.code || ''))) lang = 'French'
  if (lang && !line.details.language) {
    if (typeof Vue !== 'undefined' && Vue.set) Vue.set(line.details, 'language', lang)
    else line.details.language = lang
  }
})
if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('syncCartHeader')
