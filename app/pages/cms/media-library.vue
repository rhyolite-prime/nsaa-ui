<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  CloudArrowUpIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline';
import numeral from 'numeral';

useHead({
  title: 'Media Library | NSAA BO'
})
// Define the Media type based on the DB schema
interface MediaItem {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null; // Size in bytes
  category: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

// Mock data
const mediaItems = ref<MediaItem[]>([
  {
    id: '1',
    title: 'Raffle Promo Banner',
    file_url: 'https://images.unsplash.com/photo-1518183214770-9c67425170d1?q=80&w=2000&auto=format&fit=crop',
    file_type: 'image/jpeg',
    file_size: 2450000, // ~2.4MB
    category: 'Marketing',
    download_count: 145,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Terms and Conditions',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_type: 'application/pdf',
    file_size: 512000, // ~500KB
    category: 'Legal',
    download_count: 32,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Winner Announcement Video',
    file_url: 'https://example.com/video.mp4',
    file_type: 'video/mp4',
    file_size: 15400000, // ~15MB
    category: 'Social Media',
    download_count: 89,
    is_active: false,
    created_at: new Date().toISOString()
  }
]);

const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingItem = ref<MediaItem | null>(null);
const itemToDelete = ref<string | null>(null);

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  title: '',
  file_url: '',
  file_type: 'image/jpeg',
  file_size: 0 as number | null,
  category: '',
  is_active: false
});

// Common MIME types for the dropdown
const commonFileTypes = [
  { label: 'Image (JPEG)', value: 'image/jpeg' },
  { label: 'Image (PNG)', value: 'image/png' },
  { label: 'Image (SVG)', value: 'image/svg+xml' },
  { label: 'Video (MP4)', value: 'video/mp4' },
  { label: 'Document (PDF)', value: 'application/pdf' },
  { label: 'Document (Word)', value: 'application/msword' },
  { label: 'Archive (ZIP)', value: 'application/zip' }
];

const openCreateModal = () => {
  editingItem.value = null;
  form.value = {
    title: '',
    file_url: '',
    file_type: 'image/jpeg',
    file_size: null,
    category: '',
    is_active: true
  };
  isModalOpen.value = true;
};

const openEditModal = (item: MediaItem) => {
  editingItem.value = item;
  form.value = { 
    title: item.title,
    file_url: item.file_url,
    file_type: item.file_type,
    file_size: item.file_size,
    category: item.category,
    is_active: item.is_active
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmDelete = (id: string) => {
  itemToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const handleDelete = () => {
  if (itemToDelete.value) {
    mediaItems.value = mediaItems.value.filter(m => m.id !== itemToDelete.value);
  }
  isDeleteModalOpen.value = false;
  itemToDelete.value = null;
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
  if (!form.value.title) {
    form.value.title = file.name.split('.')[0].replace(/[-_]/g, ' ');
  }
  form.value.file_type = file.type || 'application/octet-stream';
  form.value.file_size = file.size;
  form.value.file_url = URL.createObjectURL(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const saveMedia = () => {
  if (editingItem.value) {
    const index = mediaItems.value.findIndex(m => m.id === editingItem.value!.id);
    if (index !== -1) {
      mediaItems.value[index] = { 
        ...mediaItems.value[index],
        ...form.value 
      };
    }
  } else {
    mediaItems.value.unshift({
      id: crypto.randomUUID(),
      ...form.value,
      download_count: 0,
      created_at: new Date().toISOString()
    });
  }
  closeModal();
};

// Unique categories for the datalist
const availableCategories = computed(() => {
  const categories = new Set(mediaItems.value.map(m => m.category).filter(Boolean));
  return Array.from(categories);
});

// Format file size
const formatSize = (bytes: number | null) => {
  if (bytes === null || bytes === undefined) return 'Unknown size';
  return numeral(bytes).format('0.0 b');
};

// Get appropriate icon based on file type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return PhotoIcon;
  if (mimeType.startsWith('video/')) return VideoCameraIcon;
  if (mimeType === 'application/pdf') return DocumentTextIcon;
  return DocumentIcon;
};

// Check if it's an image that can be previewed
const isImage = (mimeType: string) => mimeType.startsWith('image/');
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Media Library</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage images, videos, and documents used across the site</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold tracking-wider uppercase text-sm flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all active:scale-95"
      >
        <CloudArrowUpIcon class="w-5 h-5" />
        Upload Media
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="mediaItems.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <CloudArrowUpIcon class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-black text-slate-900 uppercase tracking-wide">Library is Empty</h3>
      <p class="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed mb-6">Upload images, promotional videos, or legal documents to use them in the raffle app.</p>
      <button 
        @click="openCreateModal"
        class="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
      >
        <CloudArrowUpIcon class="w-4 h-4" />
        Upload First File
      </button>
    </div>

    <!-- Media Grid View -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="item in mediaItems" 
        :key="item.id"
        class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
      >
        <!-- Media Preview -->
        <div class="relative h-48 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100 group-hover:border-transparent transition-colors">
          <!-- Image Preview -->
          <img 
            v-if="isImage(item.file_type) && item.file_url" 
            :src="item.file_url" 
            :alt="item.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            @error="e => (e.target as HTMLImageElement).style.display = 'none'"
          />
          <!-- File Icon for Non-Images -->
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 group-hover:bg-slate-100 transition-colors">
            <component :is="getFileIcon(item.file_type)" class="w-16 h-16 mb-2" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{{ item.file_type.split('/')[1] || item.file_type }}</span>
          </div>
          
          <!-- Status Badge -->
          <div class="absolute top-3 left-3 flex gap-2">
            <span 
              class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm"
              :class="item.is_active ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/70 text-slate-200'"
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <!-- Actions Overlay -->
          <div class="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="openEditModal(item)"
              class="w-8 h-8 rounded-xl bg-white/95 backdrop-blur text-slate-600 flex items-center justify-center hover:text-primary-600 transition-colors shadow-sm"
              title="Edit Details"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button 
              @click="confirmDelete(item.id)"
              class="w-8 h-8 rounded-xl bg-white/95 backdrop-blur text-slate-600 flex items-center justify-center hover:text-red-600 transition-colors shadow-sm"
              title="Delete File"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- File Details -->
        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-black text-slate-900 text-[15px] leading-tight line-clamp-1 mb-1" :title="item.title">{{ item.title }}</h3>
          
          <div class="flex items-center justify-between mt-auto pt-4">
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <component :is="getFileIcon(item.file_type)" class="w-3.5 h-3.5 text-slate-400" />
                {{ formatSize(item.file_size) }}
              </span>
              <span v-if="item.category" class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                <TagIcon class="w-3 h-3" />
                {{ item.category }}
              </span>
            </div>

            <div class="text-right flex flex-col items-end gap-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Downloads</span>
              <div class="flex items-center gap-1 text-slate-700 font-black">
                <ArrowDownTrayIcon class="w-3.5 h-3.5 text-slate-400" />
                {{ numeral(item.download_count).format('0,0') }}
              </div>
            </div>
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
            {{ editingItem ? 'Edit Media Details' : 'Upload New Media' }}
          </h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto bg-white">
          <form @submit.prevent="saveMedia" class="space-y-6">
            
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">File Title <span class="text-red-500">*</span></label>
              <input 
                v-model="form.title" 
                type="text" 
                required
                maxlength="255"
                placeholder="e.g. Promo Video August"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">File Upload <span class="text-red-500">*</span></label>
              
              <div 
                class="relative w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all bg-slate-50 cursor-pointer overflow-hidden group"
                :class="[
                  isDragging ? 'border-primary-500 bg-primary-50 scale-[0.99]' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100',
                  form.file_url && !isDragging ? 'border-emerald-500 bg-emerald-50' : ''
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
                  @change="handleFileSelect"
                />
                
                <div v-if="!form.file_url" class="flex flex-col items-center text-center pointer-events-none">
                  <div class="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-primary-500 group-hover:scale-110 transition-transform">
                    <CloudArrowUpIcon class="w-8 h-8" />
                  </div>
                  <h4 class="text-sm font-black text-slate-900 mb-1">Click to upload or drag and drop</h4>
                  <p class="text-xs font-medium text-slate-500 max-w-[250px]">SVG, PNG, JPG, MP4 or PDF (max. 10MB)</p>
                </div>

                <div v-else class="flex flex-col items-center text-center w-full pointer-events-none">
                  <!-- Preview -->
                  <div v-if="isImage(form.file_type)" class="w-32 h-32 rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden mb-4 relative group">
                    <img :src="form.file_url" class="w-full h-full object-cover" @error="e => (e.target as HTMLImageElement).style.display = 'none'" />
                  </div>
                  <div v-else class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckIcon class="w-8 h-8" />
                  </div>
                  
                  <h4 class="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
                    <span v-if="editingItem && form.file_url === editingItem.file_url">File attached successfully!</span>
                    <span v-else>File selected successfully!</span>
                  </h4>
                  <p class="text-xs font-medium text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-lg mt-2">Click or drag a different file to replace</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">File Type <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select 
                    v-model="form.file_type"
                    required
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                  >
                    <option v-for="type in commonFileTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">File Size (Bytes)</label>
                <input 
                  v-model.number="form.file_size" 
                  type="number" 
                  min="0"
                  placeholder="e.g. 1048576"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900"
                />
                <p v-if="form.file_size" class="text-[10px] text-primary-600 font-bold mt-1 text-right">
                  Formatted: {{ formatSize(form.file_size) }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
              <input 
                v-model="form.category" 
                type="text" 
                list="media-categories"
                maxlength="100"
                placeholder="e.g. Marketing, Legal, Banners"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
              <datalist id="media-categories">
                <option v-for="cat in availableCategories" :key="cat" :value="cat"></option>
              </datalist>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <div class="flex items-center gap-4">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer" for="status-toggle">
                  Availability Status
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
              
              <div class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full" :class="form.is_active ? 'bg-emerald-500' : 'bg-slate-300'"></div>
                {{ form.is_active ? 'Available for public use' : 'Hidden from public' }}
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
            @click="saveMedia"
            class="px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <CheckIcon class="w-5 h-5" />
            Save Media
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete Media File"
      description="Are you sure you want to remove this media file? It will be permanently deleted and links to it may break."
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>