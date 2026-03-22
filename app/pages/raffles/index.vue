<script setup lang="ts">
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

import type { Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";

const { $toast } = useNuxtApp();

useHead({
  title: 'Raffles | NSAA BO'
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


const raffleList = ref<Raffle[]>([]);

const isShimmerLoading = ref(true);


const getPaginatedRaffles = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getRaffles(filters);

        raffleList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        $toast.error('Unable to fetch raffles !');
    } finally {
        isShimmerLoading.value = false;
    }

}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-blue-100 text-blue-700';
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
    case 'UPCOMING': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedRaffles();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedRaffles();

  });

</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Raffle Campaigns</h1>
        <p class="text-slate-500 text-sm font-medium">Manage and monitor draws.</p>
      </div>
      <button class="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:shadow-xl active:scale-95">
        <PlusIcon class="w-5 h-5 stroke-2" />
        New Raffle
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by ID or Title..." 
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-sm font-medium transition-all"
        />
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-wider">
          <FunnelIcon class="w-4 h-4" />
          Status
        </button>
        <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-wider">
          <CalendarIcon class="w-4 h-4" />
          Date
        </button>
      </div>
    </div>

    <!-- Raffle Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="raffle in raffleList" :key="raffle.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
        <div class="p-8">
          <div class="flex justify-between items-start mb-6">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="getStatusClass(raffle.status)">
              {{ raffle.status }}
            </span>
            <button class="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
               <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
          </div>
          
          <h3 class="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-700 transition-colors tracking-tight">{{ raffle.name }}</h3>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{{ raffle.slug }}</p>
          
          <div class="grid grid-cols-2 gap-4 mb-8">

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Current Pool</p>
              <p class="text-sm font-black text-slate-800 tracking-tight">{{ _currency(raffle.prizePool) }}</p>
            </div>

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Entries</p>
              <p class="text-sm font-black text-slate-800 tracking-tight">{{ toNumber(raffle.totalEntries) }}</p>
            </div>

          </div>

          <div class="space-y-4">
            <!-- Dates Section -->
            <div class="grid grid-cols-1 gap-3">
              <!-- Starts -->
              <div v-if="raffle.startsAt" class="flex flex-col gap-1">
                <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black">Starts</p>
                <div class="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <CalendarIcon class="w-3.5 h-3.5 opacity-50" />
                    <span>{{ standardDateFormat(raffle.startsAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <ClockIcon class="w-3.5 h-3.5 opacity-50" />
                    <span>{{ rawTimeFormat(raffle.startsAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Ends -->
              <div v-if="raffle.endsAt" class="flex flex-col gap-1">
                <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black">Ends</p>
                <div class="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <CalendarIcon class="w-3.5 h-3.5 opacity-50" />
                    <span>{{ standardDateFormat(raffle.endsAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <ClockIcon class="w-3.5 h-3.5 opacity-50" />
                    <span>{{ rawTimeFormat(raffle.endsAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Draw -->
              <div v-if="raffle.drawTime" class="flex flex-col gap-1">
                <p class="text-[9px] uppercase tracking-widest text-primary-400 font-black">Final Draw</p>
                <div class="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <div class="flex items-center gap-1.5">
                    <CalendarIcon class="w-3.5 h-3.5 text-primary-500" />
                    <span>{{ standardDateFormat(raffle.drawTime) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <ClockIcon class="w-3.5 h-3.5 text-primary-500" />
                    <span>{{ rawTimeFormat(raffle.drawTime) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Winner Section -->
            <div v-if="raffle.winningColour && raffle.status !== 'ACTIVE'" class="flex items-center gap-3 text-xs font-bold text-slate-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/50">
              <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
              <span>Winner: <span class="uppercase tracking-widest text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded ml-1">{{ raffle.winningColour }}</span></span>
            </div>
          </div>
        </div>
        
        <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-primary-50 transition-colors">
          <NuxtLink :to="`/raffles/${raffle.id}`" class="text-[11px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-800 flex items-center gap-2">
             Manage Draw
             <ChevronRightIcon class="w-4 h-4" />
          </NuxtLink>
          <PlayIcon v-if="raffle.status === 'Active'" class="w-5 h-5 text-secondary animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>
