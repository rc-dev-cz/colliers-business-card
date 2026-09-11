<template>
  <div
    class="relative aspect-[1.75/1] w-full overflow-hidden rounded-md border border-gray-200 bg-white font-sans text-[#4A4A4A] shadow-sm"
    style="container-type: inline-size"
  >
    <div class="absolute left-[6%] top-[12%] flex w-[66%] items-center gap-[4%]">
      <div class="inline-flex w-[26%] shrink-0 flex-col overflow-hidden rounded-[2.5px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Colliers_logo.svg"
          alt="Colliers Logo"
          class="block h-auto w-full object-contain"
        />
      </div>
      <div
        class="flex flex-col font-sans font-normal leading-[1.05] tracking-tight text-[#24418A]"
        style="font-size: min(4.125cqw, 28.5px)"
      >
        <template v-if="isFrench">
          <span>Maîtres</span>
          <span>de projets</span>
        </template>
        <template v-else>
          <span>Project</span>
          <span>Leaders</span>
        </template>
      </div>
    </div>

    <div
      class="absolute left-[45%] right-[4%] flex flex-col justify-end transition-all duration-300"
      :class="isLongName ? 'bottom-[12.5%]' : 'bottom-[14.5%]'"
    >
      <div
        class="mb-[3%] font-bold text-[#24418A] transition-all duration-300"
        :class="{ 'mb-[3.5%]': isLongName }"
        style="font-size: min(4cqw, 20px)"
      >
        <div class="line-clamp-2 whitespace-pre-line leading-[1.25]">{{ displayName }}<template v-if="degreeText">,</template></div>
        <div
          v-if="degreeText"
          class="mt-[2%] leading-[1.3]"
          style="font-size: 0.7em"
        >{{ degreeText }}</div>
      </div>
      <div class="mb-[6%] leading-[1.4] text-[#7A7A7A]" style="font-size: min(2.3cqw, 12px)">
        <div>{{ titleLine }}</div>
        <div v-if="teamLine" class="mt-[2%]">{{ teamLine }}</div>
      </div>
      <div class="leading-[1.45] text-[#7A7A7A]" style="font-size: min(2.3cqw, 12px)">
        <div class="truncate">{{ displayEmail }}</div>
        <div class="mt-[1.5%]">Mobile: {{ displayPhone }}</div>
        <div class="mt-[2.5%]">{{ displayWebsite }}</div>
      </div>
    </div>

    <div
      class="absolute bottom-[14.5%] left-[6%] right-[57%] whitespace-pre-wrap leading-[1.45] text-[#7A7A7A]"
      style="font-size: min(2.3cqw, 12px)"
    >{{ displayAddress }}</div>
  </div>
</template>

<script>
/** Catalog/details empty preview — field labels only (matches designer mock). */
var SAMPLE = {
  EN: {
    name: 'Full Name',
    degree: 'Degree/Certification, Additional Credentials',
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
    degree: 'Diplôme/Certification, Informations d\'identification supplémentaires',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'Courriel:',
    phone: 'Numéro de téléphone',
    address: 'Adresse',
    website: 'colliersprojectleaders.com/fr',
  },
}

function formatPhone(value) {
  if (!value) return '555 555 5555'
  var cleaned = String(value).replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6)
  }
  if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    return cleaned.slice(1, 4) + ' ' + cleaned.slice(4, 7) + ' ' + cleaned.slice(7)
  }
  return value
}

function formatDegree(degree) {
  if (!degree) return ''
  if (typeof degree === 'string') return degree
  if (Array.isArray(degree)) return degree.join(', ')
  return String(degree)
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
      var lang = this.language || ''
      return lang === 'French' || lang === 'Français' || lang === 'FR'
    },
    sample: function () {
      return this.isFrench ? SAMPLE.FR : SAMPLE.EN
    },
    usingSample: function () {
      return !this.details || !this.details.name
    },
    displayName: function () {
      return this.details.name || this.sample.name
    },
    isLongName: function () {
      var name = this.displayName || ''
      return name.length > 25 || name.indexOf('\n') !== -1
    },
    degreeText: function () {
      var degree = ''
      if (this.details.degree !== undefined && this.details.degree !== null) {
        degree = formatDegree(this.details.degree)
      } else if (this.usingSample) {
        degree = this.sample.degree
      }
      var extra = this.details.additionalCredentials
        ? String(this.details.additionalCredentials)
        : ''
      if (degree && extra) return degree + ', ' + extra
      return degree || extra
    },
    titleLine: function () {
      var title = this.details.title
      if (Array.isArray(title) && title.length) {
        var joined = title.join(' | ')
        if (this.details.region) return joined + ' | ' + this.details.region
        return joined
      }
      if (typeof title === 'string' && title.length) {
        if (this.details.region && title.indexOf('|') === -1) {
          return title + ' | ' + this.details.region
        }
        return title
      }
      if (this.usingSample) {
        return this.sample.title + ' | ' + this.sample.region
      }
      return this.isFrench ? 'Titre' : 'Title'
    },
    teamLine: function () {
      if (this.details.specializedTeam) return this.details.specializedTeam
      return this.usingSample ? this.sample.team : ''
    },
    displayEmail: function () {
      return this.details.email || (this.usingSample ? this.sample.email : '')
    },
    displayPhone: function () {
      if (this.usingSample) return this.sample.phone
      return this.details.phone ? formatPhone(this.details.phone) : ''
    },
    displayWebsite: function () {
      if (this.usingSample) return this.sample.website
      return this.details.website || this.sample.website
    },
    displayAddress: function () {
      if (this.usingSample) return this.sample.address
      return this.details.address || ''
    },
  },
}
</script>
