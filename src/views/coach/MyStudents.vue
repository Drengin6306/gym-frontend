<template>
  <div class="my-students-page">
    <h1>{{ $t('myStudents.title') }}</h1>
    <div v-if="loading" class="loading">{{ $t('myStudents.loading') }}</div>
    <div v-else-if="students.length === 0" class="empty">{{ $t('myStudents.empty') }}</div>

    <div v-else class="student-grid">
        <div v-for="student in students" :key="student.id" class="student-card glass-panel">
            <div class="avatar-placeholder">{{ student.realName.charAt(0) }}</div>
            <h3>{{ student.realName }}</h3>
            <p>Username: {{ student.username }}</p>
            <p>{{ student.phone || $t('myStudents.noPhone') }}</p>
            <button @click="viewHistory(student)" class="btn-history">{{ $t('myStudents.viewHistory') }}</button>
        </div>
    </div>

    <!-- History Modal -->
    <div v-if="showModal && selectedStudent" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
            <h3>{{ $t('myStudents.historyTitle', { name: selectedStudent.realName }) }}</h3>
            <div class="history-list">
                <div v-if="studentHistory.length === 0" class="mini-empty">{{ $t('myStudents.noHistory') }}</div>
                <div v-for="record in studentHistory" :key="record.id" class="history-item">
                    <span class="date">{{ new Date(record.startTime!).toLocaleDateString() }}</span>
                    <span class="program">{{ record.fitnessProgram?.name || record.notes || $t('coachDashboard.trainingSession') }}</span>
                    <span :class="['status', getStatusClass(record.bookingStatus)]">{{ getStatusText(record.bookingStatus) }}</span>
                </div>
            </div>
            <button @click="closeModal" class="btn-close">{{ $t('myStudents.close') }}</button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { Member, Booking } from '@/types';
import request from '@/api/request';

import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const students = ref<Member[]>([]);
const loading = ref(false);
const showModal = ref(false);
const selectedStudent = ref<Member | null>(null);
const studentHistory = ref<Booking[]>([]);
const allCoachBookings = ref<Booking[]>([]);

const fetchData = async () => {
    if(!authStore.user) return;
    loading.value = true;
    try {
        const [resStudents, resBookings] = await Promise.all([
             request.get<any, Member[]>(`/coach/${authStore.user.id}/students`),
             request.get<any, Booking[]>(`/booking/coach/${authStore.user.id}`)
        ]);
        students.value = resStudents;
        allCoachBookings.value = resBookings;
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const viewHistory = (student: Member) => {
    selectedStudent.value = student;
    // Filter bookings for this student
    studentHistory.value = allCoachBookings.value.filter(b => b.memberId === student.id)
        .sort((a,b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime());
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedStudent.value = null;
};

const getStatusText = (s?: number) => {
    const map = [
        t('myCourse.bookingStatus.pending'),
        t('myCourse.bookingStatus.confirmed'),
        t('myCourse.bookingStatus.cancelled'),
        t('myCourse.bookingStatus.completed'),
        t('myCourse.bookingStatus.expired')
    ];
    return map[s||0] || t('myCourse.bookingStatus.unknown');
};
const getStatusClass = (s?: number) => {
    const map = ['pending', 'confirmed', 'cancelled', 'completed', 'expired'];
    return map[s||0] || '';
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.my-students-page { padding: 20px; }
.student-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
.student-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.avatar-placeholder { width: 60px; height: 60px; background: #e0f2fe; color: #0284c7; border-radius: 50%; line-height: 60px; font-size: 1.5rem; font-weight: bold; margin: 0 auto 15px; }
.btn-history { margin-top: 15px; padding: 8px 16px; background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; border-radius: 6px; cursor: pointer; }
.btn-history:hover { background: #e0f2fe; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: #fff; padding: 25px; border-radius: 12px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
.history-list { margin: 20px 0; display: flex; flex-direction: column; gap: 10px; }
.history-item { display: flex; justify-content: space-between; padding: 10px; background: #f9fafb; border-radius: 6px; font-size: 0.9rem; }
.history-item .status.confirmed { color: #16a34a; }
.history-item .status.cancelled { color: #dc2626; }
.btn-close { width: 100%; padding: 10px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; }
</style>
