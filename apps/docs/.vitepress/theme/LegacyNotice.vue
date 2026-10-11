<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, withBase } from 'vitepress';

const route = useRoute();
const isLegacy = computed(() => route.path.startsWith(withBase('/packages/legacy/')));
</script>

<template>
  <div v-if="isLegacy" class="warning custom-block legacy-notice">
    <p class="custom-block-title">LEGACY</p>
    <p>
      This page documents the previous major versions of the @tma.js packages. For the latest
      versions, see the <a :href="withBase('/packages/tma-js-sdk')">current documentation</a> and
      the <a :href="withBase('/packages/upgrading')">upgrading guide</a>.
    </p>
  </div>
</template>

<style scoped>
.legacy-notice {
  margin-bottom: 24px;
}
</style>
