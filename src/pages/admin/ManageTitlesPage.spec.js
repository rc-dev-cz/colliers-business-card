import { describe, expect, it } from 'vitest'
import ManageTitlesPage from './ManageTitlesPage.vue'

describe('Manage Titles fit check', function () {
  it('refuses a title too long for the card line', async function () {
    expect(
      await ManageTitlesPage.methods.titleFitError(
        'Senior Vice President and National Practice Leader, Infrastructure Advisory'
      )
    ).toBe('This title is too long for the card’s title line. Shorten it so it fits.')
  })

  it('accepts a title that fits, English or French', async function () {
    expect(await ManageTitlesPage.methods.titleFitError('Senior Project Manager')).toBe('')
    expect(await ManageTitlesPage.methods.titleFitError('Gestionnaire de projets principal')).toBe(
      ''
    )
  })
})
