<template>
  <div class="management-view">
    <h1>{{ $t('paymentManagementAdmin.title') }}</h1>
    <div class="glass-panel">
        <p>{{ $t('paymentManagementAdmin.placeholder') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.management-view { padding: 20px; }
.glass-panel { padding: 20px; background: #fff; border-radius: 12px; margin-top: 20px; }
</style>
