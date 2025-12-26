<template>
  <div class="admin-dashboard">
    <h1>{{ $t('adminDashboard.title') }}</h1>

    <!-- Key Metrics Row -->
    <div class="metrics-row">
        <div class="metric-card glass-panel">
            <h3>{{ $t('adminDashboard.totalRevenue') }}</h3>
            <div class="value">¥{{ revenueTrend.totalRevenue || 0 }}</div>
        </div>
         <div class="metric-card glass-panel">
            <h3>{{ $t('adminDashboard.totalMembers') }}</h3>
            <div class="value">{{ memberStats.totalMembers || 0 }}</div>
            <div class="sub">{{ $t('adminDashboard.new') }}: {{ memberStats.newMembersThisMonth || 0 }} | {{ $t('adminDashboard.active') }}: {{ memberStats.activeMembers || 0 }}</div>
        </div>
         <div class="metric-card glass-panel">
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
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
    try {
        const [resRev, resMem, resAtt, resPop] = await Promise.all([
            axios.get('/api/report/revenue-trend'),
            axios.get('/api/report/member-statistics'),
            axios.get('/api/report/attendance-analysis'),
            axios.get('/api/report/popular-courses')
        ]);
        revenueTrend.value = resRev.data;
        memberStats.value = resMem.data;
        attendanceStats.value = resAtt.data;
        popularCourses.value = resPop.data;
    } catch(err) {
        console.error("Failed to load report data", err);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.admin-dashboard { padding: 20px; }
.metrics-row { display: flex; gap: 20px; margin-bottom: 20px; }
.metric-card { flex: 1; padding: 25px; background: #fff; border-radius: 12px; text-align: center; }
.metric-card h3 { margin: 0 0 10px 0; color: #7f8c8d; font-size: 1rem; }
.metric-card .value { font-size: 2rem; font-weight: bold; color: #2c3e50; }
.metric-card .sub { color: #95a5a6; font-size: 0.9rem; margin-top: 5px; }

.charts-row { display: flex; gap: 20px; margin-bottom: 20px; height: 350px; }
.chart-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; }
.chart-card.large { flex: 2; }
.chart-card.small { flex: 1; }
.chart-card h3 { margin: 0 0 15px 0; font-size: 1.1rem; color: #34495e; }
.chart { flex: 1; width: 100%; height: 100%; }
</style>
