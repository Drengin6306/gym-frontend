<template>
  <div class="coach-dashboard">
    <div class="welcome-section glass-panel">
        <h1>{{ $t('coachDashboard.welcome', { name: authStore.user?.realName }) }}</h1>
        <p>{{ $t('coachDashboard.subtitle') }}</p>
    </div>

    <div class="stats-row">
        <div class="stat-card glass-panel" @click="$router.push('/coach/schedule')">
            <div class="stat-value">{{ upcomingCount }}</div>
            <div class="stat-label">{{ $t('coachDashboard.upcoming') }}</div>
        </div>
        <div class="stat-card glass-panel" @click="$router.push('/coach/students')">
            <div class="stat-value">{{ workData.totalStudents || 0 }}</div>
            <div class="stat-label">{{ $t('coachDashboard.students') }}</div>
        </div>
        <div class="stat-card glass-panel">
             <div class="stat-value">{{ workData.completedSessions || 0 }}</div>
             <div class="stat-label">{{ $t('coachDashboard.completed') }}</div>
        </div>
        <div class="stat-card glass-panel">
             <div class="stat-value">¥{{ workData.revenueGenerated || 0 }}</div>
             <div class="stat-label">{{ $t('coachDashboard.revenue') }}</div>
        </div>
        <div class="stat-card glass-panel" @click="$router.push('/coach/courses')">
             <div class="stat-value">📚</div>
             <div class="stat-label">{{ $t('coachCourseManagement.title') }}</div>
        </div>
    </div>

    <div class="recent-section glass-panel">
        <h3>{{ $t('coachDashboard.todaysClasses') }}</h3>
        <div v-if="loading" class="loading">{{ $t('coachDashboard.loading') }}</div>
        <div v-else-if="todayClasses.length === 0" class="empty">{{ $t('coachDashboard.noClasses') }}</div>
        <div v-else class="class-list">
            <div v-for="booking in todayClasses" :key="booking.id" class="class-item">
                <div class="time">{{ formatTime(booking.startTime) }}</div>
                <div class="info">
                    <strong>{{ booking.fitnessProgram?.name || booking.notes || $t('coachDashboard.trainingSession') }}</strong>
                    <span>{{ getDuration(booking) }} {{ $t('coachDashboard.min') }}</span>
                </div>
                <div class="status">{{ getStatus(booking.bookingStatus) }}</div>
            </div>
        </div>
        <div class="actions">
             <button @click="$router.push('/coach/schedule')" class="btn-link">{{ $t('coachDashboard.viewSchedule') }}</button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { Booking } from '@/types';
import { getCoachBookings } from '@/api/course';
import { getCoachWorkData } from '@/api/coach';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const bookings = ref<Booking[]>([]);
const workData = ref<any>({});
const loading = ref(false);
const upcomingCount = computed(() => {
    // Filter status 0,1 and future/today
    const now = new Date();
    return bookings.value.filter(b =>
        (b.bookingStatus === 0 || b.bookingStatus === 1) &&
        new Date(b.startTime!) >= now
    ).length;
});

const todayClasses = computed(() => {
    const today = new Date().toDateString();
    return bookings.value.filter(b => {
        const d = new Date(b.startTime || '').toDateString();
        return d === today && (b.bookingStatus === 1 || b.bookingStatus === 0);
    }).sort((a,b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
});

const formatTime = (iso?: string) => {
    if(!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDuration = (b: Booking) => {
    if(b.durationMinutes) return b.durationMinutes;
    if(b.startTime && b.endTime) {
        return (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 60000;
    }
    return 60;
};

const getStatus = (s?: number) => {
    const map = [
        t('myCourse.bookingStatus.pending'),
        t('myCourse.bookingStatus.confirmed'),
        t('myCourse.bookingStatus.cancelled'),
        t('myCourse.bookingStatus.completed')
    ];
    return map[s||0] || t('myCourse.bookingStatus.unknown');
};



const fetchData = async () => {
    if(!authStore.user) return;
    loading.value = true;
    try {
        // Fetch Bookings
        const resBookings = await getCoachBookings(authStore.user.id);
        bookings.value = resBookings;

        // Fetch Work Data
        const resWork = await getCoachWorkData(authStore.user.id);
        workData.value = resWork;


    } catch(err) {
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
.coach-dashboard { padding: 20px; }
.welcome-section { padding: 30px; margin-bottom: 20px; border-radius: 12px; }
.stats-row { display: flex; gap: 20px; margin-bottom: 20px; }
.stat-card { flex: 1; padding: 20px; border-radius: 12px; text-align: center; cursor: pointer; transition: transform 0.2s; background: #fff; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.stat-value { font-size: 2.5rem; font-weight: bold; color: #3498db; }
.stat-label { color: #7f8c8d; }

.recent-section { background: #fff; padding: 20px; border-radius: 12px; }
.class-list { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
.class-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #f0f0f0; }
.class-item .time { font-weight: bold; width: 80px; color: #2c3e50; }
.class-item .info { flex: 1; display: flex; flex-direction: column; }
.class-item .status { font-size: 0.8rem; padding: 4px 8px; background: #eaf6fd; color: #3498db; border-radius: 4px; }

.btn-link { background: none; border: none; color: #3498db; margin-top: 15px; cursor: pointer; text-decoration: underline; }
</style>
