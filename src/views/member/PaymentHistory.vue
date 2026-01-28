<template>
  <div class="payment-history">
    <div class="header">
        <h1>{{ $t('payment.title') }}</h1>
        <div class="stats-card">
            <span>{{ $t('payment.totalSpent') }}:</span>
            <span class="highlight">¥{{ totalSpent }}</span>
        </div>
    </div>

    <div class="glass-panel">
        <div v-if="loading" class="loading">{{ $t('payment.loading') }}</div>
        <div v-else-if="records.length === 0" class="empty">
            {{ $t('payment.empty') }}
        </div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('payment.orderNo') }}</th>
                    <th>{{ $t('payment.type') }}</th>
                    <th>{{ $t('payment.amount') }}</th>
                    <th>{{ $t('payment.method') }}</th>
                    <th>{{ $t('payment.date') }}</th>
                    <th>{{ $t('payment.status') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="record in records" :key="record.id">
                    <td class="mono">{{ record.orderNumber }}</td>
                    <td>{{ getType(record.paymentType) }}</td>
                    <td class="amount">¥{{ record.amount }}</td>
                    <td>{{ getMethod(record.paymentMethod) }}</td>
                    <td>{{ formatTime(record.payTime || record.createTime) }}</td>
                    <td>
                        <span :class="['status-badge', getStatusClass(record.paymentStatus)]">
                            {{ getStatusText(record.paymentStatus) }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getPaymentRecords, getTotalConsumption } from '@/api/payment';
import type { PaymentRecord } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const records = ref<PaymentRecord[]>([]);
const totalSpent = ref(0);
const loading = ref(false);

const getType = (type: number) => {
    const map = [
        '',
        t('payment.types.membership'),
        t('payment.types.course'),
        t('payment.types.coach')
    ];
    return map[type] || t('payment.types.other');
};

const getMethod = (method: number) => {
    const map = [
        '',
        t('payment.methods.wechat'),
        t('payment.methods.alipay'),
        t('payment.methods.cash'),
        t('payment.methods.bank')
    ];
    return map[method] || t('payment.methods.unknown');
};

const getStatusText = (status: number) => {
    const map = [
        t('payment.statusText.pending'),
        t('payment.statusText.success'),
        t('payment.statusText.failed'),
        t('payment.statusText.refunded')
    ];
    return map[status] || t('payment.statusText.unknown');
};

const getStatusClass = (status: number) => {
    if (status === 1) return 'success';
    if (status === 0) return 'pending';
    if (status === 2) return 'fail';
    return '';
};

const formatTime = (str: string) => new Date(str).toLocaleString();

const fetchData = async () => {
    if (!authStore.user) return;
    loading.value = true;
    try {
        const [list, total] = await Promise.all([
            getPaymentRecords(authStore.user.id),
            getTotalConsumption(authStore.user.id)
        ]);
        // Sort latest first
        list.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
        records.value = list;
        totalSpent.value = total || 0;
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* 🏋️ Payment History - Member Orange Theme */

.payment-history {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h1 {
  margin: 0;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
}

/* ===== Stats Card with Gradient ===== */
.stats-card {
  background: var(--member-gradient);
  color: white;
  padding: 16px 28px;
  border-radius: var(--radius-lg);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--member-shadow);
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.stats-card .highlight {
  font-size: 1.5em;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* ===== Glass Panel ===== */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 53, 0.1);
}

/* ===== Data Table ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.data-table th {
  padding: 16px;
  text-align: left;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(247, 147, 30, 0.08) 100%);
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 2px solid rgba(255, 107, 53, 0.2);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-base);
}

.data-table tbody tr {
  transition: all var(--transition-base);
}

.data-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.04) 0%, rgba(247, 147, 30, 0.04) 100%);
  transform: translateX(4px);
}

.mono {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* ===== Amount with Gradient ===== */
.amount {
  font-weight: 800;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.1rem;
}

/* ===== Status Badges ===== */
.status-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: inline-block;
}

.status-badge.success {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.status-badge.pending {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.15) 0%, rgba(230, 126, 34, 0.15) 100%);
  color: #e67e22;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.status-badge.fail {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.15) 100%);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .data-table {
    font-size: 0.9rem;
  }

  .data-table th, .data-table td {
    padding: 12px 8px;
  }
}
</style>
