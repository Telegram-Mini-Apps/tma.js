<script setup lang="ts">
import { useSDK } from './plugin/index.js';

/**
 * This component is the layer controlling the application display. It displays application in
 * case, the SDK is initialized, displays an error if something went wrong, and a loader
 * if the SDK is warming up.
 */
defineOptions()

defineSlots<{
  /**
   * Slot which will be displayed in case, SDK is not loading, didn't receive
   * any error during initialization as well as the initialization result.
   */
  initial(): any;

  /**
   * Slot which will be displayed in case, SDK initialization failed.
   */
  error(props: { error: unknown }): any;

  /**
   * Slot which will be displayed in case, SDK is currently loading.
   */
  loading(): any;

  /**
   * Slot which will be displayed in case, SDK is currently initialized.
   */
  default(): any;
}>()

const { loading, error, initResult } = useSDK();
</script>

<template>
  <slot name="default" v-if="initResult" />
  <slot name="error" v-else-if="error" :error="error"  />
  <slot name="loading" v-else-if="loading" />
  <slot name="initial" v-else />
</template>