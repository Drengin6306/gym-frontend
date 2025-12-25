import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

request.interceptors.request.use(
  (config) => {
    // Add token to header if available in localStorage or Store
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}` // Adjust if backend expects different format, usually for JWT
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle global errors here (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // local storage clear and redirect to login could happen here
    }
    return Promise.reject(error)
  },
)

export default request
