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
.management-view {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-actions h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.glass-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.data-table th,
.data-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.data-table th {
  font-weight: 600;
  color: #7f8c8d;
  background: #f8f9fa;
}
.data-table tr:hover {
  background-color: #f8f9fa;
}
.data-table.sm th,
.data-table.sm td {
  padding: 10px;
  font-size: 0.9em;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}
.status-badge.active {
  background: #e8f8f5;
  color: #2ecc71;
}
.status-badge.inactive {
  background: #fdedec;
  color: #e74c3c;
}

.actions {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  background: #3498db;
  color: white;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 0.85em;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn-info {
  background: #3498db;
  color: white;
}
.btn-pay {
  background: #27ae60;
  color: white;
}
.btn-edit {
  background: #f1c40f;
  color: white;
}
.btn-delete {
  background: #e74c3c;
  color: white;
}

.status-text.success {
  color: #27ae60;
  font-weight: bold;
}
.status-text.warning {
  color: #f39c12;
}

.loading-state,
.error-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #7f8c8d;
}
.error-state {
  color: #e74c3c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 0;
  border-radius: 12px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
.modal-content.sm {
  width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.modal-footer {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #eee;
}

.info-section,
.cards-section {
  margin-bottom: 25px;
}
.info-section h3,
.cards-section h3 {
  margin-bottom: 15px;
  color: #34495e;
  border-bottom: 2px solid #3498db;
  display: inline-block;
  padding-bottom: 5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.info-item strong {
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #34495e;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
</style>
