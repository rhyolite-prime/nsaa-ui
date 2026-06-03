<script setup lang="ts">
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  BanknotesIcon,
  FingerPrintIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  KeyIcon,
  GlobeAsiaAustraliaIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import type { AffiliatePartner, PartnerStats } from "~/models";
import { isEmpty, debounce } from "lodash-es";

useHead({
  title: 'Affiliate Partners | NSAA BO'
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

const partnerList = ref<AffiliatePartner[]>([]);
const partnerStats = ref<PartnerStats>();
const isShimmerLoading = ref(true);
const isModalOpen = ref(false);
const isSaving = ref(false);
const editingPartner = ref<AffiliatePartner | null>(null);

// Wizard State
const currentStep = ref(1);
const totalSteps = 5;

const steps = [
  { id: 1, name: 'Identity', icon: IdentificationIcon, description: 'Basic company info' },
  { id: 2, name: 'Contact', icon: EnvelopeIcon, description: 'Direct contact details' },
  { id: 3, name: 'Commercials', icon: CurrencyDollarIcon, description: 'Rates & Payouts' },
  { id: 4, name: 'Operations', icon: BriefcaseIcon, description: 'Limits & Governance' },
  { id: 5, name: 'Security', icon: ShieldCheckIcon, description: 'API & Access' },
];

const form = ref<Partial<AffiliatePartner>>({
  name: '',
  legalEntityName: '',
  taxId: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  billingEmail: '',
  country: 'Ghana',
  currency: 'GHS',
  status: 'active',
  ussdCode: '',
  wssdServiceUrl: '',
  commissionRate: 0,
  commissionType: 'percentage',
  minimumPayoutThreshold: 100,
  paymentDueDate: 7,
  paymentMethod: 'Mobile Money',
  bankDetails: {
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: ''
  },
  maxRafflesPerDay: 5,
  allowedRaffleCategories: [],
  requiresApproval: true,
  subAccountEnabled: true,
  requireTwoFactorAuth: false,
  supportPriority: 'normal',
  ipWhitelist: [],
  webhookSecret: '',
  notes: '',
  kycVerified: false,
});

const getPaginatedPartners = async () => {
    isShimmerLoading.value = true;
    try {
        let result = await getPartners(filters);
        partnerStats.value = await getPartnerStats();
        partnerList.value = result.data;
        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;
    } catch (error) {
        toast.error('Unable to fetch partners!');
    } finally {
        isShimmerLoading.value = false;
    }
}

const openAddModal = () => {
  editingPartner.value = null;
  currentStep.value = 1;
  form.value = { 
    name: '',
    legalEntityName: '',
    taxId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    billingEmail: '',
    country: 'Ghana',
    currency: 'GHS',
    status: 'active',
    ussdCode: '',
    wssdServiceUrl: '',
    commissionRate: 0,
    regonOrState: '',
    commissionType: 'percentage',
    minimumPayoutThreshold: 100,
    paymentDueDate: 7,
    paymentMethod: 'Mobile Money',
    bankDetails: { accountName: '', accountNumber: '', bankName: '', branch: '' },
    maxRafflesPerWeek: 5,
    allowedRaffleCategories: [],
    requiresApproval: true,
    subAccountEnabled: true,
    requireTwoFactorAuth: false,
    supportPriority: 'normal',
    ipWhitelist: [],
    webhookSecret: '',
    notes: '',
    kycVerified: false,
  };
  isModalOpen.value = true;
};

const openEditModal = (partner: AffiliatePartner) => {
  editingPartner.value = partner;
  currentStep.value = 1;
  form.value = { 
    ...partner,
    bankDetails: partner.bankDetails || { accountName: '', accountNumber: '', bankName: '', branch: '' },
    ipWhitelist: partner.ipWhitelist || [],
    allowedRaffleCategories: partner.allowedRaffleCategories || [],
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const savePartner = async () => {
  isSaving.value = true;
  try {
    let result;
    if (editingPartner.value?.id) {
      result = await updatePartner(editingPartner.value.id, form.value);
    } else {
      result = await createPartner(form.value);
    }

    if (result) {
      closeModal();
      toast.success(editingPartner.value ? 'Partner updated successfully' : 'Partner onboarded successfully');
      getPaginatedPartners();
    }
  } catch (error) {
    toast.error('An error occurred while saving');
  } finally {
    isSaving.value = false;
  }
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'inactive': return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1;
    getPaginatedPartners();
}, 300);

watch(() => filters.query, debouncedSearch);

onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string) || 1;
    }
    await getPaginatedPartners();
});

// Helper for IP Whitelist
const newIp = ref('');
const addIp = () => {
  if (newIp.value && !form.value.ipWhitelist?.includes(newIp.value)) {
    form.value.ipWhitelist = [...(form.value.ipWhitelist || []), newIp.value];
    newIp.value = '';
  }
};
const removeIp = (ip: string) => {
  form.value.ipWhitelist = form.value.ipWhitelist?.filter(i => i !== ip);
};

// Helper for categories
const categories = ['Electronics', 'Automotive', 'Travel', 'Cash Prizes', 'Real Estate', 'Lifestyle'];
const toggleCategory = (cat: string) => {
  const current = form.value.allowedRaffleCategories || [];
  if (current.includes(cat)) {
    form.value.allowedRaffleCategories = current.filter(c => c !== cat);
  } else {
    form.value.allowedRaffleCategories = [...current, cat];
  }
};
</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Partner Ecosystem</h1>
        <p class="text-slate-500 font-medium">Full lifecycle management for affiliate partners</p>
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-100 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Onboard Partner
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <template v-if="isShimmerLoading">
        <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
          <div class="h-4 w-24 bg-slate-100 rounded mb-4"></div>
          <div class="h-8 w-16 bg-slate-200 rounded"></div>
        </div>
      </template>
      
      <template v-else>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-primary-500 transition-all cursor-default">
          <div class="flex justify-between opacity-30 group-hover:opacity-100 group-hover:text-primary-600 mb-3 transition-all">
            <BuildingOfficeIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Total Network</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ partnerStats?.verifiedPartners || 0 }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Partners</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-500 transition-all cursor-default">
          <div class="flex justify-between opacity-30 group-hover:opacity-100 group-hover:text-emerald-600 mb-3 transition-all">
            <CheckCircleIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Operational</span>
          </div>
          <div class="text-2xl font-black text-emerald-600 tracking-tight">{{ partnerStats?.activeStatus || 0 }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Status</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all cursor-default">
          <div class="flex justify-between opacity-30 group-hover:opacity-100 group-hover:text-blue-600 mb-3 transition-all">
            <BanknotesIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">Commission</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">GHS {{ _currency(partnerStats?.totalEarned || 0) }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Earned</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-amber-500 transition-all cursor-default">
          <div class="flex justify-between opacity-30 group-hover:opacity-100 group-hover:text-amber-600 mb-3 transition-all">
            <ShieldCheckIcon class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-widest">KYC Status</span>
          </div>
          <div class="text-2xl font-black text-slate-800 tracking-tight">{{ partnerStats?.complianceRate || 0 }}%</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Compliance Rate</div>
        </div>
      </template>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center bg-slate-50/20">
        <div class="relative flex-1 w-full">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="filters.query"
            type="text" 
            placeholder="Search name, tax ID, email..." 
            class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 font-medium transition-all" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th class="px-8 py-5">Partner Profile</th>
              <th class="px-8 py-5">Commercials</th>
              <th class="px-8 py-5">Performance</th>
              <th class="px-8 py-5 text-center">KYC</th>
              <th class="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-50 text-slate-600">
            <template v-if="isShimmerLoading">
               <tr v-for="i in 5" :key="i">
                <td class="px-8 py-6"><div class="h-4 w-32 bg-slate-100 rounded shimmer mb-1"></div></td>
                <td class="px-8 py-6"><div class="h-3 w-28 bg-slate-50 rounded shimmer"></div></td>
                <td class="px-8 py-6"><div class="h-4 w-20 bg-slate-100 rounded shimmer"></div></td>
                <td class="px-8 py-6 text-center"><div class="h-6 w-16 bg-slate-50 rounded-lg shimmer mx-auto"></div></td>
                <td class="px-8 py-6 text-right"><div class="h-4 w-12 bg-slate-50 rounded shimmer ml-auto"></div></td>
              </tr>
            </template>
            <tr v-else v-for="partner in partnerList" :key="partner.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-900 group-hover:text-white transition-all transform group-hover:rotate-6">
                    <BuildingOfficeIcon class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-slate-900 tracking-tight text-sm">{{ partner.name }}</div>
                    <div class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider flex items-center gap-1 uppercase">
                       <IdentificationIcon class="w-3 h-3 opacity-50" />
                       {{ partner.legalEntityName || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex flex-col gap-1">
                  <div class="text-[13px] font-bold text-slate-700">
                    {{ partner.commissionRate }}{{ partner.commissionType === 'percentage' ? '%' : ' ' + partner.currency }}
                    <span class="text-[10px] text-slate-400 font-normal uppercase ml-1">{{ partner.commissionType }}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 flex items-center gap-1">
                    <BanknotesIcon class="w-3 h-3" />
                    Min Payout: {{ partner.currency }} {{ partner.minimumPayoutThreshold }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex flex-col gap-1">
                  <div class="text-[12px] font-black text-primary-600">
                    {{ partner.totalTicketsSold?.toLocaleString() || 0 }} Tickets
                  </div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase">
                    Rev: {{ partner.currency }} {{ _currency(partner.totalRevenueGenerated || 0) }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span v-if="partner.kycVerified" class="text-emerald-500 bg-emerald-50 p-1 rounded-full border border-emerald-100 shadow-sm">
                    <CheckCircleIcon class="w-5 h-5" />
                  </span>
                  <span v-else class="text-slate-300">
                    <XCircleIcon class="w-5 h-5" />
                  </span>
                  <span class="text-[8px] font-black uppercase tracking-tighter" :class="partner.kycVerified ? 'text-emerald-600' : 'text-slate-400'">
                    {{ partner.kycVerified ? 'Verified' : 'Pending' }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openEditModal(partner)"
                    class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                    title="Edit Partner"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                    title="Delete Partner"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          Showing {{ paginationParams.lowerBound }} to {{ paginationParams.upperBound }} of {{ paginationParams.totalCount }} Partners
        </span>
        <Pagination 
          :current-page="filters.pageNo" 
          :total-pages="paginationParams.totalPages" 
          @page-change="getPaginatedPartners"
          class="order-1 sm:order-2"
        />
      </div>
    </div>

    <!-- Onboarding Wizard Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeModal"></div>
      
      <div class="relative z-10 w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 flex flex-col h-[85vh]">
        
        <!-- Wizard Sidebar/Progress -->
        <div class="flex h-full">
          <div class="w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col shrink-0">
            <div class="mb-10">
              <div class="w-12 h-12 bg-primary-900 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                <PlusIcon class="w-6 h-6" />
              </div>
              <h2 class="text-xl font-black text-slate-900">Onboarding</h2>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Partner Lifecycle</p>
            </div>

            <nav class="flex-1 space-y-6">
              <div v-for="step in steps" :key="step.id" class="relative">
                <div 
                  class="flex items-center gap-4 group cursor-pointer transition-all"
                  :class="[currentStep >= step.id ? 'opacity-100' : 'opacity-40']"
                  @click="currentStep >= step.id ? currentStep = step.id : null"
                >
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all"
                    :class="[
                      currentStep === step.id ? 'bg-primary-900 border-primary-900 text-white shadow-lg shadow-primary-100 scale-110' : 
                      currentStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                    ]"
                  >
                    <component :is="currentStep > step.id ? CheckCircleIcon : step.icon" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-wider" :class="currentStep === step.id ? 'text-primary-900' : 'text-slate-500'">{{ step.name }}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ step.description }}</p>
                  </div>
                </div>
                <!-- Connector Line -->
                <div v-if="step.id < totalSteps" class="absolute left-5 top-10 w-0.5 h-6 bg-slate-200 -z-10" :class="{'bg-emerald-500': currentStep > step.id}"></div>
              </div>
            </nav>

            <div class="mt-auto pt-8 border-t border-slate-200">
               <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-black">
                     <BuildingOfficeIcon class="w-5 h-5" />
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] font-black text-slate-900 truncate">{{ form.name || 'New Entity' }}</p>
                    <p class="text-[9px] font-bold text-slate-400 uppercase">{{ form.country }} • {{ form.currency }}</p>
                  </div>
               </div>
            </div>
          </div>

          <!-- Wizard Body -->
          <div class="flex-1 flex flex-col bg-white">
            <div class="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div>
                 <h3 class="text-lg font-black text-slate-900">{{ steps.find(s => s.id === currentStep)?.name }}</h3>
                 <p class="text-xs text-slate-500 font-medium">{{ steps.find(s => s.id === currentStep)?.description }}</p>
               </div>
               <button @click="closeModal" class="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                 <XMarkIcon class="w-6 h-6" />
               </button>
            </div>

            <div class="flex-1 overflow-y-auto p-10">
              
              <!-- Step 1: Identity -->
              <div v-if="currentStep === 1" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div class="grid grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Public Display Name</label>
                    <input v-model="form.name" type="text" placeholder="e.g. Rhyolite Prime" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" required />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Entity Name</label>
                    <input v-model="form.legalEntityName" type="text" placeholder="e.g. Rhyolite Prime Limited" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Tax Identification (TIN/VAT)</label>
                    <input v-model="form.taxId" type="text" placeholder="e.g. GHA-123456-7" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Operating Country</label>
                    <div class="relative">
                      <GlobeAsiaAustraliaIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input v-model="form.country" type="text" class="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Region/State</label>
                    <div class="relative">
                      <GlobeAsiaAustraliaIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input v-model="form.regonOrState" type="text" class="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Currency</label>
                    <select v-model="form.currency" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                      <option value="GHS">GHS - Ghana Cedi</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Lifecycle Status</label>
                    <select v-model="form.status" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                      <option value="active">Active & Operational</option>
                      <option value="inactive">Temporarily Inactive</option>
                      <option value="pending">Awaiting Verification</option>
                    </select>
                  </div>
                </div>
                
                <div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                  <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <ClipboardDocumentCheckIcon class="w-6 h-6" />
                  </div>
                  <div>
                    <h4 class="text-xs font-black text-blue-900 uppercase tracking-widest">KYC Validation</h4>
                    <div class="flex items-center gap-4 mt-2">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input v-model="form.kycVerified" type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Manual KYC Bypass / Verification Override</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Contact -->
              <div v-if="currentStep === 2" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div class="grid grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Person Name</label>
                    <input v-model="form.contactName" type="text" placeholder="Full name of representative" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Business Email Address</label>
                    <input v-model="form.contactEmail" type="email" placeholder="email@partner.com" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" required />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Direct Phone Number</label>
                    <input v-model="form.contactPhone" type="text" placeholder="+233 24 XXX XXXX" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Accounts/Billing Email</label>
                    <input v-model="form.billingEmail" type="email" placeholder="billing@partner.com" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Assigned USSD Code</label>
                    <input v-model="form.ussdCode" type="text" placeholder="e.g. *718*10#" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">WSSD Service URL</label>
                    <input v-model="form.wssdServiceUrl" type="url" placeholder="https://api.partner.com/wssd" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              <!-- Step 3: Commercials -->
              <div v-if="currentStep === 3" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div class="grid grid-cols-3 gap-8">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Commission Type</label>
                    <select v-model="form.commissionType" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                      <option value="percentage">Percentage Share (%)</option>
                      <option value="fixed">Fixed Rate (Per Raffle)</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Rate ({{ form.commissionType === 'percentage' ? '%' : form.currency }})</label>
                    <input v-model="form.commissionRate" type="number" step="0.01" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Min Payout Threshold</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{{ form.currency }}</span>
                      <input v-model="form.minimumPayoutThreshold" type="number" class="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-8">
                   <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Due Date (Days After Draw)</label>
                    <input v-model="form.paymentDueDate" type="number" placeholder="7" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Preferred Payout Method</label>
                    <select v-model="form.paymentMethod" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                      <option value="Mobile Money">Mobile Money (MTN/AirtelTigo)</option>
                      <option value="Bank Transfer">Direct Bank Transfer</option>
                      <option value="Internal Wallet">System Wallet Credit</option>
                    </select>
                  </div>
                </div>

                <div class="bg-slate-50 p-8 rounded-[32px] space-y-6 border border-slate-100">
                  <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BanknotesIcon class="w-4 h-4" />
                    Banking / Settlement Details
                  </h4>
                  <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="block text-[9px] font-black uppercase tracking-widest text-slate-400">Account Holder Name</label>
                      <input v-model="form.bankDetails.accountName" type="text" class="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold text-slate-700 transition-all" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[9px] font-black uppercase tracking-widest text-slate-400">Account Number / IBAN</label>
                      <input v-model="form.bankDetails.accountNumber" type="text" class="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold text-slate-700 transition-all" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[9px] font-black uppercase tracking-widest text-slate-400">Financial Institution (Bank Name)</label>
                      <input v-model="form.bankDetails.bankName" type="text" class="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold text-slate-700 transition-all" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[9px] font-black uppercase tracking-widest text-slate-400">Branch / Sort Code</label>
                      <input v-model="form.bankDetails.branch" type="text" class="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500/20 font-bold text-slate-700 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 4: Operations -->
              <div v-if="currentStep === 4" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div class="grid grid-cols-2 gap-8">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Max Raffles Per Week</label>
                    <input v-model="form.maxRafflesPerWeek" type="number" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Support Priority Level</label>
                    <select v-model="form.supportPriority" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                      <option value="low">Low - Standard Response</option>
                      <option value="normal">Normal - Priority Handling</option>
                      <option value="high">High - Immediate Escalation</option>
                    </select>
                  </div>
                </div>


                <div class="grid grid-cols-2 gap-6">

                  <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest">Sub-Accounts</h4>
                      <p class="text-[9px] font-bold text-slate-400 mt-1">Allow partner to create team users</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="form.subAccountEnabled" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Internal Business Notes</label>
                  <textarea v-model="form.notes" rows="3" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-medium text-slate-700 transition-all shadow-sm resize-none" placeholder="Historical context, special arrangements, etc..."></textarea>
                </div>
              </div>

              <!-- Step 5: Security -->
              <div v-if="currentStep === 5" class="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div class="bg-amber-50/50 p-8 rounded-[40px] border border-amber-100 flex items-center gap-6">
                  <div class="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                    <KeyIcon class="w-8 h-8" />
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-black text-amber-900 uppercase tracking-widest">API Authentication</h4>
                    <p class="text-[10px] font-bold text-amber-700/60 mt-1 uppercase tracking-tighter">Production Credentials</p>
                    
                    <div class="flex items-center gap-4 mt-4">
                      <div class="flex-1 px-4 py-3 bg-white/50 border border-amber-200 rounded-xl font-mono text-[11px] text-amber-900 truncate">
                        {{ editingPartner?.apiKey || 'API KEY WILL BE GENERATED ON SUBMISSION' }}
                      </div>
                      <button type="button" class="px-4 py-3 bg-white text-amber-600 rounded-xl font-black uppercase text-[9px] border border-amber-200 shadow-sm hover:bg-amber-100 transition-all">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-8">
                  <div class="space-y-4">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">IP Whitelist (Inet Restriction)</label>
                    <div class="flex gap-2">
                      <input v-model="newIp" type="text" placeholder="192.168.1.1" class="flex-1 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" @keyup.enter="addIp" />
                      <button @click="addIp" type="button" class="p-4 bg-primary-900 text-white rounded-2xl hover:bg-primary-800 transition-all">
                        <PlusIcon class="w-6 h-6" />
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="ip in form.ipWhitelist" :key="ip" class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold font-mono">
                        {{ ip }}
                        <button @click="removeIp(ip)" class="text-rose-500 hover:text-rose-700">
                          <XMarkIcon class="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p v-if="!form.ipWhitelist?.length" class="text-[9px] text-slate-400 font-bold uppercase italic">No IPs whitelisted. Open access.</p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Webhook HMAC Secret</label>
                    <div class="relative">
                      <ShieldCheckIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input v-model="form.webhookSecret" type="password" placeholder="••••••••••••••••" class="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-slate-800 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div class="bg-primary-50 p-6 rounded-3xl border border-primary-100 flex items-center justify-between mt-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-900 shadow-sm">
                      <FingerPrintIcon class="w-6 h-6" />
                    </div>
                    <div>
                      <h4 class="text-xs font-black text-primary-900 uppercase tracking-widest">Enforce 2FA Authentication</h4>
                      <p class="text-[9px] font-bold text-primary-400 uppercase tracking-tight">Security mandatory for all partner users</p>
                    </div>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="form.requireTwoFactorAuth" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-900"></div>
                  </label>
                </div>
              </div>

            </div>

            <!-- Wizard Footer Buttons -->
            <div class="p-8 border-t border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/30">
               <button 
                 type="button" 
                 @click="prevStep" 
                 class="flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-0"
                 :disabled="currentStep === 1"
               >
                 <ChevronLeftIcon class="w-4 h-4" />
                 Previous Step
               </button>

               <div class="flex items-center gap-4">
                 <button type="button" @click="closeModal" class="px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
                 
                 <button 
                   v-if="currentStep < totalSteps"
                   type="button" 
                   @click="nextStep" 
                   class="flex items-center gap-2 px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white bg-primary-900 hover:bg-primary-800 shadow-xl shadow-primary-100 transition-all group"
                 >
                   Continue
                   <ChevronRightIcon class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>

                 <button 
                   v-else
                   type="button" 
                   @click="savePartner"
                   :disabled="isSaving"
                   class="flex items-center gap-2 px-12 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                 >
                   <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   {{ isSaving ? 'Processing...' : (editingPartner ? 'Update Partner' : 'Finish & Onboard') }}
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes animate-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: animate-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
