<template>
  <div class="app-layout">
    <aside class="sidebar" :data-role="authStore.userRole">
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
/* 🏋️ Main Layout - Dynamic Role-Based Theming */

.app-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-secondary);
  color: var(--text-primary);
  overflow: hidden;
}

/* Sidebar with Dynamic Gradient Based on Role */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  transition: all var(--transition-base);
}

/* Role-based sidebar gradients */
.sidebar[data-role="MEMBER"] {
  background: linear-gradient(180deg, #FF6B35 0%, #F7931E 100%);
}

.sidebar[data-role="COACH"] {
  background: linear-gradient(180deg, #00C9FF 0%, #92FE9D 100%);
}

.sidebar[data-role="ADMIN"] {
  background: linear-gradient(180deg, #667EEA 0%, #764BA2 100%);
}

/* Logo Section */
.logo {
  padding: 28px 24px;
  font-size: 1.75rem;
  font-weight: 900;
  font-family: var(--font-display);
  text-align: center;
  letter-spacing: -0.5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Navigation Menu */
.nav-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Navigation Items with Micro-interactions */
.nav-item {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  margin: 4px 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* Left indicator bar animation */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: white;
  border-radius: 0 4px 4px 0;
  transition: height var(--transition-base);
}

/* Hover background ripple */
.nav-item::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(4px);
}

.nav-item:hover::before,
.nav-item.active::before {
  height: 60%;
}

.nav-item:active::after {
  width: 200px;
  height: 200px;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Logout Button */
.logout {
  margin: 8px 12px;
  margin-top: auto;
  border-top: 2px solid rgba(255, 255, 255, 0.15);
  padding-top: 16px !important;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.2) 100%);
  color: white;
  font-weight: 600;
}

.logout:hover {
  background: var(--danger-gradient);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.4);
}

.logout::before {
  background: white;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top Bar with Glassmorphism */
.top-bar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 70px;
  z-index: 50;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Language Switch Pills */
.lang-switch {
  display: flex;
  gap: 6px;
  background: var(--bg-tertiary);
  padding: 4px;
  border-radius: 10px;
}

.lang-switch button {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.lang-switch button.active {
  background: white;
  color: var(--member-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.lang-switch button:hover:not(.active) {
  color: var(--text-primary);
}

/* User Info Badge */
.user-info {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: 8px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Page Content Area */
.page-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  overflow-x: hidden;
  animation: fadeInUp 0.4s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    width: 100%;
  }

  .page-content {
    padding: 20px 16px;
  }

  .top-bar {
    padding: 12px 16px;
  }

  .user-info {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}

/* Scrollbar Styling for Nav Menu */
.nav-menu::-webkit-scrollbar {
  width: 6px;
}

.nav-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.nav-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
