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
/* 🏋️ Coach Course Management - Professional Cyan-Green Theme */

.course-management {
  animation: fadeInUp 0.4s ease-out;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-light);
}

.page-header h1 {
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin: 0;
}

/* ===== Course Grid ===== */
.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* ===== Course Cards with Gradient Border ===== */
.course-card {
  position: relative;
  padding: 3px;
  background: var(--coach-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.course-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.course-card > * {
  position: relative;
  z-index: 2;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--coach-shadow);
}

/* ===== Card Header ===== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 20px 20px 12px 20px;
  border-bottom: 2px solid var(--border-light);
}

.card-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

/* ===== Card Body ===== */
.card-body {
  padding: 0 20px 16px 20px;
}

.description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  color: var(--text-light);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.value {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1rem;
}

/* ===== Card Actions ===== */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 20px 20px;
  border-top: 1px solid var(--border-light);
  padding-top: 16px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.875rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  transition: all var(--transition-base);
  cursor: pointer;
}

.btn-danger {
  background: white;
  border: 2px solid #dc3545;
  color: #dc3545;
}

.btn-danger:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* ===== Loading & Empty States ===== */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.empty-state {
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-medium);
}

/* ===== Modal ===== */
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

.modal {
  width: 90%;
  max-width: 550px;
  padding: 40px;
  background: white;
  border-radius: var(--radius-xl);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 3px solid transparent;
  background-clip: padding-box;
  position: relative;
}

.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--coach-gradient);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal h2 {
  margin: 0 0 28px 0;
  text-align: center;
  background: var(--coach-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.75rem;
}

/* ===== Form Styles ===== */
.course-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

input,
select,
textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all var(--transition-base);
  background: white;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--coach-primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 201, 255, 0.1);
  transform: translateY(-1px);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

/* ===== Modal Actions ===== */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--border-light);
}

/* ===== Button Overrides ===== */
.btn-primary {
  background: var(--coach-gradient);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(0, 201, 255, 0.3);
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
  box-shadow: 0 6px 24px rgba(0, 201, 255, 0.5);
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-secondary {
  background: white;
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  padding: 12px 28px;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--coach-primary);
  color: var(--coach-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .course-list {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 28px 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
