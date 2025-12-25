import request from './request';
import type { Coach } from '@/types';

import { type FitnessProgram } from '@/types'; // Ensure types explicitly imported if needed or strictly typed

export function getAllCoaches() {
  return request.get<any, Coach[]>('/coach/all');
}

export function getCoachCourses(coachId: number) {
  return request.get<any, FitnessProgram[]>(`/fitness-program/coach/${coachId}`);
}

export function getCoachWorkData(coachId: number) {
    return request.get<any, any>(`/report/coach-work-data/${coachId}`);
}
