export interface BaseApiResponse<T> {
    result: T;
    success: boolean;
    message: string;
    unAuthorizedRequest: boolean;
    error: Error;
}

  

export interface Error {
    code: boolean;
    details: boolean;
    message: any;
    validationErrors: any;
}

export interface BaseEntityModel {
    id: string;
    createdAt: string;
}


export interface BasePaginationModel<T> {
    pageNo: number;
    totalCount: number;
    totalPages: number;
    data: T;
    lowerBound: number;
    upperBound: number;
}

export interface NsaAdmin extends BaseEntityModel {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    username: string;
    
}

export interface NsaAdminAuthModel extends BaseEntityModel {
    email: string;
    fullName: string;
    token: number;
    userId: string;
    username: number
    
}

export interface Colour extends BaseEntityModel {

    code: string;
    name: string;
    hexColor: string;
    
}

export interface Role extends BaseEntityModel {
    name: string;
    displayName: string;
    description?: string;
    permissions?: string[] | Permission[];
}


export interface PriceTier extends BaseEntityModel {

    tierName: string;
    tierLevel: string;
    description: string;
    prizeAmount: number;
    prizePercentage: number;
    numberOfWinners: number;
    isCashBack: boolean;

}

export interface Customer extends BaseEntityModel {

    msisdn: string;
    firstName: string;
    lastName: string;
    mobileMoneyProvider: string;
    mobileMoneyAccount: string;
    isActive: boolean;
    totalSpent: number;
    totalWon: number;
    numberOfWins: number;
    numberOfEntries: number;
    createdAt: string;
}

export interface CustomerStats {

    activeCustomers: number;
    totalCustomers: number;
    totalSpent: string;
    totalWins: number;
    totalWon: string;
}

export interface TicketStats {

    activeTickets: number;
    conversionRate: number;
    totalRevenue: string;
    totalTickets: number;
}

export interface Ticket extends BaseEntityModel {

    ticketNumber: string;
    drawId: string;
    customerId: string;
    colourId: string;
    entryFee: string;
    quantity: string;
    colourName: string;
    totalAmount: string;
    paymentReference: string;
    paymentStatus: string;
    paymentMethod: string;
    customerPhone: string;
    
}


export interface Raffle extends BaseEntityModel {

    name: string;
    slug: string;
    status: string; // completed, active, upcoming, scheduled, DRAW IN PROGRESS
    totalEntries: number;
    prizePool: string;
    winningColour: string;
    scheduledFor: string;
    startsAt: string;
    endsAt: string;
    drawTime: string;
    createdAt: string;
    
}

export interface User extends BaseEntityModel {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    status: string;
    isAdmin: boolean;
    isActive: boolean;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    lockedOutUsers: number;
}

export interface PermissionResponse {
    data: Permission [];
    totalCount: number;
}

export interface Permission {
    systemName: string;
    displayName: string;
}