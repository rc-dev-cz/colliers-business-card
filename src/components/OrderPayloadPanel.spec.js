import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderPayloadPanel from './OrderPayloadPanel.vue'
import { payloadJsonForDisplay } from '../helpers/orderPayload.js'

var payload = {
  order: { order_type: 'business_cards', email: 'demo', total_items: 63, print_pdf_status: 'ok' },
  groups: [
    {
      group_ref: 'group-1',
      shipment_number: 1,
      count_locations: 1,
      total_items: 63,
      total_shipping: null,
      items: [
        {
          line_ref: 'line-1',
          product_code: 'CPL-13616',
          catalogue_id: 13616,
          language: 'English',
          quantity: 1,
          cards: 250,
          unit_price: 63,
          price: 63,
          card: { name: 'Test Person' },
        },
      ],
      locations: [
        {
          location_ref: 'loc-1',
          location_id: 1,
          location_type: 'office',
          boxes_per_item: 1,
          cards_per_item: 250,
          address: { address_name: 'Burlington Office', street_1: '300-5515 North Service Road' },
        },
      ],
    },
  ],
  cards: [{ line_ref: 'line-1', print_pdf_file_name: 'card.pdf', print_pdf_base64: 'JVBERi0x' }],
}

describe('OrderPayloadPanel', function () {
  it('stays closed until opened, then lists the order, items, locations and PDFs', async function () {
    var wrapper = mount(OrderPayloadPanel, { propsData: { payload: payload, orderId: 'mock-1' } })
    expect(wrapper.text()).toContain('mock-1')
    expect(wrapper.text()).not.toContain('Burlington Office')
    await wrapper.find('button').trigger('click')
    var text = wrapper.text()
    expect(text).toContain('business_cards')
    expect(text).toContain('CPL-13616')
    expect(text).toContain('13616')
    expect(text).toContain('Test Person')
    expect(text).toContain('Burlington Office')
    expect(text).toContain('card.pdf')
  })

  it('shortens the PDF base64 in the displayed JSON', function () {
    var json = payloadJsonForDisplay(payload)
    expect(json).not.toContain('JVBERi0x')
    expect(json).toContain('<base64 PDF, 8 characters>')
  })
})
