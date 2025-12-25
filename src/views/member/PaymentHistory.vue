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
.payment-history { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
h1 { margin: 0; color: #2c3e50; }

.stats-card { background: #3498db; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
.stats-card .highlight { font-size: 1.2em; margin-left: 10px; color: #fff; }

.glass-panel { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background: #f8f9fa; font-weight: 600; color: #7f8c8d; }

.mono { font-family: monospace; }
.amount { font-weight: bold; color: #e67e22; }

.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
.status-badge.success { background: #e8f8f5; color: #2ecc71; }
.status-badge.pending { background: #fef9e7; color: #f39c12; }
.status-badge.fail { background: #fdedec; color: #e74c3c; }

.loading, .empty { padding: 40px; text-align: center; color: #999; }
</style>
