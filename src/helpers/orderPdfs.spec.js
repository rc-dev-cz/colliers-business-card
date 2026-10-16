import { describe, expect, it, vi } from 'vitest'
import { attachPrintPdfs, bytesToBase64 } from './orderPdfs.js'
import { logOrderPayload } from './orderPayload.js'

function line(id, name, extra) {
  return {
    id: id,
    code: 'BCAD-PL-ENG',
    language: 'English',
    details: Object.assign(
      {
        name: name,
        title: 'Director',
        degree: [],
        additionalCredentials: '',
        region: '',
        specializedTeam: '',
        email: 'ada.lovelace@colliersprojectleaders.com',
        phone: '416 555 0123',
        address: 'Suite 100\n100 Main Street\nToronto, ON\nA1A 1A1 Canada',
      },
      extra || {}
    ),
  }
}

function payloadFor(refs) {
  return {
    order: {},
    groups: [
      {
        items: refs.map(function (ref) {
          return { line_ref: ref }
        }),
      },
      { items: [{ line_ref: refs[0] }] },
    ],
  }
}

describe('attachPrintPdfs', function () {
  it('adds a real PDF as base64 to every item and builds a shared card once', async function () {
    var cart = [line('a', 'Ada Lovelace'), line('b', 'Grace Hopper')]
    var payload = payloadFor(['a', 'b'])
    await attachPrintPdfs(payload, cart)
    var items = payload.groups[0].items.concat(payload.groups[1].items)
    items.forEach(function (item) {
      expect(item.print_pdf_file_name).toMatch(/^Colliers-Business-Card-.*\.pdf$/)
      expect(atob(item.print_pdf_base64.slice(0, 8)).slice(0, 5)).toBe('%PDF-')
    })
    expect(payload.groups[0].items[0].print_pdf_base64).toBe(
      payload.groups[1].items[0].print_pdf_base64
    )
    expect(payload.groups[0].items[0].print_pdf_file_name).toContain('Ada_Lovelace-a')
  })

  it('does not print the C.M. sample or the sample address on a real card', async function () {
    var payload = payloadFor(['a'])
    await attachPrintPdfs(payload, [line('a', 'Ada Lovelace')])
    var text = atob(payload.groups[0].items[0].print_pdf_base64)
    expect(text.indexOf('C.M.')).toBe(-1)
  })

  it('stops with a readable error when a card cannot be printed', async function () {
    var bad = line('a', 'sdfasdfasdfsadfsadfasdfsadasdfasdfsdfsdadasdasdas')
    await expect(attachPrintPdfs(payloadFor(['a']), [bad])).rejects.toThrow(
      /sdfasdfasdfsadf.*too long/i
    )
    await expect(attachPrintPdfs(payloadFor(['gone']), [])).rejects.toThrow(/no longer in the cart/)
  })

  it('encodes bytes as base64', function () {
    expect(bytesToBase64(new Uint8Array([37, 80, 68, 70]))).toBe('JVBERg==')
  })
})

describe('logOrderPayload with PDFs', function () {
  it('keeps the base64 out of the console line', function () {
    var logger = { info: vi.fn() }
    var payload = {
      order: { group_count: 1, item_count: 1, total_items: 63, currency: 'CAD' },
      groups: [{ items: [{ line_ref: 'a', print_pdf_base64: 'JVBERg==' }] }],
    }
    logOrderPayload('ORD-1', payload, logger)
    expect(logger.info.mock.calls[0][1].groups[0].items[0].print_pdf_base64).toBe(
      '<base64 8 chars>'
    )
    expect(payload.groups[0].items[0].print_pdf_base64).toBe('JVBERg==')
  })
})
