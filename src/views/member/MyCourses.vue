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
/* 🏋️ My Courses - Member Orange Theme */

.my-courses {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.my-courses h1 {
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-medium);
  color: var(--text-secondary);
}

/* ===== Booking List ===== */
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== Booking Cards with Gradient Border ===== */
.booking-card {
  position: relative;
  padding: 3px;
  background: var(--member-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-base);
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
  padding: 20px;
}

.booking-card:hover {
  transform: translateX(4px);
  box-shadow: var(--member-shadow);
}

.booking-card .info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.booking-card .info strong {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.booking-card .info .status {
  font-size: 0.875rem;
  font-weight: 600;
}

/* ===== Status Colors ===== */
.status-0 { color: #f39c12; } /* Pending - Orange */
.status-1 { color: #2ecc71; } /* Confirmed - Green */
.status-2 { color: #e74c3c; } /* Cancelled - Red */
.status-3 { color: #3498db; } /* Completed - Blue */
.status-4 { color: #95a5a6; } /* Expired - Gray */

.time {
  font-size: 0.875rem;
  color: var(--text-light);
  padding: 0 20px 20px 20px !important;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px !important;
}

.btn-checkin,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.875rem;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.btn-checkin {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2) 0%, rgba(39, 174, 96, 0.2) 100%);
  color: #27ae60;
  border: 2px solid rgba(46, 204, 113, 0.5);
}

.btn-checkin:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.3) 0%, rgba(39, 174, 96, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-cancel {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.2) 100%);
  color: #c0392b;
  border: 2px solid rgba(231, 76, 60, 0.5);
}

.btn-cancel:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.3) 0%, rgba(192, 57, 43, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.status-checked-in {
  color: #27ae60;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  border-radius: var(--radius-full);
  border: 2px solid rgba(46, 204, 113, 0.3);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .booking-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
