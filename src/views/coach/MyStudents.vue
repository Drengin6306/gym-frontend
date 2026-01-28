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
/* 🏋️ My Students - Coach Cyan-Green Theme */

.my-students-page {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.my-students-page h1 {
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* ===== Student Grid ===== */
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* ===== Student Card with Gradient Border ===== */
.student-card {
  position: relative;
  padding: 3px;
  background: var(--coach-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.student-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.student-card > * {
  position: relative;
  z-index: 2;
}

.student-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--coach-shadow);
}

.student-card h3 {
  text-align: center;
  padding: 0 20px;
  margin: 0 0 8px;
  color: var(--text-primary);
  font-weight: 700;
}

.student-card p {
  text-align: center;
  padding: 0 20px;
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.avatar-placeholder {
  width: 70px;
  height: 70px;
  background: var(--coach-gradient);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 20px auto 15px;
  box-shadow: 0 8px 20px rgba(0, 201, 255, 0.3);
}

.btn-history {
  display: block;
  margin: 20px auto;
  padding: 10px 24px;
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.15) 0%, rgba(146, 254, 157, 0.15) 100%);
  color: #00b894;
  border: 2px solid rgba(0, 201, 255, 0.3);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.3px;
  transition: all var(--transition-base);
}

.btn-history:hover {
  background: var(--coach-gradient);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal {
  position: relative;
  background: #fff;
  padding: 0;
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--coach-gradient);
}

.modal h3 {
  padding: 30px 25px 0;
  margin: 0;
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3rem;
}

.history-list {
  margin: 20px 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mini-empty {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.05) 0%, rgba(146, 254, 157, 0.05) 100%);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  border: 1px solid var(--border-light);
  transition: all var(--transition-base);
}

.history-item:hover {
  transform: translateX(4px);
  border-color: rgba(0, 201, 255, 0.3);
}

.history-item .date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.history-item .program {
  font-weight: 600;
  color: var(--text-primary);
}

.history-item .status {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.history-item .status.confirmed { color: #27ae60; }
.history-item .status.cancelled { color: #e74c3c; }
.history-item .status.completed { color: #3498db; }
.history-item .status.pending { color: #f39c12; }

.btn-close {
  width: calc(100% - 50px);
  margin: 0 25px 25px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.1) 0%, rgba(146, 254, 157, 0.1) 100%);
  color: #00b894;
  border: 2px solid rgba(0, 201, 255, 0.3);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.btn-close:hover {
  background: var(--coach-gradient);
  color: white;
  border-color: transparent;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .student-grid {
    grid-template-columns: 1fr;
  }
}
</style>
