<template>
  <div class="management-view">
    <div class="header-actions">
        <h1>{{ $t('coachManagement.title') }}</h1>
        <button class="btn btn-primary" @click="openAddModal">{{ $t('coachManagement.add') }}</button>
    </div>

    <div class="glass-panel">
        <div v-if="loading" class="loading-state">{{ $t('coachManagement.loading') }}</div>
        <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('coachManagement.columns.id') }}</th>
                    <th>{{ $t('coachManagement.columns.name') }}</th>
                    <th>{{ $t('coachManagement.columns.username') }}</th>
                    <th>{{ $t('coachManagement.columns.phone') }}</th>
                    <th>{{ $t('coachManagement.columns.specialty') }}</th>
                    <th>{{ $t('coachManagement.columns.experience') }}</th>
                    <th>{{ $t('coachManagement.columns.rate') }}</th>
                    <th>{{ $t('coachManagement.columns.status') }}</th>
                    <th>{{ $t('coachManagement.columns.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="coach in coaches" :key="coach.id">
                    <td>#{{ coach.id }}</td>
                    <td>{{ coach.realName }}</td>
                    <td>{{ coach.username }}</td>
                    <td>{{ coach.phone || '-' }}</td>
                    <td>{{ coach.specialty || '-' }}</td>
                    <td>{{ coach.experienceYears ? coach.experienceYears + ' yrs' : '-' }}</td>
                    <td>{{ coach.hourlyRate ? '¥' + coach.hourlyRate : '-' }}</td>
                    <td>
                        <span :class="['status-badge', coach.status === 1 ? 'active' : 'inactive']">
                            {{ coach.status === 1 ? $t('memberManagement.status.active') : $t('memberManagement.status.inactive') }}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-sm btn-edit" @click="handleEdit(coach)">{{ $t('memberManagement.actions.edit') }}</button>
                        <button class="btn-sm btn-delete" @click="handleDelete(coach.id)">{{ $t('memberManagement.actions.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="!loading && coaches.length === 0" class="empty-state">
            {{ $t('coachManagement.empty') }}
        </div>
    </div>

    <!-- Edit Coach Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('coachManagement.modal.editTitle') }}</h2>
                <button class="close-btn" @click="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitEdit">
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.username') }}</label>
                        <input type="text" v-model="editForm.username" disabled style="background:#f9f9f9; cursor: not-allowed;" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.realName') }}</label>
                        <input type="text" v-model="editForm.realName" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.phone') }}</label>
                        <input type="text" v-model="editForm.phone" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.specialty') }}</label>
                        <input type="text" v-model="editForm.specialty" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.experience') }}</label>
                        <input type="number" v-model="editForm.experienceYears" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.rate') }}</label>
                        <input type="number" v-model="editForm.hourlyRate" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.status') }}</label>
                        <select v-model="editForm.status">
                            <option :value="1">{{ $t('memberManagement.status.active') }}</option>
                            <option :value="0">{{ $t('memberManagement.status.inactive') }}</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('coachManagement.modal.save') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Add Coach Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('coachManagement.modal.addTitle') }}</h2>
                <button class="close-btn" @click="closeAddModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitAdd">
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.username') }}</label>
                        <input type="text" v-model="addForm.username" required placeholder="Login username" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.password') }}</label>
                        <input type="password" v-model="addForm.password" required placeholder="Login password" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.realName') }}</label>
                        <input type="text" v-model="addForm.realName" required placeholder="Full Name" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.phone') }}</label>
                        <input type="text" v-model="addForm.phone" placeholder="Phone Number" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.specialty') }}</label>
                        <input type="text" v-model="addForm.specialty" placeholder="e.g. Yoga, Pilates" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.experience') }}</label>
                        <input type="number" v-model="addForm.experienceYears" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.rate') }}</label>
                        <input type="number" v-model="addForm.hourlyRate" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachManagement.fields.gender') }}</label>
                        <select v-model="addForm.gender">
                            <option :value="1">{{ $t('common.gender.male') }}</option>
                            <option :value="0">{{ $t('common.gender.female') }}</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('coachManagement.modal.create') }}</button>
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
import type { Coach } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const coaches = ref<Coach[]>([]);
const loading = ref(false);
const errorMsg = ref('');

const fetchCoaches = async () => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const res = await request.get<any, Coach[]>('/coach/all'); // Removed /api prefix
        coaches.value = res; // Removed .data
    } catch (err) {
        console.error("Failed to fetch coaches", err);
        errorMsg.value = 'Failed to load coach data. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Edit State
const showEditModal = ref(false);
const editForm = ref<Coach>({} as Coach);

const handleEdit = (coach: Coach) => {
    editForm.value = { ...coach };
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editForm.value = {} as Coach;
};

const submitEdit = async () => {
    try {
        await request.put('/coach/update', editForm.value); // Removed /api prefix
        alert(t('coachManagement.alerts.updateSuccess'));
        closeEditModal();
        fetchCoaches();
    } catch (err) {
        console.error("Failed to update coach", err);
        alert("Failed to update coach.");
    }
};

// Add State
const showAddModal = ref(false);
const addForm = ref<Coach>({
    username: '',
    password: '',
    realName: '',
    phone: '',
    specialty: '',
    experienceYears: 0,
    hourlyRate: 0,
    gender: 1,
    status: 1
} as Coach);

const openAddModal = () => {
    addForm.value = {
        username: '',
        password: '',
        realName: '',
        phone: '',
        specialty: '',
        experienceYears: 0,
        hourlyRate: 0,
        gender: 1,
        status: 1
    } as Coach;
    showAddModal.value = true;
};

const closeAddModal = () => {
    showAddModal.value = false;
};

const submitAdd = async () => {
    try {
        await request.post('/coach/add', addForm.value); // Removed /api prefix
        alert(t('coachManagement.alerts.createSuccess'));
        closeAddModal();
        fetchCoaches();
    } catch (err) {
        console.error("Failed to create coach", err);
        alert("Failed to create coach.");
    }
};

const handleDelete = async (id: number) => {
    if(!confirm(t('coachManagement.alerts.deleteConfirm'))) {
        return;
    }

    try {
        await request.delete(`/coach/delete/${id}`); // Removed /api prefix
        alert(t('coachManagement.alerts.deleteSuccess'));
        fetchCoaches();
    } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete coach.");
    }
};

onMounted(() => {
    fetchCoaches();
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
    max-height: 90vh; /* Prevent modal from exceeding viewport height */
    overflow-y: auto; /* Scrollable content */
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
