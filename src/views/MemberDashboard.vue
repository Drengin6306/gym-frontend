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
/* Dashboard Styles */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Welcome Header */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.welcome-text h1 { font-size: 1.8rem; margin-bottom: 5px; }
.welcome-text p { color: var(--text-light); }
.user-role-badge {
  background: var(--secondary-color);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 10px;
}

/* Carousel */
.carousel-container {
  position: relative;
  width: 100%;
  height: 200px; /* Compact banner */
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: var(--card-shadow);
}
.carousel-slide {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  transition: opacity 0.5s ease-in-out;
}
.carousel-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 20px;
  color: white;
}
.carousel-overlay h2 { color: white; margin-bottom: 5px; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
.carousel-dots {
  position: absolute;
  bottom: 10px; right: 20px;
  display: flex; gap: 6px;
}
.dot {
  width: 8px; height: 8px;
  background: rgba(255,255,255,0.5);
  border-radius: 50%;
  cursor: pointer;
}
.dot.active { background: var(--primary-color); transform: scale(1.2); }

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

/* Columns */
.col-main { grid-column: span 8; }
.col-side { grid-column: span 4; display: flex; flex-direction: column; gap: 20px; }

@media (max-width: 768px) {
  .col-main, .col-side { grid-column: span 12; }
}

/* Cards */
.section-card {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-header h3 { font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
.section-header h3::before {
  content: ''; display: block; width: 4px; height: 20px;
  background: var(--primary-color); border-radius: 2px;
}

/* Membership Card */
.membership-visual {
  background: linear-gradient(135deg, #2c3e50 0%, #000000 100%);
  color: #f1c40f;
  padding: 24px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: transform 0.3s;
  cursor: pointer;
}
.membership-visual::after {
  content: 'GYM CLUB';
  position: absolute;
  right: -20px; bottom: -20px;
  font-size: 6rem;
  font-weight: 900;
  opacity: 0.05;
  color: #fff;
  transform: rotate(-15deg);
}
.membership-visual:hover { transform: translateY(-5px); }
.visual-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.card-name { font-size: 1.4rem; font-weight: 800; letter-spacing: 1px; color: #fff;}
.card-status-badge { background: #f1c40f; color: #000; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 0.7rem; text-transform: uppercase; }
.card-details { display: flex; justify-content: space-between; align-items: flex-end; }
.card-number { font-family: 'Courier New', monospace; font-size: 1.1rem; color: rgba(255,255,255,0.7); letter-spacing: 2px; }
.card-validity { font-size: 0.8rem; color: rgba(255,255,255,0.5); text-align: right; }

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: #fdfdfd;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.action-icon { font-size: 1.8rem; margin-bottom: 8px; }
.action-label { font-size: 0.9rem; font-weight: 600; color: var(--secondary-color); }

/* Attendance Widget */
.attendance-box {
  background: #fff;
  border: 2px dashed #eee;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: background 0.2s;
}
.attendance-box.active {
  background: #fef9e7; /* Light yellow tint */
  border-color: var(--primary-color);
}
.status-text { font-size: 1.1rem; font-weight: bold; margin-bottom: 10px; color: var(--secondary-color); }
.check-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
}
.check-in { background: var(--primary-color); color: #000; }
.check-out { background: #ff6b6b; color: #fff; }
.check-btn:hover { transform: scale(1.02); }

/* Upcoming Classes - Compact List */
.class-list { display: flex; flex-direction: column; gap: 10px; }
.class-item {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}
.class-time {
  display: flex; flex-direction: column;
  align-items: center;
  margin-right: 15px;
  padding-right: 15px;
  border-right: 1px solid #eee;
  min-width: 60px;
}
.time-big { font-weight: bold; font-size: 1.1rem; color: var(--secondary-color); }
.date-small { font-size: 0.7rem; color: #999; }
.class-info h4 { margin: 0; font-size: 1rem; color: #333; }
.class-sub { font-size: 0.8rem; color: #777; }

/* Modal Styles Reuse */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); }
.modal { background: #fff; padding: 30px; border-radius: 16px; width: 90%; max-width: 450px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal h3 { margin-bottom: 20px; text-align: center; font-size: 1.5rem; }
.plans-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.plan-item { padding: 15px; background: #f8f9fa; border: 2px solid transparent; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.plan-item:hover, .plan-item.selected { border-color: var(--primary-color); background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Button Improvements */
.section-header .refresh-btn {
    background: #f0f0f0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: #666;
    font-size: 1.2rem;
    cursor: pointer;
    border: none;
}
.section-header .refresh-btn:hover {
    background: var(--primary-color);
    color: #000;
    transform: rotate(180deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.class-list .btn-link {
    background: #f8f9fa;
    width: 100%;
    margin-top: 15px;
    padding: 12px;
    border-radius: 8px;
    color: var(--secondary-color);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid #eee;
    display: block;
    text-align: center;
}
.class-list .btn-link:hover {
    background: #fff;
    border-color: var(--primary-color);
    color: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>
