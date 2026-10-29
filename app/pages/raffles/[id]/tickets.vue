<script setup lang="ts">
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  TicketIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon,
  ChevronLeftIcon
} from '@heroicons/vue/24/outline';

import type { Ticket, TicketStats, Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import {
  getRaffleStatusConfig,
  getStatusBadge,
  getStatusText,
  getColorBadge,
} from '~/utils/statusConfig';

const router = useRouter();
const route = useRoute();
const raffleId = route.params.id as string;

// Status display config is shared — see ~/utils/statusConfig.ts

useHead({
  title: 'Raffle Tickets | NSAA BO'
})

const filters = reactive({
  query: '',
  raffleId: raffleId,
  status: '',
  startDate: '',
  endDate: '',
  pageNo: 1,
  pageSize: 10,
});

const paginationParams = reactive({
  totalPages: 0,
  totalCount: 0,
  lowerBound: 0,
  upperBound: 0
});

const ticketList = ref<Ticket[]>([]);
const ticketStats = ref<TicketStats>();
const raffle = ref<Raffle | null>(null);

const isShimmerLoading = ref(true);


const getPaginatedTickets = async () => {

  isShimmerLoading.value = true;

  try {
      
         let result = await getTickets(filters);
        
        ticketStats.value  = await getRaffleTicketStats(raffleId);
         
         ticketList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        toast.error('Unable to fetch raffle tickets!');
    } finally {
        isShimmerLoading.value = false;
    }
}

const getRaffleData = async () => {
    try {
        const result = await getRaffleDetails(raffleId);
        raffle.value = result;
    } catch (error) {
        console.error('Unable to fetch raffle details');
    }
}

const onPageChange = async (pageNumber: number) => {
  filters.pageNo = pageNumber;
  const filteredQuery = filterQueryParams({ ...route.query, ...filters });
  router.replace({ query: filteredQuery });
  await getPaginatedTickets();
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1;
    getPaginatedTickets();
  }, 300);

watch(() => filters.query, debouncedSearch);
watch(() => filters.status, () => {
    filters.pageNo = 1;
    getPaginatedTickets();
});
watch([() => filters.startDate, () => filters.endDate], () => {
    filters.pageNo = 1;
    getPaginatedTickets();
});

onMounted(async () => {
    if (!isEmpty(route.query)) {
        if (route.query.pageNo) filters.pageNo = parseInt(route.query.pageNo as string);
        if (route.query.status) filters.status = route.query.status as string;
        if (route.query.query) filters.query = route.query.query as string;
    }
    
    await getPaginatedTickets();
    await getRaffleData();
});

</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink :to="`/raffles/${raffleId}`" class="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-600 transition-all shadow-sm">
          <ChevronLeftIcon class="w-6 h-6" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Raffle Tickets</h1>
          <p class="text-slate-500 text-sm font-medium">Viewing entries for <span class="text-slate-900 font-bold">{{ raffle?.name || raffleId }}</span></p>
        </div>
      </div>
    </div>

    <!-- Raffle Banner -->
    <div v-if="raffle" class="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-10 -top-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
      
      <div class="relative z-10 flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Raffle Campaign</span>
          <!-- Raffle status pill -->
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
            :class="getRaffleStatusConfig(raffle.status).pill"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="[
                getRaffleStatusConfig(raffle.status).dot,
                getRaffleStatusConfig(raffle.status).pulse ? 'animate-pulse' : ''
              ]"
            />
            {{ getRaffleStatusConfig(raffle.status).label }}
          </span>
        </div>
        <div>
          <h2 class="text-3xl font-black tracking-tight mb-1 text-white">{{ raffle.name }}</h2>
          <p class="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{{ raffle.slug }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-6 mt-2">
            <div class="flex items-center gap-2">
                <CalendarIcon class="w-4 h-4 text-white/20" />
                <span class="text-[10px] font-black uppercase tracking-widest text-white/60">Ends {{ standardDateFormat(raffle.endsAt) }}</span>
            </div>
            <div class="flex items-center gap-2 md:border-l md:border-white/10 md:pl-6">
                <ClockIcon class="w-4 h-4 text-white/20" />
                <span class="text-[10px] font-black uppercase tracking-widest text-white/60">{{ longDateAndTimeFormat(raffle.endTime) }}</span>
            </div>
        </div>
      </div>

      <div class="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[160px] hover:bg-white/10 transition-colors">
          <p class="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-1">Winning Option</p>
          <p class="text-2xl font-black tracking-tight text-white">{{ raffle.winningOptionName || 'N/A' }}</p>
        </div>
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[160px] hover:bg-white/10 transition-colors">
          <p class="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-1">Total Entries</p>
          <p class="text-2xl font-black tracking-tight text-white">{{ toNumber(raffle.totalEntries) }}</p>
        </div>
      </div>
    </div>

    <!-- Stats for Tickets -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex justify-between opacity-30 mb-3">
           <TagIcon class="w-5 h-5" />
           <span class="text-[9px] font-black uppercase tracking-widest">Total Tickets</span>
        </div>
        <div class="text-2xl font-black text-slate-800 tracking-tight">{{ ticketStats?.totalTickets || 0 }}</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Tickets</div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex justify-between opacity-30 mb-3">
           <TicketIcon class="w-5 h-5" />
           <span class="text-[9px] font-black uppercase tracking-widest">Active Tickets</span>
        </div>
        <div class="text-2xl font-black text-slate-800 tracking-tight">{{ ticketStats?.activeTickets || 0 }}</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Tickets</div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex justify-between opacity-30 mb-3">
           <ChartBarIcon class="w-5 h-5" />
           <span class="text-[9px] font-black uppercase tracking-widest">Conversion Rate</span>
        </div>
        <div class="text-2xl font-black text-slate-800 tracking-tight">{{ toNumber(ticketStats?.conversionRate || 0) }} %</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Conversion Rate</div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex justify-between opacity-30 mb-3">
           <BanknotesIcon class="w-5 h-5" />
           <span class="text-[9px] font-black uppercase tracking-widest">Total Revenue</span>
        </div>
        <div class="text-2xl font-black text-slate-800 tracking-tight">{{ _currency(ticketStats?.totalRevenue || 0) }}</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Revenue</div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4 items-center bg-slate-50/30">
        <div class="relative flex-1 lg:flex-[2] w-full">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            v-model="filters.query"
            type="text" 
            placeholder="Search by Ticket ID or Phone..." 
            class="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-medium transition-all" 
          />
        </div>
        
        <div class="flex flex-wrap md:flex-nowrap gap-3 flex-[3] w-full lg:w-auto">
          <div class="relative w-full md:w-48">
            <FunnelIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select 
              v-model="filters.status"
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-black uppercase tracking-wider text-slate-600 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-1 min-w-[280px]">
            <div class="relative flex-1">
              <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                v-model="filters.startDate"
                type="date" 
                class="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-bold text-slate-600 transition-all"
              />
            </div>
            <span class="text-slate-300 font-bold text-xs uppercase tracking-widest">to</span>
            <div class="relative flex-1">
              <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                v-model="filters.endDate"
                type="date" 
                class="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-bold text-slate-600 transition-all"
              />
            </div>
          </div>

          <button 
            v-if="filters.status || filters.startDate || filters.endDate || filters.query"
            @click="Object.assign(filters, { query: '', status: '', startDate: '', endDate: '', pageNo: 1 })"
            class="px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest shrink-0"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="overflow-x-auto min-h-[400px] relative">
        <div v-if="isShimmerLoading" class="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
                <div class="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Tickets...</p>
            </div>
        </div>

        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th class="px-8 py-5">Ticket ID</th>
              <th class="px-8 py-5">Customer</th>
              <th class="px-8 py-5">Purchase Date</th>
              <th class="px-8 py-5">Selected Color</th>
              <th class="px-8 py-5">Quantity</th>
              <th class="px-8 py-5 text-right">Amount</th>
              <th class="px-8 py-5 text-center">Status</th>
            </tr>
          </thead>

          <tbody class="text-sm divide-y divide-slate-50 text-slate-600">
            <tr v-for="ticket in ticketList" :key="ticket.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-5 font-bold text-slate-900 tracking-tight">{{ ticket.ticketNumber }} ({{ ticket.ticketAlias }})</td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <UserIcon class="w-4 h-4" />
                  </div>
                  <span class="font-bold text-slate-700 tracking-tight">{{ ticket.customerPhone }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2 text-slate-400 font-medium text-xs">
                   <ClockIcon class="w-3.5 h-3.5 opacity-50" />
                   {{ standardDateFormat(ticket.createdAt) }}
                </div>
              </td>
               <td class="px-8 py-5">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest inline-flex items-center gap-2" :class="getColorBadge(ticket.colourName)">
                   <span class="w-1.5 h-1.5 rounded-full shadow-sm bg-slate-600"></span>
                   {{ ticket.selectedOptionName }}
                </span>
              </td>
              <td class="px-8 py-5 font-black text-slate-900">{{ ticket.quantity }}</td>
              <td class="px-8 py-5 font-black text-slate-900 text-right">{{ _currency(ticket.totalAmount) }}</td>
              <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest inline-flex items-center" :class="getStatusBadge(ticket.paymentStatus)">
                  {{ getStatusText(ticket.paymentStatus) }}
                </span>
              </td>
            </tr>
            <tr v-if="ticketList.length === 0 && !isShimmerLoading">
               <td colspan="7" class="px-8 py-20 text-center">
                  <div class="flex flex-col items-center gap-4 opacity-20">
                     <TicketIcon class="w-12 h-12" />
                     <p class="text-xs font-black uppercase tracking-[0.3em]">No tickets found for this raffle</p>
                  </div>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          Total Found: {{ paginationParams.totalCount.toLocaleString() }} Tickets
        </span>
        <div class="order-1 sm:order-2">
           <Pagination 
             :current-page="filters.pageNo" 
             :total-pages="paginationParams.totalPages" 
             @page-change="onPageChange"
           />
        </div>
      </div>
    </div>
  </div>
</template>
