import { createRouter, createWebHistory } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'; // Ensure pinia is active before using store outside components

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          // Member Dashboard
          component: () => import('@/views/MemberDashboard.vue'),
        },
        {
          path: 'my-courses',
          name: 'my-courses',
          component: () => import('@/views/member/MyCourses.vue'),
        },
        {
          path: 'member/coaches',
          name: 'coach-list',
          component: () => import('@/views/member/CoachList.vue'),
        },
        {
          path: 'member/courses',
          name: 'course-list',
          component: () => import('@/views/member/CourseList.vue'),
        },
        {
          path: 'member/membership',
          name: 'membership',
          component: () => import('@/views/member/MembershipView.vue'),
        },
        {
          path: 'member/payments',
          name: 'payments',
          component: () => import('@/views/member/PaymentHistory.vue'),
        },
        // Coach Routes
        {
          path: 'coach/dashboard',
          component: () => import('@/views/coach/CoachDashboard.vue'),
        },
        {
          path: 'coach/students',
          component: () => import('@/views/coach/MyStudents.vue'),
        },
        {
          path: 'coach/schedule',
          component: () => import('@/views/coach/CoachSchedule.vue'),
        },
        {
          path: 'coach/courses',
          component: () => import('@/views/coach/CoachCourseManagement.vue'),
        },
        // Admin Routes
        {
          path: 'admin/dashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
        },
        {
          path: 'admin/members',
          component: () => import('@/views/admin/MemberManagement.vue'),
        },
        {
          path: 'admin/coaches',
          component: () => import('@/views/admin/CoachManagement.vue'),
        },
        {
          path: 'admin/programs',
          component: () => import('@/views/admin/ProgramManagement.vue'),
        },
        {
          path: 'admin/card-types',
          component: () => import('@/views/admin/CardTypeManagement.vue'),
        },
         {
          path: 'admin/facilities',
          component: () => import('@/views/admin/FacilityManagement.vue'),
        },
        {
          path: 'admin/attendance',
          component: () => import('@/views/admin/AttendanceManagement.vue'),
        },
        // Member Routes Extension
        {
            path: 'member/attendance',
            component: () => import('@/views/member/AttendanceHistory.vue'),
        },
      ],
    },
    // Fallback
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('user')

  if (authRequired && !loggedIn) {
    return next('/login')
  }

  next()
})

export default router
