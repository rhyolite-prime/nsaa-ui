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

import type { Customer, CustomerStats } from "~/models";
import { isEmpty, debounce } from "lodash-es";

const { $toast } = useNuxtApp();

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
        $toast.error('Unable to fetch customers !');
    } finally {
        isShimmerLoading.value = false;
    }

}

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
      <button class="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export Base
      </button>
    </div>

    <!-- Stats for Customers -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
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
       
    </div>

    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center bg-slate-50/20">
        <div class="relative flex-1 w-full">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search phone, name or ID..." class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 font-medium" />
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <button class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <FunnelIcon class="w-4 h-4" />
            Segment
          </button>
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
            <tr v-for="user in customerList" :key="user.msisdn" class="hover:bg-slate-50/50 transition-colors group">
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
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Segment: 12,402 Individuals</span>
        <div class="flex gap-2">
           <button class="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm">Previous</button>
           <button class="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">Next Page</button>
        </div>
      </div>
    </div>
  </div>
</template>
