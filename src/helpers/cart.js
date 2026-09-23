import { getProduct } from '../data/products.js'

export function sameDetails(a, b) {
  const left = a || {}
  const right = b || {}
  return JSON.stringify(left) === JSON.stringify(right)
}

export function uid() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function makeLine(payload) {
  const product = getProduct(payload.code)
  const details = Object.assign({}, payload.details || {})
  if (Array.isArray(details.degree)) {
    details.degree = details.degree.slice()
  } else if (details.degree) {
    details.degree = [details.degree]
  } else {
    details.degree = []
  }
  return {
    id: payload.id || uid(),
    code: payload.code,
    language: payload.language || (product && product.language) || '',
    quantity: payload.quantity || 1,
    price: (product && product.price) || payload.price || 0,
    details: details,
  }
}

export function cloneLine(lines, id) {
  const source = Array.isArray(lines) ? lines : []
  const line = source.find(function (row) {
    return String(row.id) === String(id)
  })
  if (!line) return null
  return makeLine({
    code: line.code,
    language: line.language,
    quantity: line.quantity,
    price: line.price,
    details: line.details,
  })
}

export function consolidateCart(items) {
  const source = Array.isArray(items) ? items : []
  const merged = []
  for (let i = 0; i < source.length; i += 1) {
    const item = makeLine(source[i])
    const match = merged.find(function (line) {
      return line.code === item.code && sameDetails(line.details, item.details)
    })
    if (match) {
      match.quantity += item.quantity || 1
    } else {
      merged.push(item)
    }
  }
  return merged
}

export function cartCount(lines) {
  const source = Array.isArray(lines) ? lines : []
  return source.reduce(function (sum, line) {
    return sum + (line.quantity || 0)
  }, 0)
}

export function cartSubtotal(lines) {
  const source = Array.isArray(lines) ? lines : []
  return source.reduce(function (sum, line) {
    const product = getProduct(line.code)
    const price = (product && product.price) || line.price || 0
    return sum + price * (line.quantity || 0)
  }, 0)
}

export function lineTotal(line) {
  const product = getProduct(line.code)
  const price = (product && product.price) || line.price || 0
  return price * (line.quantity || 0)
}
