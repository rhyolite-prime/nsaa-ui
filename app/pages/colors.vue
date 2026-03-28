<script setup lang="ts">
import { 
  SwatchIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import type { Colour } from "~/models";
import { isEmpty, debounce } from "lodash-es";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

useHead({
  title: 'Colours | NSAA BO'
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


const colourList = ref<Colour[]>([]);

const isShimmerLoading = ref(true);

const onPageChange = async (pageNumber: number) => {

	filters.pageNo = pageNumber;
	const filteredQuery = filterQueryParams({ ...route.query, ...filters });

	router.replace({ name: route.name ?? '', query: filteredQuery });
    await getPaginatedColours()
}


const getPaginatedColours = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getColours(filters);

        colourList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        toast.error('Unable to fetch colours !');
    } finally {
        isShimmerLoading.value = false;
    }

 }

const isSaving = ref(false);

const isDeleteModalOpen = ref(false);
const colorIdToDelete = ref<string>('');
const isDeletingColor = ref(false);
const editingColor = ref<any>(null);
const isModalOpen = ref(false);

const form = ref({
  name: '',
  code: '',
  hexColor: '#000000'
});

const openAddModal = () => {
  editingColor.value = null;
  form.value = { name: '', code: '', hexColor: '#000000' };
  isModalOpen.value = true;
};

const openEditModal = (color: any) => {
  editingColor.value = color;
  form.value = { ...color };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveColor = async () => {
  if (!form.value.name || !form.value.code) {
    toast.error('Color name and code are required');
    return;
  }

  isSaving.value = true;
  try {
    const payload = { ...form.value };
    
    if (editingColor.value?.id) {
      (payload as any).id = editingColor.value.id;
    }

    let isSuccessful = false;
    if (editingColor.value) {
      isSuccessful = await updateColour(payload);
    } else {
      isSuccessful = await createColour(payload);
    }

    if (isSuccessful) {
      closeModal();
      toast.success(editingColor.value ? 'Colour updated successfully' : 'Colour created successfully');
      getPaginatedColours();
    } else {
      toast.error('Operation failed');
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while saving the colour');
  } finally {
    isSaving.value = false;
  }
};

const deleteColor = (id: string) => {
  colorIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeletingColor.value = true;
  try {
    const isSuccessful = await deleteColour({ id: colorIdToDelete.value });
    if (isSuccessful) {
      toast.success('Color deleted successfully');
      getPaginatedColours();
      isDeleteModalOpen.value = false;
    } else {
      toast.error('Failed to delete color');
    }
  } catch (error) {
    toast.error('An error occurred while deleting color');
  } finally {
    isDeletingColor.value = false;
  }
};


const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedColours();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string);
    }
    
    await getPaginatedColours();

  });
  
</script>

<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Color Management</h1>
        <p class="text-slate-500 font-medium">Manage colors available for raffle entries</p>
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 bg-[#C82323] hover:bg-[#A01D1D] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add New Color
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="filters.query"
          type="text" 
          placeholder="Search by name or code..." 
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 font-medium text-slate-700 transition-all"
        />
      </div>
    </div>

    <!-- Colors Table -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-5 text-[13px] font-black uppercase tracking-wider text-slate-400">Preview</th>
              <th class="px-6 py-5 text-[13px] font-black uppercase tracking-wider text-slate-400">Color Name</th>
              <th class="px-6 py-5 text-[13px] font-black uppercase tracking-wider text-slate-400">Code</th>
              <th class="px-6 py-5 text-[13px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <template v-if="isShimmerLoading">
              <tr v-for="i in 5" :key="i">
                <td class="px-6 py-5">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 shimmer border border-white"></div>
                </td>
                <td class="px-6 py-5">
                  <div class="h-4 w-32 bg-slate-100 rounded-lg shimmer"></div>
                </td>
                <td class="px-6 py-5">
                  <div class="h-6 w-16 bg-slate-50 rounded-lg shimmer"></div>
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex justify-end gap-2">
                    <div class="w-9 h-9 bg-slate-50 rounded-xl shimmer"></div>
                    <div class="w-9 h-9 bg-slate-50 rounded-xl shimmer"></div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else v-for="color in colourList" :key="color.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-5">
                <div 
                  class="w-10 h-10 rounded-xl shadow-inner border border-white"
                  :style="{ backgroundColor: color.hexColor }"
                ></div>
              </td>
              <td class="px-6 py-5">
                <span class="font-bold text-slate-700">{{ color.name }}</span>
              </td>
              <td class="px-6 py-5">
                <span class="px-3 py-1 bg-slate-100 rounded-lg text-[12px] font-black text-slate-500 uppercase tracking-widest">
                  {{ color.code }}
                </span>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="openEditModal(color)"
                    class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button 
                    @click="deleteColor(color.id)"
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
            <div class="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
              <SwatchIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">{{ editingColor ? 'Edit Color' : 'Add New Color' }}</h2>
              <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Configure raffle color attributes</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="saveColor" class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          <div class="space-y-2">
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Color Name</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="e.g. Ruby Red" 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 font-bold text-slate-700 transition-all placeholder:text-slate-300"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Code</label>
              <input 
                v-model="form.code"
                type="text" 
                placeholder="RBY-RD" 
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 font-black text-slate-700 transition-all uppercase placeholder:text-slate-300"
                required
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Hex Color</label>
              <div class="flex gap-2">
                <input 
                  v-model="form.hexColor"
                  type="color" 
                  class="w-12 h-12 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer"
                />
                <input 
                  v-model="form.hexColor"
                  type="text" 
                  class="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 font-mono text-slate-700 transition-all uppercase"
                  required
                />
              </div>
            </div>
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
              {{ isSaving ? 'Saving...' : (editingColor ? 'Edit Color' : 'Save Color') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal 
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeletingColor"
      title="Delete Color"
      description="Are you sure you want to delete this color? This action cannot be undone."
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
