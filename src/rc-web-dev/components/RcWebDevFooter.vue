<template>
  <footer class="web-dev-credit shrink-0 flex justify-end pt-2" aria-label="Developer credit">
    <p class="web-dev-credit-line">
      developed by
      <span class="web-dev-credit-name">CZ</span>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'RcWebDevFooter',
}
</script>

<style scoped>
.web-dev-credit-line {
  margin: 0;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: #9ca3af;
  animation: web-dev-credit-in 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.web-dev-credit-name {
  font-weight: 500;
  background: linear-gradient(90deg, #6b7280 0%, #25408f 42%, #00a9e0 58%, #6b7280 100%);
  background-size: 220% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: web-dev-credit-shine 7s ease-in-out 1.6s infinite;
}

@keyframes web-dev-credit-in {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}

@keyframes web-dev-credit-shine {
  0%,
  100% {
    background-position: 100% 50%;
  }
  50% {
    background-position: 0% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .web-dev-credit-line,
  .web-dev-credit-name {
    animation: none;
    filter: none;
  }

  .web-dev-credit-name {
    background: none;
    color: #25408f;
  }
}
</style>
