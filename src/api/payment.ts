import request from './request';
import type { PaymentRecord } from '@/types';

export function getPaymentRecords(memberId: number) {
    return request.get<any, PaymentRecord[]>(`/payment/member/${memberId}`);
}

export function getTotalConsumption(memberId: number) {
    return request.get<any, number>(`/payment/total-consumption/${memberId}`);
}
