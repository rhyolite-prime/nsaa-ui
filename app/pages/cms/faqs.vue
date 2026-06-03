<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  QuestionMarkCircleIcon,
  XMarkIcon,
  CheckIcon,
  TagIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/vue/24/outline';

useHead({
  title: 'Faqs | NSAA BO'
})
// Define the FAQ type based on the DB schema
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Mock data
const faqs = ref<FAQ[]>([
  {
    id: '1',
    question: 'How do I participate in the raffle?',
    answer: 'You can participate by purchasing a ticket from our main landing page. Each ticket gives you one entry into the draw.',
    category: 'General',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    question: 'When is the daily draw?',
    answer: 'The daily draw happens at 8:00 PM GMT every day. Winners are announced immediately after.',
    category: 'Draws & Prizes',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
]);

const expandedFaqId = ref<string | null>(null);
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const editingFaq = ref<FAQ | null>(null);
const faqToDelete = ref<string | null>(null);

const form = ref({
  question: '',
  answer: '',
  category: '',
  display_order: 0,
  is_active: false
});

const toggleFaq = (id: string) => {
  if (expandedFaqId.value === id) {
    expandedFaqId.value = null;
  } else {
    expandedFaqId.value = id;
  }
};

const openCreateModal = () => {
  editingFaq.value = null;
  form.value = {
    question: '',
    answer: '',
    category: '',
    display_order: faqs.value.length + 1,
    is_active: true
  };
  isModalOpen.value = true;
};

const openEditModal = (faq: FAQ) => {
  editingFaq.value = faq;
  form.value = { ...faq };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmDelete = (id: string) => {
  faqToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const handleDelete = () => {
  if (faqToDelete.value) {
    faqs.value = faqs.value.filter(f => f.id !== faqToDelete.value);
  }
  isDeleteModalOpen.value = false;
  faqToDelete.value = null;
};

const saveFaq = () => {
  if (editingFaq.value) {
    const index = faqs.value.findIndex(f => f.id === editingFaq.value!.id);
    if (index !== -1) {
      faqs.value[index] = { ...editingFaq.value, ...form.value };
    }
  } else {
    faqs.value.push({
      id: crypto.randomUUID(),
      ...form.value,
      created_at: new Date().toISOString()
    });
  }
  closeModal();
};

// Unique categories for the datalist
const availableCategories = computed(() => {
  const categories = new Set(faqs.value.map(f => f.category).filter(Boolean));
  return Array.from(categories);
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">FAQs Management</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage frequently asked questions and answers</p>
      </div>
      <button 
        @click="openCreateModal"
        class="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-2xl font-bold tracking-wider uppercase text-sm flex items-center gap-2 shadow-lg shadow-primary-900/20 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add FAQ
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="faqs.length === 0" class="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <QuestionMarkCircleIcon class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-black text-slate-900 uppercase tracking-wide">No FAQs Yet</h3>
      <p class="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed mb-6">Create your first FAQ to help your users understand how the raffle works.</p>
      <button 
        @click="openCreateModal"
        class="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Create First FAQ
      </button>
    </div>

    <!-- FAQ List View -->
    <div v-else class="space-y-4">
      <div 
        v-for="faq in faqs" 
        :key="faq.id"
        class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
      >
        <!-- FAQ Header (Clickable for Expand/Collapse) -->
        <div 
          class="p-5 flex items-center gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition-colors"
          @click="toggleFaq(faq.id)"
        >
          <!-- Status Indicator -->
          <div 
            class="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
            :class="faq.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'"
            :title="faq.is_active ? 'Active' : 'Inactive'"
          ></div>
          
          <div class="flex-1 min-w-0">
            <h3 class="font-black text-slate-900 text-[15px] leading-tight truncate pr-4">{{ faq.question }}</h3>
            <div class="flex items-center gap-3 mt-1.5">
              <span v-if="faq.category" class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                <TagIcon class="w-3 h-3" />
                {{ faq.category }}
              </span>
              <span class="text-[10px] font-bold text-slate-400">Order: #{{ faq.display_order }}</span>
            </div>
          </div>

          <!-- Actions & Chevron -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2" @click.stop>
              <button 
                @click="openEditModal(faq)"
                class="w-8 h-8 rounded-xl text-slate-400 hover:bg-white hover:text-primary-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center"
                title="Edit FAQ"
              >
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button 
                @click="confirmDelete(faq.id)"
                class="w-8 h-8 rounded-xl text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-center"
                title="Delete FAQ"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
            
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
              <ChevronUpIcon v-if="expandedFaqId === faq.id" class="w-4 h-4" />
              <ChevronDownIcon v-else class="w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- FAQ Answer (Collapsible) -->
        <div 
          v-show="expandedFaqId === faq.id" 
          class="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30"
        >
          <div class="pl-6 border-l-2 border-slate-200">
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{{ faq.answer }}</p>
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
            {{ editingFaq ? 'Edit FAQ' : 'Create FAQ' }}
          </h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-8 overflow-y-auto bg-white">
          <form @submit.prevent="saveFaq" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Question <span class="text-red-500">*</span></label>
              <textarea 
                v-model="form.question" 
                rows="2"
                required
                placeholder="e.g. How do I withdraw my winnings?"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Answer <span class="text-red-500">*</span></label>
              <textarea 
                v-model="form.answer" 
                rows="5"
                required
                placeholder="Provide a clear and helpful answer..."
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
                <input 
                  v-model="form.category" 
                  type="text" 
                  list="faq-categories"
                  maxlength="100"
                  placeholder="e.g. Payments"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
                <datalist id="faq-categories">
                  <option v-for="cat in availableCategories" :key="cat" :value="cat"></option>
                </datalist>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500">Display Order</label>
                <input 
                  v-model.number="form.display_order" 
                  type="number" 
                  min="0"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <div class="flex items-center gap-4">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 cursor-pointer" for="status-toggle">
                  Publish to Website
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
                {{ form.is_active ? 'Will be visible to users' : 'Hidden from users' }}
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
            @click="saveFaq"
            class="px-8 py-3.5 bg-primary-900 hover:bg-primary-800 text-white rounded-xl font-bold shadow-lg shadow-primary-900/20 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center gap-2"
          >
            <CheckIcon class="w-5 h-5" />
            Save FAQ
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Delete FAQ"
      description="Are you sure you want to remove this frequently asked question? It will be permanently deleted from the system."
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>