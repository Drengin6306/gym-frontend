<template>
  <div class="management-view">
    <div class="header-actions">
        <h1>{{ $t('facilityManagement.title') }}</h1>
        <div class="tabs">
            <button :class="['tab-btn', activeTab === 'venue' ? 'active' : '']" @click="activeTab = 'venue'">{{ $t('facilityManagement.tabs.venue') }}</button>
            <button :class="['tab-btn', activeTab === 'equipment' ? 'active' : '']" @click="activeTab = 'equipment'">{{ $t('facilityManagement.tabs.equipment') }}</button>
        </div>
        <button class="btn btn-primary" @click="openAddModal">{{ activeTab === 'venue' ? $t('facilityManagement.add.venue') : $t('facilityManagement.add.equipment') }}</button>
    </div>

    <!-- Venue Tab -->
    <div v-if="activeTab === 'venue'" class="glass-panel">
        <div v-if="loading" class="loading-state">{{ $t('facilityManagement.loading.venue') }}</div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('facilityManagement.columns.id') }}</th>
                    <th>{{ $t('facilityManagement.columns.name') }}</th>
                    <th>{{ $t('facilityManagement.columns.type') }}</th>
                    <th>{{ $t('facilityManagement.columns.capacity') }}</th>
                    <th>{{ $t('facilityManagement.columns.area') }}</th>
                    <th>{{ $t('facilityManagement.columns.status') }}</th>
                    <th>{{ $t('facilityManagement.columns.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="venue in venues" :key="venue.id">
                    <td>#{{ venue.id }}</td>
                    <td>{{ venue.name }}</td>
                    <td>{{ getVenueTypeName(venue.type) }}</td>
                    <td>{{ venue.capacity }}</td>
                    <td>{{ venue.area }}</td>
                    <td>
                        <span :class="['status-badge', getVenueStatusClass(venue.status)]">
                            {{ getVenueStatusName(venue.status) }}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-sm btn-edit" @click="handleEditVenue(venue)">{{ $t('memberManagement.actions.edit') }}</button>
                        <button class="btn-sm btn-delete" @click="handleDeleteVenue(venue.id)">{{ $t('memberManagement.actions.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
         <div v-if="!loading && activeTab === 'venue' && venues.length === 0" class="empty-state">{{ $t('facilityManagement.empty.venue') }}</div>
    </div>

    <!-- Equipment Tab -->
    <div v-if="activeTab === 'equipment'" class="glass-panel">
        <div v-if="loading" class="loading-state">{{ $t('facilityManagement.loading.equipment') }}</div>
        <table v-else class="data-table">
            <thead>
                <tr>
                    <th>{{ $t('facilityManagement.columns.id') }}</th>
                    <th>{{ $t('facilityManagement.columns.name') }}</th>
                    <th>{{ $t('facilityManagement.columns.type') }}</th>
                    <th>{{ $t('facilityManagement.columns.brandModel') }}</th>
                    <th>{{ $t('facilityManagement.columns.location') }}</th>
                    <th>{{ $t('facilityManagement.columns.status') }}</th>
                    <th>{{ $t('facilityManagement.columns.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in equipmentList" :key="item.id">
                    <td>#{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.type }}</td>
                    <td>
                        <div>{{ item.brand }}</div>
                        <div class="text-xs text-gray">{{ item.model }}</div>
                    </td>
                    <td>{{ item.location }}</td>
                     <td>
                        <span :class="['status-badge', getEquipmentStatusClass(item.status)]">
                            {{ getEquipmentStatusName(item.status) }}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-sm btn-edit" @click="handleEditEquipment(item)">{{ $t('memberManagement.actions.edit') }}</button>
                        <button class="btn-sm btn-delete" @click="handleDeleteEquipment(item.id)">{{ $t('memberManagement.actions.delete') }}</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="!loading && activeTab === 'equipment' && equipmentList.length === 0" class="empty-state">{{ $t('facilityManagement.empty.equipment') }}</div>
    </div>

    <!-- Venue Modal -->
    <div v-if="showVenueModal" class="modal-overlay" @click.self="closeVenueModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ isEditing ? $t('facilityManagement.modal.editVenue') : $t('facilityManagement.modal.addVenue') }}</h2>
                <button class="close-btn" @click="closeVenueModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="submitVenue">
                    <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.name') }}</label>
                        <input type="text" v-model="venueForm.name" required />
                    </div>
                     <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.type') }}</label>
                        <select v-model="venueForm.type">
                            <option :value="1">{{ $t('facilityManagement.venueType.group') }}</option>
                            <option :value="2">{{ $t('facilityManagement.venueType.private') }}</option>
                            <option :value="3">{{ $t('facilityManagement.venueType.freeWeight') }}</option>
                            <option :value="4">{{ $t('facilityManagement.venueType.pool') }}</option>
                            <option :value="5">{{ $t('facilityManagement.venueType.yoga') }}</option>
                        </select>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>{{ $t('facilityManagement.fields.capacity') }}</label>
                            <input type="number" v-model="venueForm.capacity" required />
                        </div>
                        <div class="form-group">
                            <label>{{ $t('facilityManagement.fields.area') }}</label>
                            <input type="number" v-model="venueForm.area" required />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.status') }}</label>
                        <select v-model="venueForm.status">
                            <option :value="1">{{ $t('facilityManagement.venueStatus.open') }}</option>
                            <option :value="0">{{ $t('facilityManagement.venueStatus.closed') }}</option>
                            <option :value="2">{{ $t('facilityManagement.venueStatus.maintenance') }}</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.description') }}</label>
                         <textarea v-model="venueForm.description" rows="2"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">{{ $t('facilityManagement.modal.save') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Equipment Modal -->
    <div v-if="showEquipmentModal" class="modal-overlay" @click.self="closeEquipmentModal">
        <div class="modal-content glass-panel sm">
            <div class="modal-header">
                <h2>{{ isEditing ? $t('facilityManagement.modal.editEquipment') : $t('facilityManagement.modal.addEquipment') }}</h2>
                <button class="close-btn" @click="closeEquipmentModal">&times;</button>
            </div>
             <div class="modal-body">
                <form @submit.prevent="submitEquipment">
                    <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.name') }}</label>
                        <input type="text" v-model="equipmentForm.name" required />
                    </div>
                    <div class="form-group">
                         <label>{{ $t('facilityManagement.fields.type') }}</label>
                         <input type="text" v-model="equipmentForm.type" :placeholder="$t('facilityManagement.fields.typePlaceholder')" required />
                    </div>
                    <div class="form-grid">
                         <div class="form-group">
                            <label>{{ $t('facilityManagement.fields.brand') }}</label>
                            <input type="text" v-model="equipmentForm.brand" />
                        </div>
                         <div class="form-group">
                            <label>{{ $t('facilityManagement.fields.model') }}</label>
                            <input type="text" v-model="equipmentForm.model" />
                        </div>
                    </div>
                     <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.location') }}</label>
                        <input type="text" v-model="equipmentForm.location" placeholder="e.g. Zone A" />
                    </div>
                     <div class="form-group">
                        <label>{{ $t('facilityManagement.fields.status') }}</label>
                        <select v-model="equipmentForm.status">
                            <option :value="1">{{ $t('facilityManagement.equipmentStatus.normal') }}</option>
                            <option :value="2">{{ $t('facilityManagement.equipmentStatus.repair') }}</option>
                            <option :value="3">{{ $t('facilityManagement.equipmentStatus.maintenance') }}</option>
                            <option :value="0">{{ $t('facilityManagement.equipmentStatus.scrapped') }}</option>
                        </select>
                    </div>
                     <div class="form-grid">
                        <div class="form-group">
                             <label>{{ $t('facilityManagement.fields.purchasePrice') }}</label>
                             <input type="number" v-model="equipmentForm.purchasePrice" />
                        </div>
                         <div class="form-group">
                             <label>{{ $t('facilityManagement.fields.purchaseDate') }}</label>
                             <input type="date" v-model="equipmentForm.purchaseDate" />
                        </div>
                     </div>
                     <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">{{ $t('facilityManagement.modal.save') }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import request from '@/api/request'; // Changed from raw axios
import type { Venue, Equipment } from '@/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeTab = ref<'venue' | 'equipment'>('venue');
const loading = ref(false);

const venues = ref<Venue[]>([]);
const equipmentList = ref<Equipment[]>([]);

// --- Helpers ---
// --- Helpers ---
const getVenueTypeName = (type: number) => {
    const map: Record<number, string> = {
        1: t('facilityManagement.venueType.group'),
        2: t('facilityManagement.venueType.private'),
        3: t('facilityManagement.venueType.freeWeight'),
        4: t('facilityManagement.venueType.pool'),
        5: t('facilityManagement.venueType.yoga')
    };
    return map[type] || t('facilityManagement.venueType.unknown');
}
const getVenueStatusName = (status: number) => {
     const map: Record<number, string> = {
         0: t('facilityManagement.venueStatus.closed'),
         1: t('facilityManagement.venueStatus.open'),
         2: t('facilityManagement.venueStatus.maintenance')
    };
     return map[status] || '-';
}
const getVenueStatusClass = (status: number) => {
    if (status === 1) return 'active';
    if (status === 2) return 'warning';
    return 'inactive';
}

const getEquipmentStatusName = (status: number) => {
     const map: Record<number, string> = {
         0: t('facilityManagement.equipmentStatus.scrapped'),
         1: t('facilityManagement.equipmentStatus.normal'),
         2: t('facilityManagement.equipmentStatus.repair'),
         3: t('facilityManagement.equipmentStatus.maintenance')
    };
     return map[status] || '-';
}
const getEquipmentStatusClass = (status: number) => {
    if (status === 1) return 'active';
    if (status === 2 || status === 3) return 'warning';
    return 'inactive';
}


// --- Fetch Data ---
const fetchData = async () => {
    loading.value = true;
    try {
        if (activeTab.value === 'venue') {
            const res = await request.get<any, Venue[]>('/venue/all'); // Removed /api prefix
            venues.value = res; // Removed .data
        } else {
            const res = await request.get<any, Equipment[]>('/equipment/all'); // Removed /api prefix
            equipmentList.value = res; // Removed .data
        }
    } catch (err) {
        console.error("Fetch failed", err);
    } finally {
        loading.value = false;
    }
};

watch(activeTab, fetchData);

// --- Modal State ---
const isEditing = ref(false);

// Venue
const showVenueModal = ref(false);
const venueForm = ref<Venue>({} as Venue);

const openVenueModal = (editMode: boolean, venue?: Venue) => {
    isEditing.value = editMode;
    if (editMode && venue) {
        venueForm.value = { ...venue };
    } else {
        venueForm.value = { name: '', type: 1, capacity: 20, area: 50, status: 1 } as Venue;
    }
    showVenueModal.value = true;
};
const closeVenueModal = () => showVenueModal.value = false;

const handleEditVenue = (venue: Venue) => openVenueModal(true, venue);

const submitVenue = async () => {
    try {
        if (isEditing.value) {
            await request.put('/venue/update', venueForm.value); // Removed /api prefix
        } else {
            await request.post('/venue/add', venueForm.value); // Removed /api prefix
        }
        closeVenueModal();
        fetchData();
    } catch {
        alert(t('facilityManagement.alerts.operationFail'));
    }
};

const handleDeleteVenue = async (id: number) => {
    if (!confirm(t('facilityManagement.alerts.deleteConfirm'))) return;
    try {
        await request.delete(`/venue/delete/${id}`); // Removed /api prefix
        fetchData();
    } catch { alert(t('facilityManagement.alerts.deleteFail')); }
}

// Equipment
const showEquipmentModal = ref(false);
const equipmentForm = ref<Equipment>({} as Equipment);

const openEquipmentModal = (editMode: boolean, item?: Equipment) => {
    isEditing.value = editMode;
    if (editMode && item) {
        equipmentForm.value = { ...item };
    } else {
        equipmentForm.value = { name: '', type: '', brand: '', status: 1, location: '' } as Equipment;
    }
    showEquipmentModal.value = true;
};
const closeEquipmentModal = () => showEquipmentModal.value = false;

const handleEditEquipment = (item: Equipment) => openEquipmentModal(true, item);

const submitEquipment = async () => {
    try {
        if (isEditing.value) {
            await request.put('/equipment/update', equipmentForm.value); // Removed /api prefix
        } else {
            await request.post('/equipment/add', equipmentForm.value); // Removed /api prefix
        }
        closeEquipmentModal();
        fetchData();
    } catch {
        alert(t('facilityManagement.alerts.operationFail'));
    }
}

const handleDeleteEquipment = async (id: number) => {
    if (!confirm(t('facilityManagement.alerts.deleteConfirm'))) return;
    try {
        await request.delete(`/equipment/delete/${id}`); // Removed /api prefix
        fetchData();
    } catch { alert(t('facilityManagement.alerts.deleteFail')); }
}

// Unified open handler
const openAddModal = () => {
    if (activeTab.value === 'venue') openVenueModal(false);
    else openEquipmentModal(false);
}

onMounted(fetchData);

</script>

<style scoped>
.management-view { padding: 20px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-actions h1 { margin: 0; font-size: 1.5rem; color: #2c3e50; }

.tabs { display: flex; gap: 10px; background: #e0e0e0; padding: 4px; border-radius: 8px; }
.tab-btn {
    padding: 8px 16px; border: none; background: none; cursor: pointer; border-radius: 6px; font-weight: 600; color: #7f8c8d;
    transition: all 0.2s;
}
.tab-btn.active { background: #fff; color: #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.glass-panel {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    overflow-x: auto;
}

.data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { font-weight: 600; color: #7f8c8d; background: #f8f9fa; }
.data-table tr:hover { background-color: #f8f9fa; }

.status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
.status-badge.active { background: #e8f8f5; color: #2ecc71; }
.status-badge.warning { background: #fcf3cf; color: #f39c12; }
.status-badge.inactive { background: #fdedec; color: #e74c3c; }

.text-xs { font-size: 0.8em; }
.text-gray { color: #7f8c8d; }

.actions { display: flex; gap: 10px; }
.btn-primary { background: #3498db; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; }
.btn-sm { padding: 4px 8px; font-size: 0.85em; border-radius: 4px; cursor: pointer; border: 1px solid transparent; }
.btn-edit { background: #f1c40f; color: #fff; }
.btn-delete { background: #e74c3c; color: #fff; }

.loading-state, .empty-state { padding: 40px; text-align: center; color: #7f8c8d; }

/* Modal */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
}
.modal-content.sm {
    width: 600px;
    background: #fff; padding: 0;
    border-radius: 12px;
    max-height: 90vh; overflow-y: auto;
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px; border-bottom: 1px solid #eee;
}
.modal-header h2 { margin: 0; font-size: 1.3rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; text-align: right; border-top: 1px solid #eee; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #34495e; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
</style>
