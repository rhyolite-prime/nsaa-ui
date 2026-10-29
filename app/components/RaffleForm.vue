<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { TrophyIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import type { Raffle, AffiliatePartner, PriceCategory, Prize } from "~/models";
import { getPartners } from "~/services/partners";
import { createRaffle, updateRaffle } from "~/services/raffles";
import { getPrizeCategories, getCategoryPrizes } from "~/services/priceConfig";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// Prize configuration – loaded from the prize-config API
const priceCategoryList = ref<PriceCategory[]>([]);
const prizeList = ref<Prize[]>([]);
const loadedCategoryIds = ref<string[]>([]);
const isLoadingCategories = ref(false);
const isLoadingPrizes = ref(false);
const prizeConfigError = ref('');

const props = defineProps<{
  mode: 'create' | 'edit';
  initialData?: Raffle;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'saved'): void;
}>();

const isSaving = ref(false);
const partnerList = ref<AffiliatePartner[]>([]);
const isPartnersDropdownOpen = ref(false);

const form = ref({
  name: '',
  slug: '',
  prizePool: 0,
  startTime: '',
  endTime: '',
  drawTime: '',
  exemptedPartners: [] as string[],
  selectedCategories: [] as string[],
  selectedPrizes: [] as { prizeId: string; quantity: number }[]
});

// ─── Prize configuration (API) ─────────────────────────────────────────────

// Load prize categories from the API
const loadPrizeCategories = async () => {
  isLoadingCategories.value = true;
  try {
    const res = await getPrizeCategories({ pageNo: 1, pageSize: 500 });
    priceCategoryList.value = res?.data || [];
    prizeConfigError.value = '';
  } catch (error) {
    console.error('Failed to load prize categories', error);
    prizeConfigError.value = 'Failed to load prize categories. Please try again.';
  } finally {
    isLoadingCategories.value = false;
  }
};

// Load prizes for any newly-selected categories (cached per category)
const loadPrizesForCategories = async (categoryIds: string[]) => {
  const missing = categoryIds.filter(id => !loadedCategoryIds.value.includes(id));
  if (missing.length === 0) return;

  isLoadingPrizes.value = true;
  try {
    await Promise.all(
      missing.map(async (categoryId) => {
        const raw = (await getCategoryPrizes(categoryId)) as unknown;
        const list: Prize[] = Array.isArray(raw)
          ? raw
          : ((raw as { data?: Prize[] })?.data || []);
        const prizes = list.map(p => ({ ...p, categoryId: p.categoryId || categoryId }));
        prizeList.value = [
          ...prizeList.value.filter(p => p.categoryId !== categoryId),
          ...prizes
        ];
        loadedCategoryIds.value.push(categoryId);
      })
    );
    if (form.value.selectedCategories.every(id => loadedCategoryIds.value.includes(id))) {
      prizeConfigError.value = '';
    }
  } catch (error) {
    console.error('Failed to load prizes for selected categories', error);
    prizeConfigError.value = 'Failed to load prizes for the selected categories. Please try again.';
  } finally {
    isLoadingPrizes.value = false;
  }
};

// Re-fetch whichever part of the prize configuration failed to load
const retryPrizeConfiguration = async () => {
  prizeConfigError.value = '';
  if (priceCategoryList.value.length === 0) {
    await loadPrizeCategories();
  }
  await loadPrizesForCategories([...form.value.selectedCategories]);
};

// Fetch prizes as soon as categories are selected
watch(
  () => form.value.selectedCategories,
  (categoryIds) => {
    loadPrizesForCategories([...categoryIds]);
  },
  { deep: true }
);

onMounted(async () => {
  loadPrizeCategories();
  try {
    const partnersResult = await getPartners({ pageNo: 1, pageSize: 1000 });
    partnerList.value = partnersResult.data;
  } catch (error) {
    console.error('Failed to load partners', error);
  }

  if (props.mode === 'edit' && props.initialData) {
    const raffle = props.initialData;
    form.value = {
      name: raffle.name,
      slug: raffle.slug,
      prizePool: parseFloat(raffle.prizePool?.toString() || '0'),
      startTime: raffle.startsAt ? new Date(raffle.startsAt).toISOString().slice(0, 16) : '',
      endTime: raffle.endsAt ? new Date(raffle.endsAt).toISOString().slice(0, 16) : '',
      drawTime: raffle.drawTime ? new Date(raffle.drawTime).toISOString().slice(0, 16) : '',
      exemptedPartners: raffle.exemptedPartners || [],
      selectedCategories: [], // Note: Replace with actual raffle.categories if added to API later
      selectedPrizes: []      // Note: Replace with actual raffle.prizes if added to API later
    };
  }
});

// Automate Slug generation
watch(() => form.value.name, (newName) => {
  if (newName) {
    form.value.slug = newName.toLowerCase().trim().replace(/\s+/g, '-');
  } else {
    form.value.slug = '';
  }
});

const availablePrizesForCategories = computed(() => {
  return prizeList.value.filter(p => form.value.selectedCategories.includes(p.categoryId));
});

watch(() => form.value.selectedCategories, (newCategories) => {
  form.value.selectedPrizes = form.value.selectedPrizes.filter(sp => {
    const prize = prizeList.value.find(p => p.id === sp.prizeId);
    return prize && newCategories.includes(prize.categoryId);
  });
});

const isPrizeSelected = (prizeId: string) => {
  return form.value.selectedPrizes.some(p => p.prizeId === prizeId);
};

const togglePrizeSelection = (prize: any) => {
  const index = form.value.selectedPrizes.findIndex(p => p.prizeId === prize.id);
  if (index >= 0) {
    form.value.selectedPrizes.splice(index, 1);
  } else {
    form.value.selectedPrizes.push({ prizeId: prize.id, quantity: prize.quantity || 1 });
  }
};

const getSelectedPrizeQuantity = (prizeId: string) => {
  const sp = form.value.selectedPrizes.find(p => p.prizeId === prizeId);
  return sp ? sp.quantity : 1;
};

const updatePrizeQuantity = (prizeId: string, quantity: number) => {
  const sp = form.value.selectedPrizes.find(p => p.prizeId === prizeId);
  if (sp) {
    sp.quantity = quantity;
  }
};

const computedPrizePool = computed(() => {
  return form.value.selectedPrizes.reduce((total, sp) => {
    const prize = prizeList.value.find(p => p.id === sp.prizeId);
    if (prize) {
      return total + (prize.value * sp.quantity);
    }
    return total;
  }, 0);
});

watch(() => form.value.selectedPrizes, () => {
  if (form.value.selectedPrizes.length > 0) {
    form.value.prizePool = computedPrizePool.value;
  }
}, { deep: true });

const saveRaffleData = async () => {
  if (!form.value.name || !form.value.slug || !form.value.startTime || !form.value.endTime || !form.value.drawTime) {
    toast.error('All fields are required');
    return;
  }

  isSaving.value = true;
  try {
    let isSuccessful = false;
    if (props.mode === 'edit' && props.initialData) {
      isSuccessful = await updateRaffle({ ...form.value, id: props.initialData.id });
    } else {
      isSuccessful = await createRaffle(form.value);
    }

    if (isSuccessful) {
      toast.success(props.mode === 'edit' ? 'Raffle updated successfully' : 'Raffle created successfully');
      emit('saved');
    } else {
      toast.error('Operation failed');
    }
  } catch (error) {
    toast.error('An error occurred while saving the raffle');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
          <TrophyIcon class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ mode === 'edit' ? 'Edit Raffle Campaign' : 'Initialize New Raffle' }}</h2>
          <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Configure campaign timeline and metadata</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveRaffleData" class="p-8 flex flex-col gap-6">
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
          <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Target Prize Pool <span class="text-red-500">*</span></label>
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

      <!-- Exempted Partners Dropdown -->
      <div class="space-y-2 relative">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Exempted Partners</label>
        <div 
          class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer flex justify-between items-center"
          @click="isPartnersDropdownOpen = !isPartnersDropdownOpen"
        >
          <span class="text-sm font-bold" :class="form.exemptedPartners.length ? 'text-slate-700' : 'text-slate-300'">
            {{ form.exemptedPartners.length ? `${form.exemptedPartners.length} partner(s) selected` : 'Select partners to exempt' }}
          </span>
          <ChevronDownIcon class="w-4 h-4 text-slate-400" :class="{ 'rotate-180': isPartnersDropdownOpen }" />
        </div>
        
        <div 
          v-if="isPartnersDropdownOpen" 
          class="absolute z-20 top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-2"
        >
          <div v-if="partnerList.length === 0" class="p-3 text-sm text-slate-400 font-medium text-center">
            No partners available
          </div>
          <label 
            v-for="partner in partnerList" 
            :key="partner.id" 
            class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
          >
            <input 
              type="checkbox" 
              :value="partner.id" 
              v-model="form.exemptedPartners"
              class="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
            />
            <span class="text-sm font-bold text-slate-700">{{ partner.name }}</span>
          </label>
        </div>
      </div>

      <!-- Prize Configuration Section -->
      <div class="border-t border-slate-100 pt-6">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrophyIcon class="w-5 h-5 text-yellow-500" /> Prize Configuration
        </h3>
        
        <!-- Prize configuration load error -->
        <div
          v-if="prizeConfigError"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-4"
        >
          <p class="text-sm font-semibold text-red-500">{{ prizeConfigError }}</p>
          <button
            type="button"
            @click="retryPrizeConfiguration"
            class="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- Category Selection -->
        <div class="space-y-3 mb-6">
          <label class="block text-xs font-black uppercase tracking-wider text-slate-500">Select Prize Categories</label>
          <!-- Categories loading / empty / chips (fetched from API) -->
          <div v-if="isLoadingCategories" class="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <span class="w-4 h-4 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></span>
            <span class="text-sm font-medium text-slate-400">Loading prize categories...</span>
          </div>
          <div v-else-if="priceCategoryList.length === 0" class="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p class="text-sm font-medium text-slate-400">No prize categories available. Create some in Prize Management first.</p>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <label 
              v-for="category in priceCategoryList" 
              :key="category.id"
              class="flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all"
              :class="form.selectedCategories.includes(category.id) ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
            >
              <input 
                type="checkbox" 
                :value="category.id" 
                v-model="form.selectedCategories"
                class="hidden"
              />
              <span class="text-xs font-bold">{{ category.name }}</span>
            </label>
          </div>
        </div>

        <!-- Available Prizes for Selected Categories (fetched from API) -->
        <div v-if="isLoadingPrizes && availablePrizesForCategories.length === 0" class="text-center p-8 border border-dashed border-slate-200 rounded-2xl">
          <span class="inline-block w-6 h-6 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-3"></span>
          <p class="text-sm font-medium text-slate-400">Loading prizes...</p>
        </div>
        <div v-else-if="availablePrizesForCategories.length > 0" class="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <label class="block text-xs font-black uppercase tracking-wider text-slate-500">Include Prizes & Quantities</label>
          <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
            <div v-for="prize in availablePrizesForCategories" :key="prize.id" class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
              <label class="flex items-center gap-3 cursor-pointer flex-1">
                <input 
                  type="checkbox"
                  :checked="isPrizeSelected(prize.id)"
                  @change="togglePrizeSelection(prize)"
                  class="w-4 h-4 text-[#C82323] rounded border-slate-300 focus:ring-red-500"
                />
                <div>
                  <p class="text-sm font-bold text-slate-800">{{ prize.name }}</p>
                  <p class="text-xs font-medium text-slate-500">{{ prize.currency }} {{ prize.value }}</p>
                </div>
              </label>
              <div v-if="isPrizeSelected(prize.id)" class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase text-slate-400">Qty</span>
                <input 
                  type="number" 
                  min="1"
                  :value="getSelectedPrizeQuantity(prize.id)"
                  @input="(e) => updatePrizeQuantity(prize.id, parseInt((e.target as HTMLInputElement).value) || 1)"
                  class="w-16 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
            <div v-if="isLoadingPrizes" class="flex items-center justify-center gap-2 py-2">
              <span class="w-3.5 h-3.5 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></span>
              <span class="text-xs font-medium text-slate-400">Loading more prizes...</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center p-8 border border-dashed border-slate-200 rounded-2xl">
          <p class="text-sm font-medium text-slate-400">Select a category above to view available prizes.</p>
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
      <div class="pt-6 border-t border-slate-50 flex gap-4 mt-2">
        <button 
          type="button"
          @click="emit('cancel')"
          class="flex-1 px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.15em] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
        <button 
          type="submit"
          :disabled="isSaving"
          class="flex-[1.5] px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2">
          <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isSaving ? 'Saving...' : (mode === 'edit' ? 'Edit Campaign' : 'Initialize Raffle') }}
        </button>
      </div>
    </form>
  </div>
</template>
