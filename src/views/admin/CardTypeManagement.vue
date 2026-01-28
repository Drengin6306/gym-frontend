<template>
  <div class="management-view">
    <div class="header-actions">
        <h1>{{ $t('cardTypeManagement.title') }}</h1>
        <button class="btn btn-primary" @click="openAddModal">{{ $t('cardTypeManagement.add') }}</button>
    </div>

    <div class="glass-panel">
        <div v-if="loading" class="loading-state">{{ $t('cardTypeManagement.loading') }}</div>
        <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('cardTypeManagement.columns.id') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.name') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.duration') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.price') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.status') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.description') }}</th>
                    <th>{{ $t('cardTypeManagement.columns.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="type in cardTypes" :key="type.id">
                    <td>#{{ type.id }}</td>
                    <td>{{ type.name }}</td>
                    <td>{{ type.durationDays }}</td>
                    <td class="price-cell">¥{{ type.price }}</td>
                    <td>
                        <span :class="['status-badge', type.status === 1 ? 'active' : 'inactive']">
                            {{ type.status === 1 ? $t('cardTypeManagement.status.active') : $t('cardTypeManagement.status.discontinued') }}
                        </span>
                    </td>
                    <td>{{ type.description || '-' }}</td>
                    <td class="actions">
                        <button class="btn-sm btn-edit" @click="handleEdit(type)">{{ $t('memberManagement.actions.edit') }}</button>
                        <button class="btn-sm btn-delete" @click="handleDelete(type.id)">{{ $t('memberManagement.actions.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
         <div v-if="!loading && cardTypes.length === 0" class="empty-state">
            {{ $t('cardTypeManagement.empty') }}
        </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('cardTypeManagement.modal.editTitle') }}</h2>
                <button class="close-btn" @click="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitEdit">
                    <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.name') }}</label>
                        <input type="text" v-model="editForm.name" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.duration') }}</label>
                        <input type="number" v-model="editForm.durationDays" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.price') }}</label>
                        <input type="number" v-model="editForm.price" required />
                        <small style="color:#e67e22;">{{ $t('cardTypeManagement.modal.priceHint') }}</small>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.status') }}</label>
                        <select v-model="editForm.status">
                            <option :value="1">{{ $t('cardTypeManagement.status.active') }}</option>
                            <option :value="0">{{ $t('cardTypeManagement.status.discontinued') }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.description') }}</label>
                        <textarea v-model="editForm.description" rows="3" style="width:100%; padding:8px; border:1px solid #ddd;"></textarea>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('cardTypeManagement.modal.save') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('cardTypeManagement.modal.addTitle') }}</h2>
                <button class="close-btn" @click="closeAddModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitAdd">
                     <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.name') }}</label>
                        <input type="text" v-model="addForm.name" required placeholder="e.g. Summer Special" />
                    </div>
                     <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.duration') }}</label>
                        <input type="number" v-model="addForm.durationDays" required placeholder="30" />
                    </div>
                     <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.price') }}</label>
                        <input type="number" v-model="addForm.price" required placeholder="299" />
                    </div>
                     <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.description') }}</label>
                         <textarea v-model="addForm.description" rows="3" style="width:100%; padding:8px; border:1px solid #ddd;"></textarea>
                    </div>
                     <div class="form-group">
                        <label>{{ $t('cardTypeManagement.fields.status') }}</label>
                        <select v-model="addForm.status">
                            <option :value="1">{{ $t('cardTypeManagement.status.active') }}</option>
                            <option :value="0">{{ $t('cardTypeManagement.status.discontinued') }}</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('cardTypeManagement.modal.create') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import request from '@/api/request'; // Changed from raw axios
import type { CardType } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const cardTypes = ref<CardType[]>([]);
const loading = ref(false);
const errorMsg = ref('');

const fetchCardTypes = async () => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const res = await request.get<any, CardType[]>('/card-type/all'); // Removed /api prefix
        cardTypes.value = res; // Removed .data
    } catch (err) {
        console.error("Failed to fetch card types", err);
        errorMsg.value = 'Failed to load card types.';
    } finally {
        loading.value = false;
    }
};

// Edit State
const showEditModal = ref(false);
const editForm = ref<CardType>({} as CardType);

const handleEdit = (type: CardType) => {
    editForm.value = { ...type };
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editForm.value = {} as CardType;
};

const submitEdit = async () => {
    try {
        await request.put('/card-type/update', editForm.value); // Removed /api prefix
        alert(t('cardTypeManagement.alerts.updateSuccess'));
        closeEditModal();
        fetchCardTypes();
    } catch (err) {
        console.error("Update failed", err);
        alert(t('cardTypeManagement.alerts.updateFail'));
    }
};

// Add State
const showAddModal = ref(false);
const addForm = ref<CardType>({
    name: '',
    durationDays: 30,
    price: 0,
    description: '',
    status: 1
} as CardType);

const openAddModal = () => {
    addForm.value = {
        name: '',
        durationDays: 30,
        price: 0,
        description: '',
        status: 1
    } as CardType;
    showAddModal.value = true;
};

const closeAddModal = () => {
    showAddModal.value = false;
};

const submitAdd = async () => {
    try {
        await request.post('/card-type/add', addForm.value); // Removed /api prefix
        alert(t('cardTypeManagement.alerts.createSuccess'));
        closeAddModal();
        fetchCardTypes();
    } catch (err) {
        console.error("Create failed", err);
        alert(t('cardTypeManagement.alerts.createFail'));
    }
};

const handleDelete = async (id: number) => {
    if(!confirm(t('cardTypeManagement.alerts.deleteConfirm'))) {
        return;
    }
    try {
        await request.delete(`/card-type/delete/${id}`); // Removed /api prefix
        alert(t('cardTypeManagement.alerts.deleteSuccess'));
        fetchCardTypes();
    } catch (err) {
        console.error("Delete failed", err);
        alert(t('cardTypeManagement.alerts.deleteFail'));
    }
}

onMounted(() => {
    fetchCardTypes();
});
</script>

<style scoped>
/* 🏋️ Card Type Management - Admin Purple Theme */

.management-view {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions h1 {
  margin: 0;
  font-size: 2rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
  overflow-x: auto;
}

.data-table { width: 100%; border-collapse: collapse; min-width: 600px; }

.data-table th {
  padding: 16px;
  text-align: left;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  font-weight: 700;
  color: var(--text-secondary);
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-base);
}

.data-table tbody tr {
  transition: all var(--transition-base);
}

.data-table tbody tr:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%);
  transform: translateX(4px);
}

.price-cell {
  font-weight: 800;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.15) 100%);
  color: #c0392b;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.actions { display: flex; gap: 10px; }

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--admin-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-edit {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.2) 0%, rgba(243, 156, 18, 0.2) 100%);
  color: #f39c12;
  border: 1px solid rgba(241, 196, 15, 0.4);
}

.btn-edit:hover {
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: white;
  transform: translateY(-2px);
}

.btn-delete {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.2) 100%);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.4);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  transform: translateY(-2px);
}

.loading-state, .error-state, .empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.error-state { color: #e74c3c; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal-content.sm {
  position: relative;
  width: 500px;
  background: #fff;
  padding: 0;
  border-radius: var(--radius-xl);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-content.sm::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  background: var(--admin-gradient);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.close-btn:hover {
  color: #e74c3c;
  transform: rotate(90deg);
}

.modal-body { padding: 24px; }
.modal-footer { padding: 24px; text-align: right; border-top: 1px solid var(--border-light); }

.form-group { margin-bottom: 18px; }

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
