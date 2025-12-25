<template>
  <div class="course-management container">
    <!-- Header -->
    <header class="page-header">
       <h1>{{ $t('coachCourseManagement.title') }}</h1>
       <button class="btn-primary" @click="openAddModal">
           {{ $t('coachCourseManagement.add') }}
       </button>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
        {{ $t('coachCourseManagement.loading') }}
    </div>

    <!-- Empty State -->
    <div v-else-if="courses.length === 0" class="empty-state glass-panel">
        <p>{{ $t('coachCourseManagement.empty') }}</p>
    </div>

    <!-- Course List -->
    <div v-else class="course-list">
        <div v-for="course in courses" :key="course.id" class="course-card glass-panel">
             <div class="card-header">
                 <h3>{{ course.name }}</h3>
                 <span class="status-badge" :class="course.status === 1 ? 'active' : 'inactive'">
                     {{ course.status === 1 ? 'Active' : 'Offline' }}
                 </span>
             </div>
             <div class="card-body">
                 <p class="description">{{ course.description || 'No description provided.' }}</p>
                 <div class="details-grid">
                     <div class="detail-item">
                         <span class="label">{{ $t('coachCourseManagement.type') }}:</span>
                         <span class="value">{{ course.type === 1 ? 'Group' : 'Private' }}</span>
                     </div>
                     <div class="detail-item">
                         <span class="label">{{ $t('coachCourseManagement.duration') }}:</span>
                         <span class="value">{{ course.durationMinutes }} min</span>
                     </div>
                     <div class="detail-item">
                         <span class="label">{{ $t('coachCourseManagement.price') }}:</span>
                         <span class="value">${{ course.price }}</span>
                     </div>
                     <div class="detail-item">
                         <span class="label">{{ $t('coachCourseManagement.maxParticipants') }}:</span>
                         <span class="value">{{ course.maxParticipants }}</span>
                     </div>
                 </div>
             </div>
             <div class="card-actions">
                 <button class="btn-secondary btn-sm" @click="openEditModal(course)">
                     {{ $t('coachCourseManagement.edit') }}
                 </button>
                 <button class="btn-danger btn-sm" @click="confirmDelete(course.id)">
                     {{ $t('coachCourseManagement.delete') }}
                 </button>
             </div>
        </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="modal glass-panel">
            <h2>{{ isEditing ? $t('coachCourseManagement.modal.editTitle') : $t('coachCourseManagement.modal.addTitle') }}</h2>
            <form @submit.prevent="handleSubmit" class="course-form">

                <div class="form-group">
                    <label>{{ $t('coachCourseManagement.fields.name') }}</label>
                    <input v-model="form.name" required type="text" />
                </div>

                <div class="form-group">
                    <label>{{ $t('coachCourseManagement.fields.description') }}</label>
                    <textarea v-model="form.description" rows="3"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.type') }}</label>
                        <select v-model.number="form.type" required>
                            <option :value="1">Group Class</option>
                            <option :value="2">Private Session</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.difficulty') }}</label>
                        <select v-model.number="form.difficultyLevel" required>
                            <option :value="1">Beginner</option>
                            <option :value="2">Intermediate</option>
                            <option :value="3">Advanced</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.duration') }}</label>
                        <input v-model.number="form.durationMinutes" type="number" required min="10" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.price') }}</label>
                        <input v-model.number="form.price" type="number" required min="0" step="0.01" />
                    </div>
                </div>

                 <div class="form-row">
                    <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.max') }}</label>
                        <input v-model.number="form.maxParticipants" type="number" required min="1" />
                    </div>
                    <div class="form-group">
                        <label>{{ $t('coachCourseManagement.fields.status') }}</label>
                        <select v-model.number="form.status" required>
                            <option :value="1">Active</option>
                            <option :value="0">Offline</option>
                        </select>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" @click="showModal = false">
                        {{ $t('coachCourseManagement.modal.cancel') }}
                    </button>
                    <button type="submit" class="btn-primary">
                        {{ isEditing ? $t('coachCourseManagement.modal.save') : $t('coachCourseManagement.modal.create') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { FitnessProgram } from '@/types';
import { getProgramsByCoach, addProgram, updateProgram, deleteProgram } from '@/api/course';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const authStore = useAuthStore();
const courses = ref<FitnessProgram[]>([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive<Partial<FitnessProgram>>({
    name: '',
    description: '',
    coachId: authStore.user?.id,
    price: 0,
    durationMinutes: 60,
    maxParticipants: 10,
    difficultyLevel: 1,
    type: 1,
    status: 1
});

const fetchCourses = async () => {
    if (!authStore.user) return;
    loading.value = true;
    try {
        const res = await getProgramsByCoach(authStore.user.id);
        courses.value = res || [];
    } catch (err) {
        console.error('Failed to load courses', err);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchCourses);

const openAddModal = () => {
    isEditing.value = false;
    Object.assign(form, {
        id: undefined,
        name: '',
        description: '',
        coachId: authStore.user?.id,
        price: 0,
        durationMinutes: 60,
        maxParticipants: 10,
        difficultyLevel: 1,
        type: 1,
        status: 1
    });
    showModal.value = true;
};

const openEditModal = (course: FitnessProgram) => {
    isEditing.value = true;
    Object.assign(form, course);
    showModal.value = true;
};

const handleSubmit = async () => {
    try {
        if (isEditing.value && form.id) {
            await updateProgram(form);
            alert(t('coachCourseManagement.alerts.updateSuccess'));
        } else {
            // Ensure coachId is set
            if (!form.coachId) form.coachId = authStore.user?.id;
            await addProgram(form);
            alert(t('coachCourseManagement.alerts.createSuccess'));
        }
        showModal.value = false;
        fetchCourses();
    } catch (err) {
        console.error(err);
        alert('Operation failed');
    }
};

const confirmDelete = async (id: number) => {
    if(!confirm(t('coachCourseManagement.alerts.deleteConfirm'))) return;
    try {
        await deleteProgram(id);
        alert(t('coachCourseManagement.alerts.deleteSuccess'));
        fetchCourses();
    } catch (err) {
        console.error(err);
        alert('Delete failed');
    }
};
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.course-card {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fff;
    transition: transform 0.2s;
}
.course-card:hover { transform: translateY(-3px); }

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.card-header h3 { font-size: 1.2rem; color: var(--secondary-color); }
.status-badge {
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
}
.status-badge.active { background: #d4edda; color: #155724; }
.status-badge.inactive { background: #f8d7da; color: #721c24; }

.description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 15px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 0.9rem;
    margin-bottom: 20px;
}
.label { color: #999; margin-right: 5px; }
.value { font-weight: 500; }

.card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.btn-sm {
    padding: 5px 12px;
    font-size: 0.8rem;
    border-radius: 4px;
}
.btn-danger {
    background: #fff;
    border: 1px solid #dc3545;
    color: #dc3545;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-danger:hover { background: #dc3545; color: #fff; }

/* Modal Form */
.course-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
label { font-weight: 500; font-size: 0.9rem; color: var(--secondary-color); }
input, select, textarea {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
}
input:focus, select:focus, textarea:focus { border-color: var(--primary-color); outline: none; }

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
}

.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
}
.modal {
    width: 90%; max-width: 500px;
    padding: 30px;
    background: #fff;
    max-height: 90vh;
    overflow-y: auto;
}
.modal h2 { margin-bottom: 20px; text-align: center; }
</style>
