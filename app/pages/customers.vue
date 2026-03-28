<script setup lang="ts">
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  UserIcon,
  TicketIcon,
  TrophyIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon
} from '@heroicons/vue/24/outline';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import type { Customer, CustomerStats } from "~/models";
import { isEmpty, debounce } from "lodash-es";


useHead({
  title: 'Customers | NSAA BO'
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


const customerList = ref<Customer[]>([]);
const customerStats = ref<CustomerStats>();

const isShimmerLoading = ref(true);

const getPaginatedCustomers = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getCustomers(filters);
        customerStats.value = await getCustomerStats();
      

        customerList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        toast.error('Unable to fetch customers !');
    } finally {
        isShimmerLoading.value = false;
    }

}

const onPageChange = async (pageNumber: number) => {
  filters.pageNo = pageNumber;
  const filteredQuery = filterQueryParams({ ...route.query, ...filters });
  router.replace({ name: route.name ?? '', query: filteredQuery });
  await getPaginatedCustomers();
};

const getDisplayName = (user: Customer) => {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();

  if (first || last) {
    return [first, last].filter(Boolean).join(" ");
  }

  // fallback if no name is available
  return user.msisdn ? `Customer ${user.msisdn}` : "Anonymous Customer";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Flagged': return 'bg-rose-50 text-rose-700 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedCustomers();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedCustomers();

  });
</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h1>
        <p class="text-slate-500 text-sm font-medium">View and manage your player base.</p>
      </div>
      <!-- <button class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export Base
      </button> -->
    </div>

    <!-- Stats for Customers -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <template v-if="isShimmerLoading">
        <div v-for="i in 5" :key="i" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div class="flex justify-between items-center mb-4">
             <div class="w-5 h-5 bg-slate-100 rounded-lg shimmer"></div>
             <div class="w-20 h-2 bg-slate-50 rounded shimmer"></div>
          </div>
          <div class="h-8 w-2/3 bg-slate-100 rounded-xl shimmer mb-2"></div>
          <div class="h-3 w-1/2 bg-slate-50 rounded shimmer"></div>
        </div>
      </template>

      <template v-else>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between opacity-30 mb-3">
            <UserIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Customers</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ customerStats?.totalCustomers }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Customers</div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between opacity-30 mb-3">
            <UserIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Active Customers</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ customerStats?.activeCustomers }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Customers</div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between opacity-30 mb-3">
            <TrophyIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Wins</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight"> {{ customerStats?.totalWins }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Wins</div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between opacity-30 mb-3">
            <BanknotesIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Spent</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">GHS {{ _currency(customerStats?.totalSpent) }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Spent</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between opacity-30 mb-3">
            <BanknotesIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Won</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">GHS {{ _currency(customerStats?.totalWon) }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Won</div>
        </div>
      </template>
    </div>

    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center bg-slate-50/20">
        <div class="relative flex-1 w-full">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="filters.query"
            type="text" 
            placeholder="Search phone, name or ID..." 
            class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 font-medium transition-all" 
          />
        </div>
         
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th class="px-8 py-5">Customer Detail</th>
              <th class="px-8 py-5">Joined Date</th>
              <th class="px-8 py-5 text-center">Total Entries</th>
              <th class="px-8 py-5 text-center">Total Wins</th>
              <th class="px-8 py-5 text-center">Account Status</th>
              <th class="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-50 text-slate-600">
            <template v-if="isShimmerLoading">
               <tr v-for="i in 5" :key="i">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 shimmer"></div>
                    <div>
                      <div class="h-4 w-32 bg-slate-100 rounded shimmer mb-1"></div>
                      <div class="h-2 w-20 bg-slate-50 rounded shimmer"></div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6"><div class="h-3 w-28 bg-slate-50 rounded shimmer"></div></td>
                <td class="px-8 py-6"><div class="h-4 w-8 bg-slate-100 rounded shimmer mx-auto"></div></td>
                <td class="px-8 py-6 text-center"><div class="h-6 w-16 bg-slate-50 rounded-lg shimmer mx-auto"></div></td>
                <td class="px-8 py-6 text-center"><div class="h-6 w-20 rounded-full bg-slate-50 shimmer mx-auto"></div></td>
                <td class="px-8 py-6 text-right"><div class="h-4 w-12 bg-slate-50 rounded shimmer ml-auto"></div></td>
              </tr>
            </template>
            <tr v-else v-for="user in customerList" :key="user.msisdn" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-900 group-hover:text-white transition-all transform group-hover:rotate-6">
                    <UserIcon class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-slate-900 tracking-tight text-sm">{{ getDisplayName(user) }}</div>
                    <div class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider flex items-center gap-1">
                       <DevicePhoneMobileIcon class="w-3 h-3 opacity-50" />
                       {{ user.msisdn }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-wide">{{ standardDateFormat(user.createdAt) }}</td>
              <td class="px-8 py-6 text-center">
                 <span class="font-black text-slate-800 tracking-tight">{{ user.numberOfEntries }}</span>
              </td>
              <td class="px-8 py-6 text-center">
                 <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black" :class="user.numberOfWins > 0 ? 'bg-amber-50 text-amber-600' : 'text-slate-300'">
                    <TrophyIcon v-if="user.numberOfWins > 0" class="w-3.5 h-3.5" />
                    {{ user.numberOfWins }}
                 </span>
              </td>
              <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest inline-flex items-center gap-2" :class="getStatusBadge(user.status)">
                   <span class="w-1.5 h-1.5 rounded-full shadow-sm" :class="user.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                   {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <button class="text-primary-600 hover:text-primary-800 font-black uppercase text-[10px] tracking-widest hover:underline">Profile</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          Total Base: {{ paginationParams.totalCount.toLocaleString() }} Customers
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
