<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon,
  TrophyIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';
import type { AffiliatePartner } from "~/models";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import useVuelidate from '@vuelidate/core';
import { required, minValue, helpers } from '@vuelidate/validators';

const router = useRouter();

const isSaving = ref(false);
const partnerList = ref<AffiliatePartner[]>([]);
const isPartnersDropdownOpen = ref(false);

// Prize store – backed by MOCK_CATEGORIES / MOCK_PRIZES
const { categories: priceCategoryList, allPrizes } = usePrizesStore();

// Prizes that belong to any currently-selected category
const availablePrizesForCategories = computed(() =>
  allPrizes.value.filter(p =>
    form.value.selectedCategories.includes(p.categoryId)
  )
);

// Calculate total liability based on selected prizes
const computedLiability = computed(() =>
  form.value.prizeConfiguration.reduce((sum, pc) => {
    const prize = allPrizes.value.find(p => p.id === pc.prizeId);
    return sum + (prize ? prize.value * pc.value : 0);
  }, 0)
);

const currentStep = ref(1);
const steps = [
  { number: 1, name: 'Basic Info', description: 'Campaign details & timeline' },
  { number: 2, name: 'Partner Setup', description: 'Configure exemptions' },
  { number: 3, name: 'Prize Configuration', description: 'Set up rewards' },
  { number: 4, name: 'Options Configuration', description: 'Additional settings' }
];

const form = ref({
  name: '',
  slug: '',
  startTime: '',
  endTime: '',
  drawTime: '',
  maximumWinners: 1,
  liability: 0,
  expectedRevenue: 0,
  exemptedPartnerIds: [] as string[],
  selectedCategories: [] as string[],
  prizeConfiguration: [] as { prizeCategoryId: string; prizeId: string; prizeName: string; value: number }[],
  options: [] as { id: string; name: string }[]
});

// ─── Vuelidate custom validators ───────────────────────────────────────────
const endTimeAfterStart = helpers.withMessage(
  'Sale End must be at least 30 minutes after Sale Start.',
  () => {
    if (!form.value.startTime || !form.value.endTime) return true;
    return new Date(form.value.endTime).getTime() - new Date(form.value.startTime).getTime() >= 30 * 60 * 1000;
  }
);

const drawTimeAfterEnd = helpers.withMessage(
  'Final Draw must be at least 20 minutes after Sale End.',
  () => {
    if (!form.value.endTime || !form.value.drawTime) return true;
    return new Date(form.value.drawTime).getTime() - new Date(form.value.endTime).getTime() >= 20 * 60 * 1000;
  }
);

const rules = computed(() => ({
  name:           { required: helpers.withMessage('Campaign name is required.', required) },
  startTime:      { required: helpers.withMessage('Sale Start date is required.', required) },
  endTime:        { required: helpers.withMessage('Sale End date is required.', required), endTimeAfterStart },
  drawTime:       { required: helpers.withMessage('Final Draw date is required.', required), drawTimeAfterEnd },
  maximumWinners: {
    required: helpers.withMessage('Maximum winners is required.', required),
    minValue: helpers.withMessage('Must be at least 1.', minValue(1))
  },
  expectedRevenue: {
    required: helpers.withMessage('Expected revenue is required.', required),
    minValue: helpers.withMessage('Must be 0 or greater.', minValue(0))
  }
}));

const v$ = useVuelidate(rules, form);

// ─── Helpers ───────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const partnersResult = await getPartners({ pageNo: 1, pageSize: 1000 });
    partnerList.value = partnersResult.data;
  } catch (error) {
    console.error('Failed to load partners', error);
  }
});

watch(() => form.value.name, (newName) => {
  if (newName) {
    form.value.slug = newName.toLowerCase().trim().replace(/\s+/g, '-');
  } else {
    form.value.slug = '';
  }
});

const isPrizeSelected = (prizeId: string) => {
  return form.value.prizeConfiguration.some(p => p.prizeId === prizeId);
};

const togglePrizeSelection = (prize: any) => {
  const index = form.value.prizeConfiguration.findIndex(p => p.prizeId === prize.id);
  if (index >= 0) {
    form.value.prizeConfiguration.splice(index, 1);
  } else {
    form.value.prizeConfiguration.push({ 
      prizeCategoryId: prize.categoryId,
      prizeId: prize.id,
      prizeName: prize.name,
      value: 1
    });
  }
};

watch(() => form.value.prizeConfiguration, () => {
  if (form.value.prizeConfiguration.length > 0) {
    form.value.liability = computedLiability.value;
  }
}, { deep: true });

// Step 4 Options Management
const toOptionId = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '_');

const updateOptionId = (index: number) => {
  form.value.options[index].id = toOptionId(form.value.options[index].name);
};

const addOption = () => {
  form.value.options.push({ id: '', name: '' });
};

const removeOption = (index: number) => {
  form.value.options.splice(index, 1);
};

// ─── Step navigation ───────────────────────────────────────────────────────
const validateStep1 = async () => {
  // Touch only the Step 1 fields
  v$.value.name.$touch();
  v$.value.startTime.$touch();
  v$.value.endTime.$touch();
  v$.value.drawTime.$touch();
  v$.value.maximumWinners.$touch();

  const step1Invalid =
    v$.value.name.$error ||
    v$.value.startTime.$error ||
    v$.value.endTime.$error ||
    v$.value.drawTime.$error ||
    v$.value.maximumWinners.$error;

  if (step1Invalid) {
    // First error message wins for the toast
    const firstError =
      v$.value.name.$errors[0]?.$message ||
      v$.value.startTime.$errors[0]?.$message ||
      v$.value.endTime.$errors[0]?.$message ||
      v$.value.drawTime.$errors[0]?.$message ||
      v$.value.maximumWinners.$errors[0]?.$message;
    toast.error(String(firstError));
    return false;
  }
  return true;
};

const nextStep = async () => {
  if (currentStep.value === 1 && !(await validateStep1())) return;
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const goBack = () => {
  router.push('/raffles');
};

const saveRaffleData = async () => {
  if (!(await validateStep1())) return;

  isSaving.value = true;
  try {
    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      drawTime: form.value.drawTime,
      maximumWinners: form.value.maximumWinners,
      exemptedPartnerIds: form.value.exemptedPartnerIds,
      options: form.value.options.filter(o => o.id.trim() && o.name.trim()),
      prizeConfiguration: form.value.prizeConfiguration,
      liability: form.value.liability,
      expectedRevenue: form.value.expectedRevenue
    };
    const isSuccessful = await createRaffle(payload);

    if (isSuccessful) {
      toast.success('Raffle created successfully');
      router.push('/raffles');
    } else {
      toast.error('Failed to create raffle');
    }
  } catch (error) {
    toast.error('An error occurred while saving the raffle');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="max-w-8xl mx-auto space-y-8 font-sans py-8 px-4 sm:px-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button 
        @click="goBack"
        class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
      >
        <ChevronLeftIcon class="w-6 h-6 stroke-2" />
      </button>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">New Raffle</h1>
        <p class="text-slate-500 text-sm font-medium">Create a new raffle campaign in 4 steps.</p>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="flex flex-col lg:flex-row gap-8 items-start">
      
      <!-- Stepper Sidebar -->
      <div class="w-full lg:w-1/4 shrink-0 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <nav aria-label="Progress">
          <ol role="list" class="space-y-6">
            <li v-for="step in steps" :key="step.name" class="relative">
              <!-- Connector line -->
              <div v-if="step.number !== steps.length" class="absolute left-[15px] top-10 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" :class="{ 'bg-pink-600': currentStep > step.number }"></div>
              
              <button 
                class="relative flex items-start group w-full text-left"
                @click="currentStep > step.number ? currentStep = step.number : null"
                :class="{ 'cursor-pointer': currentStep > step.number, 'cursor-default': currentStep <= step.number }"
              >
                <!-- Step Indicator -->
                <span class="flex h-9 items-center">
                  <span 
                    class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all"
                    :class="[
                      currentStep > step.number ? 'bg-pink-600 border-pink-600 hover:bg-pink-700' : '',
                      currentStep === step.number ? 'border-pink-600 bg-white' : '',
                      currentStep < step.number ? 'border-slate-300 bg-white' : ''
                    ]"
                  >
                    <CheckIcon v-if="currentStep > step.number" class="h-5 w-5 text-white stroke-[3]" />
                    <span v-else-if="currentStep === step.number" class="h-2.5 w-2.5 rounded-full bg-pink-600"></span>
                    <span v-else class="text-slate-400 font-bold text-xs">{{ step.number }}</span>
                  </span>
                </span>
                
                <!-- Step Info -->
                <span class="ml-4 flex min-w-0 flex-col">
                  <span class="text-sm font-bold uppercase tracking-wide" :class="currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'">{{ step.name }}</span>
                  <span class="text-xs font-medium text-slate-500">{{ step.description }}</span>
                </span>
              </button>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Step Content Area -->
      <div class="flex-1 w-full bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        
        <div class="p-8 flex-1">
          <!-- Step 1: Basic Info -->
          <div v-show="currentStep === 1" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-xl font-black text-slate-900 tracking-tight mb-6">Basic Info</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Campaign Name <span class="text-red-500">*</span></label>
                <input 
                  v-model="form.name"
                  type="text" 
                  placeholder="e.g. Mabango Grand Raffle" 
                  @blur="v$.name.$touch()"
                  :class="v$.name.$error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10 bg-red-50' : 'border-slate-100 focus:border-pink-500 focus:ring-pink-500/10 bg-slate-50'"
                  class="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                />
                <p v-if="v$.name.$error" class="text-xs font-semibold text-red-500 mt-1">{{ v$.name.$errors[0]?.$message }}</p>
              </div>
              
              <div class="space-y-1">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Maximum Winners <span class="text-red-500">*</span></label>
                <input 
                  v-model.number="form.maximumWinners"
                  type="number" 
                  min="1"
                  @blur="v$.maximumWinners.$touch()"
                  :class="v$.maximumWinners.$error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10 bg-red-50' : 'border-slate-100 focus:border-pink-500 focus:ring-pink-500/10 bg-slate-50'"
                  class="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                />
                <p v-if="v$.maximumWinners.$error" class="text-xs font-semibold text-red-500 mt-1">{{ v$.maximumWinners.$errors[0]?.$message }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="space-y-1">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap">Sale Start <span class="text-red-500">*</span></label>
                <input 
                  v-model="form.startTime"
                  type="datetime-local" 
                  @blur="v$.startTime.$touch()"
                  :class="v$.startTime.$error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10 bg-red-50' : 'border-slate-100 focus:border-pink-500 focus:ring-pink-500/10 bg-slate-50'"
                  class="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 text-[13px] font-bold text-slate-700"
                />
                <p v-if="v$.startTime.$error" class="text-xs font-semibold text-red-500 mt-1">{{ v$.startTime.$errors[0]?.$message }}</p>
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap">Sale End <span class="text-red-500">*</span></label>
                <input 
                  v-model="form.endTime"
                  type="datetime-local" 
                  @blur="v$.endTime.$touch()"
                  :class="v$.endTime.$error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10 bg-red-50' : 'border-slate-100 focus:border-pink-500 focus:ring-pink-500/10 bg-slate-50'"
                  class="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 text-[13px] font-bold text-slate-700"
                />
                <p v-if="v$.endTime.$error" class="text-xs font-semibold text-red-500 mt-1">{{ v$.endTime.$errors[0]?.$message }}</p>
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap text-secondary font-black">Final Draw <span class="text-red-500">*</span></label>
                <input 
                  v-model="form.drawTime"
                  type="datetime-local" 
                  @blur="v$.drawTime.$touch()"
                  :class="v$.drawTime.$error ? 'border-red-400 focus:border-red-400 focus:ring-red-500/10 bg-red-50' : 'border-slate-100 focus:border-secondary focus:ring-secondary/10 bg-slate-50'"
                  class="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-4 text-[13px] font-bold text-slate-700"
                />
                <p v-if="v$.drawTime.$error" class="text-xs font-semibold text-red-500 mt-1">{{ v$.drawTime.$errors[0]?.$message }}</p>
              </div>
            </div>
          </div>

          <!-- Step 2: Partner Setup -->
          <div v-show="currentStep === 2" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-xl font-black text-slate-900 tracking-tight mb-2">Partner Setup</h2>
            <p class="text-sm text-slate-500 font-medium mb-6">Select which partners are exempted from this raffle campaign.</p>
            
            <div class="space-y-2 relative max-w-xl">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Exempted Partners</label>
              <div 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer flex justify-between items-center hover:border-slate-300 transition-colors"
                @click="isPartnersDropdownOpen = !isPartnersDropdownOpen"
              >
                <span class="text-sm font-bold" :class="form.exemptedPartnerIds.length ? 'text-slate-700' : 'text-slate-300'">
                  {{ form.exemptedPartnerIds.length ? `${form.exemptedPartnerIds.length} partner(s) selected` : 'Select partners to exempt' }}
                </span>
                <ChevronDownIcon class="w-4 h-4 text-slate-400 transition-transform" :class="{ 'rotate-180': isPartnersDropdownOpen }" />
              </div>
              
              <div 
                v-if="isPartnersDropdownOpen" 
                class="absolute z-20 top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-64 overflow-y-auto p-2"
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
                    v-model="form.exemptedPartnerIds"
                    class="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                  />
                  <span class="text-sm font-bold text-slate-700">{{ partner.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 3: Prize Configuration -->
          <div v-show="currentStep === 3" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-xl font-black text-slate-900 tracking-tight mb-2">Prize Configuration</h2>
            <p class="text-sm text-slate-500 font-medium mb-6">Set up the prize categories and quantities for this raffle.</p>

            <div class="space-y-3 mb-6">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500">Select Prize Categories</label>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="priceCategory in priceCategoryList" 
                  :key="priceCategory.id"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all"
                  :class="form.selectedCategories.includes(priceCategory.id) ? 'bg-pink-50 border-pink-200 text-pink-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
                >
                  <input 
                    type="checkbox" 
                    :value="priceCategory.id" 
                    v-model="form.selectedCategories"
                    class="hidden"
                  />
                  <span class="text-xs font-bold">{{ priceCategory.name }}</span>
                </label>
              </div>
            </div>

            <!-- Available Prizes for Selected Categories -->
            <div v-if="availablePrizesForCategories.length > 0" class="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500">Include Prizes & Quantities</label>
              <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
                <div v-for="prize in availablePrizesForCategories" :key="prize.id" class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-pink-200 transition-colors">
                  <label class="flex items-center gap-3 cursor-pointer flex-1">
                    <input 
                      type="checkbox"
                      :checked="isPrizeSelected(prize.id)"
                      @change="togglePrizeSelection(prize)"
                      class="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                    />
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ prize.name }}</p>
                      <p class="text-xs font-medium text-slate-500">{{ prize.currency }} {{ prize.value }}</p>
                    </div>
                  </label>
                  <div v-if="isPrizeSelected(prize.id)" class="flex items-center gap-2">
                    <span class="text-[10px] font-black uppercase text-slate-400">Quantity</span>
                    <input 
                      type="number" 
                      min="1"
                      v-model.number="form.prizeConfiguration.find(p => p.prizeId === prize.id)!.value"
                      class="w-24 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center p-8 border border-dashed border-slate-200 rounded-2xl">
              <p class="text-sm font-medium text-slate-400">Select a category above to view available prizes.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
              <div class="space-y-2">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Liability <span class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">GHS</span>
                  <input 
                    v-model.number="form.liability"
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Expected Revenue <span class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">GHS</span>
                  <input 
                    v-model.number="form.expectedRevenue"
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Options Configuration -->
          <div v-show="currentStep === 4" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 class="text-xl font-black text-slate-900 tracking-tight mb-2">Options Configuration</h2>
            <p class="text-sm text-slate-500 font-medium mb-6">Configure specific options available for selection bound to this raffle.</p>

            <div class="space-y-4 max-w-2xl">
              <div v-for="(option, index) in form.options" :key="index" class="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div class="flex-1 space-y-2">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500">Option Name</label>
                  <input 
                    v-model="option.name"
                    @input="updateOptionId(index)"
                    type="text" 
                    placeholder="e.g. Red" 
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 text-sm font-bold text-slate-700"
                  />
                </div>
                <div class="flex-1 space-y-2">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500">Option ID</label>
                  <input 
                    v-model="option.id"
                    type="text"
                    readonly
                    placeholder="auto-generated"
                    class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed select-none"
                  />
                </div>
                <button 
                  @click="removeOption(index)"
                  class="p-2 mt-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>

              <button 
                @click="addOption"
                class="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 hover:border-pink-300 hover:bg-pink-50 text-slate-500 hover:text-pink-600 rounded-2xl transition-all font-bold text-sm"
              >
                <PlusIcon class="w-5 h-5 stroke-2" />
                Add New Option
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
          <button 
            type="button"
            @click="prevStep"
            class="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            :class="{ 'opacity-0 pointer-events-none': currentStep === 1 }"
          >
            Previous
          </button>
          
          <button 
            v-if="currentStep < steps.length"
            type="button"
            @click="nextStep"
            class="px-8 py-3 rounded-xl font-black uppercase text-[12px] tracking-wider text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center gap-2"
          >
            Next Step
            <ChevronRightIcon class="w-4 h-4 stroke-[3]" />
          </button>
          
          <button 
            v-else
            type="button"
            @click="saveRaffleData"
            :disabled="isSaving"
            class="px-8 py-3 rounded-xl font-black uppercase text-[12px] tracking-wider text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else><CheckIcon class="w-4 h-4 stroke-[3]" /></span>
            {{ isSaving ? 'Creating...' : 'Create Raffle' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
