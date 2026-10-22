// Site content.namedActions.onAppLoad — function action.
// Restore the EN/FR choice saved by selectLanguage. Without this, a reload falls back to English.
var saved = null
try {
  saved = localStorage.getItem('colliers.locale')
} catch (e) {}
if (saved === 'fr' || saved === 'en') app.currentLang = saved
if (app.currentLang) {
  app.i18n.langSelected = app.currentLang || app.i18n.langDefault || 'en'
}
