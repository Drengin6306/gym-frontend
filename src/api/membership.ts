import request from './request';
import type { CardType, MemberCard } from '@/types';

export function getAllCardTypes() {
    // Assuming status 1 means 'On Sale'
    return request.get<any, CardType[]>('/card-type/status/1');
}

export function getMemberCards(memberId: number) {
    return request.get<any, MemberCard[]>(`/member-card/member/${memberId}`);
}

export function createMemberCard(data: Partial<MemberCard>) {
    return request.post<any, MemberCard>('/member-card/create', data);
}

export function payCard(cardId: number, amount: number) {
    return request.post<any, boolean>(`/member-card/pay/${cardId}?amount=${amount}`);
}
