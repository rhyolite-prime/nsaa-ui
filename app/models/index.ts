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
    exemptedPartners?: string[];
}

export interface RaffleDetails extends BaseEntityModel {

    name: string;
    slug: string;
    status: string;
    totalEntries: number;
    prizePool: string;
    winningColour: string;
    startsAt: string;
    endsAt: string;
    drawTime: string;
    createdAt: string;
    prizeWinnerTiers: PrizeWinnerTier[];
    draw: Draw;
    drawSummary: DrawSummary;
    exemptedPartners?: string[];
}

export interface DrawSummary {
    drawId: string;
    generatedValue: string;
    id: string;
    metadata: DrawSummaryMetaData;
    rngType: string;
}


export interface DrawSummaryMetaData {

    cashbackRecipients: number;
    drawCode: string;
    drawId: string;
    tier2WinnersCount: number;
    tier3WinnersCount: number;
    id: string;
    timestamp: string;
    totalPrizesDistributed: string;
    ultimateWinnerCustomer: UltimateWinnerCustomer;
    ultimateWinnerTicketId: string;
    winningColour: string;
    winningColourId: string;
    winningColourTicketId: string;
    winningColourTicketNumber: string;
    
}

export interface Draw {
    alias: string;
    completedAt: string;
    createdAt: string;
    drawCode: string;
    drawDate: string;
    id: string;
    raffleId: string;
    status: string;
    winningColour: string;
    winningColourId: string;
}

export interface PrizeWinnerTier {
    amount: number;
    name: string;
    winners: number;
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

export interface RaffleWinner extends BaseEntityModel {
    customerId: string;
     
}


export interface RaffleDrawResponse extends BaseEntityModel {
    
    cashbackRecipients: string;
    drawCode: string;
    drawId: string;
    tier2WinnersCount: string;
    tier3WinnersCount: string;
    timestamp: string;
    totalPrizesDistributed: number;
    ultimateWinnerCustomer: UltimateWinnerCustomer;
    ultimateWinnerTicketId: string;
    winningColour: string;
    winningColourId: string;
    winningColourTicketId: string;
    winningColourTicketNumber: string;
}


export interface TopTicketHoldersResponse {
    
    data: TopTicketHolder[];
    totalValidEntries: number;
}

export interface TopTicketHolder {
    
    firstName: string;
    holder: string;
    lastName: string;
    msisdn: string;
    ticketNumber: string;
    totalTickets: number;
}

export interface UltimateWinnerCustomer  {
    customerId: string;
    msisdn: string;
    name: string;
}





export interface RngLog extends BaseEntityModel {
    drawId: string;
    generatedAt: string;
    generatedValue: string;
    metadata: any;
    rngType: string;
    seedValue: string;
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

export interface AffiliatePartner extends BaseEntityModel {
    name: string;
    identifier: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    billingEmail: string;
    country: string;
    currency: string;
    status: string;
    ussdCode: string;
    wssdServiceUrl?: string;
    subAccountEnabled: boolean;
    requireTwoFactorAuth: boolean;
    organizationLogo?: string;
    commissionRate: number;
    commissionType: 'percentage' | 'fixed';
    paymentDueDate?: number;
    minimumPayoutThreshold: number;
    paymentMethod?: string;
    bankDetails?: any;
    maxRafflesPerDay?: number;
    allowedRaffleCategories?: string[];
    requiresApproval: boolean;
    totalTicketsSold?: number;
    totalRevenueGenerated?: number;
    totalCommissionEarned?: number;
    lastPayoutDate?: string;
    apiKey?: string;
    apiSecret?: string;
    ipWhitelist?: string[];
    webhookSecret?: string;
    taxId?: string;
    legalEntityName?: string;
    kycVerified: boolean;
    agreementAcceptedAt?: string;
    agreementVersion?: string;
    supportPriority: string;
    notes?: string;
    updatedAt?: string;
}


export interface PartnerStats {
    activeStatus: number;
    complianceRate: number;
    totalEarned: number;
    verifiedPartners: number;
}

export interface PrizeCategory extends BaseEntityModel {
    name: string;
    code: string;
    description: string;
    priority: number;
    maxWinners: number;
    rewardType: string;
    isRepeatable: boolean;
    isActive: boolean;
    updatedAt: string;
}

export interface Prize extends BaseEntityModel {
    categoryId: string;
    name: string;
    description: string;
    value: number;
    currency: string;
    quantity: number;
    remainingQuantity: number;
    probability: number;
    startDate: string;
    endDate: string;
    metadata: any;
    updatedAt: string;
}

export interface TicketGroup extends BaseEntityModel {
    name: string;
    quantity: number;
    unitPrice: number;
    isActive: boolean;
}