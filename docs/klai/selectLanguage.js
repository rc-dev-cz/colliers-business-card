// Site content.namedActions.selectLanguage — function action.
// Called by UserHeader setLocale. Saves the choice so a reload (and the site spinner) keep it.
app.i18n.langSelected = action.options.lang
app.currentLang = action.options.lang
try {
  localStorage.setItem('colliers.locale', action.options.lang)
} catch (e) {}
document.documentElement.setAttribute('lang', action.options.lang)
document.documentElement.setAttribute('data-colliers-lang', action.options.lang)
