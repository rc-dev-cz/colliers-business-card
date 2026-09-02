#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const appRoot = join(root, '..')
const pkg = JSON.parse(readFileSync(join(appRoot, 'package.json'), 'utf8'))

const errors = []

function vueMajor(range) {
  const match = String(range || '').match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

if (vueMajor(pkg.dependencies && pkg.dependencies.vue) !== 2) {
  errors.push('package.json must resolve Vue 2.x')
}

if (vueMajor(pkg.dependencies && pkg.dependencies['vue-router']) !== 3) {
  errors.push('package.json must resolve vue-router 3.x')
}

const forbiddenPackages = ['@shoelace-style/shoelace', '@vitejs/plugin-vue']
const allDeps = Object.assign({}, pkg.dependencies, pkg.devDependencies)
forbiddenPackages.forEach(function (name) {
  if (allDeps[name]) errors.push('Forbidden Vue 3 / Clay-incompatible package: ' + name)
})

const namedImportRe =
  /import\s*\{[^}]*\b(ref|computed|watch|onMounted|onUnmounted|onBeforeUnmount|reactive|defineProps|defineEmits|createApp)\b[^}]*\}\s*from\s*['"]vue['"]/
const patterns = [
  { re: /<script\s+setup\b/i, label: '<script setup>' },
  { re: /\bcreateApp\s*\(/, label: 'createApp()' },
  { re: /<Teleport\b/i, label: 'Teleport' },
  { re: namedImportRe, label: 'Vue 3 Composition API import' },
]

function walk(dir, acc) {
  readdirSync(dir).forEach(function (name) {
    if (name === 'node_modules' || name === 'dist') return
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, acc)
    else if (/\.(vue|js)$/.test(name)) acc.push(full)
  })
  return acc
}

walk(join(appRoot, 'src'), []).forEach(function (file) {
  const text = readFileSync(file, 'utf8')
  const rel = relative(appRoot, file)
  patterns.forEach(function (rule) {
    if (rule.re.test(text)) errors.push(rel + ' uses ' + rule.label)
  })
})

const { consolidateCart } = await import('../src/helpers/cart.js')
const { clipName, clipEmail, NAME_MAX, EMAIL_MAX } = await import('../src/helpers/validate.js')
const { defaultOrder, addSplit, removeSplitAt, syncCartAssignments } = await import('../src/helpers/order.js')

const merged = consolidateCart([
  { id: 'a', code: 'BCAD-PL-ENG', quantity: 1, details: { name: 'Ada' } },
  { id: 'b', code: 'BCAD-PL-ENG', quantity: 2, details: { name: 'Ada' } },
  { id: 'c', code: 'BCAD-PL-ENG', quantity: 1, details: { name: 'Bob' } },
])
if (merged.length !== 2 || merged[0].quantity !== 3) {
  errors.push('cart helper must merge matching product + details')
}

if (clipName('x'.repeat(40)).length !== NAME_MAX || clipEmail('e'.repeat(50)).length !== EMAIL_MAX) {
  errors.push('validate helper must clip name and email to prototype limits')
}

const order = defaultOrder()
addSplit(order)
if (order.splits.length !== 2 || order.splits[1].itemIds.length !== 0) {
  errors.push('split order must add an empty group')
}
removeSplitAt(order, 0)
if (order.splits.length !== 1) errors.push('cannot go below one shipping group')
syncCartAssignments(order, ['line-1'])
if (order.splits[0].itemIds.indexOf('line-1') === -1) {
  errors.push('new cart lines must land in shipping group 1')
}

const { nextOrderId, seedOrderHistory, seedAdminOrderHistory, boxCount, cardCount, orderTotal } = await import('../src/helpers/orderHistory.js')
const { profileStorageKey } = await import('../src/helpers/storage.js')
const { seedPersonalAddresses } = await import('../src/helpers/addressBook.js')
if (profileStorageKey('addressBook', 'Demo') !== 'addressBook:demo') {
  errors.push('profile storage keys must be lowercased by email')
}
const personalSeed = seedPersonalAddresses()
if (personalSeed.length !== 2 || personalSeed[0].addressName !== 'Home Office') {
  errors.push('personal address seed must expose Home Office and Temporary Location')
}
const seeded = seedOrderHistory()
if (seeded.length !== 3 || nextOrderId(seeded) !== 'ORD-1004') {
  errors.push('order history seed must expose three demo rows and the next ORD id')
}
if (boxCount(seeded[0]) !== 2 || cardCount(seeded[0]) !== 500 || orderTotal(seeded[0]) !== 126) {
  errors.push('seeded English order must be 2 boxes, 500 cards, and $126')
}
const adminSeeded = seedAdminOrderHistory()
if (
  adminSeeded.length !== 5 ||
  cardCount(adminSeeded[0]) !== 500 ||
  orderTotal(adminSeeded[0]) !== 126
) {
  errors.push('admin order seed must expose ORD-8472 as 500 cards and $126')
}

if (errors.length) {
  console.error('Vue 2 check failed:\n- ' + errors.join('\n- '))
  process.exit(1)
}

console.log('Vue 2 check passed')

