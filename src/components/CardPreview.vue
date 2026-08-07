<script setup>
import { computed } from 'vue'

const props = defineProps({
  details: {
    type: Object,
    default: () => ({}),
  },
})

const name = computed(() => props.details.name || 'Hubert Blaine\nWolfeschlegelstein')
const title = computed(() => props.details.title || 'Associate | Canada')
const company = computed(() => props.details.company || 'Colliers')
const address = computed(
  () =>
    props.details.address ||
    '181 Bay Street\nSuite 1400\nToronto, ON M5J 2T3',
)
const email = computed(
  () => props.details.email || 'hubert.wolfe@colliers.com',
)
const phone = computed(() => props.details.phone || '+1 416 555-1234')
const website = computed(() => props.details.website || 'colliers.com/canada')
</script>

<template>
  <div
    class="relative aspect-[1.75/1] w-full overflow-hidden rounded-md border border-gray-200 bg-[#EEEEEE] font-sans text-[#4A4A4A] shadow-sm"
    style="container-type: inline-size"
  >
    <div class="absolute left-[6.5%] top-[12%] w-[25.5%]">
      <div class="inline-flex w-full flex-col overflow-hidden rounded-[2.5px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div class="flex items-center justify-center bg-[#24418A] px-[10%] py-[9%]">
          <span
            class="w-full py-[3%] text-center font-serif leading-none tracking-normal text-white"
            style="font-size: min(5.5cqw, 32px)"
          >Colliers</span>
        </div>
        <div class="w-full bg-[#00A9E0]" style="height: min(1cqw, 4px)" />
        <div class="w-full bg-[#FFD100]" style="height: min(1cqw, 4px)" />
        <div class="w-full bg-[#E35205]" style="height: min(1cqw, 4px)" />
      </div>
    </div>

    <div
      class="absolute left-[42%] right-[4%] top-[14%] text-[#25408F]"
      style="font-size: min(4.2cqw, 22px)"
    >
      <div class="line-clamp-2 break-words font-bold leading-[1.15] [overflow-wrap:anywhere] whitespace-pre-line">{{ name }}</div>
      <div class="mt-[4%] leading-[1.3] text-[#4A4A4A]" style="font-size: min(2.6cqw, 13px)">
        <div>{{ title }}</div>
        <div>{{ company }}</div>
        <div>CA Lic. 02328392</div>
      </div>
    </div>

    <div
      class="absolute bottom-[13%] left-[6.5%] right-[57%] whitespace-pre-wrap leading-[1.35] text-[#4A4A4A]"
      style="font-size: min(2.6cqw, 13px)"
    >{{ address }}</div>

    <div
      class="absolute bottom-[13%] left-[42%] right-[4%] leading-[1.35] text-[#4A4A4A]"
      style="font-size: min(2.6cqw, 13px)"
    >
      <div class="truncate">{{ email }}</div>
      <div>Mobile: {{ phone }}</div>
      <div class="mt-[2.5%]">{{ website }}</div>
    </div>
  </div>
</template>
