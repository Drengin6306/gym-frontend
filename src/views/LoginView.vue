<template>
  <div class="login-container" :data-role="loginForm.role">
    <!-- Animated Background Elements -->
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- Floating Geometric Shapes -->
    <div class="geometric-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <!-- Login Card -->
    <div class="login-card">
      <!-- Language Switcher -->
      <div class="lang-switcher">
        <button
          @click="switchLanguage('zh')"
          :class="['lang-btn', { active: locale === 'zh' }]"
          :data-role="loginForm.role"
        >
          中文
        </button>
        <button
          @click="switchLanguage('en')"
          :class="['lang-btn', { active: locale === 'en' }]"
          :data-role="loginForm.role"
        >
          EN
        </button>
      </div>

      <!-- Brand Header -->
      <div class="brand-section">
        <div class="logo-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20h8v24h-8zM44 20h8v24h-8zM24 12h16v40H24z" fill="white"/>
            <circle cx="32" cy="32" r="4" fill="white"/>
          </svg>
        </div>
        <h1 class="brand-title">{{ $t('login.title') }}</h1>
        <p class="brand-subtitle">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Role Selector with Dynamic Colors -->
      <div class="role-tabs">
        <button
          v-for="role in (['member', 'coach', 'admin'] as const)"
          :key="role"
          :class="['role-tab', { active: loginForm.role === role }]"
          :data-role="role"
          @click="loginForm.role = role"
        >
          <span class="role-icon">
            <template v-if="role === 'member'">💪</template>
            <template v-else-if="role === 'coach'">🎯</template>
            <template v-else>👑</template>
          </span>
          <span class="role-label">{{ $t(`login.role.${role}`) }}</span>
          <span class="role-glow"></span>
        </button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-wrapper">
          <label class="input-label">
            <span class="label-icon">👤</span>
            {{ $t('login.username') }}
          </label>
          <div class="input-container">
            <input
              type="text"
              v-model="loginForm.username"
              required
              :placeholder="$t('login.placeholder.username')"
              class="form-input"
            />
            <div class="input-border"></div>
          </div>
        </div>

        <div class="input-wrapper">
          <label class="input-label">
            <span class="label-icon">🔒</span>
            {{ $t('login.password') }}
          </label>
          <div class="input-container">
            <input
              type="password"
              v-model="loginForm.password"
              required
              :placeholder="$t('login.placeholder.password')"
              class="form-input"
            />
            <div class="input-border"></div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMsg }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="loading" :data-role="loginForm.role">
          <span class="btn-text">{{ loading ? $t('login.button.loggingIn') : $t('login.button.login') }}</span>
          <span class="btn-shine"></span>
          <span class="btn-particles">
            <span class="particle"></span>
            <span class="particle"></span>
            <span class="particle"></span>
          </span>
        </button>
      </form>

      <!-- Decorative Bottom Wave -->
      <div class="bottom-wave"></div>
    </div>

    <!-- Version Badge -->
    <div class="version-badge">v2.0</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import type { LoginRequest } from '@/types'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const router = useRouter()
const authStore = useAuthStore()

// 语言切换函数
const switchLanguage = (lang: string) => {
  locale.value = lang
}

const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
  role: 'member',
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await login(loginForm)
    if (res.code === 200) {
      authStore.setAuth(res.data)

      const roleRouteMap = {
        MEMBER: '/dashboard',
        COACH: '/coach/dashboard',
        ADMIN: '/admin/dashboard'
      }
      const targetRoute = roleRouteMap[res.data.role as keyof typeof roleRouteMap] || '/dashboard'
      router.push(targetRoute)
    } else {
      errorMsg.value = res.message || t('login.error.failed')
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = t('login.error.generic')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ========================================
   🏋️ GYM CLUB - ENERGIZED LOGIN EXPERIENCE
   Design Philosophy: Bold, Athletic, Dynamic
   ======================================== */

/* ===== COLOR SYSTEM ===== */
.login-container {
  --member-start: #FF6B35;
  --member-end: #F7931E;
  --coach-start: #00C9FF;
  --coach-end: #92FE9D;
  --admin-start: #667EEA;
  --admin-end: #764BA2;
}

/* ===== BASE CONTAINER ===== */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
  transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Dynamic Background Based on Role */
.login-container[data-role="member"] {
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF6B35 100%);
}

.login-container[data-role="coach"] {
  background: linear-gradient(135deg, #00C9FF 0%, #92FE9D 50%, #00C9FF 100%);
}

.login-container[data-role="admin"] {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #667EEA 100%);
}

/* ===== ANIMATED BACKGROUND ORBS ===== */
.bg-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.4;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(40px);
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  top: 50%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, -100px) scale(1.1); }
  66% { transform: translate(-100px, 100px) scale(0.9); }
}

/* ===== GEOMETRIC SHAPES ===== */
.geometric-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  opacity: 0.15;
  animation: rotate-shape 30s linear infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  background: linear-gradient(45deg, white, transparent);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  animation-duration: 25s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 70%;
  right: 15%;
  background: linear-gradient(135deg, white, transparent);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  animation-duration: 20s;
  animation-direction: reverse;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  background: linear-gradient(90deg, white, transparent);
  border-radius: 50%;
  animation-duration: 35s;
}

.shape-4 {
  width: 70px;
  height: 70px;
  top: 30%;
  right: 25%;
  background: linear-gradient(180deg, white, transparent);
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  animation-duration: 28s;
}

@keyframes rotate-shape {
  from { transform: rotate(0deg) translateY(0); }
  to { transform: rotate(360deg) translateY(20px); }
}

/* ===== LOGIN CARD ===== */
.login-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border-radius: 32px;
  padding: 56px 48px 48px;
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  animation: card-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

/* ===== LANGUAGE SWITCHER ===== */
.lang-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 6px;
  background: rgba(248, 250, 252, 0.8);
  padding: 4px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  z-index: 20;
  animation: fade-in-down 0.8s ease 0.1s both;
}

.lang-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.lang-btn:hover:not(.active) {
  background: rgba(226, 232, 240, 0.6);
  color: #475569;
}

.lang-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 角色主题色应用到活动语言按钮 */
.lang-btn.active[data-role="member"] {
  color: #FF6B35;
}

.lang-btn.active[data-role="coach"] {
  color: #00C9FF;
}

.lang-btn.active[data-role="admin"] {
  color: #667EEA;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ===== BRAND SECTION ===== */
.brand-section {
  text-align: center;
  margin-bottom: 40px;
  animation: fade-in-down 0.8s ease 0.2s both;
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: pulse-glow 2s ease-in-out infinite;
  transition: all 0.4s ease;
}

.login-container[data-role="coach"] .logo-icon {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
}

.login-container[data-role="admin"] .logo-icon {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 10px 50px rgba(255, 107, 53, 0.4);
    transform: scale(1.02);
  }
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
  fill: white;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 8px;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1.5px;
  transition: all 0.4s ease;
}

.login-container[data-role="coach"] .brand-title {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-container[data-role="admin"] .brand-title {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* ===== ROLE TABS ===== */
.role-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 36px;
  animation: fade-in-up 0.8s ease 0.3s both;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.role-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.role-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-tab[data-role="coach"]::before {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
}

.role-tab[data-role="admin"]::before {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
}

.role-tab.active::before {
  opacity: 1;
}

.role-tab:hover:not(.active) {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.role-tab.active {
  border-color: transparent;
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.role-icon {
  position: relative;
  font-size: 24px;
  z-index: 1;
  filter: grayscale(1);
  transition: filter 0.3s ease;
}

.role-tab.active .role-icon {
  filter: grayscale(0);
}

.role-label {
  position: relative;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  z-index: 1;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-tab.active .role-label {
  color: white;
}

.role-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.role-tab.active .role-glow {
  opacity: 0.3;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

/* ===== FORM STYLES ===== */
.login-form {
  animation: fade-in-up 0.8s ease 0.4s both;
}

.input-wrapper {
  margin-bottom: 24px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-icon {
  font-size: 16px;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 1rem;
  color: #1e293b;
  outline: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.input-border {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.login-container[data-role="coach"] .input-border {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
}

.login-container[data-role="admin"] .input-border {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
}

.form-input:focus + .input-border {
  opacity: 1;
}

/* ===== ERROR MESSAGE ===== */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 24px;
  animation: shake 0.5s ease, fade-in 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-8px); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.error-icon {
  font-size: 18px;
}

/* ===== SUBMIT BUTTON ===== */
.submit-btn {
  position: relative;
  width: 100%;
  padding: 18px 32px;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  margin-top: 12px;
}

.submit-btn[data-role="coach"] {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
}

.submit-btn[data-role="admin"] {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow:
    0 16px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(-2px) scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  position: relative;
  z-index: 2;
  display: inline-block;
  color: white;
}

/* Button Shine Effect */
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
  z-index: 1;
}

.submit-btn:hover:not(:disabled) .btn-shine {
  left: 100%;
}

/* Button Particles */
.btn-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  opacity: 0;
}

.submit-btn:hover:not(:disabled) .particle {
  animation: particle-float 1.5s ease-out;
}

.particle:nth-child(1) {
  left: 20%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  left: 50%;
  animation-delay: 0.2s;
}

.particle:nth-child(3) {
  left: 80%;
  animation-delay: 0.4s;
}

@keyframes particle-float {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}

/* ===== BOTTOM WAVE ===== */
.bottom-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, var(--member-start), var(--member-end));
  opacity: 0.05;
  clip-path: polygon(
    0 50%,
    10% 45%,
    20% 50%,
    30% 45%,
    40% 50%,
    50% 45%,
    60% 50%,
    70% 45%,
    80% 50%,
    90% 45%,
    100% 50%,
    100% 100%,
    0 100%
  );
  transition: background 0.4s ease;
}

.login-container[data-role="coach"] .bottom-wave {
  background: linear-gradient(135deg, var(--coach-start), var(--coach-end));
}

.login-container[data-role="admin"] .bottom-wave {
  background: linear-gradient(135deg, var(--admin-start), var(--admin-end));
}

/* ===== VERSION BADGE ===== */
.version-badge {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  z-index: 5;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 640px) {
  .login-card {
    padding: 40px 32px 32px;
    border-radius: 24px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
  }

  .logo-icon svg {
    width: 32px;
    height: 32px;
  }

  .role-tabs {
    gap: 8px;
  }

  .role-tab {
    padding: 12px 8px;
  }

  .role-icon {
    font-size: 20px;
  }

  .role-label {
    font-size: 0.75rem;
  }

  .submit-btn {
    font-size: 1rem;
    padding: 16px 24px;
  }

  .version-badge {
    bottom: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .role-tabs {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .role-tab.active {
    transform: scale(1);
  }

  .geometric-shapes {
    display: none;
  }
}
</style>
