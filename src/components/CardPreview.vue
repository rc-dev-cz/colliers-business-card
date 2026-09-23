<template>
  <div
    class="card-preview-face relative aspect-[1.75/1] w-full overflow-hidden rounded-md border border-gray-200 bg-white text-[#4A4A4A] shadow-sm"
    style="container-type: inline-size; font-family: 'ColliersOpenSans', sans-serif"
  >
    <div class="absolute left-[7%] top-[12.3%] flex w-[34%] items-center gap-[6%]">
      <div class="inline-flex w-[54.5%] shrink-0 flex-col overflow-hidden">
        <img
          :src="colliersLogo"
          alt="Colliers Logo"
          class="block h-auto w-full object-contain"
        />
      </div>
      <div
        class="min-w-0 flex-1 font-normal leading-[1.08] tracking-tight text-[#03438C]"
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

    <div
      v-for="(line, idx) in view.nameLines"
      :key="'name-' + idx"
      class="absolute whitespace-nowrap font-bold leading-none text-[#03438C]"
      :style="nameLineStyle(idx)"
    >
      <span>{{ line }}</span><span
        v-if="idx === view.nameLines.length - 1 && view.inlineCredential"
        class="align-baseline font-bold"
        style="font-size: 0.7em"
      >{{ view.inlineCredential }}</span>
    </div>

    <div
      v-if="view.credentialLine"
      class="absolute whitespace-nowrap font-bold leading-none text-[#03438C]"
      :style="rowStyle(view.credentialY, true)"
    >{{ view.credentialLine }}</div>

    <div
      class="absolute whitespace-nowrap leading-none text-[#5F636A]"
      :style="rowStyle(view.titleY, false)"
    >{{ view.title }}</div>
    <div
      v-if="view.team"
      class="absolute whitespace-nowrap leading-none text-[#5F636A]"
      :style="rowStyle(view.teamY, false)"
    >{{ view.team }}</div>

    <div
      class="absolute whitespace-nowrap leading-none text-[#5F636A]"
      :style="emailStyle()"
    >{{ view.email }}</div>
    <div
      class="absolute whitespace-nowrap leading-none text-[#5F636A]"
      :style="rowStyle(view.phoneY, false)"
    >{{ view.phone }}</div>
    <div
      class="absolute whitespace-nowrap leading-none text-[#5F636A]"
      :style="rowStyle(view.websiteY, false)"
    >{{ view.website }}</div>

    <div
      class="absolute whitespace-pre-wrap leading-[1.25] text-[#5F636A]"
      :style="addressStyle"
    >{{ view.addressText }}</div>
  </div>
</template>

<script>
import colliersLogo from '../assets/colliers-logo-print.png'
import {
  CARD_LAYOUT,
  resolveCardFields,
  trimBottomPct,
  trimLeftPct,
} from '../helpers/cardLayout'
import {
  formatCredentialSuffix,
  isFrenchLanguage,
  previewAddressText,
  previewCredentialText,
  previewTeamText,
  previewTitleText,
} from '../helpers/formatCardIdentity'

function fallbackView(fields) {
  var L = CARD_LAYOUT
  var cred = fields.credentialSuffix
  return {
    nameLines: [fields.name],
    nameLineYs: [L.nameY],
    inlineCredential: cred ? ', ' + cred : '',
    credentialLine: '',
    credentialY: null,
    title: fields.title,
    titleY: L.titleYNoCred,
    team: fields.team,
    teamY: L.teamYNoCred,
    email: fields.email,
    phone: 'Mobile: ' + fields.phone,
    website: fields.website,
    emailY: L.emailY,
    phoneY: L.phoneY,
    websiteY: L.websiteY,
    addressText: fields.address,
    addressY: L.addressBottomY,
  }
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
    plan: {
      type: Object,
      default: null,
    },
    /** Customize only. Empty optional fields keep their labels until the user types. */
    placeholders: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isFrench: function () {
      return isFrenchLanguage(this.language)
    },
    colliersLogo: function () {
      return colliersLogo
    },
    identityLeft: function () {
      return trimLeftPct(CARD_LAYOUT.identityX) + '%'
    },
    emailRight: function () {
      var L = CARD_LAYOUT
      var inset = L.trimW - (L.identityX + L.emailMaxWidth - L.bleed)
      return (inset / L.trimW) * 100 + '%'
    },
    view: function () {
      var base
      if (this.plan && this.plan.nameLines) {
        base = Object.assign({}, this.plan, {
          addressText: (this.plan.address && this.plan.address.lines
            ? this.plan.address.lines
            : []
          ).join('\n'),
          addressY: this.plan.address ? this.plan.address.bottomY : CARD_LAYOUT.addressBottomY,
        })
      } else {
        base = fallbackView(resolveCardFields(this.details, this.language))
      }
      if (!this.placeholders) return base
      return this.withOptionalPlaceholders(base)
    },
    addressStyle: function () {
      return {
        left: trimLeftPct(CARD_LAYOUT.addressX) + '%',
        right: 100 - trimLeftPct(CARD_LAYOUT.identityX) + '%',
        bottom: trimBottomPct(this.view.addressY) + '%',
        fontSize: 'min(2.15cqw, 11px)',
      }
    },
  },
  methods: {
    nameLineStyle: function (idx) {
      var y = this.view.nameLineYs && this.view.nameLineYs[idx]
      if (y == null) y = CARD_LAYOUT.nameY
      return {
        left: this.identityLeft,
        right: '7%',
        bottom: trimBottomPct(y) + '%',
        fontSize: 'min(3.7cqw, 18px)',
      }
    },
    emailStyle: function () {
      return this.rowStyle(this.view.emailY, false, this.emailRight)
    },
    rowStyle: function (y, cred, right) {
      return {
        left: this.identityLeft,
        right: right || '7%',
        bottom: trimBottomPct(y) + '%',
        fontSize: cred ? 'min(2.6cqw, 13px)' : 'min(2.15cqw, 11px)',
      }
    },
    withOptionalPlaceholders: function (view) {
      var details = this.details || {}
      var language = this.language
      var real = formatCredentialSuffix(details.degree, details.additionalCredentials)
      var cred = previewCredentialText(details.degree, details.additionalCredentials, language)
      var next = Object.assign({}, view, {
        title: previewTitleText(details.title, details.region, language),
        team: previewTeamText(details.specializedTeam, language),
      })
      var address = details.address != null ? String(details.address).trim() : ''
      if (!address) next.addressText = previewAddressText('', language)
      if (cred === real) return next
      // Degrees start on the name line, after the comma, same as "Lastname, C.M."
      // A real credential string that already needed its own row stays on that row.
      if (view.credentialLine) {
        next.credentialLine = cred
        return next
      }
      next.inlineCredential = ', ' + cred
      next.credentialLine = ''
      return next
    },
  },
}
</script>

<style>
@font-face {
  font-family: 'ColliersOpenSans';
  src: url('../assets/fonts/OpenSans-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'ColliersOpenSans';
  src: url('../assets/fonts/OpenSans-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
</style>
