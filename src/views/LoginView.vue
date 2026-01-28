<template>
  <div class="login-container">
    <div class="login-card glass-panel">
      <h2 class="title">{{ $t('login.title') }}</h2>
      <p class="subtitle">{{ $t('login.subtitle') }}</p>

      <div class="role-selector">
        <button :class="{ active: loginForm.role === 'member' }" @click="loginForm.role = 'member'">
          {{ $t('login.role.member') }}
        </button>
        <button :class="{ active: loginForm.role === 'coach' }" @click="loginForm.role = 'coach'">
          {{ $t('login.role.coach') }}
        </button>
        <button :class="{ active: loginForm.role === 'admin' }" @click="loginForm.role = 'admin'">
          {{ $t('login.role.admin') }}
        </button>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>{{ $t('login.username') }}</label>
          <input
            type="text"
            v-model="loginForm.username"
            required
            :placeholder="$t('login.placeholder.username')"
          />
        </div>

        <div class="input-group">
          <label>{{ $t('login.password') }}</label>
          <input
            type="password"
            v-model="loginForm.password"
            required
            :placeholder="$t('login.placeholder.password')"
          />
        </div>

        <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? $t('login.button.loggingIn') : $t('login.button.login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import type { LoginRequest } from '@/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')

const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
  role: 'member', // Default role
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const res = await login(loginForm)
    if (res.code === 200) {
      authStore.setAuth(res.data) // Store user info
      router.push('/dashboard') // distinct dashboard logic can be handled in router or dashboard component
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
/* 🏋️ Login Page - High Energy Fitness Theme */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Animated Background Pattern */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  animation: rotateBackground 20s linear infinite;
  pointer-events: none;
}

@keyframes rotateBackground {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Enhanced Glass Panel */
.glass-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 1;
}

/* Logo/Title Section */
.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
  animation: shimmer 3s ease-in-out infinite;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Role Selector Pills */
.role-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 6px;
}

.role-selector button {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.role-selector button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
}

.role-selector button.active {
  background: var(--member-gradient);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.role-selector button:hover:not(.active) {
  background: rgba(255, 107, 53, 0.1);
  color: var(--member-primary);
}

.role-selector button:active::before {
  width: 200px;
  height: 200px;
}

/* Input Groups */
.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

.input-group input {
  width: 100%;
  padding: 14px 18px;
  background: white;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all var(--transition-base);
  font-family: var(--font-body);
}

.input-group input::placeholder {
  color: var(--text-light);
}

.input-group input:focus {
  border-color: var(--member-primary);
  box-shadow:
    0 0 0 4px rgba(255, 107, 53, 0.1),
    0 0 20px rgba(255, 107, 53, 0.2);
  transform: translateY(-2px);
}

/* Login Button with Animation */
.login-btn {
  width: 100%;
  padding: 16px;
  background: var(--member-gradient);
  background-size: 200% 200%;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 6px 24px rgba(255, 107, 53, 0.4);
  position: relative;
  overflow: hidden;
  animation: gradientShift 3s ease infinite;
  margin-top: 8px;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 35px rgba(255, 107, 53, 0.5);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  animation: none;
}

.login-btn:disabled:hover {
  transform: none;
  box-shadow: 0 6px 24px rgba(255, 107, 53, 0.4);
}

/* Error Message */
.error-msg {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
  color: #c0392b;
  text-align: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(231, 76, 60, 0.2);
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* Responsive */
@media (max-width: 480px) {
  .glass-panel {
    padding: 36px 28px;
  }

  .title {
    font-size: 2rem;
  }

  .role-selector {
    flex-direction: column;
  }

  .role-selector button.active {
    transform: scale(1);
  }
}
</style>
