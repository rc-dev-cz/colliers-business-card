import { beforeEach, describe, expect, it } from 'vitest'
import { addPersonal, deletePersonal, getPersonal, store, updatePersonal } from './store'
import { TEST_HOME, TEST_TEMP, resetAddressBookStore } from './test/resetStore'

describe('store personal addresses', function () {
  beforeEach(function () {
    resetAddressBookStore({ personal: [TEST_HOME, TEST_TEMP] })
  })

  it('AB-S01 addPersonal grows the list', function () {
    const before = store.personalAddresses.length
    const row = addPersonal({
      addressName: 'Cabin',
      addressStreet: '1 Pine Road',
      addressCity: 'Banff',
    })
    expect(store.personalAddresses.length).toBe(before + 1)
    expect(row.addressName).toBe('Cabin')
    expect(row.addressStreet).toBe('1 Pine Road')
    expect(row.addressCity).toBe('Banff')
    expect(store.personalAddresses[store.personalAddresses.length - 1].id).toBe(row.id)
  })

  it('AB-S02 updatePersonal changes only that id', function () {
    updatePersonal(TEST_HOME.id, { addressName: 'Home', addressCity: 'Ottawa' })
    const home = getPersonal(TEST_HOME.id)
    const temp = getPersonal(TEST_TEMP.id)
    expect(home.addressName).toBe('Home')
    expect(home.addressCity).toBe('Ottawa')
    expect(temp.addressName).toBe('Temporary Location')
    expect(temp.addressCity).toBe('Toronto')
  })

  it('AB-S03 deletePersonal removes that id', function () {
    deletePersonal(TEST_TEMP.id)
    expect(getPersonal(TEST_TEMP.id)).toBe(null)
    expect(getPersonal(TEST_HOME.id)).not.toBe(null)
    expect(store.personalAddresses.length).toBe(1)
  })
})
