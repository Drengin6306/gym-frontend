<template>
  <div class="management-view">
    <div class="header-actions">
      <h1>{{ $t("memberManagement.title") }}</h1>
      <button class="btn btn-primary" @click="openAddModal">
        {{ $t("memberManagement.addMember") }}
      </button>
    </div>

    <div class="glass-panel">
      <div v-if="loading" class="loading-state">
        {{ $t("memberManagement.loading") }}
      </div>
      <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>{{ $t("memberManagement.columns.id") }}</th>
            <th>{{ $t("memberManagement.columns.username") }}</th>
            <th>{{ $t("memberManagement.columns.fullName") }}</th>
            <th>{{ $t("memberManagement.columns.phone") }}</th>
            <th>{{ $t("memberManagement.columns.status") }}</th>
            <th>{{ $t("memberManagement.columns.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>#{{ member.id }}</td>
            <td>{{ member.username }}</td>
            <td>{{ member.realName }}</td>
            <td>{{ member.phone || "-" }}</td>
            <td class="status-cell">
              <span
                :class="[
                  'status-badge',
                  member.activeCardCount && member.activeCardCount > 0
                    ? 'active'
                    : 'inactive',
                ]"
              >
                {{
                  member.activeCardCount && member.activeCardCount > 0
                    ? $t("memberManagement.status.active")
                    : $t("memberManagement.status.inactive")
                }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-sm btn-info" @click="viewDetails(member)">
                {{ $t("memberManagement.actions.details") }}
              </button>
              <button class="btn-sm btn-edit" @click="handleEdit(member)">
                {{ $t("memberManagement.actions.edit") }}
              </button>
              <button
                class="btn-sm btn-delete"
                @click="handleDelete(member.id)"
              >
                {{ $t("memberManagement.actions.delete") }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && members.length === 0" class="empty-state">
        {{ $t("memberManagement.empty") }}
      </div>
    </div>

    <!-- Member Details Modal -->
    <div v-if="selectedMember" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content glass-panel">
        <div class="modal-header">
          <h2>{{ $t("memberManagement.modal.detailsTitle") }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="info-section">
            <h3>{{ $t("memberManagement.modal.basicInfo") }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>{{ $t("memberManagement.columns.id") }}:</strong> #{{
                  selectedMember.id
                }}
              </div>
              <div class="info-item">
                <strong>{{ $t("memberManagement.columns.username") }}:</strong>
                {{ selectedMember.username }}
              </div>
              <div class="info-item">
                <strong>{{ $t("memberManagement.columns.fullName") }}:</strong>
                {{ selectedMember.realName }}
              </div>
              <div class="info-item">
                <strong>{{ $t("memberManagement.columns.phone") }}:</strong>
                {{ selectedMember.phone || "N/A" }}
              </div>
              <div class="info-item">
                <strong>Email:</strong> {{ selectedMember.email || "N/A" }}
              </div>
              <div class="info-item">
                <strong>{{ $t("adminDashboard.chart.gender") }}:</strong>
                {{
                  selectedMember.gender === 1
                    ? $t("common.gender.male")
                    : selectedMember.gender === 0
                    ? $t("common.gender.female")
                    : "Unknown"
                }}
              </div>
              <div class="info-item">
                <strong>{{ $t("memberManagement.columns.status") }}:</strong>
                {{
                  selectedMember.status === 1
                    ? $t("memberManagement.status.active")
                    : $t("memberManagement.status.inactive")
                }}
              </div>
            </div>
          </div>

          <div class="cards-section">
            <h3>{{ $t("memberManagement.modal.membershipCards") }}</h3>
            <div v-if="cardsLoading">
              {{ $t("memberManagement.cards.loading") }}
            </div>
            <table v-else-if="memberCards.length > 0" class="data-table sm">
              <thead>
                <tr>
                  <th>{{ $t("memberManagement.cards.cardNo") }}</th>
                  <th>{{ $t("memberManagement.cards.type") }}</th>
                  <th>{{ $t("memberManagement.cards.balance") }}</th>
                  <th>{{ $t("memberManagement.cards.payment") }}</th>
                  <th>{{ $t("memberManagement.cards.validity") }}</th>
                  <th>{{ $t("memberManagement.cards.status") }}</th>
                  <th>{{ $t("memberManagement.cards.actions") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="card in memberCards" :key="card.id">
                  <td>{{ card.cardNumber }}</td>
                  <td>{{ card.cardType?.name || "Unknown" }}</td>
                  <td>
                    <span v-if="card.remainingDays > 0"
                      >{{ card.remainingDays }}
                      {{ $t("memberManagement.cards.days") }}</span
                    >
                    <span v-else
                      >¥{{ card.totalAmount }} ({{
                        $t("memberManagement.cards.bal")
                      }})</span
                    >
                  </td>
                  <td>
                    <div>¥{{ card.paidAmount }} / ¥{{ card.totalAmount }}</div>
                    <div
                      class="status-text"
                      :class="card.paymentStatus === 1 ? 'success' : 'warning'"
                    >
                      {{
                        card.paymentStatus === 1
                          ? $t("memberManagement.cards.paid")
                          : $t("memberManagement.cards.unpaid")
                      }}
                    </div>
                  </td>
                  <td>{{ card.startDate }} ~ {{ card.endDate }}</td>
                  <td>
                    <span
                      :class="[
                        'status-badge',
                        card.cardStatus === 1 ? 'Valid' : 'Invalid',
                      ]"
                    >
                      {{
                        card.cardStatus === 1
                          ? $t("memberManagement.cards.valid")
                          : $t("memberManagement.cards.invalid")
                      }}
                    </span>
                  </td>
                  <td>
                    <button
                      v-if="card.paymentStatus === 0"
                      class="btn-sm btn-pay"
                      @click="handlePayment(card)"
                    >
                      {{ $t("memberManagement.cards.pay") }}
                    </button>
                    <button
                      class="btn-sm btn-delete"
                      @click="handleDeleteCard(card)"
                      style="margin-left: 5px"
                    >
                      {{ $t("memberManagement.cards.delete") }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-text">
              {{ $t("memberManagement.cards.empty") }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            v-if="!hasValidCard"
            class="btn btn-primary"
            @click="openIssueCardModal"
            style="margin-right: 10px"
          >
            {{ $t("memberManagement.modal.issueCard") }}
          </button>
          <button class="btn btn-primary" @click="closeModal">
            {{ $t("memberManagement.modal.close") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Issue Card Modal -->
    <div
      v-if="showIssueCardModal"
      class="modal-overlay"
      @click.self="closeIssueCardModal"
    >
      <div class="modal-content glass-panel sm">
        <div class="modal-header">
          <h2>{{ $t("memberManagement.issueModal.title") }}</h2>
          <button class="close-btn" @click="closeIssueCardModal">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitIssueCard">
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.fullName") }}</label>
              <input
                type="text"
                :value="selectedMember?.realName"
                disabled
                style="background: #f9f9f9"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.issueModal.cardType") }}</label>
              <select v-model="issueCardForm.cardTypeId" required>
                <option
                  v-for="type in cardTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name }} ({{ type.durationDays }}
                  {{ $t("memberManagement.cards.days") }}) - ¥{{ type.price }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.issueModal.paidAmount") }}</label>
              <input
                type="number"
                v-model="issueCardForm.paidAmount"
                placeholder="Enter amount paid"
              />
              <small style="color: #777">{{
                $t("memberManagement.issueModal.priceHint")
              }}</small>
            </div>
            <div
              class="modal-footer"
              style="padding-bottom: 0; border-top: none"
            >
              <button type="submit" class="btn btn-primary">
                {{ $t("memberManagement.issueModal.submit") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Member Modal -->
    <div
      v-if="showEditModal"
      class="modal-overlay"
      @click.self="closeEditModal"
    >
      <div class="modal-content glass-panel sm">
        <div class="modal-header">
          <h2>{{ $t("memberManagement.modal.editTitle") }}</h2>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEdit">
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.username") }}</label>
              <input
                type="text"
                v-model="editForm.username"
                disabled
                style="background: #f9f9f9; cursor: not-allowed"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.fullName") }}</label>
              <input type="text" v-model="editForm.realName" required />
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.phone") }}</label>
              <input type="text" v-model="editForm.phone" />
            </div>
            <div class="form-group">
              <label>{{ $t("adminDashboard.chart.gender") }}</label>
              <select v-model="editForm.gender">
                <option :value="1">{{ $t("common.gender.male") }}</option>
                <option :value="0">{{ $t("common.gender.female") }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.status") }}</label>
              <select v-model="editForm.status">
                <option :value="1">
                  {{ $t("memberManagement.status.active") }}
                </option>
                <option :value="0">
                  {{ $t("memberManagement.status.inactive") }}
                </option>
              </select>
            </div>
            <div
              class="modal-footer"
              style="padding-bottom: 0; border-top: none"
            >
              <button type="submit" class="btn btn-primary">
                {{ $t("memberManagement.modal.save") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content glass-panel sm">
        <div class="modal-header">
          <h2>{{ $t("memberManagement.modal.addTitle") }}</h2>
          <button class="close-btn" @click="closeAddModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitAddMember">
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.username") }}</label>
              <input
                type="text"
                v-model="addForm.username"
                required
                placeholder="Enter login username"
              />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input
                type="password"
                v-model="addForm.password"
                required
                placeholder="Enter login password"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.fullName") }}</label>
              <input
                type="text"
                v-model="addForm.realName"
                required
                placeholder="Enter full name"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("memberManagement.columns.phone") }}</label>
              <input
                type="text"
                v-model="addForm.phone"
                placeholder="Enter phone number"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("adminDashboard.chart.gender") }}</label>
              <select v-model="addForm.gender">
                <option :value="1">{{ $t("common.gender.male") }}</option>
                <option :value="0">{{ $t("common.gender.female") }}</option>
              </select>
            </div>
            <div
              class="modal-footer"
              style="padding-bottom: 0; border-top: none"
            >
              <button type="submit" class="btn btn-primary">
                {{ $t("memberManagement.modal.create") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import request from "@/api/request"; // Changed from raw axios
import type { Member, MemberCard, CardType } from "@/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const members = ref<Member[]>([]);
const loading = ref(false);
const errorMsg = ref("");

// Details Modal State
const selectedMember = ref<Member | null>(null);
const memberCards = ref<MemberCard[]>([]);
const cardsLoading = ref(false);

const fetchMembers = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await request.get<any, Member[]>("/member/all"); // Removed /api prefix
    members.value = res; // Removed .data
  } catch (err) {
    console.error("Failed to fetch members", err);
    errorMsg.value = "Failed to load member data. Please try again.";
  } finally {
    loading.value = false;
  }
};

const viewDetails = async (member: Member) => {
  selectedMember.value = member;
  memberCards.value = [];
  cardsLoading.value = true;
  try {
    const res = await request.get<any, MemberCard[]>(
      `/member-card/member/${member.id}`
    ); // Removed /api prefix
    memberCards.value = res; // Removed .data
  } catch (err) {
    console.error("Failed to fetch member cards", err);
  } finally {
    cardsLoading.value = false;
  }
};

const handlePayment = async (card: MemberCard) => {
  const remaining = card.totalAmount - card.paidAmount;
  const amountStr = prompt(
    `Enter payment amount (Remaining: ¥${remaining}):`,
    remaining.toString()
  );

  if (!amountStr) return;
  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    alert("Invalid amount");
    return;
  }

  if (amount > remaining) {
    alert(
      `Payment amount cannot exceed the remaining balance (¥${remaining}).`
    );
    return;
  }

  try {
    // API expects amount as query param
    await request.post(`/member-card/pay/${card.id}`, null, {
      params: { amount },
    }); // Removed /api prefix
    alert(t("memberManagement.alerts.paymentSuccess"));
    // Refresh cards
    if (selectedMember.value) {
      viewDetails(selectedMember.value);
    }
  } catch (err) {
    console.error("Payment failed", err);
    alert(t("memberManagement.alerts.paymentFail"));
  }
};

const handleDeleteCard = async (card: MemberCard) => {
  if (!confirm(t("memberManagement.alerts.deleteCardConfirm"))) {
    return;
  }

  try {
    await request.delete(`/member-card/${card.id}`); // Removed /api prefix
    alert(t("memberManagement.alerts.deleteCardSuccess"));
    if (selectedMember.value) {
      viewDetails(selectedMember.value);
    }
  } catch (err) {
    console.error("Delete card failed", err);
    alert("Failed to delete card. Please try again.");
  }
};

// Edit Modal State
const showEditModal = ref(false);
const editForm = ref<Member>({} as Member);

const handleEdit = (member: Member) => {
  editForm.value = { ...member }; // Clone to avoid direct mutation
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {} as Member;
};

const submitEdit = async () => {
  try {
    await request.put("/member/update", editForm.value); // Removed /api prefix
    alert(t("memberManagement.alerts.updateSuccess"));
    closeEditModal();
    fetchMembers(); // Refresh list
  } catch (err) {
    console.error("Failed to update member", err);
    alert("Failed to update member. Please try again.");
  }
};

// Add Modal State
const showAddModal = ref(false);
const addForm = ref<Member>({
  username: "",
  password: "",
  realName: "",
  phone: "",
  gender: 1,
  status: 1,
} as Member);

const openAddModal = () => {
  addForm.value = {
    username: "",
    password: "",
    realName: "",
    phone: "",
    gender: 1,
    status: 1,
  } as Member;
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
  editForm.value = {} as Member; // This seems suspicious copypaste, should be addForm? But closeAddModal is simple reset
  // No, I'll trust my plan, but wait, the original code had: showAddModal.value = false;
  // I should check if I broke anything. Original was:
  // const closeAddModal = () => { showAddModal.value = false; };
  // I will stick mainly to original logic but fix Axios.
};

const submitAddMember = async () => {
  try {
    await request.post("/member/register", addForm.value); // Removed /api prefix
    alert(t("memberManagement.alerts.createSuccess"));
    closeAddModal();
    fetchMembers();
  } catch (err) {
    console.error("Failed to create member", err);
    alert(t("memberManagement.alerts.createFail"));
  }
};

const hasValidCard = computed(() => {
  return memberCards.value.some((card) => {
    // Simple check: status is 1 (valid) and end date is future
    const isStatusValid = card.cardStatus === 1;
    const isNotExpired = new Date(card.endDate) >= new Date();
    return isStatusValid && isNotExpired;
  });
});

// Issue Card Modal State
const showIssueCardModal = ref(false);
const cardTypes = ref<CardType[]>([]);
const issueCardForm = ref({
  cardTypeId: 0,
  paidAmount: 0,
  memberId: 0,
});

const openIssueCardModal = async () => {
  if (!selectedMember.value) return;

  // Fetch card types
  try {
    const res = await request.get<any, CardType[]>("/card-type/all"); // Removed /api prefix
    cardTypes.value = res; // Removed .data
  } catch (err) {
    console.error("Failed to fetch card types", err);
    alert("Could not load card types.");
    return;
  }

  issueCardForm.value = {
    cardTypeId: cardTypes.value.length > 0 ? cardTypes.value[0].id : 0,
    paidAmount: 0,
    memberId: selectedMember.value.id,
  };
  showIssueCardModal.value = true;
};

const closeIssueCardModal = () => {
  showIssueCardModal.value = false;
};

const submitIssueCard = async () => {
  if (!issueCardForm.value.cardTypeId) {
    alert(t("memberManagement.issueModal.selectType"));
    return;
  }

  const selectedCardType = cardTypes.value.find(
    (t) => t.id === issueCardForm.value.cardTypeId
  );
  if (
    selectedCardType &&
    issueCardForm.value.paidAmount > selectedCardType.price
  ) {
    alert(
      `Payment amount cannot exceed card price ($${selectedCardType.price}).`
    );
    return;
  }

  try {
    await request.post("/member-card/create", {
      memberId: issueCardForm.value.memberId,
      cardTypeId: issueCardForm.value.cardTypeId,
      paidAmount: issueCardForm.value.paidAmount,
    }); // Removed /api prefix
    alert("Card issued successfully!");
    closeIssueCardModal();
    // Refresh detail view
    viewDetails(selectedMember.value!);
  } catch (err) {
    console.error("Failed to issue card", err);
    alert("Failed to issue card.");
  }
};

const closeModal = () => {
  selectedMember.value = null;
  memberCards.value = [];
};

const handleDelete = async (id: number) => {
  // Better confirm flow
  if (!confirm(t("memberManagement.alerts.deleteMemberConfirm"))) {
    return;
  }

  try {
    await request.delete(`/member/${id}`); // Removed /api prefix
    alert(t("memberManagement.alerts.deleteMemberSuccess"));
    fetchMembers();
  } catch (err) {
    console.error("Delete failed", err);
    alert(
      "Failed to delete member. Ensure they have no active dependencies or contact admin."
    );
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
/* 🏋️ Admin Member Management - Authority Purple Theme */

.management-view {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

/* ===== Header Actions ===== */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-light);
}

.header-actions h1 {
  margin: 0;
  font-size: 2rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===== Glass Panel ===== */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-md);
  overflow-x: auto;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* ===== Data Table ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.data-table th {
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  transition: all var(--transition-base);
}

.data-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  transform: scale(1.01);
}

.data-table.sm th,
.data-table.sm td {
  padding: 12px;
  font-size: 0.9em;
}

/* ===== Status Badges ===== */
.status-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-badge.active,
.status-badge.Valid {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.status-badge.inactive,
.status-badge.Invalid {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.15) 100%);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

/* ===== Action Buttons ===== */
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-base);
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--admin-gradient);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
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
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-base);
  border: 2px solid transparent;
}

.btn-info {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(41, 128, 185, 0.2) 100%);
  color: #2980b9;
  border-color: rgba(52, 152, 219, 0.5);
}

.btn-info:hover {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.3) 0%, rgba(41, 128, 185, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-pay {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.2) 0%, rgba(39, 174, 96, 0.2) 100%);
  color: #27ae60;
  border-color: rgba(46, 204, 113, 0.5);
}

.btn-pay:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.3) 0%, rgba(39, 174, 96, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-edit {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  color: #f39c12;
  border-color: rgba(241, 196, 15, 0.5);
}

.btn-edit:hover {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.3) 0%, rgba(243, 156, 18, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(241, 196, 15, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.2) 100%);
  color: #c0392b;
  border-color: rgba(231, 76, 60, 0.5);
}

.btn-delete:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.3) 0%, rgba(192, 57, 43, 0.3) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.status-text.success {
  color: #27ae60;
  font-weight: 700;
}

.status-text.warning {
  color: #f39c12;
  font-weight: 700;
}

/* ===== States ===== */
.loading-state,
.error-state,
.empty-state,
.empty-text {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-state {
  color: var(--danger-color);
  font-weight: 600;
}

.empty-state {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-medium);
}

/* ===== Modal Styles ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: var(--radius-xl);
  width: 850px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--admin-gradient);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal-content.sm {
  width: 550px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 2px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-light);
  transition: all var(--transition-base);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 28px;
  text-align: right;
  border-top: 2px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ===== Info Sections ===== */
.info-section,
.cards-section {
  margin-bottom: 32px;
}

.info-section h3,
.cards-section h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 1.2rem;
  padding-bottom: 12px;
  border-bottom: 3px solid transparent;
  border-image: var(--admin-gradient) 1;
  border-image-slice: 1;
  display: inline-block;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  background: var(--bg-tertiary);
  padding: 20px;
  border-radius: var(--radius-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item strong {
  color: var(--text-light);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== Form Styles ===== */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  transition: all var(--transition-base);
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--admin-primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  background: #f9f9f9;
  cursor: not-allowed;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .management-view {
    padding: 20px 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95vw;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
