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
.coach-list-page { padding: 20px; }
.coach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-top: 20px; }
.coach-card { padding: 20px; text-align: center; background: rgba(255,255,255,0.9); border-radius: 12px; transition: transform 0.2s; position: relative; overflow: hidden; cursor: pointer; }
.coach-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.card-header { position: relative; margin-bottom: 15px; }
.avatar-placeholder { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 32px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; color: #fff; font-weight: bold; }
.status-badge.available { background-color: #2ecc71; }
.status-badge.busy { background-color: #e74c3c; }
.coach-card .status-badge { position: absolute; top: 0; right: 0; }

.specialization { color: #3498db; font-weight: 600; margin: 5px 0; font-size: 0.9rem; }
.desc-snippet { font-size: 0.85rem; color: #777; margin: 10px 0; }
.card-stats { margin-top: 10px; font-size: 0.8rem; color: #555; background: #f0f4f8; padding: 4px; border-radius: 4px; display: inline-block; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; animation: fadeIn 0.3s; }
.modal { background: #fff; border-radius: 16px; width: 95%; max-width: 600px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center; max-height: 90vh; overflow-y: auto; }
.modal-header { margin-bottom: 20px; text-align: center; }
.avatar-large { width: 100px; height: 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; font-size: 40px; display: flex; justify-content: center; align-items: center; margin: 0 auto 15px; }
.badges { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }

.section { margin: 25px 0; text-align: left; }
.section h4 { border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; margin-bottom: 15px; color: #333; font-size: 1.1rem; }

.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; text-align: left; background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
.info-item label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
.info-item p { font-weight: 600; color: #333; margin: 0; font-size: 1rem; }

.course-item { display: flex; justify-content: space-between; padding: 12px 15px; background: #fff; border: 1px solid #eee; border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; }
.course-item:hover { border-color: #3498db; }
.course-name { font-weight: 600; color: #444; }
.course-price { color: #2ecc71; font-weight: bold; }
.close-btn { background: #f1f5f9; color: #475569; border: none; padding: 12px 40px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background 0.2s; width: 100%; }
.close-btn:hover { background: #e2e8f0; }

.gender-badge { background: #e0e7ff; color: #4f46e5; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
