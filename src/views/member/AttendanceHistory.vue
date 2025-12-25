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
.attendance-history { padding: 20px; }
h1 { margin-bottom: 20px; color: #2c3e50; }
.glass-panel { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background: #f8f9fa; font-weight: 600; color: #7f8c8d; }

.badge.active { background: #e8f8f5; color: #2ecc71; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
.loading, .empty { padding: 40px; text-align: center; color: #999; }
</style>
