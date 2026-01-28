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
/* 🏋️ Coach Dashboard - Professional Cyan-Green Theme */

.coach-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeInUp 0.5s ease-out;
}

/* Welcome Section with Gradient */
.welcome-section {
  padding: 32px;
  margin-bottom: 32px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.08) 0%, rgba(146, 254, 157, 0.08) 100%);
  border: 1px solid rgba(0, 201, 255, 0.15);
}

.welcome-section h1 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: var(--coach-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-section p {
  color: var(--text-secondary);
  font-size: 1.05rem;
  font-weight: 500;
}

/* Stats Row with Gradient Border Cards */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* Gradient Border Card Effect */
.stat-card {
  position: relative;
  padding: 2px;
  background: var(--coach-gradient);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: white;
  border-radius: calc(var(--radius-lg) - 2px);
  z-index: 1;
}

.stat-card > * {
  position: relative;
  z-index: 2;
  padding: 24px;
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 201, 255, 0.3);
}

.stat-card:hover::before {
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.05) 0%, rgba(146, 254, 157, 0.05) 100%);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--coach-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  animation: shimmer 3s ease-in-out infinite;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Recent Section */
.recent-section {
  background: white;
  padding: 28px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.recent-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-section h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 28px;
  background: var(--coach-gradient);
  border-radius: 4px;
}

/* Course Timeline */
.class-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.class-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.04) 0%, rgba(146, 254, 157, 0.04) 100%);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--coach-primary);
  transition: all var(--transition-base);
  position: relative;
}

.class-item::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--coach-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0, 201, 255, 0.2);
}

.class-item:hover {
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.08) 0%, rgba(146, 254, 157, 0.08) 100%);
  transform: translateX(8px);
  box-shadow: var(--shadow-sm);
}

.class-item .time {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--coach-primary);
  min-width: 100px;
  padding-left: 20px;
}

.class-item .info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 20px;
}

.class-item .info strong {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.class-item .info span {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.class-item .status {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(0, 201, 255, 0.1) 0%, rgba(146, 254, 157, 0.1) 100%);
  color: var(--coach-primary);
  border-radius: var(--radius-full);
  border: 1px solid rgba(0, 201, 255, 0.2);
}

/* Actions */
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn-link {
  background: rgba(0, 201, 255, 0.05);
  border: 2px solid rgba(0, 201, 255, 0.1);
  color: var(--coach-primary);
  padding: 12px 28px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
}

.btn-link:hover {
  background: rgba(0, 201, 255, 0.1);
  border-color: var(--coach-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 201, 255, 0.2);
}

/* Loading & Empty States */
.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .coach-dashboard {
    padding: 16px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .class-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .class-item .time {
    min-width: auto;
    padding-left: 20px;
  }
}
</style>
