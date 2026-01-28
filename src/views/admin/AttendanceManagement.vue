<template>
  <div class="management-view">
    <div class="header-actions">
        <h1>{{ $t('attendanceManagementAdmin.title') }}</h1>
        <div class="filters">
            <!-- Simple date range could go here -->
            <button class="btn btn-primary" @click="fetchData">{{ $t('attendanceManagementAdmin.refresh') }}</button>
        </div>
    </div>

    <div class="glass-panel">
        <div v-if="loading" class="loading">{{ $t('attendanceManagementAdmin.loading') }}</div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('attendanceManagementAdmin.columns.id') }}</th>
                    <th>{{ $t('attendanceManagementAdmin.columns.memberId') }}</th>
                    <!-- If backend populates Member object, use member.realName. Else just ID -->
                    <th>{{ $t('attendanceManagementAdmin.columns.memberName') }}</th>
                    <th>{{ $t('attendanceManagementAdmin.columns.checkIn') }}</th>
                    <th>{{ $t('attendanceManagementAdmin.columns.checkOut') }}</th>
                    <th>{{ $t('attendanceManagementAdmin.columns.duration') }}</th>
                    <!-- <th>Actions</th> -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="record in records" :key="record.id">
                    <td>#{{ record.id }}</td>
                    <td>{{ record.memberId }}</td>
                    <td>{{ record.member ? record.member.realName : $t('attendanceManagementAdmin.status.loading') }}</td>
                    <td>{{ formatDateTime(record.checkInTime) }}</td>
                    <td>
                        <span v-if="record.checkOutTime">{{ formatDateTime(record.checkOutTime) }}</span>
                        <span v-else class="status-live">{{ $t('attendanceManagementAdmin.status.inGym') }}</span>
                    </td>
                    <td>{{ record.durationMinutes || '-' }}</td>
                </tr>
            </tbody>
        </table>

        <div v-if="!loading && records.length === 0" class="empty">{{ $t('attendanceManagementAdmin.empty') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllAttendance } from '@/api/attendance';
import type { Attendance } from '@/types';
// If backend doesn't populate member info, we might need to fetch members map.
// But let's assume implementation details or lazy load.
// For now, let's just display.

const records = ref<Attendance[]>([]);
const loading = ref(false);

const formatDateTime = (str: string) => new Date(str).toLocaleString();

const fetchData = async () => {
    loading.value = true;
    try {
        // Fetch all, backend might limit to recent or paginated.
        const data = await getAllAttendance();
        // Backend usually returns list. If it requires date range, we might need default.
        records.value = data;
    } catch(err) {
        console.error("Failed to load attendance", err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* 🏋️ Attendance Management - Admin Purple Theme */

.management-view {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions h1 {
  margin: 0;
  font-size: 2rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.data-table { width: 100%; border-collapse: collapse; }

.data-table th {
  padding: 16px;
  text-align: left;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%);
  transform: translateX(4px);
}

.status-live {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(46, 204, 113, 0); }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 700;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--admin-gradient);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
