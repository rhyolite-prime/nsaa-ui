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
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';

import type { Ticket, Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import {
  getStatusBadge,
  getStatusText,
  getColorBadge,
} from '~/utils/statusConfig';

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
const activeRaffleList = ref<Raffle[]>([]);

const isShimmerLoading = ref(true);
const isExporting = ref(false);

const fetchTickets = async (pageNo: number, pageSize: number) => {
    return await getTickets({
        query: filters.query,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        pageNo,
        pageSize,
    });
};

const getPaginatedTickets = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await fetchTickets(filters.pageNo, filters.pageSize);

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

const exportTickets = async () => {
    if (isExporting.value) return;

    isExporting.value = true;

    try {
        // Reuse the same filters as the page, but request every record at once.
        const result = await fetchTickets(1, 500000);
        const tickets = Array.isArray(result?.data) ? result.data : [];

        if (!tickets.length) {
            toast.error('There are no tickets to export for the current filters.');
            return;
        }

        const headers = [
            'Ticket ID',
            'Ticket Alias',
            'Customer Phone',
            'Purchase Date',
            'Selected Option',
            'Quantity',
            'Amount (GHS)',
            'Payment Status',
            'Payment Method',
            'Payment Reference',
        ];

        const rows = tickets.map((ticket) => [
            ticket.ticketNumber,
            ticket.ticketAlias,
            ticket.customerPhone,
            ticket.createdAt,
            ticket.selectedOptionName,
            ticket.quantity,
            ticket.totalAmount,
            getStatusText(ticket.paymentStatus),
            ticket.paymentMethod,
            ticket.paymentReference,
        ]);

        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `nsaa-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success(`${tickets.length.toLocaleString()} tickets exported.`);
    } catch (error) {
        console.error('Ticket export failed:', error);
        toast.error('Unable to export tickets. Please try again.');
    } finally {
        isExporting.value = false;
    }
};


const onPageChange = async (pageNumber: number) => {
  filters.pageNo = pageNumber;
  const filteredQuery = filterQueryParams({ ...route.query, ...filters });
  router.replace({ name: route.name ?? '', query: filteredQuery });
  await getPaginatedTickets();
};


// Status display config is shared — see ~/utils/statusConfig.ts

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
   

  });

</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ticket Explorer</h1>
        <p class="text-slate-500 text-sm font-medium">Real-time entry monitoring.</p>
      </div>
      <button
        type="button"
        @click="exportTickets"
        :disabled="isExporting || isShimmerLoading"
        title="Export all filtered tickets as CSV"
        class="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 shrink-0"
      >
        <ArrowPathIcon v-if="isExporting" class="w-4 h-4 animate-spin text-primary" />
        <ArrowDownTrayIcon v-else class="w-4 h-4 text-primary" />
        <span>{{ isExporting ? 'Exporting…' : 'Export CSV' }}</span>
      </button>
    </div>

    

    <!-- List active raffles for selection, when a user selects an active raffle we display the ticket records for that raffle -->
     

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
              <option value="1">Paid</option>
              <option value="0">Pending</option>
              <option value="2">Failed</option>
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
              <th class="px-8 py-5">Selected Option</th>
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
              <td class="px-8 py-5 font-black text-slate-900 text-right">{{ ticket.totalAmount }}</td>
              <td class="px-8 py-5 text-center">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest inline-flex items-center" :class="getStatusBadge(ticket.paymentStatus)">
                  {{ getStatusText(ticket.paymentStatus) }}
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
