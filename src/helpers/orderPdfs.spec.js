import { beforeEach, describe, expect, it } from 'vitest'
import { buildPrintPdfs, bytesToBase64, PRINT_PDFS_KEY, savePrintPdfs } from './orderPdfs.js'
import { readStorage } from './storage.js'

function line(id, name) {
  return {
    id: id,
    code: 'BCAD-PL-ENG',
    language: 'English',
    details: {
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
  }
}

function payloadFor(refs) {
  return {
    order: { date: '2026-10-16T10:00:00Z' },
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

describe('buildPrintPdfs', function () {
  it('builds one real PDF (base64) per ordered card and leaves the payload alone', async function () {
    var cart = [line('a', 'Ada Lovelace'), line('b', 'Grace Hopper'), line('c', 'Not ordered')]
    var payload = payloadFor(['a', 'b'])
    var before = JSON.stringify(payload)
    var pdfs = await buildPrintPdfs(payload, cart)
    expect(Object.keys(pdfs).sort()).toEqual(['a', 'b'])
    expect(pdfs.a.file_name).toContain('Ada_Lovelace-a')
    expect(atob(pdfs.a.base64.slice(0, 8)).slice(0, 5)).toBe('%PDF-')
    expect(JSON.stringify(payload)).toBe(before)
  })

  it('does not print the C.M. sample on a real card', async function () {
    var pdfs = await buildPrintPdfs(payloadFor(['a']), [line('a', 'Ada Lovelace')])
    expect(atob(pdfs.a.base64).indexOf('C.M.')).toBe(-1)
  })

  it('names the card that cannot be printed', async function () {
    var bad = line('a', 'sdfasdfasdfsadfsadfasdfsadasdfasdfsdfsdadasdasdas')
    await expect(buildPrintPdfs(payloadFor(['a']), [bad])).rejects.toThrow(
      /sdfasdfasdfsadf.*too long/i
    )
  })

  it('encodes bytes as base64', function () {
    expect(bytesToBase64(new Uint8Array([37, 80, 68, 70]))).toBe('JVBERg==')
  })
})

describe('savePrintPdfs', function () {
  beforeEach(function () {
    localStorage.clear()
  })

  it('keeps the PDFs of the last 3 orders in localStorage', function () {
    ;['2026-10-16T1', '2026-10-16T2', '2026-10-16T3', '2026-10-16T4'].forEach(function (key) {
      savePrintPdfs(key, { a: { file_name: 'x.pdf', base64: 'JVBERg==' } })
    })
    var all = readStorage(PRINT_PDFS_KEY, {})
    expect(Object.keys(all)).toEqual(['2026-10-16T2', '2026-10-16T3', '2026-10-16T4'])
    expect(all['2026-10-16T4'].a.base64).toBe('JVBERg==')
  })
})
