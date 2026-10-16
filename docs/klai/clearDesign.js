model.card = model.card || {};
var lang = model.card.language || (model.product && model.product.language) || 'English';
var isFrench = /french|fran|fr\b/i.test(String(lang)) && !/bilingual|bilin/i.test(String(lang));
model.card = {
  language: lang,
  name: '',
  nameWrapped: '',
  nameLines: [],
  inlineCredential: '',
  credentialLine: '',
  title: '',
  titleFr: '',
  titleFrEdited: 0,
  degree: [],
  additionalCredentials: '',
  region: '',
  specializedTeam: '',
  email: '',
  emailEdited: false,
  phone: '',
  address: '',
  company: 'Colliers Project Leaders',
  website: isFrench ? 'colliersprojectleaders.com/fr' : 'colliersprojectleaders.com',
  websiteFr: 'colliersprojectleaders.com/fr'
};
model.layoutError = '';
model.layoutReady = 1;
model.canPreviewProof = 0;
BF.namedAction('wrapCardName');
