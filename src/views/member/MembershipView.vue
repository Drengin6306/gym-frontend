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
.membership-page { padding: 20px; }
.section { margin-bottom: 40px; }
.cards-grid, .types-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 15px; }

.member-card, .type-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.member-card.active { border-left: 5px solid #2ecc71; }

.type-card h3, .member-card h3 { color: #2c3e50; margin-bottom: 10px; }
.desc { color: #7f8c8d; margin-bottom: 15px; min-height: 40px; }
.price { font-size: 1.2rem; font-weight: bold; color: #2980b9; margin-bottom: 15px; }

.buy-btn, .pay-btn { width: 100%; padding: 10px; background: #3498db; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.buy-btn:hover { background: #2980b9; }
.pay-btn { background: #e67e22; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: #95a5a6; color: #fff; margin-right: 5px; }
.badge.active { background: #2ecc71; }
.badge.expired { background: #e74c3c; }
.badge.unpaid { background: #f1c40f; color: #333; }
</style>
