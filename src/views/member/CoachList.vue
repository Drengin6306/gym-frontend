<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllCoaches, getCoachCourses } from '@/api/coach';
import type { Coach, FitnessProgram } from '@/types';

const coaches = ref<Coach[]>([]);
const loading = ref(false);
const error = ref('');

// Modal State
const currentCoach = ref<Coach | null>(null);
const coachCourses = ref<FitnessProgram[]>([]);
const loadingCourses = ref(false);

const fetchData = async () => {
    loading.value = true;
    try {
        const data = await getAllCoaches();
        coaches.value = data;
    } catch {
        error.value = 'Failed to load coaches';
    } finally {
        loading.value = false;
    }
};

const openCoachModal = async (coach: Coach) => {
    currentCoach.value = coach;
    loadingCourses.value = true;
    coachCourses.value = [];
    try {
        const courses = await getCoachCourses(coach.id);
        coachCourses.value = courses;
    } catch (e) {
        console.error(e);
    } finally {
        loadingCourses.value = false;
    }
};

const closeModal = () => {
    currentCoach.value = null;
    coachCourses.value = [];
};

onMounted(() => {
    fetchData();
});
</script>

<template>
  <div class="coach-list-page">
    <h1>{{ $t('coach.title') }}</h1>

    <div v-if="loading" class="loading">{{ $t('coach.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="coach-grid">
      <div
        v-for="coach in coaches"
        :key="coach.id"
        class="coach-card glass-panel"
        @click="openCoachModal(coach)"
      >
        <div class="card-header">
            <div class="avatar-placeholder">{{ coach.realName.charAt(0) }}</div>
            <span :class="['status-badge', coach.status === 1 ? 'available' : 'busy']">
              {{ coach.status === 1 ? $t('coach.status.available') : $t('coach.status.busy') }}
            </span>
        </div>
        <h3>{{ coach.realName }}</h3>
        <p class="specialization">{{ coach.specialty || $t('coach.general') }}</p>
        <p class="desc-snippet">{{ coach.description?.substring(0, 60) }}...</p>
        <div class="card-stats">
             <span v-if="coach.experienceYears">{{ coach.experienceYears }} {{ $t('coach.exp') }}</span>
        </div>
      </div>
    </div>

  <!-- Coach Detail Modal -->
  <div v-if="currentCoach" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
          <div class="modal-header">
              <div class="avatar-large">{{ currentCoach.realName.charAt(0) }}</div>
              <h2>{{ currentCoach.realName }}</h2>
              <div class="badges">
                  <span :class="['status-badge', currentCoach.status === 1 ? 'available' : 'busy']">
                    {{ currentCoach.status === 1 ? $t('coach.status.available') : $t('coach.status.busy') }}
                  </span>
                  <span v-if="currentCoach.gender !== undefined" class="gender-badge">
                      {{ currentCoach.gender === 1 ? $t('common.gender.male') : $t('common.gender.female') }}
                  </span>
              </div>
          </div>

          <div class="modal-body">
              <div class="info-grid">
                  <div class="info-item">
                      <label>{{ $t('coach.specialty') }}</label>
                      <p>{{ currentCoach.specialty || $t('coach.general') }}</p>
                  </div>
                  <div class="info-item" v-if="currentCoach.experienceYears">
                      <label>{{ $t('coach.experience') }}</label>
                      <p>{{ currentCoach.experienceYears }} {{ $t('coach.exp') }}</p>
                  </div>
                  <div class="info-item" v-if="currentCoach.hourlyRate">
                      <label>{{ $t('coach.hourlyRate') }}</label>
                      <p>${{ currentCoach.hourlyRate }}/hr</p>
                  </div>
                  <div class="info-item" v-if="currentCoach.certificate">
                       <label>{{ $t('coach.certificate') }}</label>
                       <p>{{ currentCoach.certificate }}</p>
                  </div>
              </div>

              <div class="section">
                  <h4>{{ $t('coach.about') }}</h4>
                  <p>{{ currentCoach.description || $t('coach.noDesc') }}</p>
              </div>

              <div class="section">
                  <h4>{{ $t('coach.coursesTaught') }}</h4>
                  <div v-if="loadingCourses">{{ $t('common.loading') }}</div>
                  <div v-else-if="coachCourses.length === 0" class="no-courses">{{ $t('coach.noCourses') }}</div>
                  <div v-else class="course-list-mini">
                      <div v-for="course in coachCourses" :key="course.id" class="course-item">
                          <span class="course-name">{{ course.name }}</span>
                          <span class="course-price">${{ course.price }}</span>
                      </div>
                  </div>
              </div>
          </div>
          <button @click="closeModal" class="close-btn">{{ $t('common.close') }}</button>
      </div>
  </div>

  </div>
</template>

<style scoped>
/* 🏋️ Coach List - Member Orange Theme */

.coach-list-page {
  padding: 32px;
  animation: fadeInUp 0.4s ease-out;
}

.coach-list-page h1 {
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 24px;
}

.loading, .error {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error { color: #e74c3c; }

/* ===== Coach Grid ===== */
.coach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

/* ===== Coach Card with Gradient Border ===== */
.coach-card {
  position: relative;
  padding: 3px;
  background: var(--member-gradient);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.coach-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.coach-card > * {
  position: relative;
  z-index: 2;
}

.coach-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--member-shadow);
}

.card-header {
  position: relative;
  margin-bottom: 15px;
  padding: 20px 20px 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: var(--member-gradient);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
}

.status-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  color: #fff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.available {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.status-badge.busy {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.coach-card .status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
}

.coach-card h3 {
  text-align: center;
  padding: 0 20px;
  margin: 0 0 8px;
  color: var(--text-primary);
  font-weight: 700;
}

.specialization {
  text-align: center;
  padding: 0 20px;
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  margin: 5px 0;
  font-size: 0.9rem;
}

.desc-snippet {
  text-align: center;
  padding: 0 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 10px 0;
  line-height: 1.5;
}

.card-stats {
  margin: 15px 20px 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 600;
}

/* ===== Modal Styles ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal {
  position: relative;
  background: #fff;
  border-radius: var(--radius-xl);
  width: 95%;
  max-width: 600px;
  padding: 0;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Modal Top Gradient Bar */
.modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--member-gradient);
}

.modal-header {
  margin-bottom: 20px;
  text-align: center;
  padding: 30px 30px 0;
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: var(--member-gradient);
  color: white;
  border-radius: 50%;
  font-size: 40px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.badges {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}

.modal-body {
  padding: 0 30px 30px;
}

.section {
  margin: 25px 0;
  text-align: left;
}

.section h4 {
  border-bottom: 2px solid rgba(255, 107, 53, 0.2);
  padding-bottom: 8px;
  margin-bottom: 15px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  text-align: left;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 100%);
  padding: 20px;
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

.info-item label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-item p {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 1rem;
}

.no-courses {
  color: var(--text-secondary);
  text-align: center;
  padding: 20px;
}

.course-list-mini {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
  background: #fff;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.course-item:hover {
  border-color: rgba(255, 107, 53, 0.5);
  transform: translateX(4px);
}

.course-name {
  font-weight: 600;
  color: var(--text-primary);
}

.course-price {
  background: var(--member-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.close-btn {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(247, 147, 30, 0.1) 100%);
  color: #e67e22;
  border: 2px solid rgba(255, 107, 53, 0.3);
  padding: 14px 40px;
  border-radius: var(--radius-full);
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: all var(--transition-base);
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn:hover {
  background: var(--member-gradient);
  color: white;
  border-color: transparent;
}

.gender-badge {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(247, 147, 30, 0.15) 100%);
  color: #e67e22;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .coach-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
