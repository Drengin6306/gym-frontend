export interface LoginRequest {
    username: string;
    password: string;
    role: 'member' | 'coach' | 'admin';
}

export interface LoginResponse {
    userId: number; // Matches backend DTO
    username: string;
    role: string;
    realName: string;
    token: string;
}

export interface User {
    id: number;
    username: string; // Account username
    role: string;
    realName: string;
}

export interface Member {
    id: number;
    username: string;
    password?: string; // For registration/update
    realName: string;
    phone?: string;
    email?: string;
    gender?: number;
    birthday?: string;
    avatarUrl?: string;
    status: number;
    activeCardCount?: number;
    createTime?: string;
}

export interface CardType {
    id: number;
    name: string;
    durationDays: number;
    price: number;
    description: string;
    status: number; // 0停售，1在售
}

export interface Coach {
    id: number;
    username: string;
    password?: string; // Optional for list, required for add
    realName: string;
    phone?: string;
    email?: string;
    avatarUrl?: string; // Matching backend
    certificate?: string;
    specialty?: string; // 专长
    experienceYears?: number; // 从业年限
    hourlyRate?: number; // 时薪
    gender?: number; // 0女，1男
    status: number; // 0离职，1在职
    createTime?: string;
    description?: string;
}

export interface FitnessProgram {
    id: number;
    name: string; // Changed from title
    description: string;
    coachId: number;
    coach?: Coach; // Entity has this
    price: number;
    durationMinutes: number; // Changed from duration
    maxParticipants: number; // Added
    difficultyLevel: number; // 1:Beginner, 2:Intermediate, 3:Advanced
    type: number; // 1:Group, 2:Private, 3:Free
    status: number; // 0:Off, 1:On
}

export interface Booking {
    id: number;
    memberId: number;
    bookingType: number; // 1团课，2私教课...
    relatedId: number; // e.g., Program ID
    coachId?: number; // Optional
    venueId?: number; // Optional
    status: number; // 0: Pending, 1: Confirmed, 2: Cancelled, 3: Completed
    createTime: string;
    startTime?: string;
    endTime?: string;
    programTitle?: string;
    durationMinutes?: number;
    participantsCount?: number;
    bookingStatus?: number;
    attendanceStatus?: number; // 0: Not Checked In, 1: Checked In, 2: Late, 3: Missed
    notes?: string;
    fitnessProgram?: FitnessProgram;
}



export interface MemberCard {
    id: number;
    memberId: number;
    cardTypeId: number;
    cardNumber: string;
    startDate: string;
    endDate: string;
    remainingDays: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: number; // 0未支付，1已支付
    cardStatus: number; // 1有效
    cardType?: CardType;
}

export interface Venue {
    id: number;
    name: string;
    type: number; // 1:Classroom, 2:Private, 3:Free Weight, 4:Pool, 5:Yoga
    area: number;
    capacity: number;
    status: number; // 0:Closed, 1:Open, 2:Maintenance
    description?: string;
}

export interface Equipment {
    id: number;
    name: string;
    type: string;
    brand: string;
    model: string;
    purchaseDate: string;
    purchasePrice: number;
    usageHours?: number;
    status: number; // 0:Scrapped, 1:Normal, 2:Repair, 3:Maintenance
    location: string;
    notes?: string;
}

export interface Attendance {
    id: number;
    memberId: number;
    member?: Member; // For display
    checkInTime: string;
    checkOutTime?: string;
    durationMinutes?: number;
    bookingId?: number;
    notes?: string;
    createTime?: string;
}

export interface PaymentRecord {
    id: number;
    memberId: number;
    orderNumber: string;
    paymentType: number; // 1:Card, 2:Course, 3:Coach
    relatedId?: number;
    amount: number;
    paymentMethod: number; // 1:WeChat, 2:Alipay, 3:Cash, 4:Bank
    paymentStatus: number; // 0:Pending, 1:Success, 2:Fail, 3:Refunded
    payTime?: string;
    createTime: string;
}

export interface RevenueTrend {
    monthlyRevenue?: Record<string, number>;
    revenueBySource?: Record<string, number>;
    totalRevenue?: number;
}
export interface MemberStats {
    totalMembers?: number;
    newMembersThisMonth?: number;
    activeMembers?: number;
    inactiveMembers?: number;
    ageDistribution?: Record<string, number>;
    genderDistribution?: Record<string, number>;
}
export interface AttendanceStats {
    avgDailyCheckins?: number;
    peakHours?: string;
}
export interface PopularCourse {
    courseName: string;
    bookingCount: number;
}
