import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null) // Replace 'any' with proper User type
  const token = ref<string | null>(localStorage.getItem('token'))
  const role = ref<string | null>(localStorage.getItem('role'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => role.value)

  function setAuth(data: any) {
    // Backend returns userId, but frontend uses id. Map it.
    const adaptedUser = {
        ...data,
        id: data.userId || data.id
    };
    user.value = adaptedUser

    localStorage.setItem('user', JSON.stringify(adaptedUser))
    localStorage.setItem('role', data.role)
    localStorage.setItem('token', 'mock-token') // Persist a mock token if needed

    token.value = 'mock-token'
    role.value = data.role
  }

  function logout() {
    user.value = null
    token.value = null
    role.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  function loadFromStorage() {
    const storedUserJson = localStorage.getItem('user')
    if (storedUserJson) {
      try {
          const storedUser = JSON.parse(storedUserJson);
          // Ensure ID is mapped even if loaded from storage (legacy data fix)
          if ((storedUser.id === undefined || storedUser.id === null) && storedUser.userId) {
              storedUser.id = storedUser.userId;
              // Save back fixed version
              localStorage.setItem('user', JSON.stringify(storedUser));
          }

          if (storedUser.id === undefined || storedUser.id === null) {
              console.warn('User loaded from storage has no ID, invalidating session.');
              logout();
              return;
          }

          user.value = storedUser
          role.value = localStorage.getItem('role')
      } catch (e) {
          console.log("Error parsing user from storage", e);
          logout();
      }
    }
  }

  return { user, token, role, isAuthenticated, userRole, setAuth, logout, loadFromStorage }
})
