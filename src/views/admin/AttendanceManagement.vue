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
.management-view { padding: 20px; }
.header-actions { display: flex; justify-content: space-between; margin-bottom: 20px; }
.glass-panel { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background-color: #f8f9fa; font-weight: 600; color: #666; }

.status-live { color: #2ecc71; font-weight: bold; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #3498db; color: #fff; }
.loading, .empty { padding: 40px; text-align: center; color: #999; }
</style>
