<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">Gym Club</div>
      <nav class="nav-menu">
        <router-link v-if="authStore.userRole === 'MEMBER'" to="/dashboard" class="nav-item" active-class="active">
          {{ $t('nav.dashboard') }}
        </router-link>

        <template v-if="authStore.userRole === 'MEMBER'">
            <router-link to="/member/courses" class="nav-item">{{ $t('nav.courses') }}</router-link>
            <router-link to="/member/coaches" class="nav-item">{{ $t('nav.coaches') }}</router-link>
            <router-link to="/my-courses" class="nav-item">{{ $t('nav.myBookings') }}</router-link>
            <router-link to="/member/membership" class="nav-item">{{ $t('nav.membership') }}</router-link>
            <router-link to="/member/attendance" class="nav-item">{{ $t('nav.attendance') }}</router-link>
            <router-link to="/member/payments" class="nav-item">{{ $t('nav.payments') }}</router-link>
        </template>

        <template v-if="authStore.userRole === 'COACH'">
            <router-link to="/coach/dashboard" class="nav-item">{{ $t('nav.dashboard') }}</router-link>
            <router-link to="/coach/students" class="nav-item">{{ $t('nav.myStudents') }}</router-link>
            <router-link to="/coach/courses" class="nav-item">{{ $t('coachCourseManagement.title') }}</router-link>
            <router-link to="/coach/schedule" class="nav-item">{{ $t('nav.mySchedule') }}</router-link>
        </template>

        <template v-if="authStore.userRole === 'ADMIN'">
            <router-link to="/admin/dashboard" class="nav-item">{{ $t('nav.dashboard') }}</router-link>
            <router-link to="/admin/members" class="nav-item">{{ $t('nav.members') }}</router-link>
            <router-link to="/admin/coaches" class="nav-item">{{ $t('nav.coaches') }}</router-link>
            <router-link to="/admin/programs" class="nav-item">{{ $t('nav.programs') }}</router-link>
            <router-link to="/admin/card-types" class="nav-item">{{ $t('nav.cardInfo') }}</router-link>
            <router-link to="/admin/facilities" class="nav-item">{{ $t('nav.facilities') }}</router-link>
            <router-link to="/admin/attendance" class="nav-item">{{ $t('nav.attendance') }}</router-link>
        </template>

        <div class="nav-item logout" @click="handleLogout">{{ $t('nav.logout') }}</div>
      </nav>
    </aside>
    <main class="main-content">
      <header class="top-bar">
        <div class="header-right">
             <div class="lang-switch">
                <button @click="switchLang('zh')" :class="{ active: locale === 'zh' }">中文</button>
                <button @click="switchLang('en')" :class="{ active: locale === 'en' }">EN</button>
             </div>
             <div class="user-info">{{ authStore.user?.username }} ({{ authStore.userRole }})</div>
        </div>
      </header>
      <div class="page-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const router = useRouter()
const { locale } = useI18n()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const switchLang = (lang: string) => {
    locale.value = lang;
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  color: #333;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 15px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.nav-item:hover,
.nav-item.active {
  background-color: #34495e;
  color: #fff;
  border-left: 4px solid #3498db;
}

.logout {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #e74c3c;
}

.logout:hover {
  background-color: rgba(231, 76, 60, 0.1);
  color: #ff6b6b;
  border-left: 4px solid #e74c3c;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  background-color: #fff;
  padding: 15px 30px;
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.lang-switch {
    display: flex;
    gap: 5px;
}

.lang-switch button {
    border: 1px solid #ddd;
    background: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.lang-switch button.active {
    background: #3498db;
    color: #fff;
    border-color: #3498db;
}

.user-info {
  font-weight: 600;
  color: #2c3e50;
}

.page-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>
