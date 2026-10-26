<template>
  <section class="w-full rounded-xl border border-gray-200 bg-white text-left shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-gray-900">{{ t('fmDataTitle') }}</h2>
        <p class="mt-0.5 text-sm text-gray-500">
          {{ t('fmDataHint') }}
          <span class="whitespace-nowrap">#{{ orderId }}</span>
        </p>
      </div>
      <app-button variant="outline" @click="open = !open">
        {{ open ? t('fmDataHide') : t('fmDataShow') }}
      </app-button>
    </div>

    <div v-if="open" class="space-y-6 border-t border-gray-100 px-5 py-5 sm:px-6">
      <!-- Order header → store_BFUsers_order -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ t('fmDataOrder') }} <span class="font-normal text-gray-400">· order</span>
        </h3>
        <dl class="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div v-for="row in orderRows" :key="row.key" class="flex justify-between gap-3">
            <dt class="font-mono text-xs leading-5 text-gray-500">{{ row.key }}</dt>
            <dd class="text-right text-gray-900 [overflow-wrap:anywhere]">{{ show(row.value) }}</dd>
          </div>
        </dl>
      </div>

      <!-- One block per shipping group → sync_BR_order_group -->
      <div
        v-for="group in payload.groups"
        :key="group.group_ref"
        class="rounded-lg border border-gray-200"
      >
        <div class="flex flex-wrap justify-between gap-2 bg-gray-50 px-4 py-2 text-sm">
          <span class="font-semibold text-gray-900">
            {{ t('fmDataGroup') }} {{ group.shipment_number }}
          </span>
          <span class="font-mono text-xs leading-5 text-gray-500">
            count_locations {{ group.count_locations }} · total_items
            {{ money(group.total_items) }} · total_shipping {{ show(group.total_shipping) }}
          </span>
        </div>

        <!-- items[] → _items -->
        <div class="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('fmDataItems') }} <span class="font-normal normal-case">· items</span>
        </div>
        <div class="overflow-x-auto px-4 pb-3">
          <table class="w-full min-w-[560px] text-left text-sm">
            <thead class="font-mono text-xs text-gray-500">
              <tr>
                <th class="py-1.5 pr-3 font-normal">product_code</th>
                <th class="py-1.5 pr-3 font-normal">catalogue_id</th>
                <th class="py-1.5 pr-3 font-normal">language</th>
                <th class="py-1.5 pr-3 font-normal">card.name</th>
                <th class="py-1.5 pr-3 text-right font-normal">quantity</th>
                <th class="py-1.5 pr-3 text-right font-normal">unit_price</th>
                <th class="py-1.5 text-right font-normal">price</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in group.items"
                :key="item.line_ref"
                class="border-t border-gray-100 align-top"
              >
                <td class="py-1.5 pr-3">{{ item.product_code }}</td>
                <td class="py-1.5 pr-3">{{ show(item.catalogue_id) }}</td>
                <td class="py-1.5 pr-3">{{ show(item.language) }}</td>
                <td class="py-1.5 pr-3 [overflow-wrap:anywhere]">{{ show(item.card.name) }}</td>
                <td class="py-1.5 pr-3 text-right tabular-nums">
                  {{ item.quantity }}
                  <span class="text-xs text-gray-400">({{ item.cards }})</span>
                </td>
                <td class="py-1.5 pr-3 text-right tabular-nums">{{ money(item.unit_price) }}</td>
                <td class="py-1.5 text-right tabular-nums">{{ money(item.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- locations[] → _shipment, address → _shipment_addresses -->
        <div class="px-4 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {{ t('fmDataLocations') }} <span class="font-normal normal-case">· locations</span>
        </div>
        <div class="overflow-x-auto px-4 pb-4">
          <table class="w-full min-w-[560px] text-left text-sm">
            <thead class="font-mono text-xs text-gray-500">
              <tr>
                <th class="py-1.5 pr-3 font-normal">location_id</th>
                <th class="py-1.5 pr-3 font-normal">address_name</th>
                <th class="py-1.5 pr-3 font-normal">address_contact</th>
                <th class="py-1.5 pr-3 font-normal">street_1 · city · province</th>
                <th class="py-1.5 text-right font-normal">boxes_per_item</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="loc in group.locations"
                :key="loc.location_ref"
                class="border-t border-gray-100 align-top"
              >
                <td class="py-1.5 pr-3">
                  {{ show(loc.location_id) }}
                  <span v-if="loc.location_type" class="text-xs text-gray-400">
                    ({{ loc.location_type }})
                  </span>
                </td>
                <td class="py-1.5 pr-3">{{ show(loc.address.address_name) }}</td>
                <td class="py-1.5 pr-3">{{ show(loc.address.address_contact) }}</td>
                <td class="py-1.5 pr-3 [overflow-wrap:anywhere]">
                  {{ addressText(loc.address) }}
                </td>
                <td class="py-1.5 text-right tabular-nums">
                  {{ loc.boxes_per_item }}
                  <span class="text-xs text-gray-400">({{ loc.cards_per_item }})</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- cards[] → one print PDF per unique card -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900">
          {{ t('fmDataPdfs') }}
          <span class="font-normal text-gray-400">
            · cards · print_pdf_status {{ show(payload.order.print_pdf_status) }}
          </span>
        </h3>
        <ul class="space-y-2 text-sm">
          <li
            v-for="card in cards"
            :key="card.line_ref"
            class="flex flex-wrap items-center justify-between gap-2"
          >
            <span class="min-w-0 [overflow-wrap:anywhere]">
              {{ card.print_pdf_file_name }}
              <span class="text-xs text-gray-400">({{ pdfSize(card) }})</span>
            </span>
            <button
              type="button"
              class="text-sm font-medium text-colliers-primary hover:underline"
              @click="openPdf(card)"
            >
              {{ t('fmDataOpenPdf') }}
            </button>
          </li>
        </ul>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-gray-900">{{ t('fmDataJson') }}</h3>
          <button
            type="button"
            class="text-sm font-medium text-colliers-primary hover:underline"
            @click="copyJson"
          >
            {{ copied ? t('fmDataCopied') : t('fmDataCopy') }}
          </button>
        </div>
        <pre
          class="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100"
          >{{ json }}</pre>
      </div>
    </div>
  </section>
</template>

<script>
import AppButton from './AppButton.vue'
import { t } from '../store'
import { payloadJsonForDisplay } from '../helpers/orderPayload'

export default {
  name: 'OrderPayloadPanel',
  components: { AppButton },
  props: {
    payload: { type: Object, required: true },
    orderId: { type: String, default: '' },
  },
  data: function () {
    return { open: false, copied: false }
  },
  computed: {
    orderRows: function () {
      var order = this.payload.order || {}
      return Object.keys(order).map(function (key) {
        return { key: key, value: order[key] }
      })
    },
    cards: function () {
      return this.payload.cards || []
    },
    json: function () {
      return payloadJsonForDisplay(this.payload)
    },
  },
  methods: {
    t: t,
    show: function (value) {
      return value == null || value === '' ? '—' : String(value)
    },
    money: function (value) {
      return value == null ? '—' : '$' + Number(value).toFixed(2)
    },
    addressText: function (address) {
      var parts = [address.street_1, address.city, address.province].filter(Boolean)
      return parts.length ? parts.join(' · ') : this.show(address.one_line)
    },
    pdfSize: function (card) {
      // base64 is 4 characters per 3 bytes
      var bytes = Math.round((String(card.print_pdf_base64 || '').length * 3) / 4)
      return Math.max(1, Math.round(bytes / 1024)) + ' KB'
    },
    openPdf: function (card) {
      var binary = atob(card.print_pdf_base64)
      var bytes = new Uint8Array(binary.length)
      for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
      var url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      window.open(url, '_blank', 'noopener')
    },
    copyJson: function () {
      var self = this
      // Full payload, PDFs included, so it can be pasted into a FileMaker test.
      var text = JSON.stringify(this.payload, null, 2)
      if (!navigator.clipboard) return
      navigator.clipboard.writeText(text).then(function () {
        self.copied = true
        setTimeout(function () {
          self.copied = false
        }, 2000)
      })
    },
  },
}
</script>
