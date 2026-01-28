<template>
  <div class="coach-schedule-page">
    <h1>{{ $t('coachSchedule.title') }}</h1>

    <div class="tabs">
        <button :class="['tab', { active: activeTab === 'upcoming' }]" @click="activeTab = 'upcoming'">{{ $t('coachSchedule.tabs.upcoming') }}</button>
        <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">{{ $t('coachSchedule.tabs.history') }}</button>
    </div>

    <div v-if="loading" class="loading">{{ $t('coachSchedule.loading') }}</div>
    <div v-else-if="filteredBookings.length === 0" class="empty">{{ $t('coachSchedule.empty', { tab: activeTab === 'upcoming' ? $t('coachSchedule.tabs.upcoming') : $t('coachSchedule.tabs.history') }) }}</div>

    <div v-else class="schedule-list">
        <div v-for="(group, date) in groupedBookings" :key="date" class="date-group">
            <h3 class="date-header">{{ date }}</h3>
            <div class="cards-container">
                <div v-for="booking in group" :key="booking.id" class="booking-card glass-panel">
                    <div class="time-block">
                        <span class="start-time">{{ formatTime(booking.startTime) }}</span>
                        <span class="duration">{{ getDuration(booking) }} min</span>
                    </div>
                    <div class="info-block">
                        <h4>{{ booking.fitnessProgram?.name || booking.notes || $t('coachDashboard.trainingSession') }}</h4>
                        <!-- Ideally fetch Member Name. Booking has memberId. We need a way to get member name. -->
                        <!-- The backend Booking entity likely only has memberId. We might need Member info. -->
                        <p class="member-info">{{ $t('coachSchedule.memberId') }}: {{ booking.memberId }}</p>
                    </div>
                    <div class="status-block">
                        <span :class="['ticket-status', getStatusClass(booking.bookingStatus)]">
                            {{ getStatusText(booking.bookingStatus) }}
                        </span>
                        <button v-if="booking.bookingStatus === 0" @click="handleConfirm(booking)" class="btn-confirm">
                            {{ $t('coachSchedule.confirm') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { Booking } from '@/types';
import request from '@/api/request';
import { updateBookingStatus } from '@/api/course';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const activeTab = ref<'upcoming' | 'history'>('upcoming');
const bookings = ref<Booking[]>([]);
const loading = ref(false);

const fetchData = async () => {
    if(!authStore.user) return;
    loading.value = true;
    try {
        const res = await request.get<any, Booking[]>(`/booking/coach/${authStore.user.id}`);
        // We might need to fetch member details if not included.
        // For now, let's just show Member ID or try to map if we have students list cached.
        bookings.value = res;
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleConfirm = async (booking: Booking) => {
    if(!confirm(t('coachSchedule.confirmPrompt'))) return;
    try {
        await updateBookingStatus(booking.id, 1);
        await fetchData(); // Refresh
    } catch(err) {
        console.error("Failed to confirm", err);
        alert(t('coachSchedule.confirmFail'));
    }
};

const filteredBookings = computed(() => {
    const now = new Date();
    return bookings.value.filter(b => {
        const start = new Date(b.startTime!);
        if (activeTab.value === 'upcoming') {
            return (b.bookingStatus === 0 || b.bookingStatus === 1) && start >= now; // Or just future dates irrelevant of status?
            // Actually, cancelled should go to history or separate.
            // Let's keep status 0,1 as active.
        } else {
            return start < now || b.bookingStatus === 2 || b.bookingStatus === 3 || b.bookingStatus === 4;
        }
    }).sort((a,b) => {
        return activeTab.value === 'upcoming'
            ? new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()
            : new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
    });
});

const groupedBookings = computed(() => {
    const groups: Record<string, Booking[]> = {};
    filteredBookings.value.forEach(b => {
        const d = new Date(b.startTime!).toDateString();
        if(!groups[d]) groups[d] = [];
        groups[d].push(b);
    });
    return groups;
});

const formatTime = (iso?: string) => {
    if(!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const getDuration = (b: Booking) => b.durationMinutes || 60;
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
const getStatusClass = (s?: number) => ['pending', 'confirmed', 'cancelled', 'completed', 'expired'][s||0] || '';

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* 🏋️ Coach Schedule - Coach Cyan-Green Theme */

.coach-schedule-page {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.coach-schedule-page h1 {
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 24px;
}

/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  background: rgba(0, 201, 255, 0.08);
  padding: 6px;
  border-radius: var(--radius-full);
  width: fit-content;
}

.tab {
  background: none;
  border: none;
  padding: 12px 28px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
}

.tab.active {
  background: var(--coach-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 201, 255, 0.3);
}

.tab:not(.active):hover {
  background: rgba(0, 201, 255, 0.1);
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* ===== Date Groups ===== */
.date-group {
  margin-bottom: 32px;
}

.date-header {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-left: 16px;
  position: relative;
  font-weight: 700;
}

.date-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--coach-gradient);
  border-radius: 2px;
}

/* ===== Booking Card with Gradient Border ===== */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-card {
  position: relative;
  padding: 3px;
  background: var(--coach-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
}

.booking-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.booking-card > * {
  position: relative;
  z-index: 2;
}

.booking-card:hover {
  transform: translateX(6px);
  box-shadow: var(--coach-shadow);
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  padding: 20px;
  border-right: 2px solid rgba(0, 201, 255, 0.15);
}

.start-time {
  font-size: 1.3rem;
  font-weight: 800;
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.duration {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.info-block {
  flex: 1;
  padding: 20px;
}

.info-block h4 {
  margin: 0 0 6px 0;
  color: var(--text-primary);
  font-weight: 700;
}

.member-info {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-block {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* ===== Status Badges ===== */
.ticket-status {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.ticket-status.pending {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.15) 0%, rgba(230, 126, 34, 0.15) 100%);
  color: #e67e22;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.ticket-status.confirmed {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.ticket-status.cancelled {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.15) 100%);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.ticket-status.completed {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(41, 128, 185, 0.15) 100%);
  color: #2980b9;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.ticket-status.expired {
  background: linear-gradient(135deg, rgba(149, 165, 166, 0.15) 0%, rgba(127, 140, 141, 0.15) 100%);
  color: #7f8c8d;
  border: 1px solid rgba(149, 165, 166, 0.3);
}

.btn-confirm {
  padding: 8px 16px;
  background: var(--coach-gradient);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all var(--transition-base);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 201, 255, 0.4);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .booking-card {
    flex-direction: column;
    align-items: stretch;
  }

  .time-block {
    border-right: none;
    border-bottom: 2px solid rgba(0, 201, 255, 0.15);
    flex-direction: row;
    justify-content: center;
    gap: 12px;
  }

  .status-block {
    align-items: flex-start;
  }
}
</style>
