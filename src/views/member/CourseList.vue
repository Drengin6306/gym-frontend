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
.course-list-page { padding: 20px; }
.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
.course-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.course-card h3 { margin-bottom: 10px; color: #2c3e50; }
.details { margin: 15px 0; display: flex; justify-content: space-between; font-weight: bold; color: #666; }
.book-btn { width: 100%; padding: 10px; background: #2ecc71; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.book-btn:hover { background: #27ae60; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: #fff; padding: 30px; border-radius: 10px; width: 90%; max-width: 400px; text-align: center; }
.modal .actions { margin-top: 20px; display: flex; gap: 10px; justify-content: center; }
.modal button { padding: 10px 20px; cursor: pointer; }
.modal button.cancel { background: #ccc; }
</style>

<style scoped>
.course-list-page { padding: 20px; }
.course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 20px; }
.course-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.2s; }
.course-card:hover { transform: translateY(-4px); }
.card-badges { display: flex; justify-content: space-between; margin-bottom: 15px; }
.badge { font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
.badge.type { background: #e0f2fe; color: #0284c7; }
.badge.status.open { background: #dcfce7; color: #166534; }
.badge.status.full { background: #fee2e2; color: #991b1b; }

.course-card h3 { margin-bottom: 5px; color: #1f2937; font-size: 1.25rem; }
.coach-name { color: #6b7280; font-size: 0.9rem; margin-bottom: 10px; font-style: italic; }
.desc { color: #4b5563; font-size: 0.95rem; line-height: 1.5; margin-bottom: 20px; flex-grow: 1; }

.details { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f9fafb; padding: 10px; border-radius: 8px; }
.detail-item { display: flex; flex-direction: column; align-items: center; }
.detail-item .label { font-size: 0.75rem; color: #9ca3af; text-transform: uppercase; }
.detail-item .value { font-weight: bold; color: #374151; }
.detail-item .value.price { color: #2563eb; font-size: 1.1rem; }

.book-btn { width: 100%; padding: 12px; background: linear-gradient(to right, #2563eb, #1d4ed8); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
.book-btn:hover { opacity: 0.9; }
.book-btn:disabled { background: #d1d5db; cursor: not-allowed; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
.modal .actions { margin-top: 24px; display: flex; gap: 12px; justify-content: center; }
.modal button { padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 500; border: none; }
.modal button:first-child { background: #2563eb; color: white; }
.modal button.cancel { background: #f3f4f6; color: #374151; }
.booking-inputs { margin: 20px 0; display: flex; flex-direction: column; gap: 10px; }
.booking-inputs input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
</style>

