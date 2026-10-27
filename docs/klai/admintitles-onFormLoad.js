// Manage Titles (admintitles) onFormLoad.
// FileMaker returns `titles` as records { id, title, language: "EN" | "FR" } from store_titles.
// Older responses were plain strings; those are treated as English until FileMaker sends records.
// Until FileMaker returns any titles: the client's 31 English titles (Colliers Project Leaders Titles.xlsx, Oct 2026)
// and the 8 French titles (Titles French.xlsx, Oct 2026).
var SEED_EN = ["Advisor", "Assistant Preconstruction Manager", "Assistant Project Manager", "Associate", "Business Development Manager", "Director", "Director, Preconstruction", "Human Resources Business Partner", "Independent Consultant", "Manager", "Manager, Infrastructure Advisory", "Managing Principal", "National Sector Lead", "Preconstruction Manager", "Principal", "Professional Practice Specialist", "Project Director", "Project Manager", "Proposal Writer", "Regional Marketing Specialist", "Sector Director", "Senior Advisor", "Senior Associate - Infrastructure Advisory", "Senior Manager, Project Controls", "Senior Preconstruction Manager", "Senior Project Manager", "Senior Proposal Writer", "Senior Vice President", "Talent Acquisition Business Partner", "Team Lead", "Vice President"];
var SEED_FR = ["Responsable du développement commercial", "Directrice", "Gestionnaire de projets Senior", "Chef d’équipe", "Gestionnaire de Projet", "Gestionnaire de projets principal", "Gestionnaire de projet adjoint", "Partenaire d’affaires sénior en acquisition de talent"];
function toRecord(row, index) {
  if (row && typeof row === 'object') {
    return {
      id: row.id != null && row.id !== '' ? row.id : 'title-' + index,
      title: String(row.title || '').trim(),
      language: String(row.language || '').toUpperCase() === 'FR' ? 'FR' : 'EN'
    };
  }
  return { id: 'title-' + index, title: String(row || '').trim(), language: 'EN' };
}
function seed(list, language) {
  return list.map(function (title, index) { return { id: 'seed-' + language + '-' + index, title: title, language: language }; });
}
var rows = (Array.isArray(model.titles) ? model.titles : []).map(toRecord).filter(function (row) { return row.title; });
if (!rows.length) rows = seed(SEED_EN, 'EN').concat(seed(SEED_FR, 'FR'));
rows.sort(function (a, b) { return a.title.localeCompare(b.title); });
model.titles = rows;
if (model.activeTab !== 'FR') model.activeTab = 'EN';
model.saving = false;
model.addError = '';
model.editError = '';
// Open Sans for the title fit check in addTitle / saveEdit (same file as the print PDF).
if (!window.__colliersTitleFont && typeof FontFace !== 'undefined') {
  window.__colliersTitleFont = new FontFace('Colliers Open Sans', 'url(https://cdn.jsdelivr.net/gh/googlefonts/opensans@main/fonts/ttf/OpenSans-Regular.ttf)').load().then(function (face) {
    document.fonts.add(face);
    window.__colliersTitleFontReady = true;
  }).catch(function () {});
}
