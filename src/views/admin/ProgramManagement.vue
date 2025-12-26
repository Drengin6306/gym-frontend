<template>
  <div class="management-view">
    <div class="header-actions">
        <h1>{{ $t('programManagement.title') }}</h1>
        <button class="btn btn-primary" @click="openAddModal">{{ $t('programManagement.add') }}</button>
    </div>

    <div class="glass-panel">
        <div v-if="loading" class="loading-state">{{ $t('programManagement.loading') }}</div>
        <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('programManagement.columns.id') }}</th>
                    <th>{{ $t('programManagement.columns.name') }}</th>
                    <th>{{ $t('programManagement.columns.coach') }}</th>
                    <th>{{ $t('programManagement.columns.type') }}</th>
                    <th>{{ $t('programManagement.columns.duration') }}</th>
                    <th>{{ $t('programManagement.columns.maxSize') }}</th>
                    <th>{{ $t('programManagement.columns.price') }}</th>
                    <th>{{ $t('programManagement.columns.difficulty') }}</th>
                    <th>{{ $t('programManagement.columns.status') }}</th>
                    <th>{{ $t('programManagement.columns.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="program in programs" :key="program.id">
                    <td>#{{ program.id }}</td>
                    <td>
                        <strong>{{ program.name }}</strong>
                        <div class="text-xs text-gray">{{ program.description }}</div>
                    </td>
                    <td>{{ program.coach?.realName || 'Unknown' }}</td>
                    <td>{{ getTypeName(program.type) }}</td>
                    <td>{{ program.durationMinutes }}m</td>
                    <td>{{ program.maxParticipants }}</td>
                    <td>¥{{ program.price }}</td>
                    <td>{{ getDifficultyName(program.difficultyLevel) }}</td>
                    <td>
                        <span :class="['status-badge', program.status === 1 ? 'active' : 'inactive']">
                            {{ program.status === 1 ? $t('programManagement.status.active') : $t('programManagement.status.offline') }}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-sm btn-edit" @click="handleEdit(program)">{{ $t('memberManagement.actions.edit') }}</button>
                        <button class="btn-sm btn-delete" @click="handleDelete(program.id)">{{ $t('memberManagement.actions.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>

         <div v-if="!loading && programs.length === 0" class="empty-state">
            {{ $t('programManagement.empty') }}
        </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('programManagement.modal.editTitle') }}</h2>
                <button class="close-btn" @click="closeEditModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitEdit">
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.name') }}</label>
                        <input type="text" v-model="editForm.name" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.coach') }}</label>
                        <select v-model="editForm.coachId" required>
                            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
                                {{ coach.realName }} ({{ coach.specialty || 'General' }})
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.type') }}</label>
                        <select v-model="editForm.type">
                            <option :value="1">{{ $t('programManagement.type.group') }}</option>
                            <option :value="2">{{ $t('programManagement.type.private') }}</option>
                            <option :value="3">{{ $t('programManagement.type.free') }}</option>
                        </select>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.duration') }}</label>
                            <input type="number" v-model="editForm.durationMinutes" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.maxSize') }}</label>
                            <input type="number" v-model="editForm.maxParticipants" required />
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.price') }}</label>
                            <input type="number" v-model="editForm.price" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.difficulty') }}</label>
                            <select v-model="editForm.difficultyLevel">
                                <option :value="1">{{ $t('programManagement.difficulty.beginner') }}</option>
                                <option :value="2">{{ $t('programManagement.difficulty.intermediate') }}</option>
                                <option :value="3">{{ $t('programManagement.difficulty.advanced') }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.description') }}</label>
                        <input type="text" v-model="editForm.description" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.status') }}</label>
                        <select v-model="editForm.status">
                            <option :value="1">{{ $t('programManagement.status.active') }}</option>
                            <option :value="0">{{ $t('programManagement.status.offline') }}</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('programManagement.modal.save') }}</button>
                    </div>
                </form>
             </div>
        </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ $t('programManagement.modal.addTitle') }}</h2>
                <button class="close-btn" @click="closeAddModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitAdd">
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.name') }}</label>
                        <input type="text" v-model="addForm.name" required />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.coach') }}</label>
                        <select v-model="addForm.coachId" required>
                            <option value="" disabled selected>{{ $t('programManagement.modal.selectCoach') }}</option>
                            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
                                {{ coach.realName }} ({{ coach.specialty || 'General' }})
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.type') }}</label>
                        <select v-model="addForm.type">
                            <option :value="1">{{ $t('programManagement.type.group') }}</option>
                            <option :value="2">{{ $t('programManagement.type.private') }}</option>
                            <option :value="3">{{ $t('programManagement.type.free') }}</option>
                        </select>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.duration') }}</label>
                            <input type="number" v-model="addForm.durationMinutes" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.maxSize') }}</label>
                            <input type="number" v-model="addForm.maxParticipants" required />
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.price') }}</label>
                            <input type="number" v-model="addForm.price" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('programManagement.fields.difficulty') }}</label>
                            <select v-model="addForm.difficultyLevel">
                                <option :value="1">{{ $t('programManagement.difficulty.beginner') }}</option>
                                <option :value="2">{{ $t('programManagement.difficulty.intermediate') }}</option>
                                <option :value="3">{{ $t('programManagement.difficulty.advanced') }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.description') }}</label>
                        <input type="text" v-model="addForm.description" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('programManagement.fields.status') }}</label>
                        <select v-model="addForm.status">
                            <option :value="1">{{ $t('programManagement.status.active') }}</option>
                            <option :value="0">{{ $t('programManagement.status.offline') }}</option>
                        </select>
                    </div>
                    <div class="modal-footer" style="padding-bottom:0; border-top:none;">
                        <button type="submit" class="btn btn-primary">{{ $t('programManagement.modal.create') }}</button>
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
import type { FitnessProgram, Coach } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const programs = ref<FitnessProgram[]>([]);
const coaches = ref<Coach[]>([]);
const loading = ref(false);
const errorMsg = ref('');

const fetchPrograms = async () => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const res = await request.get<any, FitnessProgram[]>('/fitness-program/all'); // Removed /api prefix
        programs.value = res; // Removed .data
    } catch (err) {
        console.error("Failed to fetch programs", err);
        errorMsg.value = 'Failed to load courses.';
    } finally {
        loading.value = false;
    }
};

const fetchCoaches = async () => {
    try {
        const res = await request.get<any, Coach[]>('/coach/all'); // Removed /api prefix
        coaches.value = res; // Removed .data
    } catch(err) {
        console.error("Failed to fetch coaches", err);
    }
}

// Helpers
const getTypeName = (type: number) => {
    switch(type) {
        case 1: return t('programManagement.type.group');
        case 2: return t('programManagement.type.private');
        case 3: return t('programManagement.type.free');
        default: return t('programManagement.type.unknown');
    }
};

const getDifficultyName = (level: number) => {
    switch(level) {
        case 1: return t('programManagement.difficulty.beginner');
        case 2: return t('programManagement.difficulty.intermediate');
        case 3: return t('programManagement.difficulty.advanced');
        default: return '-';
    }
};

// Edit State
const showEditModal = ref(false);
const editForm = ref<FitnessProgram>({} as FitnessProgram);

const handleEdit = (program: FitnessProgram) => {
    editForm.value = { ...program };
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editForm.value = {} as FitnessProgram;
};

const submitEdit = async () => {
    try {
        await request.put('/fitness-program/update', editForm.value); // Removed /api prefix
        alert(t('programManagement.alerts.updateSuccess'));
        closeEditModal();
        fetchPrograms();
    } catch (err) {
        console.error("Failed to update course", err);
        alert(t('programManagement.alerts.updateFail'));
    }
};

// Add State
const showAddModal = ref(false);
const addForm = ref<FitnessProgram>({
    name: '',
    type: 1,
    coachId: 0, // Will be bound to selector
    description: '',
    durationMinutes: 60,
    maxParticipants: 10,
    price: 0,
    difficultyLevel: 1,
    status: 1
} as FitnessProgram);

const openAddModal = () => {
     addForm.value = {
        name: '',
        type: 1,
        coachId: coaches.value.length > 0 ? coaches.value[0].id : 0,
        description: '',
        durationMinutes: 60,
        maxParticipants: 10,
        price: 0,
        difficultyLevel: 1,
        status: 1
    } as FitnessProgram;
    showAddModal.value = true;
};

const closeAddModal = () => {
    showAddModal.value = false;
};

const submitAdd = async () => {
    try {
        await request.post('/fitness-program/add', addForm.value); // Removed /api prefix
        alert(t('programManagement.alerts.createSuccess'));
        closeAddModal();
        fetchPrograms();
    } catch (err) {
        console.error("Failed to create course", err);
        alert(t('programManagement.alerts.createFail'));
    }
};

const handleDelete = async (id: number) => {
    if(!confirm(t('programManagement.alerts.deleteConfirm'))) {
        return;
    }
    try {
        await request.delete(`/fitness-program/delete/${id}`); // Removed /api prefix
         alert(t('programManagement.alerts.deleteSuccess'));
         fetchPrograms();
    } catch (err) {
        console.error("Delete failed", err);
        alert(t('programManagement.alerts.deleteFail'));
    }
}

onMounted(() => {
    fetchPrograms();
    fetchCoaches(); // Load for selector
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

.data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { font-weight: 600; color: #7f8c8d; background: #f8f9fa; }
.data-table tr:hover { background-color: #f8f9fa; }

.text-xs { font-size: 0.8em; }
.text-gray { color: #7f8c8d; }

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
    width: 600px; /* Slightly wider for form grid */
    background: #fff; padding: 0;
    border-radius: 12px;
    max-height: 90vh;
    overflow-y: auto;
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

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
</style>
