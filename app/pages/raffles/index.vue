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
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline';

import type { Raffle } from "~/models";
import { isEmpty, debounce } from "lodash-es";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


useHead({
  title: 'Raffles | NSAA BO'
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

// Modal Logic
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingRaffle = ref<Raffle | null>(null);

const form = ref({
  name: '',
  slug: '',
  prizePool: 0,
  startTime: '',
  endTime: '',
  drawTime: ''
});

const openAddModal = () => {
  editingRaffle.value = null;
  form.value = {
    name: '',
    slug: '',
    prizePool: 0,
    startTime: '',
    endTime: '',
    drawTime: ''
  };
  isModalOpen.value = true;
};

const openEditModal = (raffle: Raffle) => {
  editingRaffle.value = raffle;
  form.value = {
    name: raffle.name,
    slug: raffle.slug,
    prizePool: parseFloat(raffle.prizePool || '0'),
    startTime: raffle.startsAt ? new Date(raffle.startsAt).toISOString().slice(0, 16) : '',
    endTime: raffle.endsAt ? new Date(raffle.endsAt).toISOString().slice(0, 16) : '',
    drawTime: raffle.drawTime ? new Date(raffle.drawTime).toISOString().slice(0, 16) : ''
  };
  isModalOpen.value = true;
};

// Automate Slug generation
watch(() => form.value.name, (newName) => {
  if (newName) {
    form.value.slug = newName.toLowerCase().trim().replace(/\s+/g, '-');
  } else {
    form.value.slug = '';
  }
});

const closeModal = () => {
  isModalOpen.value = false;
};

const saveRaffleData = async () => {
  if (!form.value.name || !form.value.slug || !form.value.startTime || !form.value.endTime || !form.value.drawTime) {
    toast.error('All fields are required');
    return;
  }

  isSaving.value = true;
  try {
     

    let isSuccessful = false;
    if (editingRaffle.value) {
      isSuccessful = await updateRaffle({ ...form.value, id: editingRaffle.value.id  });
    } else {
      isSuccessful = await createRaffle(form.value);
    }

    if (isSuccessful) {
      toast.success(editingRaffle.value ? 'Raffle updated successfully' : 'Raffle created successfully');
      closeModal();
      getPaginatedRaffles();
    } else {
      toast.error('Operation failed');
    }
  } catch (error) {
    toast.error('An error occurred while saving the raffle');
  } finally {
    isSaving.value = false;
  }
};

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
      <button 
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#C82323] hover:bg-[#A01D1D] text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:shadow-xl shadow-red-100 active:scale-95"
      >
        <PlusIcon class="w-5 h-5 stroke-2" />
        New Raffle
      </button>
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
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="raffle in raffleList" :key="raffle.id" class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
        <div class="p-8">
          <div class="flex justify-between items-start mb-6">
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" :class="getStatusClass(raffle.status)">
              {{ raffle.status }}
            </span>
            <div v-if="raffle.status.toUpperCase() !== 'ACTIVE'" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                @click="openEditModal(raffle)"
                class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="Edit Raffle">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button 
                @click="openDeleteModal(raffle.id)"
                class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                title="Delete Raffle"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <h3 class="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-700 transition-colors tracking-tight">{{ raffle.name }}</h3>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{{ raffle.slug }}</p>
          
          <div class="grid grid-cols-2 gap-4 mb-8">

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1">Prize Pool</p>
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

    <!-- Create/Update Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
              <TrophyIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingRaffle ? 'Edit Raffle Campaign' : 'Initialize New Raffle' }}</h2>
              <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Configure campaign timeline and metadata</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveRaffleData" class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Campaign Name <span class="text-red-500">*</span></label>
              <input 
                v-model="form.name"
                type="text" 
                required
                placeholder="e.g. Mabango Grand Raffle" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Target Prize Pool <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">GHS</span>
                <input 
                  v-model="form.prizePool"
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00" 
                  class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap">Sale Start <span class="text-red-500">*</span></label>
              <input 
                v-model="form.startTime"
                type="datetime-local" 
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-[13px] font-bold text-slate-700"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap">Sale End <span class="text-red-500">*</span></label>
              <input 
                v-model="form.endTime"
                type="datetime-local" 
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-[13px] font-bold text-slate-700"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap text-secondary font-black">Final Draw <span class="text-red-500">*</span></label>
              <input 
                v-model="form.drawTime"
                type="datetime-local" 
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary text-[13px] font-bold text-slate-700"
              />
            </div>
          </div>

          <!-- Note at the bottom -->
          <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-3">
            <div class="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <p class="text-[11px] text-blue-700 font-medium leading-relaxed">
              <span class="font-black uppercase tracking-wider text-[10px] block mb-0.5">Prize Availability</span>
              The prize pool amount entered reflects the total prize value currently available to be won by participants in this campaign.
            </p>
          </div>

          <!-- Actions -->
          <div class="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4 shrink-0 -mx-8 -mb-8 mt-2">
            <button 
              type="button"
              @click="closeModal"
              class="flex-1 px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.15em] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="isSaving"
              class="flex-[1.5] px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2">
              <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isSaving ? 'Saving...' : (editingRaffle ? 'Edit Campaign' : 'Initialize Raffle') }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
