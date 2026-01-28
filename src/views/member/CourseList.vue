<template>
  <div class="course-list-page">
    <h1>{{ $t('programs.title') }}</h1>

    <div v-if="loading" class="loading">{{ $t('programs.loading') }}</div>

    <div v-else class="course-grid">
      <div v-for="course in courses" :key="course.id" class="course-card glass-panel">
        <div class="card-badges">
            <span class="badge type">{{ course.type === 1 ? $t('programs.type.group') : $t('programs.type.personal') }}</span>
            <span :class="['badge status', course.status === 1 ? 'open' : 'full']">
                {{ course.status === 1 ? $t('programs.open') : $t('programs.full') }}
            </span>
        </div>
        <h3>{{ course.name }}</h3>
        <p class="coach-name" v-if="course.coach">{{ $t('programs.coach') }}: {{ course.coach.realName }}</p>
        <p class="coach-name" v-else-if="getCoachName(course.coachId)">{{ $t('programs.coach') }}: {{ getCoachName(course.coachId) }}</p>
        <p class="desc">{{ course.description }}</p>
        <div class="details">
            <div class="detail-item">
                <span class="label">{{ $t('programs.price') }}</span>
                <span class="value price">${{ course.price }}</span>
            </div>
            <div class="detail-item">
                <span class="label">{{ $t('programs.duration') }}</span>
                <span class="value">{{ course.durationMinutes }} {{ $t('programs.minutes') }}</span>
            </div>
        </div>
        <button @click="handleBook(course)" class="book-btn" :disabled="course.status !== 1">
            {{ course.status === 1 ? $t('programs.book') : $t('programs.full') }}
        </button>
      </div>
    </div>

    <!-- Simple Booking Confirmation/Prompt -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <h3>{{ $t('programs.modal.title', { name: selectedCourse?.name }) }}</h3>
            <p>{{ $t('programs.modal.prompt') }}</p>
            <div class="booking-inputs">
                <input type="date" v-model="bookingDate" :min="minDate" required />
                <input type="time" v-model="bookingTime" required />
            </div>
            <div class="actions">
                <button @click="confirmBooking">{{ $t('programs.modal.confirm') }}</button>
                <button @click="showModal = false" class="cancel">{{ $t('common.cancel') }}</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAllPrograms, createBooking, checkAvailability } from '@/api/course';
import { getAllCoaches } from '@/api/coach'; // Import this
import type { FitnessProgram, Coach } from '@/types'; // Import Coach
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const courses = ref<FitnessProgram[]>([]);
const coaches = ref<Coach[]>([]); // Store coaches
const loading = ref(false);
const showModal = ref(false);
const selectedCourse = ref<FitnessProgram | null>(null);
const bookingDate = ref('');
const bookingTime = ref('');
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const minDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
});

const fetchCourses = async () => {
    loading.value = true;
    try {
        const [programsData, coachesData] = await Promise.all([
            getAllPrograms(),
            getAllCoaches()
        ]);
        courses.value = programsData;
        coaches.value = coachesData;
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const getCoachName = (id: number) => {
    const found = coaches.value.find(c => c.id === id);
    return found ? found.realName : t('programs.unknownCoach');
};

const handleBook = (course: FitnessProgram) => {
    selectedCourse.value = course;
    showModal.value = true;
};

const confirmBooking = async () => {
    if (!selectedCourse.value || !authStore.user || !bookingDate.value || !bookingTime.value) {
        alert(t('programs.modal.dateReq'));
        return;
    }

    try {
        const startDateTime = `${bookingDate.value}T${bookingTime.value}:00`;
        // Calculate end time
        const start = new Date(startDateTime);
        const end = new Date(start.getTime() + selectedCourse.value.durationMinutes * 60000);
        // Format YYYY-MM-DDTHH:mm:ss manually to avoid timezone shift from toISOString()
        const year = end.getFullYear();
        const month = String(end.getMonth() + 1).padStart(2, '0');
        const day = String(end.getDate()).padStart(2, '0');
        const hours = String(end.getHours()).padStart(2, '0');
        const minutes = String(end.getMinutes()).padStart(2, '0');
        const seconds = String(end.getSeconds()).padStart(2, '0');
        const endDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        // Check availability
        const isAvailable = await checkAvailability(undefined, selectedCourse.value.coachId, startDateTime, endDateTime);
        if (!isAvailable) {
            alert(t('programs.modal.unavailable', 'The selected time slot is not available.'));
            return;
        }

        await createBooking({
            memberId: authStore.user.id,
            bookingType: 1, // 1 for Group Class/Course based on FitnessProgram entity comment usually, or logic map. Program type 1?
            relatedId: selectedCourse.value.id,
            coachId: selectedCourse.value.coachId,
            startTime: startDateTime,
            // endTime: endDateTime,
            bookingStatus: 0, // Pending
            durationMinutes: selectedCourse.value.durationMinutes,
            participantsCount: 1
        });
        alert(t('programs.modal.success'));
        showModal.value = false;
        router.push('/my-courses');
    } catch (err: any) {
        console.error(err);
        const errorMsg = err.response?.data?.message || err.message || t('programs.modal.fail');
        alert(`${t('common.error')}: ${errorMsg}`);
    }
};

onMounted(() => {
    fetchCourses();
});
</script>

<style scoped>
/* 🏋️ Member Course List - Energetic Orange Theme */

.course-list-page {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.course-list-page h1 {
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* ===== Course Grid ===== */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

/* ===== Course Cards with Gradient Border ===== */
.course-card {
  position: relative;
  padding: 3px;
  background: var(--member-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
}

.course-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.course-card > * {
  position: relative;
  z-index: 2;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--member-shadow);
}

/* ===== Card Badges ===== */
.card-badges {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 20px 20px 0 20px;
}

.badge {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.type {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge.status.open {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.badge.status.full {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.15) 100%);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

/* ===== Card Content ===== */
.course-card h3 {
  margin-bottom: 8px;
  padding: 0 20px;
  font-size: 1.3rem;
  font-weight: 700;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.coach-name {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
  font-style: italic;
  padding: 0 20px;
}

.desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
  padding: 0 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== Details Section ===== */
.details {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: var(--radius-md);
  margin: 0 20px 20px 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.detail-item .label {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-item .value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.detail-item .value.price {
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.3rem;
  font-weight: 800;
}

/* ===== Book Button ===== */
.book-btn {
  width: calc(100% - 40px);
  margin: 0 20px 20px 20px;
  padding: 14px;
  background: var(--member-gradient);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;
}

.book-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.book-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 107, 53, 0.5);
}

.book-btn:hover::before {
  left: 100%;
}

.book-btn:disabled {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  cursor: not-allowed;
  animation: none;
  box-shadow: none;
}

.book-btn:disabled:hover {
  transform: none;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  padding: 40px;
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 450px;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
}

.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--member-gradient);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal h3 {
  margin: 0 0 12px 0;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.5rem;
}

.modal p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.booking-inputs {
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-inputs input {
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.booking-inputs input:focus {
  border-color: var(--member-primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.modal .actions {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal button {
  padding: 12px 28px;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  border: none;
  transition: all var(--transition-base);
}

.modal button:first-child {
  background: var(--member-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.modal button:first-child:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
}

.modal button.cancel {
  background: white;
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
}

.modal button.cancel:hover {
  border-color: var(--member-primary);
  color: var(--member-primary);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 28px 20px;
  }
}
</style>

