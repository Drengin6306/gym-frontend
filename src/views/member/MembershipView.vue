<template>
  <div class="membership-page">
    <h1>{{ $t('membership.title') }}</h1>

    <!-- Current Membership Section -->
    <div class="section">
        <h2>{{ $t('membership.myCards') }}</h2>
        <div v-if="loadingCards">{{ $t('membership.loadingCards') }}</div>
        <div v-else-if="myCards.length === 0" class="empty-state">
            <p>{{ $t('membership.noCards') }}</p>
        </div>
        <div v-else class="cards-grid">
            <div v-for="card in myCards" :key="card.id" class="member-card glass-panel" :class="{ 'active': card.cardStatus === 1 }">
                <h3>{{ card.cardType?.name || $t('membership.title') }}</h3>
                <p>{{ $t('membership.cardNo') }}: {{ card.cardNumber }}</p>
                <div class="dates">
                    <p>{{ $t('membership.valid') }}: {{ card.startDate }} {{ $t('membership.to') }} {{ card.endDate }}</p>
                    <p>{{ $t('membership.remaining') }}: {{ card.remainingDays }} {{ $t('membership.days') }}</p>
                </div>
                <div class="status">
                    <span :class="['badge', getStatusClass(card.cardStatus)]">{{ getStatusText(card.cardStatus) }}</span>
                    <span v-if="card.paymentStatus === 0" class="badge unpaid">{{ $t('membership.unpaid') }}</span>
                </div>
                <!-- Simple mock payment for unpaid cards -->
                <button v-if="card.paymentStatus === 0 && card.cardStatus !== 1" @click="handlePay(card)" class="pay-btn">{{ $t('membership.payNow') }}</button>
            </div>
        </div>
    </div>

    <!-- Buy New Mebership Section -->
    <div class="section">
        <h2>{{ $t('membership.buyNew') }}</h2>
        <div v-if="loadingTypes">{{ $t('membership.loadingTypes') }}</div>
        <div v-else class="types-grid">
            <div v-for="type in cardTypes" :key="type.id" class="type-card glass-panel">
                <h3>{{ type.name }}</h3>
                <p class="desc">{{ type.description }}</p>
                <p class="price">${{ type.price }} / {{ type.durationDays }} {{ $t('membership.days') }}</p>
                <button @click="handleBuy(type)" class="buy-btn">{{ $t('membership.purchase') }}</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllCardTypes, getMemberCards, createMemberCard, payCard } from '@/api/membership';
import type { CardType, MemberCard } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
const myCards = ref<MemberCard[]>([]);
const cardTypes = ref<CardType[]>([]);
const loadingCards = ref(false);
const loadingTypes = ref(false);

const getStatusText = (status: number) => {
    const map = [
        t('membership.status.invalid'),
        t('membership.status.active'),
        t('membership.status.expired'),
        t('membership.status.lost')
    ];
    return map[status] || t('membership.status.unknown');
};

const getStatusClass = (status: number) => {
    if (status === 1) return 'active';
    if (status === 2) return 'expired';
    return '';
};

const fetchData = async () => {
    if (!authStore.user) return;
    loadingCards.value = true;
    loadingTypes.value = true;

    try {
        const [cards, types] = await Promise.all([
            getMemberCards(authStore.user.id),
            getAllCardTypes()
        ]);
        myCards.value = cards;
        cardTypes.value = types;
    } catch(err) {
        console.error(err);
    } finally {
        loadingCards.value = false;
        loadingTypes.value = false;
    }
};

const handleBuy = async (type: CardType) => {
    if (!authStore.user) return;
    if (!confirm(t('membership.confirmPurchase', { name: type.name, price: type.price }))) return;

    try {
        await createMemberCard({
            memberId: authStore.user.id,
            cardTypeId: type.id,
            totalAmount: type.price
        });
        alert(t('membership.created'));
        fetchData();
    } catch {
        // const msg = (err as any).response?.data?.message || t('common.error');
        alert(t('common.error'));
    }
};

const handlePay = async (card: MemberCard) => {
    const remaining = card.totalAmount - (card.paidAmount || 0);
    const amountStr = prompt(t('membership.payPrompt', { remaining: remaining }), remaining.toString());

    if (amountStr === null) return; // Cancelled

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        alert(t('membership.invalidAmount'));
        return;
    }

    if (amount > remaining) {
        alert(t('membership.exceedAmount', { remaining: remaining }));
        return;
    }

    try {
        await payCard(card.id, amount);
        alert(t('membership.paySuccess'));
        fetchData();
    } catch {
        alert(t('membership.payFail'));
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
/* 🏋️ Membership View - Member Orange Theme */

.membership-page {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.membership-page h1 {
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.section {
  margin-bottom: 48px;
}

.section h2 {
  color: var(--text-primary);
  font-size: 1.4rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(255, 107, 53, 0.2);
}

.cards-grid, .types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-medium);
  color: var(--text-secondary);
}

/* ===== Member Card with Gradient Border ===== */
.member-card {
  position: relative;
  padding: 3px;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.member-card.active {
  background: var(--member-gradient);
}

.member-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.member-card > * {
  position: relative;
  z-index: 2;
}

.member-card h3 {
  padding: 20px 20px 0;
  color: var(--text-primary);
  margin: 0 0 12px;
  font-weight: 700;
}

.member-card p {
  padding: 0 20px;
  margin: 8px 0;
  color: var(--text-secondary);
}

.member-card .dates {
  padding: 0 20px;
}

.member-card .dates p {
  padding: 0;
  font-size: 0.9rem;
}

.member-card .status {
  padding: 16px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--member-shadow);
}

/* ===== Type Card with Gradient Border ===== */
.type-card {
  position: relative;
  padding: 3px;
  background: var(--member-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.type-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.type-card > * {
  position: relative;
  z-index: 2;
}

.type-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--member-shadow);
}

.type-card h3 {
  padding: 24px 24px 0;
  color: var(--text-primary);
  margin: 0 0 12px;
  font-weight: 700;
  font-size: 1.3rem;
}

.desc {
  padding: 0 24px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  min-height: 50px;
  line-height: 1.5;
}

.price {
  padding: 0 24px;
  font-size: 1.4rem;
  font-weight: 800;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
}

/* ===== Buttons ===== */
.buy-btn, .pay-btn {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  padding: 14px;
  background: var(--member-gradient);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.buy-btn::before, .pay-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.buy-btn:hover::before, .pay-btn:hover::before {
  left: 100%;
}

.buy-btn:hover, .pay-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}

.pay-btn {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

/* ===== Badges ===== */
.badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: #fff;
}

.badge.active {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.badge.expired {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.badge.unpaid {
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #333;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .cards-grid, .types-grid {
    grid-template-columns: 1fr;
  }
}
</style>
