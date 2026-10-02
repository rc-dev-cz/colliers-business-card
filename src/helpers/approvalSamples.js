/**
 * Shared Standard / Maximum card fixtures for approval sheets and Customize.
 * Keep Maximum as a valid stress case (fits layout), not an overflow example.
 */
import { OTTAWA_OFFICE_CARD, VANCOUVER_OFFICE_CARD } from '../data/offices.js'

export var APPROVAL_STANDARD = {
  name: 'Hannah Sharpe',
  title: 'Business Services Administrator',
  region: 'Ontario',
  specializedTeam: '',
  // Short pair that fits inline after the name (matches client reference).
  degree: ['B.Comm', 'PMP'],
  additionalCredentials: '',
  email: 'hannah.sharpe@colliersprojectleaders.com',
  phone: '6139789906',
  address: OTTAWA_OFFICE_CARD,
}

export var APPROVAL_MAXIMUM = {
  name: 'Christopher Harrington-Wellington',
  title: 'Associate Director',
  region: 'British Columbia',
  specializedTeam: 'Project Management Advisory',
  degree: ['P. Eng.', 'LEED AP BD+C'],
  additionalCredentials: 'CPA',
  // Longest clean name-derived local that still fits the 132 pt email lane.
  email: 'christopher.hw@colliersprojectleaders.com',
  phone: '6045550199',
  address: VANCOUVER_OFFICE_CARD,
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
