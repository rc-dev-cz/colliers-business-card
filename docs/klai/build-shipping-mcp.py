#!/usr/bin/env python3
"""Build Klai MCP ops payload for Shipping (not executed by MCP itself)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def fn(name):
    return (ROOT / name).read_text().strip() + "\n"


def action(text):
    return [{"action": "function", "function": text}]


named = {
    "onFormLoad": action(fn("shipping-onFormLoad.js")),
    "refreshView": action(fn("shipping-refreshView.js")),
    "goBack": action(
        "if (typeof BF !== 'undefined' && BF.goto) { BF.goto('/'); return; }\n"
        "if (window.location) window.location.hash = '#/';"
    ),
    "goReview": action(
        "BF.namedAction('refreshView');\n"
        "if (!(model.view && model.view.canReview)) return;\n"
        "if (typeof BF !== 'undefined' && BF.goto) { BF.goto('/review'); return; }\n"
        "if (window.location) window.location.hash = '#/review';"
    ),
    "setLineCardsQty": action(
        "var lineId = action && action.options && action.options.lineId;\n"
        "var cards = Number(action && action.options && action.options.cards) || 0;\n"
        "var line = _.find(model.cart || [], function (row) { return String(row.id) === String(lineId); });\n"
        "if (!line) return;\n"
        "var locCount = 0;\n"
        "((model.order && model.order.splits) || []).forEach(function (split) {\n"
        "  if ((split.itemIds || []).indexOf(String(lineId)) >= 0) locCount = split.locations ? split.locations.length : 0;\n"
        "});\n"
        "var mult = locCount > 0 ? locCount : 1;\n"
        "line.quantity = Math.max(1, Math.round(cards / 250 / mult));\n"
        "BF.namedAction('refreshView');"
    ),
    "removeLine": action(fn("shipping-removeLine.js")),
    "setLocationQty": action(fn("shipping-setLocationQty.js")),
    "moveLine": action(fn("shipping-moveLine.js")),
    "addCartLine": action(
        "var lineId = String(action && action.options && action.options.lineId || '');\n"
        "var splitId = String(action && action.options && action.options.splitId || '');\n"
        "action.options = { lineId: lineId, splitId: splitId };\n"
        "BF.namedAction('moveLine', { lineId: lineId, splitId: splitId });\n"
        "model.view.addItemMenuIndex = null;"
    ),
    "addItem": action(
        "var splitIndex = Number(action && action.options && action.options.splitIndex);\n"
        "var split = model.order.splits[splitIndex];\n"
        "if (!split) return;\n"
        "if (split.outsideLines && split.outsideLines.length) {\n"
        "  model.view.selectMenuIndex = null;\n"
        "  model.view.addItemMenuIndex = model.view.addItemMenuIndex === splitIndex ? null : splitIndex;\n"
        "  return;\n"
        "}\n"
        "if (typeof app !== 'undefined') app.pendingSplitId = split.id;\n"
        "if (typeof BF !== 'undefined' && BF.goto) { BF.goto('/'); return; }\n"
        "if (window.location) window.location.hash = '#/';"
    ),
    "splitOrder": action(
        "if (!model.order || !Array.isArray(model.order.splits)) {\n"
        "  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'order', { splits: [] });\n"
        "  else model.order = { splits: [] };\n"
        "}\n"
        "var next = { id: Date.now(), itemIds: [], locations: [] };\n"
        "model.order.splits.push(next);\n"
        "if (typeof app !== 'undefined') {\n"
        "  if (!app.order || !Array.isArray(app.order.splits)) app.order = { splits: [] };\n"
        "  app.order.splits.push({ id: next.id, itemIds: [], locations: [] });\n"
        "}\n"
        "if (model.view) model.view.addItemMenuIndex = null;\n"
        "BF.namedAction('refreshView');"
    ),
    "removeSplit": action(
        "var splitIndex = Number(action && action.options && action.options.splitIndex);\n"
        "if (!model.order.splits || model.order.splits.length <= 1) return;\n"
        "var removed = model.order.splits.splice(splitIndex, 1)[0];\n"
        "var ids = (removed && removed.itemIds) || [];\n"
        "var target = model.order.splits[0];\n"
        "target.itemIds = target.itemIds || [];\n"
        "ids.forEach(function (id) {\n"
        "  if (target.itemIds.indexOf(String(id)) === -1) target.itemIds.push(String(id));\n"
        "});\n"
        "BF.namedAction('refreshView');"
    ),
    "removeLocation": action(fn("shipping-removeLocation.js")),
    "toggleSelectMenu": action(
        "var splitIndex = Number(action && action.options && action.options.splitIndex);\n"
        "model.view.addItemMenuIndex = null;\n"
        "model.view.selectMenuIndex = model.view.selectMenuIndex === splitIndex ? null : splitIndex;"
    ),
    "toggleSelectAddress": action(
        "var splitIndex = Number(action && action.options && action.options.splitIndex);\n"
        "var address = String(action && action.options && action.options.address || '').trim();\n"
        "var checked = Boolean(action && action.options && action.options.checked);\n"
        "var split = model.order.splits[splitIndex];\n"
        "if (!split || !address) return;\n"
        "split.locations = split.locations || [];\n"
        "var idx = split.locations.findIndex(function (row) { return row.address === address; });\n"
        "if (checked && idx < 0) {\n"
        "  split.locations.push({ id: 'loc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), address: address, qty: 1 });\n"
        "} else if (!checked && idx >= 0) {\n"
        "  split.locations.splice(idx, 1);\n"
        "}\n"
        "BF.namedAction('refreshView');"
    ),
    "openAddModal": action(
        "var splitIndex = Number(action && action.options && action.options.splitIndex);\n"
        "var split = model.order.splits[splitIndex];\n"
        "model.view.selectMenuIndex = null;\n"
        "model.view.modalSplitIndex = splitIndex;\n"
        "model.view.modalSelected = split ? (split.locations || []).map(function (row) { return row.address; }).filter(Boolean) : [];\n"
        "model.view.modalOpen = true;"
    ),
    "closeAddModal": action(
        "model.view.modalOpen = false;\n"
        "model.view.modalSplitIndex = null;\n"
        "model.view.modalSelected = [];"
    ),
    "toggleModalAddress": action(
        "var address = String(action && action.options && action.options.address || '').trim();\n"
        "if (!address || !model.view) return;\n"
        "var selected = Array.isArray(model.view.modalSelected) ? model.view.modalSelected.slice() : [];\n"
        "var idx = selected.indexOf(address);\n"
        "var raw = action && action.options ? action.options.checked : undefined;\n"
        "var on;\n"
        "if (raw === undefined || raw === null || raw === '') on = idx < 0;\n"
        "else on = raw === true || raw === 1 || raw === 'true' || raw === '1';\n"
        "if (on && idx < 0) selected.push(address);\n"
        "if (!on && idx >= 0) selected.splice(idx, 1);\n"
        "if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, 'modalSelected', selected);\n"
        "else model.view.modalSelected = selected;"
    ),
    "applyModalAddresses": action(
        "var splitIndex = Number(model.view && model.view.modalSplitIndex);\n"
        "var wanted = ((model.view && model.view.modalSelected) || []).map(function (row) {\n"
        "  return String(row || '').trim();\n"
        "}).filter(Boolean);\n"
        "var split = model.order && model.order.splits && model.order.splits[splitIndex];\n"
        "if (model.view) {\n"
        "  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, 'modalOpen', false);\n"
        "  else model.view.modalOpen = false;\n"
        "  model.view.modalSplitIndex = null;\n"
        "}\n"
        "if (!split) {\n"
        "  BF.namedAction('refreshView');\n"
        "  return;\n"
        "}\n"
        "var existing = {};\n"
        "(split.locations || []).forEach(function (loc) {\n"
        "  if (loc && loc.address) existing[loc.address] = loc;\n"
        "});\n"
        "var next = wanted.map(function (addr) {\n"
        "  return existing[addr] || { id: 'loc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), address: addr, qty: 1 };\n"
        "});\n"
        "if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split, 'locations', next);\n"
        "else split.locations = next;\n"
        "try {\n"
        "  if (typeof sessionStorage !== 'undefined') {\n"
        "    sessionStorage.setItem('colliers-tab.order', JSON.stringify({\n"
        "      detachedIds: (model.order && model.order.detachedIds) || [],\n"
        "      splits: (model.order.splits || []).map(function (row) {\n"
        "        return {\n"
        "          id: row.id,\n"
        "          itemIds: (row.itemIds || []).slice(),\n"
        "          qtys: Object.assign({}, row.qtys || {}),\n"
        "          locations: (row.locations || []).map(function (loc) {\n"
        "            return { id: loc.id, address: loc.address || '', qty: loc.qty };\n"
        "          })\n"
        "        };\n"
        "      })\n"
        "    }));\n"
        "  }\n"
        "} catch (errPersist) {}\n"
        "BF.namedAction('refreshView');"
    ),
    "moveLocation": action(fn("shipping-moveLocation.js")),
    "previewLine": action(fn("shipping-previewLine.js")),
    "editLine": action(fn("shipping-editLine.js")),
    "goCustomize": action(fn("shipping-goCustomize.js")),
}

sample_cart = [
    {
        "id": "line-dev-1",
        "code": "BCAD-PL-ENG",
        "language": "English",
        "quantity": 1,
        "price": 63,
        "details": {"name": "", "language": "English"},
    },
    {
        "id": "line-dev-2",
        "code": "BCAD-PL-FR",
        "language": "French",
        "quantity": 1,
        "price": 63,
        "details": {"name": "", "language": "French"},
    },
]
sample_order = {
    "splits": [
        {
            "id": 1,
            "itemIds": ["line-dev-1", "line-dev-2"],
            "locations": [],
        }
    ]
}
model = {
    "cart": sample_cart,
    "order": sample_order,
    "products": [
        {"code": "BCAD-PL-ENG", "language": "English", "nameKey": "label_colliers_productEnglish", "price": 63},
        {"code": "BCAD-PL-FR", "language": "French", "nameKey": "label_colliers_productFrench", "price": 63},
        {"code": "BCAD-PL-BIL", "language": "Bilingual", "nameKey": "label_colliers_productBilingual", "price": 63},
    ],
    "personalAddresses": [],
    "offices": [],
    "view": {
        "itemCount": 2,
        "cardsCount": 500,
        "addressOptions": {"personal": [], "offices": [], "all": []},
        "knownAddresses": [],
        "addItemMenuIndex": None,
        "selectMenuIndex": None,
        "modalOpen": False,
        "modalSplitIndex": None,
        "modalSelected": [],
    },
}

html = ROOT.joinpath("shipping.html").read_text()
ops = [
    {"op": "replace", "path": "pages[0].schema.fields[0].fields[1].html", "type": "string", "value": html},
    {"op": "replace", "path": "form.namedActions", "type": "object", "value": named},
    {
        "op": "set",
        "path": "form.styleClassesPage",
        "type": "string",
        "value": "colliers-page h-screen flex flex-col",
    },
    {
        "op": "set",
        "path": "form.styleClassesBody",
        "type": "string",
        "value": "colliers-page-body colliers-page-body--stack flex flex-col flex-1 min-h-0 overflow-auto",
    },
    {"op": "replace", "path": "model", "type": "object", "value": model},
    {"op": "replace", "path": "modelDev", "type": "object", "value": model},
    {"op": "set", "path": "devDataEnabled", "type": "boolean", "value": True},
]
out = ROOT / ".tmp-shipping-mcp-ops.json"
out.write_text(json.dumps({"recModCount": 8, "ops": ops}, ensure_ascii=False))
print("wrote", out, "bytes", out.stat().st_size)
