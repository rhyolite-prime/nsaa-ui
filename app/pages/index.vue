<script setup lang="ts">
import {
  BanknotesIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TicketIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import { getSummary, getTicketDistribution } from '~/services/reports';
import type {
  DashboardSummary,
  TicketDistribution,
  TicketDistributionEntry,
} from '~/models';

useHead({
  title: 'Dashboard | NSAA BO',
});

// Sample figures from the reporting endpoints, used only by the dev preview
// when the API is unreachable. Production always renders live responses.
const previewSummary: DashboardSummary = {
  activeCustomers: 7,
  activeRaffles: 1,
  completedDraws: 0,
  endDate: '',
  paidTickets: 5,
  pendingPayouts: 0,
  pendingTickets: 33,
  startDate: '',
  totalCustomers: 7,
  totalDraws: 0,
  totalQuantity: 38,
  totalRaffles: 1,
  totalRevenue: 25,
  totalTickets: 38,
  totalWinners: 0,
};

const previewDistribution: TicketDistribution = {
  data: [
    {
      entries: 5,
      name: 'Green',
      percentage: 100,
      revenue: 25,
      tickets: 1,
      value: 'green',
    },
  ],
  totalEntries: 5,
  totalRevenue: 25,
  totalTickets: 1,
};

const summary = ref<DashboardSummary | null>(null);
const distribution = ref<TicketDistribution | null>(null);

const isLoading = ref(true);
const isRefreshing = ref(false);
const isError = ref(false);
const hasPartialError = ref(false);
const isPreviewData = ref(false);
const lastUpdated = ref('');

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

const formatNumber = (value?: number | null) => numberFormatter.format(Number(value ?? 0));

const formatCurrency = (value?: number | null) => currencyFormatter.format(Number(value ?? 0));

const formatPercent = (value?: number | null) => `${percentFormatter.format(Number(value ?? 0))}%`;

const formatTicketCount = (value?: number | null) =>
  `${formatNumber(value)} ${Number(value ?? 0) === 1 ? 'ticket' : 'tickets'}`;

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// ---------------------------------------------------------------------------
// Data loading — both dashboard endpoints live in the report service
// ---------------------------------------------------------------------------

const loadDashboard = async (mode: 'initial' | 'refresh' = 'initial') => {
  const showSkeleton = mode === 'initial' || isError.value || !summary.value;

  if (showSkeleton) {
    isLoading.value = true;
  } else {
    isRefreshing.value = true;
  }

  isError.value = false;
  hasPartialError.value = false;

  try {
    const [summaryResult, distributionResult] = await Promise.allSettled([
      getSummary({}),
      getTicketDistribution({}),
    ]);

    let failedCount = 0;

    if (summaryResult.status === 'fulfilled' && summaryResult.value) {
      summary.value = summaryResult.value;
    } else {
      failedCount++;
    }

    if (distributionResult.status === 'fulfilled' && distributionResult.value) {
      distribution.value = distributionResult.value;
    } else {
      failedCount++;
    }

    if (failedCount === 2) {
      if (import.meta.dev) {
        summary.value = previewSummary;
        distribution.value = previewDistribution;
        isPreviewData.value = true;
        lastUpdated.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        isError.value = true;
        toast.error('Unable to load dashboard analytics. Please try again.');
      }
    } else if (failedCount === 1) {
      hasPartialError.value = true;
      isPreviewData.value = false;
      lastUpdated.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      toast.error('Some dashboard analytics could not be loaded.');
    } else {
      isPreviewData.value = false;
      lastUpdated.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (mode === 'refresh') {
        toast.success('Dashboard analytics refreshed.');
      }
    }
  } catch (error) {
    console.error('Dashboard load failed:', error);

    if (import.meta.dev) {
      summary.value = previewSummary;
      distribution.value = previewDistribution;
      isPreviewData.value = true;
      lastUpdated.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      isError.value = true;
      toast.error('Unable to load dashboard analytics. Please try again.');
    }
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});

// ---------------------------------------------------------------------------
// Derived metrics
// ---------------------------------------------------------------------------

const reportingWindow = computed(() => {
  const startDate = summary.value?.startDate;
  const endDate = summary.value?.endDate;

  if (startDate && endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  if (startDate) return `From ${formatDate(startDate)}`;
  if (endDate) return `Until ${formatDate(endDate)}`;
  return 'All time';
});

const paidTicketShare = computed(() => {
  const total = Number(summary.value?.totalTickets ?? 0);
  const paid = Number(summary.value?.paidTickets ?? 0);
  return total > 0 ? Math.round((paid / total) * 100) : 0;
});

const pendingTicketShare = computed(() => {
  const total = Number(summary.value?.totalTickets ?? 0);
  return total > 0 ? Math.max(0, 100 - paidTicketShare.value) : 0;
});

const drawCompletionRate = computed(() => {
  const totalDraws = Number(summary.value?.totalDraws ?? 0);
  const completedDraws = Number(summary.value?.completedDraws ?? 0);
  return totalDraws > 0 ? Math.round((completedDraws / totalDraws) * 100) : 0;
});

const averageRevenuePerTicket = computed(() => {
  const tickets = Number(summary.value?.totalTickets ?? 0);
  const revenue = Number(summary.value?.totalRevenue ?? 0);
  return tickets > 0 ? revenue / tickets : 0;
});

const kpis = computed(() => [
  {
    label: 'Total Revenue',
    value: formatCurrency(summary.value?.totalRevenue),
    hint: 'Gross revenue from ticket sales',
    badge: 'Revenue',
    icon: BanknotesIcon,
    iconClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
    badgeClass: 'bg-emerald-50 text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  {
    label: 'Total Tickets',
    value: formatNumber(summary.value?.totalTickets),
    hint: `${formatNumber(summary.value?.paidTickets)} paid · ${formatNumber(summary.value?.pendingTickets)} pending`,
    badge: `${paidTicketShare.value}% paid`,
    icon: TicketIcon,
    iconClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white',
    badgeClass: 'bg-blue-50 text-blue-600',
    dotClass: 'bg-blue-500',
  },
  {
    label: 'Active Customers',
    value: formatNumber(summary.value?.activeCustomers),
    hint: `of ${formatNumber(summary.value?.totalCustomers)} total customers`,
    badge: 'Players',
    icon: UsersIcon,
    iconClass: 'bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white',
    badgeClass: 'bg-violet-50 text-violet-600',
    dotClass: 'bg-violet-500',
  },
  {
    label: 'Active Raffles',
    value: formatNumber(summary.value?.activeRaffles),
    hint: `${formatNumber(summary.value?.totalDraws)} draws · ${formatNumber(summary.value?.completedDraws)} completed`,
    badge: 'Raffles',
    icon: TrophyIcon,
    iconClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
    badgeClass: 'bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
  },
]);

const quickStats = computed(() => [
  {
    label: 'Paid Tickets',
    value: formatNumber(summary.value?.paidTickets),
    icon: CheckCircleIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Pending Tickets',
    value: formatNumber(summary.value?.pendingTickets),
    icon: ClockIcon,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Total Winners',
    value: formatNumber(summary.value?.totalWinners),
    icon: TrophyIcon,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Pending Payouts',
    value: formatCurrency(summary.value?.pendingPayouts),
    icon: CreditCardIcon,
    iconClass: 'bg-rose-50 text-rose-600',
  },
]);

const healthMetrics = computed(() => [
  {
    label: 'Total Quantity',
    value: formatNumber(summary.value?.totalQuantity),
    icon: TicketIcon,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Total Winners',
    value: formatNumber(summary.value?.totalWinners),
    icon: TrophyIcon,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Total Draws',
    value: formatNumber(summary.value?.totalDraws),
    icon: ChartBarIcon,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Avg. Revenue / Ticket',
    value: formatCurrency(averageRevenuePerTicket.value),
    icon: BanknotesIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
]);

const quickActions = [
  {
    label: 'Manage Raffles',
    description: 'Create, schedule and monitor raffles',
    href: '/raffles',
    icon: TrophyIcon,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Ticket Explorer',
    description: 'Search and audit every ticket sold',
    href: '/tickets/explorer',
    icon: TicketIcon,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Winners',
    description: 'Review draw winners and payouts',
    href: '/winners',
    icon: SparklesIcon,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Disbursements',
    description: 'Track pending and completed payouts',
    href: '/disbursements',
    icon: CreditCardIcon,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
];

// ---------------------------------------------------------------------------
// Ticket distribution donut
// ---------------------------------------------------------------------------

const colourPalette: Record<string, string> = {
  green: '#059669',
  red: '#DC2626',
  gold: '#FBBF24',
  black: '#0F172A',
  'black star': '#0F172A',
  blue: '#2563EB',
  purple: '#7C3AED',
  orange: '#EA580C',
};

const fallbackPalette = ['#209552', '#DCAE56', '#DC2626', '#2563EB', '#7C3AED', '#0F172A'];

const getEntryColor = (entry: TicketDistributionEntry, index: number) => {
  const byValue = colourPalette[(entry.value ?? '').toLowerCase()];
  if (byValue) return byValue;
  const byName = colourPalette[(entry.name ?? '').toLowerCase()];
  if (byName) return byName;
  return fallbackPalette[index % fallbackPalette.length];
};

const donutSegments = computed(() => {
  const entries = Array.isArray(distribution.value?.data) ? distribution.value.data : [];
  const totalEntries = entries.reduce((total, entry) => total + Number(entry.entries ?? 0), 0);

  let offset = 0;

  return entries.map((entry, index) => {
    const entryCount = Number(entry.entries ?? 0);
    const percentage =
      totalEntries > 0 ? (entryCount / totalEntries) * 100 : Number(entry.percentage ?? 0);
    const pct = Math.max(0, Math.min(100, percentage));

    const segment = {
      ...entry,
      color: getEntryColor(entry, index),
      pct,
      offset,
    };

    offset += pct;
    return segment;
  });
});

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

const exportAnalytics = () => {
  if (!summary.value) {
    toast.error('There is no dashboard data to export yet.');
    return;
  }

  const currentSummary = summary.value;
  const currentDistribution = distribution.value;

  const rows: (string | number)[][] = [
    ['NSAA Dashboard Analytics'],
    ['Generated', new Date().toLocaleString()],
    ['Reporting window', reportingWindow.value],
    [],
    ['Summary metric', 'Value'],
    ['Total revenue (GHS)', currentSummary.totalRevenue],
    ['Total tickets', currentSummary.totalTickets],
    ['Paid tickets', currentSummary.paidTickets],
    ['Pending tickets', currentSummary.pendingTickets],
    ['Total quantity', currentSummary.totalQuantity],
    ['Active customers', currentSummary.activeCustomers],
    ['Total customers', currentSummary.totalCustomers],
    ['Active raffles', currentSummary.activeRaffles],
    ['Total raffles', currentSummary.totalRaffles],
    ['Total draws', currentSummary.totalDraws],
    ['Completed draws', currentSummary.completedDraws],
    ['Total winners', currentSummary.totalWinners],
    ['Pending payouts (GHS)', currentSummary.pendingPayouts],
    [],
    ['Ticket distribution'],
    ['Colour', 'Entries', 'Percentage (%)', 'Tickets', 'Revenue (GHS)'],
    ...(currentDistribution?.data ?? []).map((entry) => [
      entry.name,
      entry.entries,
      entry.percentage,
      entry.tickets,
      entry.revenue,
    ]),
    [],
    [
      'Totals',
      currentDistribution?.totalEntries ?? 0,
      '',
      currentDistribution?.totalTickets ?? 0,
      currentDistribution?.totalRevenue ?? 0,
    ],
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `nsaa-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success('Dashboard analytics exported.');
};
</script>

<template>
  <div class="space-y-6 pb-16 font-sans text-slate-900">
    <!-- Page header -->
    <div class="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-4">
          
           
             
        </div>
        <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Executive Dashboard</h1>
        <p class="text-sm font-medium text-slate-400 mt-2">
          A real-time pulse on revenue, tickets, customers and draws.
          <span v-if="lastUpdated" class="text-slate-300"> · Updated {{ lastUpdated }}</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <CalendarIcon class="w-4 h-4 text-slate-400" />
          <div class="leading-tight">
            <p class="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Reporting Window</p>
            <p class="text-[11px] font-black text-slate-700 mt-0.5">{{ reportingWindow }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="loadDashboard('refresh')"
          :disabled="isRefreshing || isLoading"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
          <span>{{ isRefreshing ? 'Syncing' : 'Refresh' }}</span>
        </button>

        <button
          type="button"
          @click="exportAnalytics"
          :disabled="isLoading || !summary"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-900 text-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>

    <!-- Dev preview notice -->
    <div
      v-if="isPreviewData"
      class="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4"
    >
      <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p class="text-xs font-black text-amber-800">Preview data</p>
        <p class="text-[11px] font-medium text-amber-700/80 mt-0.5">
          The reporting API isn't reachable from this environment, so sample figures are shown. Connect the API to see live data.
        </p>
      </div>
    </div>

    <!-- Partial failure notice -->
    <div
      v-if="hasPartialError"
      class="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4"
    >
      <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p class="text-xs font-black text-amber-800">Some analytics are missing</p>
        <p class="text-[11px] font-medium text-amber-700/80 mt-0.5">
          One of the reporting endpoints didn't respond. The figures below may be incomplete.
        </p>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div
          v-for="index in 4"
          :key="`kpi-skeleton-${index}`"
          class="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div class="w-11 h-11 rounded-2xl shimmer"></div>
            <div class="w-16 h-5 rounded-full shimmer"></div>
          </div>
          <div class="w-24 h-3 rounded-full shimmer mt-7"></div>
          <div class="w-32 h-7 rounded-xl shimmer mt-2"></div>
          <div class="w-40 h-3 rounded-full shimmer mt-3"></div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          v-for="index in 4"
          :key="`quick-skeleton-${index}`"
          class="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm flex items-center gap-4"
        >
          <div class="w-10 h-10 rounded-2xl shimmer shrink-0"></div>
          <div class="flex-1">
            <div class="w-20 h-2.5 rounded-full shimmer"></div>
            <div class="w-16 h-5 rounded-lg shimmer mt-2"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 h-[440px] rounded-[36px] bg-white border border-slate-100 shadow-sm shimmer"></div>
        <div class="h-[440px] rounded-[36px] bg-primary-900/90 shimmer"></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 h-[300px] rounded-[36px] bg-white border border-slate-100 shadow-sm shimmer"></div>
        <div class="h-[300px] rounded-[36px] bg-white border border-slate-100 shadow-sm shimmer"></div>
      </div>
    </div>

    <!-- Full failure state -->
    <div
      v-else-if="isError"
      class="bg-white rounded-[36px] border border-slate-100 shadow-sm p-12 text-center"
    >
      <div class="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
        <ExclamationTriangleIcon class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-black tracking-tight mt-6">Analytics are taking a break</h2>
      <p class="text-sm font-medium text-slate-400 mt-2 max-w-md mx-auto">
        We couldn't reach the reporting service. Check your connection and try again.
      </p>
      <button
        type="button"
        @click="loadDashboard('initial')"
        class="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-800 transition-all active:scale-95"
      >
        <ArrowPathIcon class="w-4 h-4" />
        Try again
      </button>
    </div>

    <!-- Dashboard content -->
    <div v-else class="space-y-6">
      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="group relative bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="p-3.5 rounded-2xl transition-all duration-500"
              :class="kpi.iconClass"
            >
              <component :is="kpi.icon" class="w-5 h-5" />
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
              :class="kpi.badgeClass"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="kpi.dotClass"></span>
              {{ kpi.badge }}
            </span>
          </div>
          <p class="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mt-6">{{ kpi.label }}</p>
          <p class="text-[26px] leading-tight font-black tracking-tight text-slate-900 mt-1">{{ kpi.value }}</p>
          <p class="text-[11px] font-bold text-slate-400 mt-2">{{ kpi.hint }}</p>
        </article>
      </div>

      <!-- Quick stats strip -->
      <div
        class="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div
          v-for="stat in quickStats"
          :key="stat.label"
          class="p-5 flex items-center gap-3.5"
        >
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" :class="stat.iconClass">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <p class="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 truncate">{{ stat.label }}</p>
            <p class="text-lg font-black tracking-tight text-slate-900 mt-0.5 truncate">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- Distribution + draw performance -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Ticket distribution -->
        <section
          class="xl:col-span-2 bg-white rounded-[36px] border border-slate-100 shadow-sm p-6 sm:p-8"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-600">Sales Mix</p>
              <h3 class="text-xl font-black tracking-tight mt-1">Ticket Distribution</h3>
              <p class="text-xs font-medium text-slate-400 mt-1">Entry share by raffle colour.</p>
            </div>
            <span
              class="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500"
            >
              <ChartPieIcon class="w-3.5 h-3.5 text-primary" />
              {{ formatNumber(distribution?.totalEntries) }} entries
            </span>
          </div>

          <div class="mt-8 grid md:grid-cols-[220px,1fr] gap-8 items-center">
            <!-- Donut -->
            <div class="relative mx-auto w-[220px] h-[220px]">
              <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90">
                <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" stroke-width="5.5" />
                <circle
                  v-for="(segment, index) in donutSegments"
                  :key="`segment-${segment.value}-${index}`"
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="none"
                  :stroke="segment.color"
                  stroke-width="5.5"
                  :stroke-dasharray="`${segment.pct} ${100 - segment.pct}`"
                  :stroke-dashoffset="-segment.offset"
                  class="transition-all duration-700"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Total Entries</p>
                <p class="text-3xl font-black tracking-tighter text-slate-900 mt-1">
                  {{ formatNumber(distribution?.totalEntries) }}
                </p>
                <p class="text-[10px] font-black text-emerald-600 mt-1">
                  {{ formatTicketCount(distribution?.totalTickets) }}
                </p>
              </div>
            </div>

            <!-- Legend -->
            <div class="space-y-2.5">
              <template v-for="(segment, index) in donutSegments" :key="`legend-${segment.value}-${index}`">
                <div
                  class="rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span
                        class="w-2.5 h-2.5 rounded-full shrink-0"
                        :style="{ backgroundColor: segment.color }"
                      ></span>
                      <span class="text-xs font-black text-slate-700 truncate">{{ segment.name }}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      <span class="text-[10px] font-bold text-slate-400">
                        {{ formatNumber(segment.entries) }} entries
                      </span>
                      <span class="text-xs font-black text-slate-900">{{ formatPercent(segment.pct) }}</span>
                    </div>
                  </div>
                  <div class="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{ width: `${segment.pct}%`, backgroundColor: segment.color }"
                    ></div>
                  </div>
                </div>
              </template>

              <div
                v-if="!donutSegments.length"
                class="rounded-2xl border border-dashed border-slate-200 p-8 text-center"
              >
                <ChartPieIcon class="w-8 h-8 mx-auto text-slate-300" />
                <p class="text-sm font-bold text-slate-500 mt-3">No ticket distribution yet</p>
                <p class="text-xs text-slate-400 mt-1">Colour data will appear as tickets are sold.</p>
              </div>
            </div>
          </div>

          <!-- Distribution totals -->
          <div class="mt-8 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50/60 border border-slate-100 py-4">
            <div class="px-4 text-center">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Entries</p>
              <p class="text-lg font-black tracking-tight mt-1">{{ formatNumber(distribution?.totalEntries) }}</p>
            </div>
            <div class="px-4 text-center">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Tickets</p>
              <p class="text-lg font-black tracking-tight mt-1">{{ formatNumber(distribution?.totalTickets) }}</p>
            </div>
            <div class="px-4 text-center">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Revenue</p>
              <p class="text-lg font-black tracking-tight mt-1 text-emerald-600">
                {{ formatCurrency(distribution?.totalRevenue) }}
              </p>
            </div>
          </div>
        </section>

        <!-- Draw performance -->
        <section
          class="relative overflow-hidden rounded-[36px] bg-primary-900 p-6 sm:p-8 text-white flex flex-col shadow-xl shadow-primary-900/10"
        >
          <div class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/20 blur-3xl"></div>
          <div class="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"></div>

          <div class="relative flex items-start justify-between gap-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-300">Draw Performance</p>
              <h3 class="text-xl font-black tracking-tight mt-1">Operational Pulse</h3>
            </div>
             
          </div>

          <div class="relative mt-8">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.16em] text-primary-300">Completion Rate</p>
                <p class="text-4xl font-black tracking-tighter mt-1">
                  {{ drawCompletionRate }}<span class="text-lg text-primary-300">%</span>
                </p>
              </div>
              <span
                class="px-3 py-1.5 rounded-full bg-white/10 text-[8px] font-black uppercase tracking-widest text-primary-100"
              >
                {{ formatNumber(summary?.completedDraws) }} of {{ formatNumber(summary?.totalDraws) }} draws
              </span>
            </div>
            <div class="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-secondary to-amber-300 transition-all duration-1000"
                :style="{ width: `${drawCompletionRate}%` }"
              ></div>
            </div>
          </div>

          <div class="relative mt-8 grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-primary-300">Total Raffles</p>
              <p class="text-xl font-black mt-1">{{ formatNumber(summary?.totalRaffles) }}</p>
            </div>
            <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-primary-300">Active Raffles</p>
              <p class="text-xl font-black mt-1">{{ formatNumber(summary?.activeRaffles) }}</p>
            </div>
            <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-primary-300">Total Draws</p>
              <p class="text-xl font-black mt-1">{{ formatNumber(summary?.totalDraws) }}</p>
            </div>
            <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p class="text-[8px] font-black uppercase tracking-[0.16em] text-primary-300">Completed Draws</p>
              <p class="text-xl font-black mt-1">{{ formatNumber(summary?.completedDraws) }}</p>
            </div>
          </div>

          <div class="relative mt-auto pt-6">
            <div class="rounded-2xl bg-secondary/10 border border-secondary/20 p-4 flex items-center justify-between gap-3">
              <div>
                <p class="text-[8px] font-black uppercase tracking-[0.16em] text-secondary">Pending Payouts</p>
                <p class="text-lg font-black mt-0.5">{{ formatCurrency(summary?.pendingPayouts) }}</p>
              </div>
              <CreditCardIcon class="w-5 h-5 text-secondary shrink-0" />
            </div>
          </div>
        </section>
      </div>

      <!-- Payment health + quick actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Payment health -->
        <section
          class="lg:col-span-2 bg-white rounded-[36px] border border-slate-100 shadow-sm p-6 sm:p-8"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-600">Cash Flow</p>
              <h3 class="text-xl font-black tracking-tight mt-1">Ticket Payment Health</h3>
              <p class="text-xs font-medium text-slate-400 mt-1">Paid versus pending tickets across all raffles.</p>
            </div>
            <span
              class="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black uppercase tracking-widest text-emerald-700"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>

          <div class="mt-8 flex items-end justify-between gap-4">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Paid Tickets</p>
              <p class="text-3xl font-black tracking-tight mt-1">{{ formatNumber(summary?.paidTickets) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Pending Tickets</p>
              <p class="text-3xl font-black tracking-tight mt-1 text-amber-500">
                {{ formatNumber(summary?.pendingTickets) }}
              </p>
            </div>
          </div>

          <div class="mt-4 h-3 rounded-full bg-amber-100 overflow-hidden flex">
            <div
              class="h-full bg-emerald-500 transition-all duration-700"
              :style="{ width: `${paidTicketShare}%` }"
            ></div>
          </div>
          <div class="mt-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
            <span class="text-emerald-600">{{ paidTicketShare }}% paid</span>
            <span class="text-amber-600">{{ pendingTicketShare }}% pending</span>
          </div>

          <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              v-for="metric in healthMetrics"
              :key="metric.label"
              class="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
            >
              <div class="w-8 h-8 rounded-xl flex items-center justify-center" :class="metric.iconClass">
                <component :is="metric.icon" class="w-4 h-4" />
              </div>
              <p class="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400 mt-3 truncate">
                {{ metric.label }}
              </p>
              <p class="text-sm font-black tracking-tight text-slate-900 mt-1 truncate">{{ metric.value }}</p>
            </div>
          </div>
        </section>

        <!-- Quick actions -->
        <section
          class="bg-white rounded-[36px] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col"
        >
          <div>
            <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-600">Shortcuts</p>
            <h3 class="text-xl font-black tracking-tight mt-1">Quick Actions</h3>
            <p class="text-xs font-medium text-slate-400 mt-1">Jump straight into operations.</p>
          </div>

          <div class="mt-6 space-y-2.5 flex-1">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.href"
              :to="action.href"
              class="group flex items-center gap-3.5 rounded-2xl border border-slate-100 p-3.5 hover:border-primary-200 hover:bg-primary-50/40 transition-all"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="action.iconClass">
                <component :is="action.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black text-slate-800">{{ action.label }}</p>
                <p class="text-[10px] font-medium text-slate-400 truncate">{{ action.description }}</p>
              </div>
              <ChevronRightIcon
                class="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </NuxtLink>
          </div>

           
        </section>
      </div>
    </div>
  </div>
</template>
