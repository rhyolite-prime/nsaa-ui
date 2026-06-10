<script setup lang="ts">
import { 
  PlusIcon,
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  GiftIcon,
  FolderIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import type { PrizeCategory, Prize } from "~/models";
import { v4 as uuidv4 } from 'uuid';

useHead({
  title: 'Prizes Management | NSAA BO'
})

const prizesStore = usePrizesStore();
const categories = prizesStore.categories;
const allPrizes = prizesStore.allPrizes;


// --- STATE ---
const selectedCategoryId = ref<string | null>(null);
const searchCategoryQuery = ref('');
const searchPrizeQuery = ref('');

// Computed filtered lists
const filteredCategories = computed(() => {
  if (!searchCategoryQuery.value) return categories.value;
  const q = searchCategoryQuery.value.toLowerCase();
  return categories.value.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
});

const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value) || null;
});

const selectedCategoryRewardType = computed(() => {
  return selectedCategory.value?.rewardType || 'CASH';
});

const categoryPrizes = computed(() => {
  if (!selectedCategoryId.value) return [];
  let prizesForCat = allPrizes.value.filter(p => p.categoryId === selectedCategoryId.value);
  
  if (searchPrizeQuery.value) {
    const q = searchPrizeQuery.value.toLowerCase();
    prizesForCat = prizesForCat.filter(p => p.name.toLowerCase().includes(q));
  }
  return prizesForCat;
});


// --- CATEGORY MODAL ---
const isCategoryModalOpen = ref(false);
const editingCategory = ref<PrizeCategory | null>(null);
const categoryForm = ref<Partial<PrizeCategory>>({
  name: '',
  code: '',
  description: '',
  priority: 0,
  maxWinners: 1,
  rewardType: 'CASH',
  isRepeatable: false,
  isActive: true
});

const openCategoryModal = (category?: PrizeCategory) => {
  if (category) {
    editingCategory.value = category;
    categoryForm.value = { ...category };
  } else {
    editingCategory.value = null;
    categoryForm.value = {
      name: '',
      code: '',
      description: '',
      priority: 0,
      maxWinners: 1,
      rewardType: 'CASH',
      isRepeatable: false,
      isActive: true
    };
  }
  isCategoryModalOpen.value = true;
};

const saveCategory = () => {
  if (!categoryForm.value.name || !categoryForm.value.code) {
    toast.error('Name and Code are required');
    return;
  }
  
  if (editingCategory.value) {
    prizesStore.updateCategory(editingCategory.value.id, { ...categoryForm.value as PrizeCategory, updatedAt: new Date().toISOString() });
    toast.success('Category updated successfully');
  } else {
    const newCategory: PrizeCategory = {
      ...categoryForm.value as PrizeCategory,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    prizesStore.addCategory(newCategory);
    toast.success('Category created successfully');
    if (!selectedCategoryId.value) {
      selectedCategoryId.value = newCategory.id;
    }
  }
  isCategoryModalOpen.value = false;
};

const deleteCategory = (id: string) => {
  if (confirm('Are you sure you want to delete this category? All linked prizes will also be deleted.')) {
    prizesStore.deleteCategory(id);
    if (selectedCategoryId.value === id) {
      selectedCategoryId.value = null;
    }
    toast.success('Category deleted');
  }
};


// --- PRIZE MODAL ---
const isPrizeModalOpen = ref(false);
const editingPrize = ref<Prize | null>(null);
const prizeForm = ref<Partial<Prize>>({
  name: '',
  description: '',
  value: 0,
  currency: 'GHS',
  quantity: 1,
  remainingQuantity: 1,
  probability: 0,
  startDate: '',
  endDate: '',
  metadata: {}
});

const openPrizeModal = (prize?: Prize) => {
  if (prize) {
    editingPrize.value = prize;
    prizeForm.value = { ...prize, metadata: prize.metadata || {} };
    // Format dates for input[type="datetime-local"]
    if (prizeForm.value.startDate) {
      prizeForm.value.startDate = new Date(prizeForm.value.startDate).toISOString().slice(0, 16);
    }
    if (prizeForm.value.endDate) {
      prizeForm.value.endDate = new Date(prizeForm.value.endDate).toISOString().slice(0, 16);
    }
  } else {
    editingPrize.value = null;
    prizeForm.value = {
      name: '',
      description: '',
      value: 0,
      currency: 'GHS',
      quantity: 1,
      remainingQuantity: 1,
      probability: 0,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      metadata: {}
    };
  }
  isPrizeModalOpen.value = true;
};

const savePrize = () => {
  if (!prizeForm.value.name || !prizeForm.value.value) {
    toast.error('Name and Value are required');
    return;
  }
  
  if (editingPrize.value) {
    prizesStore.updatePrize(editingPrize.value.id, { 
      ...prizeForm.value as Prize, 
      updatedAt: new Date().toISOString() 
    });
    toast.success('Prize updated successfully');
  } else {
    const newPrize: Prize = {
      ...prizeForm.value as Prize,
      id: uuidv4(),
      categoryId: selectedCategoryId.value as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    prizesStore.addPrize(newPrize);
    toast.success('Prize created successfully');
  }
  isPrizeModalOpen.value = false;
};

const deletePrize = (id: string) => {
  if (confirm('Are you sure you want to delete this prize?')) {
    prizesStore.deletePrize(id);
    toast.success('Prize deleted');
  }
};

const formatCurrency = (amount: number, currency = 'GHS') => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(amount);
};
</script>

<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Prize Management</h1>
        <p class="text-slate-500 font-medium">Manage prize categories and configure linked prizes</p>
      </div>
    </div>

    <!-- Two Column Layout -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
      
      <!-- LEFT COLUMN: Categories -->
      <div class="lg:col-span-5 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-4 shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FolderIcon class="w-5 h-5 text-blue-500" />
              Prize Categories
            </h2>
            <button 
              @click="openCategoryModal()"
              class="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              <PlusIcon class="w-4 h-4" />
              Add
            </button>
          </div>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              v-model="searchCategoryQuery"
              type="text" 
              placeholder="Search categories..." 
              class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            v-for="cat in filteredCategories" 
            :key="cat.id"
            @click="selectedCategoryId = cat.id"
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer group flex items-start gap-4"
            :class="[
              selectedCategoryId === cat.id 
                ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-500/10' 
                : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
            ]"
          >
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FolderIcon class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-slate-900 truncate pr-2">{{ cat.name }}</h3>
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0"
                  :class="cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ cat.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-1 mb-2">{{ cat.description }}</p>
              <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                <span class="flex items-center gap-1"><TagIcon class="w-3 h-3" /> {{ cat.code }}</span>
                <span class="flex items-center gap-1"><GiftIcon class="w-3 h-3" /> {{ cat.rewardType }}</span>
              </div>
            </div>
            
            <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="openCategoryModal(cat)" class="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click.stop="deleteCategory(cat.id)" class="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div v-if="filteredCategories.length === 0" class="py-12 text-center text-slate-500 flex flex-col items-center">
            <FolderIcon class="w-12 h-12 text-slate-200 mb-3" />
            <p class="font-medium text-sm">No categories found.</p>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Prizes -->
      <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden relative">
        <template v-if="selectedCategory">
          <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-4 shrink-0">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GiftIcon class="w-5 h-5 text-[#C82323]" />
                Prizes for {{ selectedCategory.name }}
              </h2>
              <button 
                @click="openPrizeModal()"
                class="flex items-center justify-center gap-1 bg-[#C82323] hover:bg-[#A01D1D] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition-all active:scale-95"
              >
                <PlusIcon class="w-4 h-4" />
                Add Prize
              </button>
            </div>
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                v-model="searchPrizeQuery"
                type="text" 
                placeholder="Search prizes within category..." 
                class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C82323]/20 focus:border-[#C82323] text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div 
              v-for="prize in categoryPrizes" 
              :key="prize.id"
              class="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group flex items-start gap-4"
            >
              <div class="w-12 h-12 rounded-xl bg-red-50 text-[#C82323] flex items-center justify-center shrink-0 border border-red-100">
                <CurrencyDollarIcon class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-bold text-slate-900 truncate pr-2 text-base">{{ prize.name }}</h3>
                  <div class="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {{ formatCurrency(prize.value, prize.currency) }}
                  </div>
                </div>
                <p class="text-xs text-slate-500 line-clamp-1 mb-3">{{ prize.description }}</p>
                <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-3">
                  <div class="flex flex-col">
                    <span class="text-[10px] text-slate-400 uppercase">Qty</span>
                    <span>{{ prize.remainingQuantity }} / {{ prize.quantity }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] text-slate-400 uppercase">Win Prob.</span>
                    <span>{{ (prize.probability * 100).toFixed(2) }}%</span>
                  </div>
                  
                  <!-- Metadata display badges -->
                  <div class="flex items-center gap-2 ml-auto" v-if="prize.metadata && Object.keys(prize.metadata).length > 0">
                    <span v-if="prize.metadata.payoutMethod" class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] uppercase font-black tracking-wider">
                      {{ prize.metadata.payoutMethod.replace('_', ' ') }}
                    </span>
                    <span v-if="prize.metadata.provider || prize.metadata.brand" class="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                      <TagIcon class="w-3 h-3" /> {{ prize.metadata.provider || prize.metadata.brand }}
                    </span>
                    <span v-if="prize.metadata.itemBrand" class="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] uppercase font-black tracking-wider">
                      {{ prize.metadata.itemBrand }} {{ prize.metadata.itemModel || '' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openPrizeModal(prize)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-xl bg-slate-50 border border-slate-100">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="deletePrize(prize.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl bg-slate-50 border border-slate-100">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="categoryPrizes.length === 0" class="py-16 text-center text-slate-500 flex flex-col items-center">
              <GiftIcon class="w-16 h-16 text-slate-200 mb-4" />
              <p class="font-bold text-slate-700">No prizes yet</p>
              <p class="text-sm">Click "Add Prize" to create one for this category.</p>
            </div>
          </div>
        </template>
        
        <template v-else>
          <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div class="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
              <FolderIcon class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">No Category Selected</h3>
            <p class="text-slate-500 max-w-sm">Select a prize category from the left panel to view and manage its associated prizes.</p>
          </div>
        </template>
      </div>

    </div>

    <!-- Category Modal -->
    <div v-if="isCategoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isCategoryModalOpen = false"></div>
      <div class="relative z-10 w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
              <FolderIcon class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
            </div>
          </div>
          <button @click="isCategoryModalOpen = false" class="p-2 hover:bg-white rounded-full text-slate-400">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="saveCategory" class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Name</label>
              <input v-model="categoryForm.name" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Code</label>
              <input v-model="categoryForm.code" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 uppercase" required />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase text-slate-500">Description</label>
            <textarea v-model="categoryForm.description" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Priority</label>
              <input v-model="categoryForm.priority" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Max Winners</label>
              <input v-model="categoryForm.maxWinners" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Reward Type</label>
              <select v-model="categoryForm.rewardType" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 appearance-none">
                <option value="CASH">Cash</option>
                <option value="POINTS">Points</option>
                <option value="GIFT_CARD">Gift Card</option>
                <option value="VOUCHER">Voucher</option>
                <option value="PHYSICAL_ITEM">Physical Item</option>
                <option value="DIGITAL_ITEM">Digital Item</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="SERVICE">Service</option>
                <option value="EXPERIENCE">Experience</option>
                <option value="DONATION">Donation</option>
                <option value="COUPON">Coupon</option>
                <option value="DISCOUNT">Discount</option>
                <option value="AIRTIME">Airtime</option>
                <option value="MEMBERSHIP">Membership</option>
                <option value="CONSOLATION">Consolation</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div class="flex gap-6 mt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="categoryForm.isRepeatable" type="checkbox" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm font-bold text-slate-700">Repeatable Prize</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="categoryForm.isActive" type="checkbox" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm font-bold text-slate-700">Active Category</span>
            </label>
          </div>
          <div class="mt-4 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" @click="isCategoryModalOpen = false" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
            <button type="submit" class="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20">Save Category</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Prize Modal -->
    <div v-if="isPrizeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isPrizeModalOpen = false"></div>
      <div class="relative z-10 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#C82323] rounded-xl flex items-center justify-center text-white shadow-md shadow-red-200">
              <GiftIcon class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">{{ editingPrize ? 'Edit Prize' : 'New Prize' }}</h2>
              <p class="text-xs text-slate-500 font-medium">Under category: {{ selectedCategory?.name }}</p>
            </div>
          </div>
          <button @click="isPrizeModalOpen = false" class="p-2 hover:bg-white rounded-full text-slate-400">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="savePrize" class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase text-slate-500">Prize Name</label>
            <input v-model="prizeForm.name" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" required />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase text-slate-500">Description</label>
            <textarea v-model="prizeForm.description" rows="2" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium text-slate-700 resize-none"></textarea>
          </div>
        

          
          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Value / Amount</label>
              <input v-model="prizeForm.value" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Win Probability (0-1)</label>
              <input v-model="prizeForm.probability" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Total Quantity</label>
              <input v-model="prizeForm.quantity" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Remaining Qty</label>
              <input v-model="prizeForm.remainingQuantity" type="number" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">Start Date</label>
              <input v-model="prizeForm.startDate" type="datetime-local" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-black uppercase text-slate-500">End Date</label>
              <input v-model="prizeForm.endDate" type="datetime-local" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-bold text-slate-800" />
            </div>
          </div>
          
          <!-- DYNAMIC METADATA CONFIGURATION -->
          <div v-if="prizeForm.metadata" class="mt-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TagIcon class="w-4 h-4 text-slate-400" />
              {{ selectedCategoryRewardType }} Configuration (Metadata)
            </h3>
            
            <div v-if="selectedCategoryRewardType === 'CASH'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Payout Method</label>
                <select v-model="prizeForm.metadata.payoutMethod" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash_pickup">Cash Pickup</option>
                </select>
              </div>
              <div class="flex items-center gap-2 mt-6">
                <input v-model="prizeForm.metadata.requiresTaxDeduction" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Requires Tax Deduction</span>
              </div>
              
              <template v-if="prizeForm.metadata.requiresTaxDeduction">
                <div class="flex items-center gap-2 mt-6">
                  <input v-model="prizeForm.metadata.isTaxPercentage" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                  <span class="text-sm font-bold text-slate-700">Is Percentage?</span>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[11px] font-black uppercase text-slate-500">
                    Tax {{ prizeForm.metadata.isTaxPercentage ? 'Percentage (%)' : 'Amount' }}
                  </label>
                  <input v-model="prizeForm.metadata.taxValue" type="number" step="0.01" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
                </div>
              </template>
            </div>

            <div v-if="selectedCategoryRewardType === 'POINTS'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Point Multiplier</label>
                <input v-model="prizeForm.metadata.pointMultiplier" type="number" step="0.1" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Expiry Days</label>
                <input v-model="prizeForm.metadata.expiryDays" type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'GIFT_CARD'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Brand</label>
                <input v-model="prizeForm.metadata.brand" type="text" placeholder="e.g. Amazon, Apple" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Delivery Method</label>
                <select v-model="prizeForm.metadata.deliveryMethod" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
  
                </select>
              </div>
              <div class="flex items-center gap-2 mt-2 col-span-2">
                <input v-model="prizeForm.metadata.activationRequired" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Activation Required</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'VOUCHER'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Provider</label>
                <input v-model="prizeForm.metadata.provider" type="text" placeholder="e.g. Shoprite, Spa" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Validity (Days)</label>
                <input v-model="prizeForm.metadata.validityDays" type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5 col-span-2">
                <label class="text-[11px] font-black uppercase text-slate-500">Redemption URL</label>
                <input v-model="prizeForm.metadata.redemptionUrl" type="url" placeholder="https://" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'PHYSICAL_ITEM'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Item Brand</label>
                <input v-model="prizeForm.metadata.itemBrand" type="text" placeholder="e.g. Apple, Samsung" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Item Model/Type</label>
                <input v-model="prizeForm.metadata.itemModel" type="text" placeholder="e.g. iPhone 15 Pro" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="flex items-center gap-2 mt-2 col-span-2">
                <input v-model="prizeForm.metadata.shippingRequired" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Requires Shipping</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'DIGITAL_ITEM'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Format</label>
                <input v-model="prizeForm.metadata.format" type="text" placeholder="e.g. PDF, PNG, ZIP" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">License Key</label>
                <input v-model="prizeForm.metadata.licenseKey" type="text" placeholder="Optional" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5 col-span-2">
                <label class="text-[11px] font-black uppercase text-slate-500">Download Link</label>
                <input v-model="prizeForm.metadata.downloadLink" type="url" placeholder="https://" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'SUBSCRIPTION'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Plan Name</label>
                <input v-model="prizeForm.metadata.planName" type="text" placeholder="e.g. Premium 4K" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Duration (Months)</label>
                <input v-model="prizeForm.metadata.durationMonths" type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="flex items-center gap-2 mt-2 col-span-2">
                <input v-model="prizeForm.metadata.autoRenew" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Auto Renew Enabled</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'SERVICE'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Service Provider</label>
                <input v-model="prizeForm.metadata.serviceProvider" type="text" placeholder="e.g. AutoSpa" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Location</label>
                <input v-model="prizeForm.metadata.location" type="text" placeholder="e.g. East Legon" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="flex items-center gap-2 mt-2 col-span-2">
                <input v-model="prizeForm.metadata.bookingRequired" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Booking Required</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'EXPERIENCE'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Event Name</label>
                <input v-model="prizeForm.metadata.eventName" type="text" placeholder="e.g. Afrochella" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Event Date</label>
                <input v-model="prizeForm.metadata.date" type="date" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Location</label>
                <input v-model="prizeForm.metadata.location" type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="flex items-center gap-2 mt-6">
                <input v-model="prizeForm.metadata.vipAccess" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">VIP Access</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'DONATION'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5 col-span-2">
                <label class="text-[11px] font-black uppercase text-slate-500">Charity Name</label>
                <input v-model="prizeForm.metadata.charityName" type="text" placeholder="e.g. Red Cross" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="flex items-center gap-2 mt-2">
                <input v-model="prizeForm.metadata.taxDeductibleReceipt" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Tax Deductible</span>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <input v-model="prizeForm.metadata.certificateAvailable" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Certificate Provided</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'COUPON'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5 col-span-2">
                <label class="text-[11px] font-black uppercase text-slate-500">Discount Code</label>
                <input v-model="prizeForm.metadata.discountCode" type="text" placeholder="e.g. SAVE50" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Min Purchase</label>
                <input v-model="prizeForm.metadata.minPurchase" type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Max Discount</label>
                <input v-model="prizeForm.metadata.maxDiscount" type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'DISCOUNT'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Discount Percentage</label>
                <input v-model="prizeForm.metadata.discountPercentage" type="number" min="1" max="100" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Applies To</label>
                <select v-model="prizeForm.metadata.appliesTo" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20">
                  <option value="ALL_ITEMS">Storewide</option>
                  <option value="SPECIFIC_CATEGORY">Specific Category</option>
                  <option value="SHIPPING_ONLY">Shipping Only</option>
                </select>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'AIRTIME'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Network Provider</label>
                <select v-model="prizeForm.metadata.networkProvider" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20">
                  <option value="MTN">MTN</option>
                  <option value="VODAFONE">Telecel (Vodafone)</option>
                  <option value="AIRTELTIGO">AT (AirtelTigo)</option>
                </select>
              </div>
               
              <div class="flex items-center gap-2 mt-6">
                <input v-model="prizeForm.metadata.phoneNumberRequired" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span class="text-sm font-bold text-slate-700">Requires Phone Number Input</span>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'MEMBERSHIP'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Membership Tier</label>
                <input v-model="prizeForm.metadata.membershipTier" type="text" placeholder="e.g. Gold, VIP" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Access Level</label>
                <input v-model="prizeForm.metadata.accessLevel" type="text" placeholder="e.g. All Access" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'CONSOLATION'" class="grid grid-cols-1 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Consolation Type</label>
                <input v-model="prizeForm.metadata.consolationType" type="text" placeholder="e.g. Digital Card" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Message</label>
                <textarea v-model="prizeForm.metadata.message" rows="2" placeholder="Thank you for playing!" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20 resize-none"></textarea>
              </div>
            </div>

            <div v-if="selectedCategoryRewardType === 'HYBRID'" class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Primary Reward Type</label>
                <select v-model="prizeForm.metadata.primaryReward" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20">
                  <option value="CASH">Cash</option>
                  <option value="PHYSICAL_ITEM">Physical Item</option>
                  <option value="POINTS">Points</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-black uppercase text-slate-500">Bundle Components (Comma separated)</label>
                <input v-model="prizeForm.metadata.components" type="text" placeholder="CASH, ITEM, POINTS" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500/20" />
              </div>
            </div>
            
          </div>

          <div class="mt-4 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" @click="isPrizeModalOpen = false" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
            <button type="submit" class="px-6 py-2.5 rounded-xl font-bold text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-md shadow-red-500/20">Save Prize</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove spinner from number input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
