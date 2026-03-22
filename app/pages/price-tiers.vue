<script setup lang="ts">
import { 
  QueueListIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  UsersIcon,
  PercentBadgeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

import type { PriceTier } from "~/models";
import { isEmpty, debounce } from "lodash-es";

const { $toast } = useNuxtApp();

useHead({
  title: 'Price Tiers | NSAA BO'
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


const priceTierList = ref<PriceTier[]>([]);

const isShimmerLoading = ref(true);


const searchQuery = ref('');
const isModalOpen = ref(false);
const editingTier = ref<any>(null);

const form = ref({
  tierName: '',
  tierLevel: 1,
  description: '',
  prizeAmount: 0,
  pricePercentage: 0,
  numberOfWinners: 1,
  isCashBack: false
});

const getPaginatedPriceTiers = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getPriceTiers(filters);

        priceTierList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        $toast.error('Unable to fetch colours !');
    } finally {
        isShimmerLoading.value = false;
    }

}
 
 

const openAddModal = () => {
  editingTier.value = null;
  form.value = { 
    tierName: '', 
    tierLevel: priceTierList.value.length + 1, 
    description: '', 
    prizeAmount: 0, 
    pricePercentage: 0, 
    numberOfWinners: 1, 
    isCashBack: false 
  };
  isModalOpen.value = true;
};

const openEditModal = (tier: any) => {
  editingTier.value = tier;
  form.value = { ...tier };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveTier = () => {
   
  closeModal();
};

const deleteTier = (id: string) => {
   
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedPriceTiers();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedPriceTiers();

  });
</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Price Tiers</h1>
        <p class="text-slate-500 font-medium">Configure prize levels and award distributions</p>
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 bg-[#C82323] hover:bg-[#A01D1D] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Create New Tier
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
      <div class="relative max-w-md">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by tier name or description..." 
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-medium text-slate-700 transition-all"
        />
      </div>
    </div>

    <!-- Tiers Table -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400">Level</th>
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400">Tier Name</th>
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400">Prize Details</th>
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400">Distribution</th>
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400">Type</th>
              <th class="px-6 py-5 text-[12px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="tier in priceTierList" :key="tier.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-5">
                <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100">
                  {{ tier.tierLevel }}
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900">{{ tier.tierName }}</span>
                  <span class="text-[13px] text-slate-400 font-medium line-clamp-1 max-w-[200px]">{{ tier.description }}</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1.5 font-black text-slate-700">
                    <BanknotesIcon class="w-4 h-4 text-emerald-500" />
                    {{ formatCurrency(tier.prizeAmount) }}
                  </div>
                  <div class="flex items-center gap-1.5 text-[13px] font-bold text-slate-400">
                    <PercentBadgeIcon class="w-4 h-4 text-blue-400" />
                    {{ tier.prizePercentage }}% Allocation
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <div class="flex items-center gap-1.5 font-bold text-slate-700">
                  <UsersIcon class="w-4 h-4 text-blue-500" />
                  {{ tier.numberOfWinners }} Winner(s)
                </div>
              </td>
              <td class="px-6 py-5">
                <span 
                  v-if="tier.isCashBack" 
                  class="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-black uppercase tracking-widest border border-amber-100"
                >
                  <CheckCircleIcon class="w-3 h-3" />
                  Cashback
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-black uppercase tracking-widest border border-slate-200"
                >
                  <XCircleIcon class="w-3 h-3" />
                  Standard
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openEditModal(tier)"
                    class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button 
                    @click="deleteTier(tier.id)"
                    class="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Layout -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <QueueListIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">{{ editingTier ? 'Edit Prize Tier' : 'Define New Tier' }}</h2>
              <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Tier Configuration</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Modal Body -->
        <form @submit.prevent="saveTier" class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          
          <div class="grid grid-cols-2 gap-6">
            <!-- Tier Name -->
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Tier Name</label>
              <input 
                v-model="form.tierName"
                type="text" 
                placeholder="e.g. Bronze Ticket" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-bold text-slate-800 transition-all"
                required
              />
            </div>
            <!-- Tier Level -->
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Priority Level</label>
              <input 
                v-model="form.tierLevel"
                type="number" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-black text-slate-800 transition-all"
                required
              />
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Mission Description</label>
            <textarea 
              v-model="form.description"
              rows="2"
              placeholder="Explain the eligibility and reward context..." 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-medium text-slate-700 transition-all resize-none"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <!-- Prize Amount -->
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Prize (GHS)</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-[13px] tracking-tight">₵</span>
                <input 
                  v-model="form.prizeAmount"
                  type="number" 
                  class="w-full pl-9 pr-4 py-3 bg-slate-100/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-black text-slate-800 transition-all"
                  required
                />
              </div>
            </div>
            <!-- Percentage -->
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Pool %</label>
              <div class="relative">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 font-black text-blue-600 text-[13px]">%</span>
                <input 
                  v-model="form.pricePercentage"
                  type="number" 
                  class="w-full pr-9 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-black text-slate-800 transition-all"
                  required
                />
              </div>
            </div>
            <!-- Winners -->
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Winner Cap</label>
              <input 
                v-model="form.numberOfWinners"
                type="number" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 font-black text-slate-800 transition-all"
                required
              />
            </div>
          </div>

          <!-- Cashback Toggle -->
          <div class="bg-slate-50 p-6 rounded-[28px] border border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                <BanknotesIcon class="w-6 h-6" />
              </div>
              <div>
                <span class="block text-sm font-black text-slate-900 uppercase tracking-widest">Cashback Reward</span>
                <span class="text-[12px] text-slate-400 font-bold uppercase tracking-wide">Refunds ticket cost to winner</span>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.isCashBack" type="checkbox" class="sr-only peer">
              <div class="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
              class="flex-[1.5] px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2">
          
              {{ editingTier ? 'Edit Tier' : 'Save Tier' }}
            </button>

          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>


input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-in {
  animation: animate-in 0.3s ease-out;
}
</style>
