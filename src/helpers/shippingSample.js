import { makeLine } from './cart.js'
import { createSplit } from './order.js'

/** Old preview seed — never a real ship-to. Strip if still persisted. */
export var PLACEHOLDER_SHIP_ADDRESS = 'Unit, Street'

export function sampleShippingCart() {
  return [
    makeLine({
      id: 'line-dev-1',
      code: 'BCAD-PL-ENG',
      language: 'English',
      quantity: 1,
      details: { name: '', language: 'English' },
    }),
    makeLine({
      id: 'line-dev-2',
      code: 'BCAD-PL-FR',
      language: 'French',
      quantity: 1,
      details: { name: '', language: 'French' },
    }),
  ]
}

export function sampleShippingOrder() {
  return {
    splits: [
      createSplit({
        id: 1,
        itemIds: ['line-dev-1', 'line-dev-2'],
        locations: [],
      }),
    ],
  }
}
