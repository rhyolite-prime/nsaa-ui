<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  CalendarDaysIcon,
  LinkIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline';
import dayjs from 'dayjs';

useHead({
  title: 'Banners | NSAA BO'
})

// Define the Banner type based on the DB schema
interface Banner {
  id: string;
  name: string;
  description: string;
  banner_image_url: string;
  cta_text: string;
  cta_link: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Mock data
const banners = ref<Banner[]>([
  {
    id: '1',
    name: 'Summer Mega Draw',
    description: 'Special promotion for the summer season with 2x prize money.',
    banner_image_url: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2000&auto=format&fit=crop',
    cta_text: 'Buy Tickets Now',
    cta_link: '/tickets',
    start_date: dayjs().subtract(2, 'days').format('YYYY-MM-DDTHH:mm'),
    end_date: dayjs().add(10, 'days').format('YYYY-MM-DDTHH:mm'),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: null
  },
  {
    id: '2',
    name: 'New Year Special',
    description: 'Start the year with a bang! Win a brand new car.',
    banner_image_url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2000&auto=format&fit=crop',
    cta_text: 'Learn More',
    cta_link: '/promotions/new-year',
    start_date: dayjs().add(5, 'months').format('YYYY-MM-DDTHH:mm'),
    end_date: dayjs().add(6, 'months').format('YYYY-MM-DDTHH:mm'),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: null
  }
]);

const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingBanner = ref<Banner | null>(null);
const bannerToDelete = ref<string | null>(null);

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  name: '',
  description: '',
  banner_image_url: '',
  cta_text: '',
  cta_link: '',
  start_date: '',
  end_date: '',
  is_active: false
});

const openCreateModal = () => {
  editingBanner.value = null;
  form.value = {
    name: '',
    description: '',
    banner_image_url: '',
    cta_text: '',
    cta_link: '',
    start_date: dayjs().format('YYYY-MM-DDTHH:mm'),
    end_date: dayjs().add(7, 'days').format('YYYY-MM-DDTHH:mm'),
    is_active: true
  };
  isModalOpen.value = true;
};

const openEditModal = (banner: Banner) => {
  editingBanner.value = banner;
  form.value = { ...banner };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmDelete = (id: string) => {
  bannerToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const handleDelete = () => {
  if (bannerToDelete.value) {
    banners.value = banners.value.filter(b => b.id !== bannerToDelete.value);
  }
  isDeleteModalOpen.value = false;
  bannerToDelete.value = null;
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
  form.value.banner_image_url = URL.createObjectURL(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const saveBanner = () => {
  const now = new Date().toISOString();
  if (editingBanner.value) {
    const index = banners.value.findIndex(b => b.id === editingBanner.value!.id);
    if (index !== -1) {
      banners.value[index] = { 
        ...editingBanner.value, 
        ...form.value,
        updated_at: now
      };
    }
  } else {
    banners.value.unshift({
      id: crypto.randomUUID(),
      ...form.value,
      created_at: now,
      updated_at: null
    });
  }
  closeModal();
};

// Compute banner status
const getBannerStatus = (banner: Banner) => {
  if (!banner.is_active) return { label: 'Inactive', class: 'bg-slate-900/70 text-slate-200' };
  
  const now = dayjs();
  const start = dayjs(banner.start_date);
  const end = dayjs(banner.end_date);
  
  if (now.isBefore(start)) {
    return { label: 'Scheduled', class: 'bg-blue-500/90 text-white' };
  } else if (now.isAfter(end)) {
    return { label: 'Expired', class: 'bg-amber-500/90 text-white' };
  } else {
    return { label: 'Live', class: 'bg-emerald-500/90 text-white shadow-emerald-500/30' };
  }
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMM D, YYYY • h:mm A');
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Banners Management</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage promotional banners and their visibility schedules</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold tracking-wider uppercase text-sm flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add Banner
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="banners.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <PhotoIcon class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-black text-slate-900 uppercase tracking-wide">No Banners Yet</h3>
      <p class="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed mb-6">Create promotional banners to highlight specials, events, or important announcements.</p>
      <button 
        @click="openCreateModal"
        class="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Create First Banner
      </button>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div 
        v-for="banner in banners" 
        :key="banner.id"
        class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
      >
        <!-- Banner Image Area -->
        <div class="relative h-56 bg-slate-100 overflow-hidden shrink-0">
          <img 
            v-if="banner.banner_image_url" 
            :src="banner.banner_image_url" 
            :alt="banner.name" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            @error="e => (e.target as HTMLImageElement).style.display = 'none'"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <PhotoIcon class="w-16 h-16" />
          </div>
          
          <!-- Gradient Overlay for readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
          
          <!-- Status Badge -->
          <div class="absolute top-4 left-4 flex gap-2 z-10">
            <span 
              class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm"
              :class="getBannerStatus(banner).class"
            >
              {{ getBannerStatus(banner).label }}
            </span>
          </div>
          
          <!-- Quick Actions -->
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              @click="openEditModal(banner)"
              class="w-8 h-8 rounded-full bg-white/95 backdrop-blur text-slate-700 flex items-center justify-center hover:bg-white hover:text-primary-600 transition-colors shadow-sm"
              title="Edit Banner"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button 
              @click="confirmDelete(banner.id)"
              class="w-8 h-8 rounded-full bg-white/95 backdrop-blur text-slate-700 flex items-center justify-center hover:bg-white hover:text-red-600 transition-colors shadow-sm"
              title="Delete Banner"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Overlay Details -->
          <div class="absolute bottom-0 left-0 right-0 p-5 z-10">
             <h3 class="font-black text-white text-xl leading-tight line-clamp-1 shadow-sm">{{ banner.name }}</h3>
             <p class="text-slate-200 text-sm line-clamp-1 mt-1 font-medium">{{ banner.description || 'No description provided' }}</p>
          </div>
        </div>

        <!-- Banner Details & Schedule -->
        <div class="p-6 flex flex-col gap-5 flex-1 bg-white">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <CalendarDaysIcon class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Starts</p>
                <p class="text-xs font-bold text-slate-800 mt-0.5">{{ formatDate(banner.start_date) }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <CalendarDaysIcon class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ends</p>
                <p class="text-xs font-bold text-slate-800 mt-0.5">{{ formatDate(banner.end_date) }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 mt-auto pt-2">
            <div v-if="banner.cta_text || banner.cta_link" class="flex items-center gap-2 flex-1">
              <LinkIcon class="w-4 h-4 text-slate-400" />
              <div class="flex-1 truncate">
                <span v-if="banner.cta_text" class="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-1 rounded-md mr-2">
                  {{ banner.cta_text }}
                </span>
                <a v-if="banner.cta_link" :href="banner.cta_link" target="_blank" class="text-xs font-medium text-slate-500 hover:text-primary-600 truncate transition-colors">
                  {{ banner.cta_link }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl">
          <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">
            {{ editingBanner ? 'Edit Banner' : 'Create Banner' }}
          </h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto bg-white">
          <form @submit.prevent="saveBanner" class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-6">
                <!-- Name -->
                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Banner Name <span class="text-red-500">*</span></label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    required
                    maxlength="255"
                    placeholder="e.g. Summer Mega Draw"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <!-- Description -->
                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                  <textarea 
                    v-model="form.description" 
                    rows="3"
                    placeholder="Provide details about this banner campaign..."
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                <!-- Image URL -->
                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Banner Image <span class="text-red-500">*</span></label>
                  
                  <div 
                    class="relative w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-slate-50 cursor-pointer overflow-hidden group"
                    :class="[
                      isDragging ? 'border-primary-500 bg-primary-50 scale-[0.99]' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-100',
                      form.banner_image_url && !isDragging ? 'border-emerald-500 bg-emerald-50' : ''
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
                    
                    <div v-if="!form.banner_image_url" class="flex flex-col items-center text-center pointer-events-none">
                      <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-primary-500 group-hover:scale-110 transition-transform">
                        <CloudArrowUpIcon class="w-6 h-6" />
                      </div>
                      <h4 class="text-sm font-black text-slate-900 mb-1">Upload banner image</h4>
                      <p class="text-[10px] font-medium text-slate-500 max-w-[200px]">Drag and drop or click to browse</p>
                    </div>

                    <div v-else class="flex flex-col items-center text-center w-full pointer-events-none">
                      <div class="w-full h-32 rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden mb-3 relative group">
                        <img :src="form.banner_image_url" class="w-full h-full object-cover" @error="e => (e.target as HTMLImageElement).style.display = 'none'" />
                      </div>
                      <p class="text-[10px] font-medium text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">Click to replace</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><CalendarDaysIcon class="w-3.5 h-3.5" /> Start Date <span class="text-red-500">*</span></label>
                    <input 
                      v-model="form.start_date" 
                      type="datetime-local" 
                      required
                      class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 text-sm"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><CalendarDaysIcon class="w-3.5 h-3.5" /> End Date <span class="text-red-500">*</span></label>
                    <input 
                      v-model="form.end_date" 
                      type="datetime-local" 
                      required
                      class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <!-- Call to Action -->
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500">CTA Text</label>
                    <input 
                      v-model="form.cta_text" 
                      type="text" 
                      maxlength="255"
                      placeholder="e.g. Play Now"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500">CTA Link</label>
                    <input 
                      v-model="form.cta_link" 
                      type="text" 
                      maxlength="500"
                      placeholder="e.g. /promotions/summer"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"> Position</label>
                    <input 
                      v-model="form.cta_link" 
                      type="text" 
                      maxlength="500"
                      placeholder="e.g. /promotions/summer"
                      class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>


                </div>
              </div>
            </div>

            <!-- Status Toggle -->
            <div class="flex items-center justify-between pt-6 border-t border-slate-100">
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
              
              <div class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full" :class="form.is_active ? 'bg-emerald-500' : 'bg-slate-300'"></div>
                {{ form.is_active ? 'Banner is enabled (subject to schedule)' : 'Banner is completely disabled' }}
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
            @click="saveBanner"
            class="px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <CheckIcon class="w-5 h-5" />
            Save Banner
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete Banner"
      description="Are you sure you want to remove this banner campaign? It will be permanently deleted."
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>