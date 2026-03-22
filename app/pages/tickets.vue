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
  ChartBarIcon
} from '@heroicons/vue/24/outline';

import type { Ticket, TicketStats } from "~/models";
import { isEmpty, debounce } from "lodash-es";

const { $toast } = useNuxtApp();

useHead({
  title: 'Tickets | NSAA BO'
})


const router = useRouter();
const route = useRoute();

const filters = reactive({
  query: '',
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
        $toast.error('Unable to fetch tickets !');
    } finally {
        isShimmerLoading.value = false;
    }
  
}


const getColorBadge = (color: string) => {
  switch (color) {
    case 'Red': return 'bg-red-50 text-red-700 border-red-100';
    case 'Gold': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Green': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Black Star': return 'bg-slate-100 text-slate-800 border-slate-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedTickets();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedTickets();

  });

</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ticket Explorer</h1>
        <p class="text-slate-500 text-sm font-medium">Real-time entry monitoring.</p>
      </div>
      <button class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export CSV
      </button>
    </div>

    <!-- Stats for Tickets -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">

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

      <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex justify-between opacity-30 mb-3">
           <TagIcon class="w-5 h-5" />
           <span class="text-[9px] font-black uppercase tracking-widest">Total Tickets</span>
        </div>
        <div class="text-2xl font-black text-slate-800 tracking-tight">{{ ticketStats?.totalTickets }}</div>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Tickets</div>
      </div>
      
    </div>

    

    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center bg-slate-50/30">
        <div class="relative flex-1 w-full">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search entries..." class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 font-medium" />
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <button class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <FunnelIcon class="w-4 h-4" />
            Filters
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
            <tr v-for="ticket in ticketList" :key="ticket.id" class="hover:bg-slate-50/50 transition-colors group">
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
                <span class="text-emerald-600 font-black uppercase text-[10px] tracking-widest">{{ ticket.paymentStatus }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Page 1 of 4,923</span>
        <div class="flex gap-2">
           <button class="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all" disabled>Prev</button>
           <button class="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
