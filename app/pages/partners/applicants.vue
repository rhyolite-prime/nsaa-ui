<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline';
import dayjs from 'dayjs';

// Define the Applicant type based on the requested fields plus status
interface Applicant {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  region: string;
  partnership_type: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Mock data
const applicants = ref<Applicant[]>([
  {
    id: '1',
    name: 'Kwame Mensah',
    company: 'TechGrowth Ghana',
    email: 'kwame@techgrowth.gh',
    phone: '+233 24 123 4567',
    region: 'Greater Accra',
    partnership_type: 'Digital Marketing',
    message: 'We have a network of over 50,000 active users on our platform and we would like to promote the Chop Money raffle to our audience for a commission.',
    status: 'pending',
    created_at: dayjs().subtract(2, 'hours').toISOString()
  },
  {
    id: '2',
    name: 'Abena Osei',
    company: 'Osei Retail Ventures',
    email: 'abena.osei@retailventures.com',
    phone: '+233 20 987 6543',
    region: 'Ashanti',
    partnership_type: 'Physical Agent',
    message: 'I own 5 retail shops across Kumasi and want to sell physical raffle tickets directly to walk-in customers.',
    status: 'approved',
    created_at: dayjs().subtract(2, 'days').toISOString()
  },
  {
    id: '3',
    name: 'John Doe',
    company: 'Global Media',
    email: 'john@globalmedia.net',
    phone: '+44 7700 900077',
    region: 'International',
    partnership_type: 'Media Partner',
    message: 'Looking to partner for international broadcasting rights.',
    status: 'rejected',
    created_at: dayjs().subtract(1, 'week').toISOString()
  }
]);

const currentTab = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending');
const selectedApplicant = ref<Applicant | null>(null);
const isDetailModalOpen = ref(false);

const filteredApplicants = computed(() => {
  if (currentTab.value === 'all') return applicants.value;
  return applicants.value.filter(a => a.status === currentTab.value);
});

const stats = computed(() => {
  return {
    all: applicants.value.length,
    pending: applicants.value.filter(a => a.status === 'pending').length,
    approved: applicants.value.filter(a => a.status === 'approved').length,
    rejected: applicants.value.filter(a => a.status === 'rejected').length
  };
});

const openApplicantDetails = (applicant: Applicant) => {
  selectedApplicant.value = applicant;
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  setTimeout(() => {
    selectedApplicant.value = null;
  }, 200); // Wait for transition
};

const updateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
  const index = applicants.value.findIndex(a => a.id === id);
  if (index !== -1) {
    applicants.value[index].status = newStatus;
  }
  closeDetailModal();
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending Review', class: 'bg-amber-100 text-amber-700 border border-amber-200' };
    case 'approved':
      return { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
    case 'rejected':
      return { label: 'Rejected', class: 'bg-red-100 text-red-700 border border-red-200' };
    default:
      return { label: 'Unknown', class: 'bg-slate-100 text-slate-700 border border-slate-200' };
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMM D, YYYY • h:mm A');
};

const formatTimeAgo = (dateString: string) => {
  return dayjs().to(dayjs(dateString)); // Requires dayjs relativeTime plugin in a real app, fallback to simple date here
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header & Stats -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Affiliate Applications</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Review and manage partnership requests from the main website</p>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex gap-4">
        <div class="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[100px]">
          <span class="text-2xl font-black text-amber-500 leading-none">{{ stats.pending }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending</span>
        </div>
        <div class="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[100px]">
          <span class="text-2xl font-black text-emerald-500 leading-none">{{ stats.approved }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Approved</span>
        </div>
      </div>
    </div>

    <!-- Tabs & Content Area -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      
      <!-- Tabs -->
      <div class="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
        <button 
          v-for="tab in ['pending', 'approved', 'rejected', 'all'] as const" 
          :key="tab"
          @click="currentTab = tab"
          class="px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap"
          :class="currentTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'"
        >
          {{ tab }} ({{ stats[tab] }})
          <div v-if="currentTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredApplicants.length === 0" class="p-16 text-center flex flex-col items-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <UserGroupIcon class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-black text-slate-900 uppercase tracking-wide">No {{ currentTab !== 'all' ? currentTab : '' }} applications</h3>
        <p class="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed">There are currently no partner applications matching this status.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Applicant</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company & Type</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Region</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Applied On</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="applicant in filteredApplicants" 
              :key="applicant.id"
              class="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              @click="openApplicantDetails(applicant)"
            >
              <!-- Applicant Name & Email -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-black border border-primary-100 shrink-0">
                    {{ applicant.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ applicant.name }}</p>
                    <p class="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                      <EnvelopeIcon class="w-3 h-3" /> {{ applicant.email }}
                    </p>
                  </div>
                </div>
              </td>
              
              <!-- Company & Type -->
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <BuildingOfficeIcon class="w-4 h-4 text-slate-400" />
                  {{ applicant.company || 'N/A' }}
                </p>
                <p class="text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md inline-flex mt-1.5">
                  {{ applicant.partnership_type }}
                </p>
              </td>

              <!-- Region -->
              <td class="px-6 py-4">
                <p class="text-sm text-slate-600 font-medium flex items-center gap-1">
                  <MapPinIcon class="w-4 h-4 text-slate-400" />
                  {{ applicant.region }}
                </p>
              </td>

              <!-- Date -->
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700 font-medium">{{ dayjs(applicant.created_at).format('MMM D, YYYY') }}</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ dayjs(applicant.created_at).format('h:mm A') }}</p>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span 
                  class="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg"
                  :class="getStatusConfig(applicant.status).class"
                >
                  {{ getStatusConfig(applicant.status).label }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <button 
                  @click.stop="openApplicantDetails(applicant)"
                  class="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                  title="View Application"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <div v-if="isDetailModalOpen && selectedApplicant" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeDetailModal"></div>
      
      <div class="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        <!-- Status Banner Top -->
        <div 
          class="h-2 w-full shrink-0"
          :class="{
            'bg-amber-400': selectedApplicant.status === 'pending',
            'bg-emerald-500': selectedApplicant.status === 'approved',
            'bg-red-500': selectedApplicant.status === 'rejected'
          }"
        ></div>

        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div class="flex gap-4 items-center">
            <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200 shrink-0">
              <UserGroupIcon class="w-7 h-7" />
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">{{ selectedApplicant.name }}</h2>
                <span 
                  class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md"
                  :class="getStatusConfig(selectedApplicant.status).class"
                >
                  {{ selectedApplicant.status }}
                </span>
              </div>
              <p class="text-sm font-bold text-slate-500 mt-1">{{ selectedApplicant.company || 'Independent' }}</p>
            </div>
          </div>
          
          <button @click="closeDetailModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto bg-slate-50/50 flex-1">
          
          <!-- Contact Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><EnvelopeIcon class="w-3 h-3"/> Email Address</p>
              <a :href="`mailto:${selectedApplicant.email}`" class="text-sm font-bold text-primary-600 hover:underline">{{ selectedApplicant.email }}</a>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><PhoneIcon class="w-3 h-3"/> Phone Number</p>
              <a :href="`tel:${selectedApplicant.phone}`" class="text-sm font-bold text-slate-700 hover:text-primary-600">{{ selectedApplicant.phone }}</a>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><MapPinIcon class="w-3 h-3"/> Region</p>
              <p class="text-sm font-bold text-slate-700">{{ selectedApplicant.region }}</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5"><UserGroupIcon class="w-3 h-3"/> Partnership Type</p>
              <p class="text-sm font-bold text-slate-700">{{ selectedApplicant.partnership_type }}</p>
            </div>
          </div>

          <!-- Message Area -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Application Message</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ formatDate(selectedApplicant.created_at) }}</p>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ selectedApplicant.message }}</p>
            </div>
          </div>

        </div>

        <!-- Action Footer (Only show if pending) -->
        <div v-if="selectedApplicant.status === 'pending'" class="px-8 py-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            @click="updateStatus(selectedApplicant.id, 'rejected')"
            class="flex-1 py-3.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <XCircleIcon class="w-5 h-5" />
            Reject Application
          </button>
          <button 
            @click="updateStatus(selectedApplicant.id, 'approved')"
            class="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <CheckCircleIcon class="w-5 h-5" />
            Approve Partner
          </button>
        </div>
        
        <!-- Status Indicator Footer (if already processed) -->
        <div v-else class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <p class="text-xs font-medium text-slate-500">
            This application was <strong>{{ selectedApplicant.status }}</strong>.
          </p>
          <button 
            v-if="selectedApplicant.status === 'rejected'"
            @click="updateStatus(selectedApplicant.id, 'pending')"
            class="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors"
          >
            Move back to Pending
          </button>
        </div>

      </div>
    </div>

  </div>
</template>