<script setup lang="ts">
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
} from '@heroicons/vue/24/outline';

import type { Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { getRaffleStatusConfig } from '~/utils/statusConfig';

useHead({
  title: 'Raffles | NSAA BO'
})


const router = useRouter();
const route = useRoute();

const filters = reactive({
  query: '',
  status: -1,
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
        toast.error('Unable to fetch raffles !');
    } finally {
        isShimmerLoading.value = false;
    }

}

const onPageChange = async (pageNumber: number) => {
  filters.pageNo = pageNumber;
  const filteredQuery = filterQueryParams({ ...route.query, ...filters });
  router.replace({ name: route.name ?? '', query: filteredQuery });
  await getPaginatedRaffles();
};

// Status display config is shared — see ~/utils/statusConfig.ts

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedRaffles();
  }, 300); // 300ms delay


watch(() => filters.query, debouncedSearch);
  
  watch(() => filters.status, () => {
    filters.pageNo = 1;
    getPaginatedRaffles();
  });
  
  watch([() => filters.startDate, () => filters.endDate], () => {
    filters.pageNo = 1;
    getPaginatedRaffles();
  });

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedRaffles();
  });

// Modal logic removed.

const isDeleteModalOpen = ref(false);
const raffleIdToDelete = ref<string>('');
const isDeletingRaffle = ref(false);

const openDeleteModal = (id: string) => {
  raffleIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeletingRaffle.value = true;
  try {
    const isSuccessful = await deleteRaffle(raffleIdToDelete.value);
    if (isSuccessful) {
      toast.success('Raffle deleted successfully');
      getPaginatedRaffles();
      isDeleteModalOpen.value = false;
    } else {
      toast.error('Failed to delete raffle');
    }
  } catch (error) {
    toast.error('An error occurred while deleting raffle');
  } finally {
    isDeletingRaffle.value = false;
  }
};

</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Raffle Campaigns</h1>
        <p class="text-slate-500 text-sm font-medium">Manage and monitor draws.</p>
      </div>
      <NuxtLink 
        to="/raffles/create"
        class="flex items-center gap-2 bg-[#C82323] hover:bg-[#A01D1D] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:shadow-xl shadow-red-100 active:scale-95"
      >
        <PlusIcon class="w-5 h-5 stroke-2" />
        New Raffle
      </NuxtLink>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col lg:flex-row gap-4 shadow-sm">
      <div class="relative flex-[2]">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          v-model="filters.query"
          type="text" 
          placeholder="Search by ID or Title..." 
          class="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-medium transition-all" 
        />
      </div>
      
      <div class="flex flex-wrap md:flex-nowrap gap-3 flex-[3]">
        <!-- Status Dropdown -->
        <div class="relative w-full md:w-48">
          <FunnelIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select 
            v-model="filters.status"
            class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-black uppercase tracking-wider text-slate-600 appearance-none cursor-pointer transition-all"
          >
            <option value="-1">All Statuses</option>
            <option value="1">Scheduled</option>
            <option value="0">Active</option>
            <option value="2">Completed</option>
            <option value="3">Closed</option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <!-- Date Range -->
        <div class="flex items-center gap-2 flex-1">
          <div class="relative flex-1">
            <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              v-model="filters.startDate"
              type="date" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-bold text-slate-600 transition-all"
            />
          </div>
          <span class="text-slate-300 font-bold text-xs uppercase tracking-widest">to</span>
          <div class="relative flex-1">
            <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input 
              v-model="filters.endDate"
              type="date" 
              class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-xs font-bold text-slate-600 transition-all"
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

    <!-- Raffle Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative min-h-[400px]">
     
      <div v-for="raffle in raffleList" :key="raffle.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <div class="p-8">
              <div class="flex justify-between items-start mb-6">
                <!-- Status badge -->
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
                <div v-if="raffle.status === 1" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NuxtLink 
                    :to="`/raffles/${raffle.id}/edit`"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors inline-block"
                    title="Edit Raffle">
                    <PencilIcon class="w-4 h-4" />
                  </NuxtLink>
                  <button 
                    @click="openDeleteModal(raffle.id)"
                    class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    title="Delete Raffle">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 class="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-700 transition-colors tracking-tight">{{ raffle.name }}</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{{ raffle.slug }}</p>
              
              <div class="grid grid-cols-2 gap-4 mb-8">

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Liability</p>
                  <p class="text-sm font-black text-slate-800 tracking-tight">{{ _currency(raffle.liablity) }}</p>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Expected Revenue</p>
                  <p class="text-sm font-black text-slate-800 tracking-tight">{{ _currency(raffle.expectedRevenue) }}</p>
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
              <NuxtLink :to="`/raffles/${raffle.id}/manage-draw`" class="text-[11px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-800 flex items-center gap-2">
                 Manage Draw
                 <ChevronRightIcon class="w-4 h-4" />
              </NuxtLink>
              <PlayIcon v-if="raffle.status === 0" class="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
          </div>

          <!-- Empty State (Optional) -->
          <div v-if="raffleList.length === 0 && !isShimmerLoading" class="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <TrophyIcon class="w-8 h-8" />
            </div>
            <p class="text-slate-500 font-black uppercase tracking-widest text-xs">No Raffles Found</p>
            <p class="text-slate-400 text-[10px] font-medium mt-1">Try adjusting your filters or search query.</p>
          </div>
     
    </div>

    <!-- Pagination -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
        Total Campaigns: {{ paginationParams.totalCount.toLocaleString() }} Raffles
      </span>
      <div class="order-1 sm:order-2">
         <Pagination 
           :current-page="filters.pageNo" 
           :total-pages="paginationParams.totalPages" 
           @page-change="onPageChange"
         />
      </div>
    </div>

    <!-- Create/Update Modal moved to pages -->

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal 
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeletingRaffle"
      title="Delete Raffle Campaign"
      description="Are you sure you want to delete this raffle campaign? All entry data associated with this draw will be permanently removed."
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
