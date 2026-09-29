/**
 * Shared Standard / Maximum card fixtures for approval sheets and Customize.
 * Keep Maximum as a valid stress case (fits layout), not an overflow example.
 */
export var APPROVAL_STANDARD = {
  name: 'Kevin Collins',
  title: 'Associate Director',
  region: 'Ontario',
  specializedTeam: 'Project Management',
  degree: ['P.Eng'],
  additionalCredentials: '',
  email: 'kevin.collins@colliersprojectleaders.com',
  phone: '4165550142',
  address: '181 Bay Street, Suite 1400\nToronto, ON\nM5J 2T3\nCanada',
}

export var APPROVAL_MAXIMUM = {
  name: 'Christopher Harrington-Wellington',
  title: 'Associate Director',
  region: 'British Columbia',
  specializedTeam: 'Project Management Advisory',
  degree: ['P. Eng.', 'LEED AP BD+C'],
  additionalCredentials: '',
  // Longest clean @colliersprojectleaders.com local that still fits the 130 pt lane
  // (Open Sans Regular 6.5 pt ≈ 129.84 pt; one wider glyph overflows).
  email: 'mike.lastname@colliersprojectleaders.com',
  phone: '6045550199',
  address: 'Bay Adelaide Centre\n333 Bay Street\nSuite 3400\nToronto, ON\nM5H 2S7 Canada',
}

export function cloneApprovalDetails(source) {
  var src = source || {}
  return {
    name: src.name || '',
    title: src.title || '',
    degree: Array.isArray(src.degree) ? src.degree.slice() : [],
    additionalCredentials: src.additionalCredentials || '',
    region: src.region || '',
    specializedTeam: src.specializedTeam || '',
    email: src.email || '',
    phone: src.phone || '',
    address: src.address || '',
  }
}
