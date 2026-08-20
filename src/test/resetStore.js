import Vue from 'vue'
import { store, logout } from '../store'

export const TEST_OFFICE = {
  id: 'office-burlington',
  addressName: 'Burlington Office',
  addressStreet: '300-5515 North Service Road',
  addressStreet2: '',
  addressCity: 'Burlington',
  addressProvince: 'ON',
  addressPostalZip: 'L7L 6G4',
  addressCountry: 'Canada',
}

export const TEST_HOME = {
  id: 'seed-home',
  addressName: 'Home Office',
  addressStreet: '100 King Street West',
  addressStreet2: 'Suite 5600',
  addressCity: 'Toronto',
  addressProvince: 'ON',
  addressPostalZip: 'M5X 1C9',
  addressCountry: 'Canada',
}

export const TEST_TEMP = {
  id: 'seed-temp',
  addressName: 'Temporary Location',
  addressStreet: '200 Bay Street',
  addressStreet2: '',
  addressCity: 'Toronto',
  addressProvince: 'ON',
  addressPostalZip: 'M5J 2J2',
  addressCountry: 'Canada',
}

export function resetAddressBookStore(options) {
  const personal = (options && options.personal) || []
  const offices = (options && options.offices) || []
  logout()
  try {
    localStorage.clear()
  } catch (error) {
    /* ignore */
  }
  Vue.set(store, 'session', {
    email: 'address-book-test@colliers.com',
    role: 'user',
    loggedInAt: 1,
  })
  store.locale = 'EN'
  store.personalAddresses.splice(0, store.personalAddresses.length)
  personal.forEach(function (row) {
    store.personalAddresses.push(Object.assign({}, row))
  })
  store.offices.splice(0, store.offices.length)
  offices.forEach(function (row) {
    store.offices.push(Object.assign({}, row))
  })
  store.officesLoading = false
  store.officesError = ''
}
