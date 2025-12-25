import request from './request'
import type { LoginRequest, LoginResponse } from '@/types' // We might need to define types

export function login(data: LoginRequest) {
  return request.post<any, { code: number; message: string; data: LoginResponse }>(
    '/auth/login',
    data,
  )
}

// Add other auth related methods if needed
