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
/* 🏋️ Payment Management - Admin Purple Theme */

.management-view {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.management-view h1 {
  margin: 0 0 24px;
  font-size: 2rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-panel {
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  margin-top: 20px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  text-align: center;
  color: var(--text-secondary);
}

.glass-panel p {
  margin: 0;
  font-size: 1.1rem;
}
</style>
