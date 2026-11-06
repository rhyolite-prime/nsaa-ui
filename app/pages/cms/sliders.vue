<script setup lang="ts">
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { debounce, isEmpty } from 'lodash-es';
import type { HeroSlider, HeroSliderForm } from "~/models";

useHead({
  title: 'Hero Sliders | NSAA BO'
})

// Mirrors the limits the api enforces on the uploaded slide image.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
  'image/tiff',
  'image/avif'
];
const ACCEPTED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tif', 'tiff', 'avif'];

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

// Modal state
const isModalOpen = ref(false);
const editingSlide = ref<HeroSlider | null>(null);
const isSaving = ref(false);

// Delete modal state
const isDeleteModalOpen = ref(false);
const isDeletingSlide = ref(false);
const slideIdToDelete = ref('');

// The editable fields of a slide, they become the multipart form fields.
const emptyForm = (): HeroSliderForm => ({
  headline: '',
  copy: '',
  ctaPrimary: '',
  ctaSecondary: '',
  displayOrder: 0,
  isActive: true
});

const form = ref<HeroSliderForm>(emptyForm());

// The image is kept as a File and attached to the request as form data, the
// preview url is only used to show the user what they picked.
const imageFile = ref<File | null>(null);
const imagePreview = ref('');
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const currentImageUrl = computed(() => imagePreview.value || editingSlide.value?.imageUrl || '');
const hasStoredImage = computed(() => !imageFile.value && !!editingSlide.value?.imageUrl);

const getPaginatedHeroSliders = async () => {

    isShimmerLoading.value = true;

    try {

        let result = await getHeroSliders(filters);

        heroSliderList.value = result?.data ?? [];

        paginationParams.totalPages = result?.totalPages ?? 0;
        paginationParams.totalCount = result?.totalCount ?? 0;
        paginationParams.lowerBound = result?.lowerBound ?? 0;
        paginationParams.upperBound = result?.upperBound ?? 0;

    } catch (error) {
        toast.error('Unable to fetch hero sliders !');
    } finally {
        isShimmerLoading.value = false;
    }

 }

const onPageChange = async (pageNumber: number) => {

	filters.pageNo = pageNumber;
	const filteredQuery = filterQueryParams({ ...route.query, ...filters });

	router.replace({ name: route.name ?? '', query: filteredQuery });
    await getPaginatedHeroSliders()
}

const revokeImagePreview = () => {
    if (imagePreview.value) {
        URL.revokeObjectURL(imagePreview.value);
        imagePreview.value = '';
    }
};

const resetImageSelection = () => {
    revokeImagePreview();
    imageFile.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const isSupportedImage = (file: File) => {
    const mimeType = file.type?.toLowerCase();
    if (mimeType) {
        return ACCEPTED_IMAGE_TYPES.includes(mimeType);
    }
    const extension = file.name?.split('.').pop()?.toLowerCase() ?? '';
    return ACCEPTED_IMAGE_EXTENSIONS.includes(extension);
};

const handleFile = (file: File) => {

    if (!isSupportedImage(file)) {
        toast.error('Unsupported file. Use a png, jpg, gif, bmp, webp or svg image');
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        toast.error('The image is too large. The maximum allowed size is 5MB');
        return;
    }

    revokeImagePreview();
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
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
  const droppedFile = e.dataTransfer?.files?.[0];
  if (droppedFile) {
    handleFile(droppedFile);
  }
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (selectedFile) {
    handleFile(selectedFile);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

/**
 * Builds the multipart/form-data body of the create/update requests.
 *
 * The image travels with the record as the `image` file attachment so the api
 * can upload it to cloudinary and persist the returned url, which is why the
 * stored `imageUrl` is never part of the payload.
 */
const buildSliderFormData = () => {

    const formData = new FormData();

    formData.append('headline', form.value.headline.trim());
    formData.append('copy', form.value.copy?.trim() ?? '');
    formData.append('ctaPrimary', form.value.ctaPrimary?.trim() ?? '');
    formData.append('ctaSecondary', form.value.ctaSecondary?.trim() ?? '');
    formData.append('displayOrder', String(form.value.displayOrder ?? 0));
    formData.append('isActive', String(form.value.isActive));

    // a new image replaces the stored one, omitting it keeps the current image
    if (imageFile.value) {
        formData.append('image', imageFile.value, imageFile.value.name);
    }

    return formData;
};

const openCreateModal = () => {
  editingSlide.value = null;
  resetImageSelection();
  form.value = {
    ...emptyForm(),
    displayOrder: (paginationParams.totalCount || heroSliderList.value.length) + 1
  };
  isModalOpen.value = true;
};

const openEditModal = (slide: HeroSlider) => {
  editingSlide.value = slide;
  resetImageSelection();
  // only the editable fields are copied over, the id and the stored image url
  // are not form data fields
  form.value = {
    headline: slide.headline ?? '',
    copy: slide.copy ?? '',
    ctaPrimary: slide.ctaPrimary ?? '',
    ctaSecondary: slide.ctaSecondary ?? '',
    displayOrder: slide.displayOrder ?? 0,
    isActive: slide.isActive ?? true
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingSlide.value = null;
  resetImageSelection();
};

const saveSlider = async () => {

  if (!form.value.headline?.trim()) {
    toast.error('Slide headline is required');
    return;
  }

  if (!editingSlide.value && !imageFile.value) {
    toast.error('An image is required to create a slide');
    return;
  }

  const displayOrder = Number(form.value.displayOrder);
  if (!Number.isFinite(displayOrder)) {
    toast.error('Display order must be a number');
    return;
  }
  form.value.displayOrder = Math.max(0, Math.trunc(displayOrder));

  isSaving.value = true;
  try {
    const payload = buildSliderFormData();

    const isSuccessful = editingSlide.value
      ? await updateHeroSlider(editingSlide.value.id, payload)
      : await createHeroSlider(payload);

    if (isSuccessful) {
      toast.success(editingSlide.value ? 'Slider updated successfully' : 'Slider created successfully');
      closeModal();
      await getPaginatedHeroSliders();
    } else {
      toast.error(editingSlide.value ? 'Failed to update the slider' : 'Failed to create the slider');
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while saving the slider');
  } finally {
    isSaving.value = false;
  }
};

const openDeleteModal = (id: string) => {
  slideIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {

  if (!slideIdToDelete.value) {
    return;
  }

  isDeletingSlide.value = true;
  try {
    const isLastItemOnPage = heroSliderList.value.length === 1;
    const isSuccessful = await deleteHeroSlider(slideIdToDelete.value);

    if (isSuccessful) {
      toast.success('Slider deleted successfully');

      // step back a page when the deleted slide was the only one left on it
      if (isLastItemOnPage && filters.pageNo > 1) {
        filters.pageNo -= 1;
      }

      isDeleteModalOpen.value = false;
      await getPaginatedHeroSliders();
    } else {
      toast.error('Failed to delete the slider');
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while deleting the slider');
  } finally {
    isDeletingSlide.value = false;
    slideIdToDelete.value = '';
  }
};

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const hideBrokenImage = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
};

const debouncedSearch = debounce(() => {
    filters.pageNo = 1; // Reset to first page for new search
    getPaginatedHeroSliders();
  }, 300); // 300ms delay


  watch(() => filters.query, debouncedSearch);

  onMounted(async () => {
    if (!isEmpty(route.query)) {
      filters.pageNo = parseInt(route.query.pageNo as string) || 1;
    }

    await getPaginatedHeroSliders();

  });

  onBeforeUnmount(() => {
    debouncedSearch.cancel();
    revokeImagePreview();
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

    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="filters.query"
          type="text"
          placeholder="Search by headline, copy or call to action..."
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-200 font-medium text-slate-700 transition-all"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isShimmerLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
      >
        <div class="h-48 bg-slate-100 shimmer shrink-0"></div>
        <div class="p-6 space-y-3">
          <div class="h-4 w-3/4 bg-slate-100 rounded-lg shimmer"></div>
          <div class="h-3 w-full bg-slate-50 rounded-lg shimmer"></div>
          <div class="h-3 w-2/3 bg-slate-50 rounded-lg shimmer"></div>
          <div class="flex gap-2 pt-2">
            <div class="h-7 w-20 bg-slate-50 rounded-lg shimmer"></div>
            <div class="h-7 w-20 bg-slate-50 rounded-lg shimmer"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="heroSliderList.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
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
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="slide in heroSliderList"
          :key="slide.id"
          class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
        >
          <!-- Image Header -->
          <div class="relative h-48 bg-slate-100 overflow-hidden shrink-0">
            <img v-if="slide.imageUrl" :src="slide.imageUrl" :alt="slide.headline" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" @error="hideBrokenImage" />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
              <PhotoIcon class="w-12 h-12" />
            </div>

            <!-- Status Badge -->
            <div class="absolute top-4 left-4 flex gap-2">
              <span
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
                :class="slide.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/70 text-slate-200'"
              >
                {{ slide.isActive ? 'Active' : 'Inactive' }}
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
                @click="openDeleteModal(slide.id)"
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
              <span class="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">#{{ slide.displayOrder }}</span>
            </div>

            <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 min-h-[40px] flex-1">
              {{ slide.copy || 'No copy provided' }}
            </p>

            <div class="flex flex-wrap gap-2 mt-auto">
              <span v-if="slide.ctaPrimary" class="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                {{ slide.ctaPrimary }}
              </span>
              <span v-if="slide.ctaSecondary" class="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {{ slide.ctaSecondary }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
          Showing {{ paginationParams.lowerBound }} to {{ paginationParams.upperBound }} of {{ paginationParams.totalCount }} Slides
        </span>
        <div v-if="paginationParams.totalPages > 1" class="order-1 sm:order-2">
          <Pagination
            :current-page="filters.pageNo"
            :total-pages="paginationParams.totalPages"
            @page-change="onPageChange"
          />
        </div>
      </div>
    </template>

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
          <form id="slider-form" @submit.prevent="saveSlider" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500" for="slide-headline">Headline <span class="text-red-500">*</span></label>
              <input
                id="slide-headline"
                v-model="form.headline"
                type="text"
                required
                maxlength="255"
                placeholder="e.g. Win Big This Friday!"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500" for="slide-copy">Copy text</label>
              <textarea
                id="slide-copy"
                v-model="form.copy"
                rows="3"
                placeholder="Brief description underneath the headline..."
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">
                Slide Image <span v-if="!editingSlide" class="text-red-500">*</span>
              </label>

              <div
                class="relative w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-slate-50 cursor-pointer overflow-hidden group"
                :class="[
                  isDragging ? 'border-primary-500 bg-primary-50 scale-[0.99]' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100',
                  currentImageUrl && !isDragging ? 'border-emerald-500 bg-emerald-50' : ''
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
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp,image/webp,image/svg+xml"
                  @change="handleFileSelect"
                />

                <div v-if="!currentImageUrl" class="flex flex-col items-center text-center pointer-events-none">
                  <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-primary-500 group-hover:scale-110 transition-transform">
                    <CloudArrowUpIcon class="w-6 h-6" />
                  </div>
                  <h4 class="text-sm font-black text-slate-900 mb-1">Upload slide image</h4>
                  <p class="text-[10px] font-medium text-slate-500 max-w-[220px]">Drag and drop or click to browse • PNG, JPG, GIF, WEBP or SVG up to 5MB</p>
                </div>

                <div v-else class="flex flex-col items-center text-center w-full pointer-events-none">
                  <div class="w-full h-32 rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-3 relative">
                    <img :src="currentImageUrl" class="w-full h-full object-cover" @error="hideBrokenImage" />
                  </div>
                  <p v-if="imageFile" class="text-[10px] font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {{ imageFile.name }} • {{ formatFileSize(imageFile.size) }}
                  </p>
                  <p class="text-[10px] font-medium text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md mt-1">
                    {{ imageFile ? 'Click to replace the attached image' : (hasStoredImage ? 'Click to upload a new image' : 'Click to browse') }}
                  </p>
                </div>
              </div>

              <div v-if="imageFile && editingSlide" class="flex justify-end">
                <button
                  type="button"
                  @click="resetImageSelection"
                  class="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 transition-colors"
                >
                  Discard new image
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500" for="slide-cta-primary">Primary CTA Label</label>
                <input
                  id="slide-cta-primary"
                  v-model="form.ctaPrimary"
                  type="text"
                  maxlength="255"
                  placeholder="e.g. Play Now"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500" for="slide-cta-secondary">Secondary CTA Label</label>
                <input
                  id="slide-cta-secondary"
                  v-model="form.ctaSecondary"
                  type="text"
                  maxlength="255"
                  placeholder="e.g. Learn More"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <div class="space-y-2 w-32">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500" for="slide-display-order">Display Order</label>
                <input
                  id="slide-display-order"
                  v-model.number="form.displayOrder"
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
                  @click="form.isActive = !form.isActive"
                  class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none"
                  :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-300'"
                >
                  <span
                    class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm"
                    :class="form.isActive ? 'translate-x-7' : 'translate-x-1'"
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
            :disabled="isSaving"
            class="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 text-sm uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="slider-form"
            :disabled="isSaving"
            class="px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <CheckIcon v-else class="w-5 h-5" />
            {{ isSaving ? 'Saving...' : 'Save Slide' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeletingSlide"
      title="Delete Slide"
      description="Are you sure you want to remove this hero slide? It will no longer appear on the main landing page. This action cannot be undone."
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
