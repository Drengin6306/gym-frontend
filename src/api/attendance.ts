import request from './request';
import type { Attendance } from '@/types';

export function checkIn(memberId: number, notes?: string) {
    return request.post<any, Attendance>('/attendance/checkin', null, {
        params: { memberId, notes }
    });
}

export function checkOut(id: number) {
    return request.post<any, Attendance>(`/attendance/checkout/${id}`);
}

export function getMemberAttendance(memberId: number) {
    return request.get<any, Attendance[]>(`/attendance/member/${memberId}`);
}

export function getAllAttendance(startDate?: string, endDate?: string) {
    return request.get<any, Attendance[]>('/attendance/date-range', {
        params: { startDate, endDate }
    });
}

// For stats if needed
export function getAttendanceStats(memberId: number) {
    return request.get<any, any>(`/attendance/count/${memberId}`);
}
