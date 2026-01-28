<template>
  <div class="attendance-history">
    <h1>{{ $t('attendance.title') }}</h1>

    <div class="glass-panel">
        <div v-if="loading" class="loading">{{ $t('attendance.loading') }}</div>
        <div v-else-if="records.length === 0" class="empty">
            {{ $t('attendance.empty') }}
        </div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('attendance.date') }}</th>
                    <th>{{ $t('attendance.checkIn') }}</th>
                    <th>{{ $t('attendance.checkOut') }}</th>
                    <th>{{ $t('attendance.duration') }}</th>
                    <!-- <th>Notes</th> -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="record in records" :key="record.id">
                    <td>{{ formatDate(record.checkInTime) }}</td>
                    <td>{{ formatTime(record.checkInTime) }}</td>
                    <td>{{ record.checkOutTime ? formatTime(record.checkOutTime) : $t('attendance.ongoing') }}</td>
                    <td>
                        <span v-if="record.durationMinutes">{{ record.durationMinutes }}</span>
                        <span v-else-if="!record.checkOutTime" class="badge active">{{ $t('attendance.inProgress') }}</span>
                        <span v-else>-</span>
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
import { getMemberAttendance } from '@/api/attendance';
import type { Attendance } from '@/types';


const authStore = useAuthStore();
const records = ref<Attendance[]>([]);
const loading = ref(false);

const formatDate = (str: string) => new Date(str).toLocaleDateString();
const formatTime = (str: string) => new Date(str).toLocaleTimeString();

const fetchData = async () => {
    if (!authStore.user) return;
    loading.value = true;
    try {
        const data = await getMemberAttendance(authStore.user.id);
        // Sort latest first
        data.sort((a,b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
        records.value = data;
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
/* 🏋️ Attendance History - Member Orange Theme */

.attendance-history {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

h1 {
  margin-bottom: 24px;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
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
  color: var(--text-primary);
  transition: all var(--transition-base);
}

.data-table tbody tr {
  transition: all var(--transition-base);
}

.data-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.04) 0%, rgba(247, 147, 30, 0.04) 100%);
  transform: translateX(4px);
}

/* ===== Active Badge ===== */
.badge.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid rgba(46, 204, 113, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .data-table th, .data-table td {
    padding: 12px 8px;
    font-size: 0.9rem;
  }
}
</style>
