<template>
  <div class="admin-dashboard">
    <!-- Metrics Row -->
    <div class="metrics-row">
        <div class="metric-card shadow-sm">
            <h3>{{ $t('adminDashboard.totalMembers') }}</h3>
            <div class="value">{{ memberStats.totalMembers || 0 }}</div>
            <div class="sub">
               <span :class="{'text-success': (memberStats.newMembersThisMonth || 0) > 0}">
                 +{{ memberStats.newMembersThisMonth || 0 }}
               </span> {{ $t('adminDashboard.newThisMonth') }}
            </div>
        </div>
        <div class="metric-card shadow-sm">
            <h3>{{ $t('adminDashboard.totalRevenue') }}</h3>
            <div class="value">¥{{ revenueTrend.totalRevenue || 0 }}</div>
            <div class="sub">{{ $t('adminDashboard.monthlyRevenue') }}</div>
        </div>
        <div class="metric-card shadow-sm">
            <h3>{{ $t('adminDashboard.dailyAttendance') }}</h3>
            <div class="value">{{ attendanceStats.avgDailyCheckins || 0 }}</div>
            <div class="sub">{{ $t('adminDashboard.peak') }}: {{ attendanceStats.peakHours || '-' }}</div>
        </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="charts-row">
        <div class="chart-card glass-panel large">
            <h3>{{ $t('adminDashboard.revenueTrend') }}</h3>
            <v-chart class="chart" :option="revenueChartOption" autoresize />
        </div>
        <div class="chart-card glass-panel small">
            <h3>{{ $t('adminDashboard.revenueSources') }}</h3>
            <v-chart class="chart" :option="sourceChartOption" autoresize />
        </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="charts-row">
        <div class="chart-card glass-panel large">
            <h3>{{ $t('adminDashboard.popularCourses') }}</h3>
            <v-chart class="chart" :option="courseChartOption" autoresize />
        </div>
        <div class="chart-card glass-panel small">
            <h3>{{ $t('adminDashboard.genderDistribution') }}</h3>
            <v-chart class="chart" :option="genderChartOption" autoresize />
        </div>
         <div class="chart-card glass-panel small">
            <h3>{{ $t('adminDashboard.memberStatus') }}</h3>
            <v-chart class="chart" :option="statusChartOption" autoresize />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import request from '@/api/request'; // Changed from raw axios to request
import type { RevenueTrend, MemberStats, AttendanceStats, PopularCourse } from '@/types';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { useI18n } from 'vue-i18n';

use([CanvasRenderer, PieChart, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

const { t } = useI18n();

const revenueTrend = ref<RevenueTrend>({});
const memberStats = ref<MemberStats>({});
const attendanceStats = ref<AttendanceStats>({});
const popularCourses = ref<PopularCourse[]>([]);
let timer: ReturnType<typeof setInterval> | null = null;

// Options for charts
const revenueChartOption = computed(() => {
    const monthly = revenueTrend.value.monthlyRevenue || {};
    const months = Object.keys(monthly).sort();
    const values = months.map(m => monthly[m]);
    return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: months },
        yAxis: { type: 'value' },
        series: [{ data: values, type: 'line', smooth: true, color: '#3498db', areaStyle: { opacity: 0.2 } }]
    };
});

const sourceChartOption = computed(() => {
    const sources = revenueTrend.value.revenueBySource || {};
    const data = Object.keys(sources).map(k => ({ name: k, value: sources[k] }));
    return {
         tooltip: { trigger: 'item' },
         legend: { bottom: '0' },
         series: [{
            name: t('adminDashboard.chart.revenueSource'),
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            data
        }]
    };
});

const courseChartOption = computed(() => {
    const courses = popularCourses.value || [];
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: courses.map(c => c.courseName).reverse() },
        series: [{
            name: t('adminDashboard.chart.bookings'),
            type: 'bar',
            data: courses.map(c => c.bookingCount).reverse(),
            itemStyle: { color: '#2ecc71', borderRadius: [0, 5, 5, 0] }
        }]
    };
});



const genderChartOption = computed(() => {
    const dist = memberStats.value.genderDistribution || {};
    // Backend returns keys like "male", "female" (case-insensitive check)
    // We normalize them to lowercase to match our mapping logic
    const normalizedDist: Record<string, number> = {};
    Object.keys(dist).forEach(k => {
        normalizedDist[k.toLowerCase()] = dist[k];
    });

    const data = [
        { value: normalizedDist['male'] || 0, name: t('common.gender.male'), itemStyle: { color: '#3498db' } },   // Blue for Male
        { value: normalizedDist['female'] || 0, name: t('common.gender.female'), itemStyle: { color: '#e74c3c' } } // Red/Pink for Female
    ].filter(d => d.value > 0); // Only show present genders? Or show all? ECharts handles zeros fine, but pie needs value.
    // If we want to keep others/unknown
    // But usually simple Male/Female is sufficient for this domain.

    return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: '0', icon: 'circle' },
        series: [{
            name: t('adminDashboard.chart.gender'),
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: '18', fontWeight: 'bold' }
            },
            data
        }]
    };
});

const statusChartOption = computed(() => {
    const active = memberStats.value.activeMembers || 0;
    const inactive = memberStats.value.inactiveMembers || 0;
    return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: '0', icon: 'circle' },
        color: ['#2ecc71', '#95a5a6'], // Green, Grey
        series: [{
            name: t('adminDashboard.chart.status'),
            type: 'pie',
            radius: ['40%', '70%'], // Donut style
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: '18', fontWeight: 'bold' }
            },
            data: [
                { value: active, name: t('adminDashboard.chart.active') },
                { value: inactive, name: t('adminDashboard.chart.inactive') }
            ]
        }]
    };
});

const fetchData = async () => {
    const t = Date.now();
    try {
        const [resRev, resMem, resAtt, resPop] = await Promise.all([
            request.get<any, RevenueTrend>(`/report/revenue-trend?t=${t}`),
            request.get<any, MemberStats>(`/report/member-statistics?t=${t}`),
            request.get<any, AttendanceStats>(`/report/attendance-analysis?t=${t}`),
            request.get<any, PopularCourse[]>(`/report/popular-courses?t=${t}`)
        ]);
        // request.get returns the data directly
        revenueTrend.value = resRev;
        memberStats.value = resMem;
        attendanceStats.value = resAtt;
        popularCourses.value = resPop;
    } catch(err) {
        console.error("Failed to load report data", err);
    }
};

onMounted(() => {
    fetchData();
    timer = setInterval(fetchData, 5000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 🏋️ Admin Dashboard - Authority Purple Theme */

.admin-dashboard {
  padding: 32px;
  animation: fadeInUp 0.5s ease-out;
}

/* ===== Metrics Cards with Gradient Border ===== */
.metrics-row {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  flex: 1;
  position: relative;
  padding: 3px;
  background: var(--admin-gradient);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  animation: cardPulse 3s ease-in-out infinite;
}

.metric-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  background: white;
  border-radius: calc(var(--radius-lg) - 3px);
  z-index: 1;
}

.metric-card > * {
  position: relative;
  z-index: 2;
  padding: 28px 20px;
  text-align: center;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow);
}

.metric-card h3 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-card .value {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  animation: shimmer 3s ease-in-out infinite;
}

.metric-card .sub {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-top: 8px;
}

.text-success {
  color: var(--success-color);
  font-weight: 700;
}

/* ===== Chart Cards Enhanced ===== */
.charts-row {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  min-height: 380px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-lg);
  padding: 28px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--admin-gradient);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--admin-shadow);
  border-color: rgba(102, 126, 234, 0.3);
}

.chart-card:hover::before {
  opacity: 1;
}

.chart-card.large {
  flex: 2;
}

.chart-card.small {
  flex: 1;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 700;
  background: var(--admin-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

/* ===== Responsive Design ===== */
@media (max-width: 1200px) {
  .metrics-row {
    flex-wrap: wrap;
  }

  .metric-card {
    flex: 1 1 calc(50% - 12px);
    min-width: 200px;
  }

  .charts-row {
    flex-direction: column;
    min-height: auto;
  }

  .chart-card.large,
  .chart-card.small {
    flex: 1 1 auto;
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 20px 16px;
  }

  .metrics-row {
    flex-direction: column;
    gap: 16px;
  }

  .metric-card {
    flex: 1 1 auto;
  }

  .charts-row {
    gap: 16px;
  }
}
</style>
