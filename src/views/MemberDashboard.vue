<template>
  <div class="dashboard">
    <!-- Welcome & Hero -->
    <div class="welcome-header">
       <div class="welcome-text">
          <h1>{{ $t('dashboard.welcome', { name: authStore.user?.realName }) }}</h1>
          <p>Let's make today count! <span class="user-role-badge">{{ authStore.userRole }}</span></p>
       </div>
    </div>

    <!-- Carousel Section -->
    <div class="carousel-container">
       <div
         v-for="(slide, index) in slides"
         :key="index"
         class="carousel-slide"
         :style="{
           backgroundImage: `url(${slide.image})`,
           opacity: currentSlide === index ? 1 : 0
         }"
       ></div>
       <div class="carousel-overlay">
         <h2>{{ slides[currentSlide].title }}</h2>
         <p>{{ slides[currentSlide].desc }}</p>
       </div>
       <div class="carousel-dots">
         <span
           v-for="(_, index) in slides"
           :key="index"
           class="dot"
           :class="{ active: currentSlide === index }"
           @click="setSlide(index)"
         ></span>
       </div>
    </div>

    <!-- Main Content Grid -->
    <div v-if="authStore.userRole === 'MEMBER'" class="dashboard-grid">

       <!-- Left Main Column -->
       <div class="col-main">

           <!-- Membership Card -->
           <div class="section-card">
              <div class="section-header">
                 <h3>{{ $t('dashboard.myMembership') }}</h3>
              </div>

              <div v-if="loadingCard" class="loading">{{ $t('dashboard.loading') }}</div>
              <div v-else-if="!validCard" class="empty-state-card">
                 <p>{{ $t('dashboard.noValidCard') }}</p>
                 <button @click="showBuyModal = true" class="btn-primary" style="margin-top:10px">{{ $t('dashboard.getMembership') }}</button>
              </div>
              <div v-else class="membership-visual" @click="openCardDetail(validCard)">
                 <div class="visual-header">
                    <span class="card-name">{{ validCard.cardType?.name || 'GYM MEMBER' }}</span>
                    <span class="card-status-badge">{{ $t('dashboard.active') }}</span>
                 </div>
                 <div class="card-details">
                    <div class="card-number">NO. {{ validCard.cardNumber }}</div>
                    <div class="card-validity">
                       Valid thru<br>
                       {{ validCard.endDate }}
                    </div>
                 </div>
                 <!-- Quick Recharge Overlay Button -->
                 <button
                   v-if="validCard.paymentStatus === 0"
                   @click.stop="openRecharge(validCard)"
                   class="btn-primary"
                   style="position: absolute; top: 15px; left: 50%; transform: translateX(-50%); box-shadow: 0 4px 10px rgba(0,0,0,0.3);"
                 >
                   {{ $t('dashboard.pay') }}
                 </button>
              </div>
           </div>

           <!-- Upcoming Classes -->
           <div class="section-card">
               <div class="section-header">
                  <h3>{{ $t('dashboard.upcomingClasses') }}</h3>
                  <button @click="fetchData" class="refresh-btn">↻</button>
               </div>

               <div v-if="loading" class="loading">{{ $t('dashboard.loading') }}</div>
               <div v-else-if="recentBookings.length === 0" class="empty">
                  <p style="text-align:center; color:#999; margin-bottom:15px">{{ $t('dashboard.noClasses') }}</p>
                  <button @click="$router.push('/member/courses')" class="btn-primary" style="display:block; margin:0 auto;">{{ $t('dashboard.bookClass') }}</button>
               </div>
               <div v-else class="class-list">
                  <div v-for="booking in recentBookings" :key="booking.id" class="class-item">
                      <div class="class-time">
                          <span class="time-big">{{ new Date(booking.startTime || 0).getHours() }}:00</span>
                          <span class="date-small">{{ new Date(booking.startTime || 0).toLocaleDateString() }}</span>
                      </div>
                      <div class="class-info">
                          <h4>{{ booking.fitnessProgram?.name || booking.notes || 'Fitness Class' }}</h4>
                          <span class="class-sub">{{ getStatus(booking.bookingStatus || 0) }}</span>
                      </div>
                  </div>
                  <button @click="$router.push('/member/courses')" class="btn-link" style="text-align: center; display: block; margin-top: 10px;">{{ $t('dashboard.viewAll') }}</button>
               </div>
           </div>

       </div>

       <!-- Right Side Column -->
       <div class="col-side">

           <!-- Quick Actions -->
           <div class="section-card">
              <div class="section-header">
                 <h3>{{ $t('dashboard.quickActions') }}</h3>
              </div>
              <div class="quick-actions-grid">
                  <div class="action-btn" @click="$router.push('/member/courses')">
                     <span class="action-icon">📅</span>
                     <span class="action-label">{{ $t('dashboard.browseCourses') }}</span>
                  </div>
                  <div class="action-btn" @click="$router.push('/member/coaches')">
                     <span class="action-icon">💪</span>
                     <span class="action-label">{{ $t('dashboard.findCoach') }}</span>
                  </div>
              </div>
           </div>

           <!-- Attendance Widget -->
           <div class="section-card">
              <div class="section-header">
                 <h3>{{ $t('dashboard.attendance') }}</h3>
              </div>
              <div class="attendance-box" :class="{ active: lastAttendance && !lastAttendance.checkOutTime }">
                  <div v-if="lastAttendance && !lastAttendance.checkOutTime">
                      <div class="status-text" style="color:#2ecc71">Checked In</div>
                      <p style="font-size:0.8rem; margin-bottom:15px; color:#666">Since {{ formatTime(lastAttendance.checkInTime).split(',')[1] }}</p>
                      <button @click="handleCheckOut(lastAttendance.id)" class="check-btn check-out">{{ $t('dashboard.checkOut') }}</button>
                  </div>
                  <div v-else>
                       <div class="status-text">Ready to Train?</div>
                       <button @click="handleCheckIn" class="check-btn check-in">{{ $t('dashboard.checkIn') }}</button>
                  </div>
              </div>
           </div>

       </div>

    </div>
    <!-- Buy Membership Modal -->
    <div v-if="showBuyModal" class="modal-overlay">
        <div class="modal">
            <h3>{{ $t('dashboard.selectPlan') }}</h3>
            <div v-if="loadingTypes">{{ $t('dashboard.loading') }}</div>
            <div v-else class="plans-list">
                <div v-for="type in cardTypes" :key="type.id" class="plan-item" @click="handleBuy(type)">
                    <div class="plan-name">{{ type.name }}</div>
                    <div class="plan-price">${{ type.price }} / {{ type.durationDays }} {{ $t('membership.days') }}</div>
                </div>
            </div>
            <button @click="showBuyModal = false" class="cancel-btn">{{ $t('common.cancel') }}</button>
        </div>
    </div>

    <!-- Pay Modal -->
    <div v-if="showRechargeModal" class="modal-overlay">
        <div class="modal">
            <h3>{{ $t('dashboard.payTitle') }}</h3>
            <p>{{ $t('dashboard.enterAmount') }}</p>
            <input type="number" v-model="rechargeAmount" :placeholder="$t('dashboard.amountPlaceholder')" class="input-field" />
            <div class="actions">
                <button @click="confirmRecharge">{{ $t('dashboard.pay') }}</button>
                <button @click="showRechargeModal = false" class="cancel">{{ $t('common.cancel') }}</button>
            </div>
        </div>
    </div>

    <!-- Card Detail Modal -->
    <div v-if="showCardDetailModal && selectedCard" class="modal-overlay" @click.self="showCardDetailModal = false">
        <div class="modal detail-modal">
            <h3>{{ $t('dashboard.detailsTitle') }}</h3>

            <div class="detail-grid">
                <div class="detail-item full-width highlight">
                    <label>{{ $t('dashboard.cardType') }}</label>
                    <p>{{ selectedCard.cardType?.name }}</p>
                </div>
                <div class="detail-item">
                    <label>{{ $t('dashboard.cardNo') }}</label>
                    <p>{{ selectedCard.cardNumber }}</p>
                </div>
                <div class="detail-item">
                    <label>{{ $t('dashboard.remainingDays') }}</label>
                    <p class="highlight-text">{{ selectedCard.remainingDays }} {{ $t('membership.days') }}</p>
                </div>
                 <div class="detail-item">
                    <label>{{ $t('dashboard.startDate') }}</label>
                    <p>{{ selectedCard.startDate }}</p>
                </div>
                 <div class="detail-item">
                    <label>{{ $t('dashboard.endDate') }}</label>
                    <p>{{ selectedCard.endDate }}</p>
                </div>
                <div class="detail-item">
                    <label>{{ $t('dashboard.totalValue') }}</label>
                    <p>${{ selectedCard.totalAmount }}</p>
                </div>
                 <div class="detail-item">
                    <label>{{ $t('dashboard.paidAmount') }}</label>
                    <p>${{ selectedCard.paidAmount }}</p>
                </div>
                 <div class="detail-item">
                    <label>{{ $t('dashboard.paymentStatus') }}</label>
                    <p :class="selectedCard.paymentStatus === 1 ? 'status-paid' : 'status-unpaid'">
                        {{ selectedCard.paymentStatus === 1 ? $t('dashboard.paid') : $t('dashboard.unpaid') }}
                    </p>
                </div>
            </div>

            <button @click="showCardDetailModal = false" class="cancel-btn" style="margin-top: 20px; width: 100%;">{{ $t('dashboard.close') }}</button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getMemberBookings } from '@/api/course';
import { getMemberCards, getAllCardTypes, createMemberCard, payCard } from '@/api/membership';
import { checkIn, checkOut, getMemberAttendance } from '@/api/attendance'; // Import new API
import type { Booking, MemberCard, CardType, Attendance } from '@/types'; // Import Attendance type
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const recentBookings = ref<Booking[]>([]);
const validCard = ref<MemberCard | null>(null);
const cardTypes = ref<CardType[]>([]);
const lastAttendance = ref<Attendance | null>(null);

const loading = ref(false);
const loadingCard = ref(false);
const loadingTypes = ref(false);

// Carousel State
const currentSlide = ref(0);
const slides = ref([
  { image: 'https://img.zx123.cn/Resources/zx123cn/uploadfile/2021/0208/b0920f738180f6b23306cdc9c65c1132.jpg', title: 'Start Your Journey', desc: 'Join the best classes in town.' },
  { image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80', title: 'Professional Trainers', desc: 'Get expert guidance from top coaches.' },
  { image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80', title: 'Premium Equipment', desc: 'Train with the best gear.' }
]);

const setSlide = (index: number) => {
  currentSlide.value = index;
};

// Auto slide
let interval: ReturnType<typeof setInterval>;
onMounted(() => {
  fetchData();
  fetchCardTypes();
  interval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  }, 5000);
});

onUnmounted(() => {
    clearInterval(interval);
});


// Modals
const showBuyModal = ref(false);
const showRechargeModal = ref(false);
const showCardDetailModal = ref(false);
const rechargeAmount = ref(0);
const selectedCard = ref<MemberCard | null>(null);

const getStatus = (s: number) => {
    // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed, 4: Expired
    const map = [
        t('myCourse.bookingStatus.pending'),
        t('myCourse.bookingStatus.confirmed'),
        t('myCourse.bookingStatus.cancelled'),
        t('myCourse.bookingStatus.completed'),
        t('myCourse.bookingStatus.expired')
    ];
    return map[s] || t('myCourse.bookingStatus.unknown');
};

const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

const fetchData = async () => {
    if (authStore.userRole !== 'MEMBER' || !authStore.user) return;
    loading.value = true;
    loadingCard.value = true;
    try {
        const [bookings, cards, attendanceList] = await Promise.all([
            getMemberBookings(authStore.user.id),
            getMemberCards(authStore.user.id),
            getMemberAttendance(authStore.user.id) // Fetch attendance
        ]);

        // Recent Bookings
        const activeBookings = bookings.filter(b => [0, 1].includes(b.bookingStatus || 0));
        activeBookings.sort((a, b) => new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime());
        recentBookings.value = activeBookings.slice(0, 3);

        // Find valid card
        validCard.value = cards.find(c => c.cardStatus === 1) || null;

        // Check for active check-in (no checkout time)
        // Sort by id desc (latest first) to be safe
        attendanceList.sort((a, b) => b.id - a.id);
        if (attendanceList.length > 0 && !attendanceList[0].checkOutTime) {
            lastAttendance.value = attendanceList[0];
        } else {
            lastAttendance.value = null;
        }

    } catch(err) {
        console.error(err);
    } finally {
        loading.value = false;
        loadingCard.value = false;
    }
};

const fetchCardTypes = async () => {
    loadingTypes.value = true;
    try {
        cardTypes.value = await getAllCardTypes();
    } catch (err) {
        console.error(err);
    } finally {
        loadingTypes.value = false;
    }
};

const handleCheckIn = async () => {
    if (!authStore.user) return;
    try {
        await checkIn(authStore.user.id);
        alert('Check-in successful!');
        fetchData();
    } catch(err) {
        console.error(err);
        alert('Check-in failed.');
    }
};

const handleCheckOut = async (id: number) => {
    try {
        await checkOut(id);
        alert('Check-out successful!');
        fetchData();
    } catch(err) {
         console.error(err);
         alert('Check-out failed.');
    }
}

const handleBuy = async (type: CardType) => {
    if (!authStore.user) return;
    if (!confirm(t('membership.confirmPurchase', { name: type.name, price: type.price }))) return;
    try {
        await createMemberCard({
            memberId: authStore.user.id,
            cardTypeId: type.id,
            totalAmount: type.price
        });
        alert('Membership created! Please recharge to use if required.');
        showBuyModal.value = false;
        fetchData();
    } catch(err) {
         console.error(err);
         alert('Purchase failed');
    }
};

const openRecharge = (card: MemberCard) => {
    selectedCard.value = card;
    rechargeAmount.value = 0;
    showRechargeModal.value = true;
};

const openCardDetail = (card: MemberCard) => {
    selectedCard.value = card;
    showCardDetailModal.value = true;
};

const confirmRecharge = async () => {
    if (!selectedCard.value || rechargeAmount.value <= 0) {
        alert("Enter a valid amount");
        return;
    }
    try {
        await payCard(selectedCard.value.id, rechargeAmount.value);
        alert('Recharge successful!');
        showRechargeModal.value = false;
        fetchData();
    } catch(err) {
        console.error(err);
        alert('Recharge failed.');
    }
};
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeInUp 0.5s ease-out;
}

/* Welcome Header with Gradient */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 28px 32px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(247, 147, 30, 0.08) 100%);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 107, 53, 0.15);
}

.welcome-text h1 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: var(--member-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text p {
  color: var(--text-secondary);
  font-size: 1.05rem;
  font-weight: 500;
}

.user-role-badge {
  background: var(--member-gradient);
  color: white;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 700;
  margin-left: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Enhanced Carousel */
.carousel-container {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: var(--shadow-xl);
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1.05);
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  padding: 32px;
  color: white;
}

.carousel-overlay h2 {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.carousel-overlay p {
  font-size: 1.05rem;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  right: 32px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
}

.dot:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.2);
}

.dot.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
}

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.col-main {
  grid-column: span 8;
}

.col-side {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .col-main,
  .col-side {
    grid-column: span 12;
  }
}

/* Section Cards */
.section-card {
  background: white;
  padding: 28px;
  border-radius: var(--radius-xl);
  margin-bottom: 24px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.section-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.section-header h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 24px;
  background: var(--member-gradient);
  border-radius: 4px;
}

/* 3D Membership Card with Hologram Effect */
.membership-visual {
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
  color: #f1c40f;
  padding: 32px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  transform-style: preserve-3d;
}

/* Watermark */
.membership-visual::after {
  content: 'GYM CLUB';
  position: absolute;
  right: -30px;
  bottom: -30px;
  font-size: 7rem;
  font-weight: 900;
  opacity: 0.03;
  color: #fff;
  transform: rotate(-15deg);
  pointer-events: none;
}

/* Hologram Effect */
.membership-visual::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  transition: left 0.6s;
}

.membership-visual:hover {
  transform: rotateY(5deg) rotateX(5deg) translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.membership-visual:hover::before {
  left: 100%;
}

.visual-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.card-name {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #fff;
  text-transform: uppercase;
}

.card-status-badge {
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #000;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(241, 196, 15, 0.4);
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-number {
  font-family: 'Courier New', monospace;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 3px;
  font-weight: 600;
}

.card-validity {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
  line-height: 1.6;
}

/* Quick Actions with Gradient */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: white;
  border: 2px solid rgba(255, 107, 53, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.05), transparent);
  transition: left 0.5s;
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%);
  border-color: var(--member-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
}

.action-btn:hover::before {
  left: 100%;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.action-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Attendance Widget with Pulse Effect */
.attendance-box {
  background: white;
  border: 2px dashed rgba(255, 107, 53, 0.2);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  transition: all var(--transition-base);
}

.attendance-box.active {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%);
  border-color: var(--member-primary);
  border-style: solid;
}

.status-text {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.check-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.check-in {
  background: var(--member-gradient);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
  animation: pulseGlow 2s ease-in-out infinite;
}

.check-in:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.5);
}

.check-out {
  background: var(--danger-gradient);
  color: white;
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.3);
}

.check-out:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(231, 76, 60, 0.5);
}

/* Upcoming Classes List */
.class-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-item {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.04) 0%, rgba(247, 147, 30, 0.04) 100%);
  padding: 16px;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--member-primary);
  transition: all var(--transition-base);
}

.class-item:hover {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(247, 147, 30, 0.08) 100%);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.class-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  padding-right: 16px;
  border-right: 2px solid rgba(255, 107, 53, 0.2);
  min-width: 70px;
}

.time-big {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--member-primary);
}

.date-small {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 600;
}

.class-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.class-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Loading & Empty States */
.loading,
.empty {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.empty-state-card {
  text-align: center;
  padding: 40px 20px;
}

.empty-state-card p {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 1.05rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeInUp 0.3s ease-out;
}

.modal {
  background: white;
  padding: 36px;
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal h3 {
  margin-bottom: 24px;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
}

/* Refresh Button */
.section-header .refresh-btn {
  background: rgba(255, 107, 53, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  color: var(--member-primary);
  font-size: 1.3rem;
  cursor: pointer;
  border: none;
}

.section-header .refresh-btn:hover {
  background: var(--member-gradient);
  color: white;
  transform: rotate(180deg);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* View All Link */
.btn-link {
  background: rgba(255, 107, 53, 0.05);
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border-radius: var(--radius-md);
  color: var(--member-primary);
  font-weight: 700;
  text-decoration: none;
  transition: all var(--transition-base);
  border: 2px solid rgba(255, 107, 53, 0.1);
  display: block;
  text-align: center;
}

.btn-link:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: var(--member-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .welcome-text h1 {
    font-size: 1.75rem;
  }

  .carousel-container {
    height: 200px;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
/* ===== 美化"预约课程"按钮和其他主要按钮 ===== */
.btn-primary {
  background: var(--member-gradient);
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 28px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
  position: relative;
  overflow: hidden;
  animation: gradientShift 3s ease infinite;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 107, 53, 0.6);
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:active {
  transform: translateY(-1px) scale(0.98);
}

/* 空状态提示文字 */
.empty p {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-bottom: 20px;
  font-weight: 500;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}
</style>
