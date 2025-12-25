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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%);
  font-family: 'Inter', sans-serif;
  color: #fff;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #ccc;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.role-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 5px;
}

.role-selector button {
  flex: 1;
  background: transparent;
  border: none;
  color: #aaa;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-selector button.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: bold;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #ddd;
}

.input-group input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.input-group input:focus {
  border-color: #4facfe;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #ff6b6b;
  text-align: center;
  margin-bottom: 15px;
  font-size: 0.9rem;
}
</style>
