import request from './request';
import type { FitnessProgram, Booking } from '@/types';

export function getAllPrograms() {
  return request.get<any, FitnessProgram[]>('/fitness-program/all');
}

export function createBooking(data: Partial<Booking>) {
  return request.post<any, Booking>('/booking/create', data);
}

export function getMemberBookings(memberId: number) {
    return request.get<any, Booking[]>(`/booking/member/${memberId}`);
}

export function cancelBooking(bookingId: number, reason?: string) {
  return request.post<any, boolean>(`/booking/cancel/${bookingId}`, null, {
    params: { cancelReason: reason }
  });
}

export function updateBookingStatus(bookingId: number, status: number) {
    return request.post<any, boolean>(`/booking/update-status/${bookingId}`, null, {
        params: { status }
    });
}

export function checkIn(bookingId: number) {
    return request.post<any, boolean>(`/booking/checkin/${bookingId}`);
}

export function getCoachBookings(coachId: number) {
    return request.get<any, Booking[]>(`/booking/coach/${coachId}`);
}


// Program Management APIs
export function addProgram(data: Partial<FitnessProgram>) {
    return request.post<any, FitnessProgram>('/fitness-program/add', data);
}

export function updateProgram(data: Partial<FitnessProgram>) {
    return request.put<any, FitnessProgram>('/fitness-program/update', data);
}

export function deleteProgram(id: number) {
    return request.delete<any, boolean>(`/fitness-program/delete/${id}`);
}

export function getProgramsByCoach(coachId: number) {
    return request.get<any, FitnessProgram[]>(`/fitness-program/coach/${coachId}`);
}
