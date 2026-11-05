<script setup lang="ts">
import { ref } from 'vue';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline';
import type { HeroSlider } from "~/models";
// Define the slide type based on the DB schema

const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingSlide = ref<HeroSlider | null>(null);
const slideToDelete = ref<string | null>(null);

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);


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


const heroSliderList = ref<HeroSlider[]>([]);

const isShimmerLoading = ref(true);

const onPageChange = async (pageNumber: number) => {

	filters.pageNo = pageNumber;
	const filteredQuery = filterQueryParams({ ...route.query, ...filters });

	router.replace({ name: route.name ?? '', query: filteredQuery });
    await getPaginatedHeroSliders()
}

const getPaginatedHeroSliders = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await createHeroSlider(filters);

        heroSliderList.value = result.data;

        paginationParams.totalPages = result.totalPages;
        paginationParams.totalCount = result.totalCount;
        paginationParams.lowerBound = result.lowerBound;
        paginationParams.upperBound = result.upperBound;

    } catch (error) {
        toast.error('Unable to fetch hero sliders !');
    } finally {
        isShimmerLoading.value = false;
    }

 }

const isSaving = ref(false);


const saveSlider = async () => {
  if (!form.value.name || !form.value.code) {
    toast.error('Color name and code are required');
    return;
  }

  isSaving.value = true;
  try {
    const payload = { ...form.value };
    
    if (slideToDelete.value) {
      (payload as any).id = slideToDelete.value;
    }

    let isSuccessful = false;
    if (editingColor.value) {
      isSuccessful = await updateColour(payload, slideToDelete.value);
    } else {
      isSuccessful = await createColour(payload);
    }

    if (isSuccessful) {
      closeModal();
      toast.success(editingColor.value ? 'Slider updated successfully' : 'Slider created successfully');
      getPaginatedHeroSliders();
    } else {
      toast.error('Operation failed');
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while saving the slider');
  } finally {
    isSaving.value = false;
  }
};




const form = ref({
  headline: '',
  copy: '',
  ctaPrimary: '',
  ctaSecondary: '',
  displayOrder: 0,
  isActive: false
});

const openCreateModal = () => {
  editingSlide.value = null;
  form.value = {
    headline: '',
    copy: '',
    ctaPrimary: '',
    ctaSecondary: '',
    displayOrder: slides.value.length + 1,
    isActive: true
  };
  isModalOpen.value = true;
};

const openEditModal = (slide: HeroSlide) => {
  editingSlide.value = slide;
  form.value = { ...slide };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmDelete = (id: string) => {
  slideToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeletingColor.value = true;
  try {
    const isSuccessful = await deleteColour({ id: colorIdToDelete.value });
    if (isSuccessful) {
      toast.success('Sliders deleted successfully');
      getPaginatedHeroSliders();
      isDeleteModalOpen.value = false;
    } else {
      toast.error('Failed to delete sliders');
    }
  } catch (error) {
    toast.error('An error occurred while deleting slider');
  } finally {
    isDeletingColor.value = false;
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0]);
  }
};

const handleFile = (file: File) => {
  form.value.image_url = URL.createObjectURL(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Hero Sliders</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage the main carousel on the landing page</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold tracking-wider uppercase text-sm flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add Slide
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="slides.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <PhotoIcon class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-black text-slate-900 uppercase tracking-wide">No Slides Yet</h3>
      <p class="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed mb-6">Create your first hero slide to welcome visitors to the Chop Money raffle site.</p>
      <button 
        @click="openCreateModal"
        class="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Create First Slide
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="slide in slides" 
        :key="slide.id"
        class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
      >
        <!-- Image Header -->
        <div class="relative h-48 bg-slate-100 overflow-hidden shrink-0">
          <img v-if="slide.image_url" :src="slide.image_url" :alt="slide.headline" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <PhotoIcon class="w-12 h-12" />
          </div>
          
          <!-- Status Badge -->
          <div class="absolute top-4 left-4 flex gap-2">
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
              :class="slide.is_active ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/70 text-slate-200'"
            >
              {{ slide.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <!-- Quick Actions Overlay -->
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="openEditModal(slide)"
              class="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center hover:bg-white hover:text-primary-600 transition-colors shadow-sm"
              title="Edit Slide"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button 
              @click="confirmDelete(slide.id)"
              class="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center hover:bg-white hover:text-red-600 transition-colors shadow-sm"
              title="Delete Slide"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 flex flex-col flex-1">
          <div class="flex items-start justify-between gap-4 mb-2">
            <h3 class="font-black text-slate-900 text-lg leading-tight line-clamp-1">{{ slide.headline }}</h3>
            <span class="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">#{{ slide.display_order }}</span>
          </div>
          
          <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 min-h-[40px] flex-1">
            {{ slide.copy || 'No copy provided' }}
          </p>

          <div class="flex flex-wrap gap-2 mt-auto">
            <span v-if="slide.cta_primary" class="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
              {{ slide.cta_primary }}
            </span>
            <span v-if="slide.cta_secondary" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {{ slide.cta_secondary }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">
            {{ editingSlide ? 'Edit Slide' : 'Create Slide' }}
          </h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto bg-white">
          <form @submit.prevent="saveSlide" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Headline <span class="text-red-500">*</span></label>
              <input 
                v-model="form.headline" 
                type="text" 
                required
                maxlength="255"
                placeholder="e.g. Win Big This Friday!"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Copy text</label>
              <textarea 
                v-model="form.copy" 
                rows="3"
                placeholder="Brief description underneath the headline..."
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Image Upload <span class="text-red-500">*</span></label>
              
              <div 
                class="relative w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-slate-50 cursor-pointer overflow-hidden group"
                :class="[
                  isDragging ? 'border-primary-500 bg-primary-50 scale-[0.99]' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100',
                  form.image_url && !isDragging ? 'border-emerald-500 bg-emerald-50' : ''
                ]"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
                @click="triggerFileInput"
              >
                <input 
                  type="file" 
                  ref="fileInput"
                  class="hidden" 
                  accept="image/*"
                  @change="handleFileSelect"
                />
                
                <div v-if="!form.image_url" class="flex flex-col items-center text-center pointer-events-none">
                  <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-primary-500 group-hover:scale-110 transition-transform">
                    <CloudArrowUpIcon class="w-6 h-6" />
                  </div>
                  <h4 class="text-sm font-black text-slate-900 mb-1">Upload slide image</h4>
                  <p class="text-[10px] font-medium text-slate-500 max-w-[200px]">Drag and drop or click to browse</p>
                </div>

                <div v-else class="flex flex-col items-center text-center w-full pointer-events-none">
                  <div class="w-full h-32 rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-3 relative group">
                    <img :src="form.image_url" class="w-full h-full object-cover" @error="e => (e.target as HTMLImageElement).style.display = 'none'" />
                  </div>
                  <p class="text-[10px] font-medium text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">Click to replace</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Primary CTA Label</label>
                <input 
                  v-model="form.cta_primary" 
                  type="text" 
                  maxlength="255"
                  placeholder="e.g. Play Now"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Secondary CTA Label</label>
                <input 
                  v-model="form.cta_secondary" 
                  type="text" 
                  maxlength="255"
                  placeholder="e.g. Learn More"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <div class="space-y-2 w-32">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Display Order</label>
                <input 
                  v-model.number="form.display_order" 
                  type="number" 
                  min="0"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 text-center"
                />
              </div>

              <div class="flex items-center gap-4">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer" for="status-toggle">
                  Active Status
                </label>
                <button
                  id="status-toggle"
                  type="button"
                  @click="form.is_active = !form.is_active"
                  class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none"
                  :class="form.is_active ? 'bg-emerald-500' : 'bg-slate-300'"
                >
                  <span 
                    class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm"
                    :class="form.is_active ? 'translate-x-7' : 'translate-x-1'"
                  ></span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            @click="closeModal" 
            class="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
          >
            Cancel
          </button>
          <button 
            @click="saveSlide"
            class="px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <CheckIcon class="w-5 h-5" />
            Save Slide
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete Slide"
      description="Are you sure you want to remove this hero slide? It will no longer appear on the main landing page. This action cannot be undone."
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>
