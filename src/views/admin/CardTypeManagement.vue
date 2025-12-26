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
.management-view { padding: 20px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-actions h1 { margin: 0; font-size: 1.5rem; color: #2c3e50; }

.glass-panel {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    overflow-x: auto;
}

.data-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { font-weight: 600; color: #7f8c8d; background: #f8f9fa; }
.data-table tr:hover { background-color: #f8f9fa; }

.price-cell { font-weight: bold; color: #e67e22; }

.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
.status-badge.active { background: #e8f8f5; color: #2ecc71; }
.status-badge.inactive { background: #fdedec; color: #e74c3c; }

.actions { display: flex; gap: 10px; }
.btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
.btn-primary { background: #3498db; color: white; }
.btn-sm { padding: 4px 8px; font-size: 0.85em; border-radius: 4px; cursor: pointer; border: 1px solid transparent; }
.btn-edit { background: #f1c40f; color: #fff; }
.btn-delete { background: #e74c3c; color: #fff; }

.loading-state, .error-state, .empty-state { padding: 40px; text-align: center; color: #7f8c8d; }
.error-state { color: #e74c3c; }

/* Modal Styles */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
}
.modal-content.sm {
    width: 500px;
    background: #fff; padding: 0;
    border-radius: 12px;
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px; border-bottom: 1px solid #eee;
}
.modal-header h2 { margin: 0; font-size: 1.3rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; text-align: right; border-top: 1px solid #eee; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #34495e; }
.form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
</style>
