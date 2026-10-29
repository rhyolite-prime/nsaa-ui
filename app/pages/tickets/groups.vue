<script setup lang="ts">
import { 
  PlusIcon,
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline';

import DeleteConfirmationModal from '~/components/DeleteConfirmationModal.vue';
import { isEmpty, debounce } from "lodash-es";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import type { TicketGroup } from "~/models";


useHead({
  title: 'Ticket Groups | NSAA BO'
});

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


const onPageChange = async (pageNumber: number) => {

	filters.pageNo = pageNumber;
	const filteredQuery = filterQueryParams({ ...route.query, ...filters });

	router.replace({ name: route.name ?? '', query: filteredQuery });
    await getPaginatedTicketGroups()
}
 

const ticketGroupList = ref<TicketGroup[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);

const getPaginatedTicketGroups = async () => {
  isLoading.value = true;
  try {

    const result = await getTicketGroups(filters);

    ticketGroupList.value = result.data;

    paginationParams.totalPages = result.totalPages;
    paginationParams.totalCount = result.totalCount;
    paginationParams.lowerBound = result.lowerBound;
    paginationParams.upperBound = result.upperBound;
        
  } catch (error) {
    console.error("Failed to fetch ticket groups", error);
    toast.error("Failed to load ticket groups");
  } finally {
    isLoading.value = false;
  }
};

 

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedTicketGroups();
  }, 300); // 300ms delay

  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedTicketGroups();

  });
 

// Modal state
const isModalOpen = ref(false);
const editingGroup = ref<TicketGroup | null>(null);
const form = ref<Partial<TicketGroup>>({
  name: '',
  quantity: 1,
  unitPrice: 0,
  isActive: true
});

const openModal = (group?: TicketGroup) => {
  if (group) {
    editingGroup.value = group;
    form.value = { ...group };
  } else {
    editingGroup.value = null;
    form.value = {
      name: '',
      quantity: 1,
      unitPrice: 0,
      isActive: true
    };
  }
  isModalOpen.value = true;
};

const saveGroup = async () => {
  if (!form.value.name || form.value.unitPrice === undefined || form.value.quantity === undefined) {
    toast.error('Please fill all required fields');
    return;
  }

  isSaving.value = true;
  try {
    if (editingGroup.value) {
      form.value.unitPrice = parseFloat(form.value.unitPrice);
      const success = await updateTicketGroup(form.value.id, form.value);
      if (success) {
        toast.success('Ticket Group updated successfully');
        await getPaginatedTicketGroups();
        isModalOpen.value = false;
      } else {
        toast.error('Failed to update ticket group');
      }
    } else {
      const success = await createTicketGroup(form.value);
      if (success) {
        toast.success('Ticket Group created successfully');
        await getPaginatedTicketGroups();
        isModalOpen.value = false;
      } else {
        toast.error('Failed to create ticket group');
      }
    }
  } catch (error) {
    console.error("Error saving ticket group", error);
    toast.error('An error occurred while saving');
  } finally {
    isSaving.value = false;
  }
};

const isDeleteModalOpen = ref(false);
const groupToDelete = ref<string | null>(null);
const isDeleting = ref(false);

const confirmDelete = (id: string) => {
  groupToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const proceedDelete = async () => {
  if (!groupToDelete.value) return;
  
  isDeleting.value = true;
  try {
    const success = await deleteTicketGroup(groupToDelete.value);
    if (success) {
      toast.success('Ticket Group deleted');
      await getPaginatedTicketGroups();
    } else {
      toast.error('Failed to delete ticket group');
    }
  } catch (error) {
    console.error("Error deleting ticket group", error);
    toast.error('An error occurred while deleting');
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    groupToDelete.value = null;
  }
};

const formatCurrency = (amount: number, currency = 'GHS') => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(amount);
};
</script>

<template>
  <div class="h-[calc(100vh-6rem)] flex flex-col font-sans">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ticket Groups</h1>
        <p class="text-slate-500 font-medium">Manage ticket groups and pricing</p>
      </div>
      <button 
        @click="openModal()"
        class="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Create Ticket Group
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
      <div class="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
        <div class="relative w-full max-w-md">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="filters.query"
            type="text" 
            placeholder="Search ticket group..." 
            class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="isLoading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div v-else-if="ticketGroupList.length === 0" class="py-16 text-center text-slate-500 flex flex-col items-center">
          <TicketIcon class="w-16 h-16 text-slate-200 mb-4" />
          <p class="font-bold text-slate-700">No ticket groups found</p>
          <p class="text-sm mt-1">Try adjusting your search or create a new collection.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div 
            v-for="collection in ticketGroupList" 
            :key="collection.id"
            class="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all group flex flex-col gap-4 relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button @click="openModal(collection)" class="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="confirmDelete(collection.id)" class="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <TicketIcon class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0 pt-1">
                <h3 class="font-bold text-slate-900 text-lg truncate pr-16">{{ collection.name }}</h3>
                <span 
                  class="inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0"
                  :class="collection.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ collection.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-100">
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 uppercase font-black tracking-wider">Quantity</span>
                <span class="font-semibold text-slate-700 text-sm mt-0.5">{{ collection.quantity }} Tickets</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 uppercase font-black tracking-wider">Unit Price</span>
                <span class="font-black text-emerald-600 text-sm mt-0.5">{{ formatCurrency(collection.unitPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
      <div class="relative z-10 w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
              <TicketIcon class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-base font-black text-slate-900">{{ editingGroup ? 'Edit Collection' : 'New Collection' }}</h2>
            </div>
          </div>
          <button @click="isModalOpen = false" class="p-2 hover:bg-white rounded-full text-slate-400">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        
        <form @submit.prevent="saveGroup" class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div class="space-y-1.5">
            <label class="text-[11px] font-black uppercase text-slate-500">Name/Label</label>
            <input v-model="form.name" type="text" placeholder="e.g. Bronze Package" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-slate-800" required />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[11px] font-black uppercase text-slate-500">Ticket Quantity</label>
              <input v-model="form.quantity" type="number" min="1" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-slate-800" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-black uppercase text-slate-500">Unit Price</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">GHS</span>
                <input v-model="form.unitPrice" type="number" step="0.01" min="0" class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-slate-800" required />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-1 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer" @click="form.isActive = !form.isActive">
            <input v-model="form.isActive" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" @click.stop />
            <div class="flex-1">
              <span class="text-sm font-bold text-slate-700 block">Active Status</span>
            </div>
            <component :is="form.isActive ? CheckCircleIcon : XCircleIcon" class="w-5 h-5" :class="form.isActive ? 'text-emerald-500' : 'text-slate-300'" />
          </div>

          <div class="mt-2 pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center min-w-[120px]">
              <div v-if="isSaving" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              {{ isSaving ? 'Saving...' : 'Save Collection' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeleting"
      title="Delete Collection"
      description="Are you sure you want to delete this ticket collection? This action cannot be undone."
      @close="isDeleteModalOpen = false"
      @confirm="proceedDelete"
    />
  </div>
</template>
