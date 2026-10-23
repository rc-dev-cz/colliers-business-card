import { describe, expect, it } from 'vitest'
import ManageTitlesPage from './ManageTitlesPage.vue'

var ctx = { items: ['Director', 'Advisor'] }

describe('Manage Titles fit check', function () {
  it('refuses a title too long for the card line', async function () {
    expect(
      await ManageTitlesPage.methods.titleError.call(
        ctx,
        'Senior Vice President and National Practice Leader, Infrastructure Advisory'
      )
    ).toBe('This title is too long for the card’s title line. Shorten it so it fits.')
  })

  it('accepts a title that fits, English or French', async function () {
    expect(await ManageTitlesPage.methods.titleError.call(ctx, 'Senior Project Manager')).toBe('')
    expect(
      await ManageTitlesPage.methods.titleError.call(ctx, 'Gestionnaire de projets principal')
    ).toBe('')
  })
})

describe('Manage Titles duplicate message', function () {
  it('says the title is already on the list, in any case', async function () {
    expect(await ManageTitlesPage.methods.titleError.call(ctx, 'director')).toBe(
      'This title is already on the list.'
    )
    expect(await ManageTitlesPage.methods.titleError.call(ctx, 'Director', null)).toBe(
      'This title is already on the list.'
    )
  })

  it('renaming onto another title is a duplicate; a case fix of the same row is not', async function () {
    expect(await ManageTitlesPage.methods.titleError.call(ctx, 'DIRECTOR', 'Advisor')).toBe(
      'This title is already on the list.'
    )
    expect(await ManageTitlesPage.methods.titleError.call(ctx, 'DIRECTOR', 'Director')).toBe('')
  })
})
