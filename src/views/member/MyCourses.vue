<template>
  <div class="my-courses">
    <h1>{{ $t('myCourse.title') }}</h1>

    <div v-if="loading" class="loading">{{ $t('myCourse.loading') }}</div>

    <div v-else-if="bookings.length === 0" class="empty-state">
      <p>{{ $t('myCourse.empty') }}</p>
    </div>

    <div v-else class="booking-list">
        <div v-for="booking in bookings" :key="booking.id" class="booking-card">
            <div class="info">
                <strong>{{ booking.fitnessProgram?.name || booking.notes || `Booking #${booking.id}` }}</strong>
                <span :class="'status status-' + booking.bookingStatus">{{ $t('myCourse.status') }}: {{ getStatus(booking.bookingStatus) }}</span>
            </div>
            <div class="actions">
                 <button v-if="booking.bookingStatus === 1 && (!booking.attendanceStatus || booking.attendanceStatus === 0)"
                         @click="handleCheckIn(booking)" class="btn-checkin">{{ $t('myCourse.checkIn') }}</button>
                 <span v-if="booking.attendanceStatus === 1" class="status-checked-in">{{ $t('myCourse.checkedIn') }}</span>
                 <button v-if="booking.bookingStatus === 0 || booking.bookingStatus === 1"
                         @click="handleCancel(booking)" class="btn-cancel">{{ $t('myCourse.cancel') }}</button>
            </div>
            <div class="time">{{ $t('myCourse.created') }}: {{ new Date(booking.createTime).toLocaleDateString() }}</div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMemberBookings, cancelBooking, checkIn } from '@/api/course';
import type { Booking } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const authStore = useAuthStore();

const { t } = useI18n();

const getStatus = (s?: number) => {
    // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed, 4: Expired
    const map = [
        t('myCourse.bookingStatus.pending'),
        t('myCourse.bookingStatus.confirmed'),
        t('myCourse.bookingStatus.cancelled'),
        t('myCourse.bookingStatus.completed'),
        t('myCourse.bookingStatus.expired')
    ];
    return map[s || 0] || t('myCourse.bookingStatus.unknown');
};

const fetchData = async () => {
    if (!authStore.user) return;
    loading.value = true;
    try {
        bookings.value = await getMemberBookings(authStore.user.id);
        // Sort by create time desc
        bookings.value.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const handleCancel = async (booking: Booking) => {
    try {
        await cancelBooking(booking.id, 'User cancelled');
        alert(t('myCourse.cancelSuccess'));
        await fetchData();
    } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.message || err.response?.data || t('myCourse.cancelFail');
        alert(msg);
    }
};

const handleCheckIn = async (booking: Booking) => {
    try {
        await checkIn(booking.id);
        alert(t('myCourse.checkInSuccess'));
        await fetchData();
    } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.message || err.response?.data || t('myCourse.checkInFail');
        alert(msg);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.my-courses { padding: 20px; }
.empty-state { text-align: center; padding: 40px; background: #fff; border-radius: 8px; color: #777; }
.booking-list { display: flex; flex-direction: column; gap: 15px; }
.booking-card { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
.booking-card .info { display: flex; flex-direction: column; gap: 5px; }
.status-0 { color: #f39c12; }
.status-1 { color: #2ecc71; }
.status-2 { color: #e74c3c; }
.status-3 { color: #3498db; }
.status-4 { color: #95a5a6; }
.btn-cancel { background: #fee2e2; color: #ef4444; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-left: 10px; }
.btn-cancel:hover { background: #fecaca; }
.btn-checkin { background: #d1fae5; color: #10b981; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-checkin:hover { background: #a7f3d0; }
.status-checked-in { color: #10b981; font-weight: bold; margin-right: 10px; }
.actions { display: flex; align-items: center; gap: 10px; }
</style>
