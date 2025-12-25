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
import axios from 'axios';
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
        const res = await axios.get(`/api/booking/coach/${authStore.user.id}`);
        // We might need to fetch member details if not included.
        // For now, let's just show Member ID or try to map if we have students list cached.
        bookings.value = res.data;
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
.coach-schedule-page { padding: 20px; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.tab { background: none; border: none; padding: 10px 20px; font-weight: bold; color: #888; cursor: pointer; }
.tab.active { color: #3498db; border-bottom: 2px solid #3498db; margin-bottom: -12px; }

.date-group { margin-bottom: 30px; }
.date-header { font-size: 1.1rem; color: #555; margin-bottom: 15px; border-left: 4px solid #3498db; padding-left: 10px; }
.booking-card { display: flex; align-items: center; padding: 20px; background: #fff; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.time-block { display: flex; flex-direction: column; align-items: center; min-width: 80px; border-right: 1px solid #eee; padding-right: 20px; margin-right: 20px; }
.start-time { font-size: 1.2rem; font-weight: bold; color: #2c3e50; }
.duration { font-size: 0.8rem; color: #888; }

.info-block { flex: 1; }
.info-block h4 { margin: 0 0 5px 0; color: #2c3e50; }
.member-info { margin: 0; color: #666; font-size: 0.9rem; }

.ticket-status { padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.ticket-status.confirmed { background: #dcfce7; color: #166534; }
.ticket-status.cancelled { background: #fee2e2; color: #991b1b; }
.ticket-status.completed { background: #dbeafe; color: #1e40af; }
.btn-confirm { display: block; margin-top: 5px; padding: 5px 10px; background: #22c55e; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-confirm:hover { background: #16a34a; }
</style>
