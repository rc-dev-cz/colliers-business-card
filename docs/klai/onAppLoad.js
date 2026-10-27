// Site content.namedActions.onAppLoad — function action.
// Restore the EN/FR choice saved by selectLanguage. Without this, a reload falls back to English.
var saved = null
try {
  saved = localStorage.getItem('colliers.locale')
} catch (e) {}
if (saved === 'fr' || saved === 'en') app.currentLang = saved
// French card faces print the French region name (Vue canadianProvinces.js regionForCard, BUG-10).
// The saved region stays English; previews look the French name up here.
var REGION_FR = {"British Columbia": "Colombie-Britannique", "New Brunswick": "Nouveau-Brunswick", "Newfoundland and Labrador": "Terre-Neuve-et-Labrador", "Nova Scotia": "Nouvelle-Écosse", "Prince Edward Island": "Île-du-Prince-Édouard", "Quebec": "Québec", "Northwest Territories": "Territoires du Nord-Ouest"}
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(app, 'regionFr', REGION_FR)
else app.regionFr = REGION_FR
if (app.currentLang) {
  app.i18n.langSelected = app.currentLang || app.i18n.langDefault || 'en'
}
