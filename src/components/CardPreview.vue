<template>
  <div
    class="card-preview-face relative aspect-[1.75/1] w-full overflow-hidden rounded-md border border-gray-200 bg-white font-sans text-[#4A4A4A] shadow-sm"
    style="container-type: inline-size"
  >
    <!-- Brand lockup: matches approved EN print PDF (logo + Project Leaders) -->
    <div class="absolute left-[7%] top-[12.3%] flex w-[34%] items-center gap-[6%]">
      <div class="inline-flex w-[54.5%] shrink-0 flex-col overflow-hidden">
        <img
          :src="colliersLogo"
          alt="Colliers Logo"
          class="block h-auto w-full object-contain"
        />
      </div>
      <div
        class="min-w-0 flex-1 font-sans font-normal leading-[1.08] tracking-tight text-[#03438C]"
        style="font-size: min(3.2cqw, 16px)"
      >
        <template v-if="isFrench">
          <span class="block">Maîtres</span>
          <span class="block">de projets</span>
        </template>
        <template v-else>
          <span class="block">Project</span>
          <span class="block">Leaders</span>
        </template>
      </div>
    </div>

    <!-- Right column: identity at top of column, contact pinned to bottom with a clear gap -->
    <div class="absolute bottom-[12.5%] left-[41.3%] right-[8.5%] top-[41%] flex flex-col">
      <div>
        <div class="font-bold leading-[1.2] text-[#03438C]" style="font-size: min(3.7cqw, 18px)">
          <span class="whitespace-pre-line">{{ displayName }}</span><span
            v-if="credentialSuffix"
            class="align-baseline font-bold"
            style="font-size: 0.7em"
          >, {{ credentialSuffix }}</span>
        </div>
        <div class="mt-[3.5%] leading-[1.35] text-[#5F636A]" style="font-size: min(2.15cqw, 11px)">
          <div>{{ titleLine }}</div>
          <div class="mt-[2%] min-h-[1.35em]">{{ teamLine }}</div>
        </div>
      </div>
      <!-- Paragraph break before email (matches approved client cards) -->
      <div
        class="mt-auto pt-[10%] leading-[1.5] text-[#5F636A]"
        style="font-size: min(2.15cqw, 11px)"
      >
        <div class="break-words">{{ displayEmail }}</div>
        <div>Mobile: {{ displayPhone }}</div>
        <div>{{ displayWebsite }}</div>
      </div>
    </div>

    <div
      class="absolute bottom-[12.5%] left-[7%] right-[58%] whitespace-pre-wrap leading-[1.5] text-[#5F636A]"
      style="font-size: min(2.15cqw, 11px)"
    >{{ displayAddress }}</div>
  </div>
</template>

<script>
import colliersLogo from '../assets/colliers-logo-print.png'
import { wrapCardName } from '../helpers/wrapCardName'
import { formatCredentialSuffix, formatTitleLine, isFrenchLanguage } from '../helpers/formatCardIdentity'
import { formatCardPhone } from '../helpers/validate'

/** Catalog/details empty preview — field labels only (matches designer mock). */
var SAMPLE = {
  EN: {
    name: 'Full Name',
    title: 'Title',
    region: 'Region',
    team: 'Specialized Team',
    email: 'Email:',
    phone: 'Phone Number',
    address: 'Address',
    website: 'colliersprojectleaders.com',
  },
  FR: {
    name: 'Nom complet',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'Courriel:',
    phone: 'Numéro de téléphone',
    address: 'Adresse',
    website: 'colliersprojectleaders.com/fr',
  },
}

export default {
  name: 'CardPreview',
  props: {
    details: {
      type: Object,
      default: function () {
        return {}
      },
    },
    language: {
      type: String,
      default: 'English',
    },
  },
  computed: {
    isFrench: function () {
      return isFrenchLanguage(this.language)
    },
    colliersLogo: function () {
      return colliersLogo
    },
    sample: function () {
      return this.isFrench ? SAMPLE.FR : SAMPLE.EN
    },
    displayName: function () {
      var name = String((this.details && this.details.name) || '').trim()
      return wrapCardName(name) || this.sample.name
    },
    credentialSuffix: function () {
      return formatCredentialSuffix(
        this.details && this.details.degree,
        this.details && this.details.additionalCredentials,
      )
    },
    titleLine: function () {
      return formatTitleLine(
        this.details.title,
        this.details.region,
        this.sample.title,
        this.sample.region,
      )
    },
    teamLine: function () {
      return String((this.details && this.details.specializedTeam) || '').trim()
    },
    displayEmail: function () {
      return this.details.email || this.sample.email
    },
    displayPhone: function () {
      return this.details.phone ? formatCardPhone(this.details.phone) : this.sample.phone
    },
    displayWebsite: function () {
      return this.details.website || this.sample.website
    },
    displayAddress: function () {
      return this.details.address || this.sample.address
    },
  },
}
</script>
