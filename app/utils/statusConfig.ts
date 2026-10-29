import { BoltIcon, ClockIcon, LockClosedIcon } from '@heroicons/vue/24/outline';
import { SparklesIcon } from '@heroicons/vue/24/solid';

// ---------------------------------------------------------------------------
// Raffle Status
// ---------------------------------------------------------------------------

export enum RaffleStatus {
  ACTIVE = 0,
  SCHEDULED = 1,
  DRAW_COMPLETED = 2,
  CLOSED = 3,
}

export const raffleStatusConfig: Record<
  number,
  { label: string; pill: string; dot: string; icon: any; pulse: boolean }
> = {
  [RaffleStatus.ACTIVE]: {
    label: 'Active',
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    icon: BoltIcon,
    pulse: true,
  },
  [RaffleStatus.SCHEDULED]: {
    label: 'Scheduled',
    pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-400',
    icon: ClockIcon,
    pulse: false,
  },
  [RaffleStatus.DRAW_COMPLETED]: {
    label: 'Draw Completed',
    pill: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    dot: 'bg-violet-500',
    icon: SparklesIcon,
    pulse: false,
  },
  [RaffleStatus.CLOSED]: {
    label: 'Closed',
    pill: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    icon: LockClosedIcon,
    pulse: false,
  },
};

export const getRaffleStatusConfig = (status: number) =>
  raffleStatusConfig[status] ?? raffleStatusConfig[RaffleStatus.CLOSED];

// ---------------------------------------------------------------------------
// Ticket / Payment Status
// ---------------------------------------------------------------------------

export enum PaymentStatus {
  PAYMENT_INITIATED = 0,
  SUCCESS = 1,
  PAYMENT_FAILED = 2,
}

export const paymentStatusConfig: Record<
  number,
  { label: string; badge: string }
> = {
  [PaymentStatus.SUCCESS]: {
    label: 'PAID',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  [PaymentStatus.PAYMENT_INITIATED]: {
    label: 'PENDING',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  [PaymentStatus.PAYMENT_FAILED]: {
    label: 'FAILED',
    badge: 'bg-red-50 text-red-700 border-red-100',
  },
};

const _defaultPaymentBadge = { label: 'UNKNOWN', badge: 'bg-slate-50 text-slate-600 border-slate-100' };

export const getPaymentStatusConfig = (status: PaymentStatus | string | number) => {
  const statusNum = Number(status);
  return paymentStatusConfig[statusNum] ?? _defaultPaymentBadge;
};

/** Convenience: returns only the badge class string. */
export const getStatusBadge = (status: PaymentStatus | string | number): string =>
  getPaymentStatusConfig(status).badge;

/** Convenience: returns only the label string. */
export const getStatusText = (status: PaymentStatus | string | number): string =>
  getPaymentStatusConfig(status).label;

// ---------------------------------------------------------------------------
// Ticket Colour Badge
// ---------------------------------------------------------------------------

const colourBadgeMap: Record<string, string> = {
  Red: 'bg-red-50 text-red-700 border-red-100',
  Gold: 'bg-amber-50 text-amber-700 border-amber-100',
  Green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Black Star': 'bg-slate-100 text-slate-800 border-slate-200',
};

export const getColorBadge = (color: string): string =>
  colourBadgeMap[color] ?? 'bg-slate-50 text-slate-600 border-slate-100';
