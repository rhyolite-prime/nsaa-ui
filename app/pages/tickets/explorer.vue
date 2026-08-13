<script setup lang="ts">
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  TicketIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

import type { Ticket, TicketStats, Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

useHead({
  title: 'Tickets | NSAA BO'
})


const router = useRouter();
const route = useRoute();

const filters = reactive({
  query: '',
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
const activeRaffle = ref<Raffle | null>(null);

const isShimmerLoading = ref(true);

const getPaginatedTickets = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getTickets(filters);
        ticketStats.value = await getTicketStats();

        ticketList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        toast.error('Unable to fetch tickets !');
    } finally {
        isShimmerLoading.value = false;
    }
  
}

const getActiveRaffleData = async () => {
    try {
        const result = await getActiveRaffle();
        activeRaffle.value = result;
    } catch (error) {
        console.error('Unable to fetch active raffle');
    }
}

const onPageChange = async (pageNumber: number) => {
  filters.pageNo = pageNumber;
  const filteredQuery = filterQueryParams({ ...route.query, ...filters });
  router.replace({ name: route.name ?? '', query: filteredQuery });
  await getPaginatedTickets();
};


const getColorBadge = (color: string) => {
  switch (color) {
    case 'Red': return 'bg-red-50 text-red-700 border-red-100';
    case 'Gold': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Green': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Black Star': return 'bg-slate-100 text-slate-800 border-slate-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedTickets();
  }, 300); // 300ms delay


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
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedTickets();
    await getActiveRaffleData();

  });

</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ticket Explorer</h1>
        <p class="text-slate-500 text-sm font-medium">Real-time entry monitoring.</p>
      </div>
      <!-- <button class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export CSV
      </button> -->
    </div>

    <!-- Active Raffle Banner -->
    <template v-if="isShimmerLoading && !activeRaffle">
      <div class="bg-slate-900 rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 mb-8 min-h-[220px]">
        <div class="absolute inset-0 shimmer opacity-10"></div>
        <div class="relative z-10 flex flex-col gap-4 w-full md:w-auto">
          <div class="w-32 h-4 bg-white/10 rounded-full"></div>
          <div class="space-y-2">
            <div class="w-64 h-8 bg-white/20 rounded-xl"></div>
            <div class="w-24 h-3 bg-white/10 rounded-lg"></div>
          </div>
          <div class="flex gap-4 mt-2">
            <div class="w-32 h-3 bg-white/10 rounded-lg"></div>
            <div class="w-32 h-3 bg-white/10 rounded-lg"></div>
          </div>
        </div>
        <div class="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
          <div class="bg-white/5 border border-white/10 p-6 rounded-3xl min-w-[160px]">
             <div class="w-16 h-2 bg-white/10 rounded mb-3"></div>
             <div class="w-24 h-6 bg-white/20 rounded-lg"></div>
          </div>
          <div class="bg-white/5 border border-white/10 p-6 rounded-3xl min-w-[160px]">
             <div class="w-16 h-2 bg-white/10 rounded mb-3"></div>
             <div class="w-24 h-6 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="activeRaffle" class="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
      <!-- Background Decorative Element -->
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -left-10 -top-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
      
      <div class="relative z-10 flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Current Raffle Campaign</span>
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <h2 class="text-3xl font-black tracking-tight mb-1 text-white">{{ activeRaffle.name }}</h2>
          <p class="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{{ activeRaffle.slug }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-6 mt-2">
            <div class="flex items-center gap-2">
                <CalendarIcon class="w-4 h-4 text-white/20" />
                <span class="text-[10px] font-black uppercase tracking-widest text-white/60">Ends {{ standardDateFormat(activeRaffle.endsAt) }}</span>
            </div>
            <div class="flex items-center gap-2 md:border-l md:border-white/10 md:pl-6">
                <ClockIcon class="w-4 h-4 text-white/20" />
                <span class="text-[10px] font-black uppercase tracking-widest text-white/60">{{ rawTimeFormat(activeRaffle.endsAt) }}</span>
            </div>
        </div>
      </div>

      <div class="relative z-10 grid grid-cols-2 gap-4 w-full md:w-auto">
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[160px] hover:bg-white/10 transition-colors">
          <p class="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-1">Live Prize Pool</p>
          <p class="text-2xl font-black tracking-tight text-white">{{ _currency(activeRaffle.prizePool) }}</p>
        </div>
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[160px] hover:bg-white/10 transition-colors">
          <p class="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black mb-1">Total Entries</p>
          <p class="text-2xl font-black tracking-tight text-white">{{ toNumber(activeRaffle.totalEntries) }}</p>
        </div>
      </div>
    </div>

    <!-- Stats for Tickets -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <template v-if="isShimmerLoading">
        <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between items-center mb-4">
             <div class="w-5 h-5 bg-slate-100 rounded-lg shimmer"></div>
             <div class="w-20 h-2 bg-slate-50 rounded shimmer"></div>
          </div>
          <div class="h-8 w-2/3 bg-slate-100 rounded-xl shimmer mb-2"></div>
          <div class="h-3 w-1/2 bg-slate-50 rounded shimmer"></div>
        </div>
      </template>

      <template v-else>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between opacity-30 mb-3">
            <TagIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Tickets</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ ticketStats?.totalTickets }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Tickets</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between opacity-30 mb-3">
            <TicketIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Active Tickets</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ ticketStats?.activeTickets }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Tickets</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between opacity-30 mb-3">
            <ChartBarIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Conversion Rate</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ toNumber(ticketStats?.conversionRate) }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Conversion Rate</div>
        </div>
      

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between opacity-30 mb-3">
            <BanknotesIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Revenue</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ _currency(ticketStats?.totalRevenue) }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Revenue</div>
        </div>
      </template>
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
          <!-- Status Dropdown -->
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

          <!-- Date Range -->
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

          <!-- Reset Button -->
          <button 
            v-if="filters.status || filters.startDate || filters.endDate || filters.query"
            @click="Object.assign(filters, { query: '', status: '', startDate: '', endDate: '', pageNo: 1 })"
            class="px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest shrink-0"
          >
            Clear
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
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
            <template v-if="isShimmerLoading">
              <tr v-for="i in 5" :key="i">
                <td class="px-8 py-5"><div class="h-4 w-20 bg-slate-100 rounded shimmer"></div></td>
                <td class="px-8 py-5">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-slate-100 shimmer"></div>
                      <div class="h-4 w-24 bg-slate-100 rounded shimmer"></div>
                   </div>
                </td>
                <td class="px-8 py-5"><div class="h-4 w-32 bg-slate-50 rounded shimmer"></div></td>
                <td class="px-8 py-5"><div class="h-6 w-24 rounded-full bg-slate-100/50 shimmer"></div></td>
                <td class="px-8 py-5 font-black text-slate-900"><div class="h-4 w-8 bg-slate-100 rounded shimmer"></div></td>
                <td class="px-8 py-5 text-right"><div class="h-4 w-12 bg-slate-100 rounded shimmer ml-auto"></div></td>
                <td class="px-8 py-5 flex justify-center"><div class="h-6 w-20 rounded-full bg-slate-100/50 shimmer"></div></td>
              </tr>
            </template>
            <tr v-else v-for="ticket in ticketList" :key="ticket.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-5 font-bold text-slate-900 tracking-tight">{{ ticket.ticketNumber }}</td>
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
                   <span class="w-1.5 h-1.5 rounded-full shadow-sm" :class="[
                      ticket.colourName === 'Red' ? 'bg-red-500' :
                      ticket.colourName === 'Gold' ? 'bg-amber-500' :
                      ticket.colourName === 'Black Star' ? 'bg-black-500' :
                      ticket.colourName === 'Green' ? 'bg-emerald-500' : 'bg-slate-600'
                   ]"></span>
                   {{ ticket.colourName }}
                </span>
              </td>
              <td class="px-8 py-5 font-black text-slate-900">{{ ticket.quantity }}</td>
              <td class="px-8 py-5 font-black text-slate-900 text-right">{{ ticket.totalAmount }}</td>
              <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest inline-flex items-center" :class="getStatusBadge(ticket.paymentStatus)">
                  {{ ticket.paymentStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          Total Base: {{ paginationParams.totalCount.toLocaleString() }} Tickets
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
