<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  TicketIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArrowTopRightOnSquareIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/vue/24/outline';

useHead({
  title: 'Support Tickets | NSAA BO'
})
// Define the SupportTicket type based on the DB schema
interface SupportTicket {
  id: string;
  ticket_number: string;
  source?: 'web' | 'ussd';
  user_id?: string;
  user_name: string;
  user_phone: string;
  user_email?: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  message: string;
  attachment_urls?: string[];
  assigned_to?: string;
  resolved_at?: string;
  closed_at?: string;
  rating?: number;
  rating_feedback?: string;
  metadata?: any;
  created_at: string;
}

// Mock data
const tickets = ref<SupportTicket[]>([
  {
    id: '1',
    ticket_number: 'TK-2026-001',
    source: 'ussd',
    user_name: 'Kwame Mensah',
    user_phone: '+233541234567',
    user_email: 'kwame@example.com',
    subject: 'Cannot purchase raffle ticket',
    category: 'Payment Issue',
    priority: 'high',
    status: 'open',
    message: 'I tried to buy a ticket using Mobile Money but it failed after I entered my PIN. My account was debited. Please help me get my ticket.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: '2',
    ticket_number: 'TK-2026-002',
    source: 'web',
    user_name: 'Ama Osei',
    user_phone: '+233241112233',
    subject: 'When will the winners be announced?',
    category: 'General Enquiry',
    priority: 'low',
    status: 'resolved',
    message: 'Hello, I bought 5 tickets for the Friday draw. What time will the live draw start and where can I watch it?',
    resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: '3',
    ticket_number: 'TK-2026-003',
    source: 'web',
    user_name: 'John Doe',
    user_phone: '+233209998877',
    user_email: 'john.doe@email.com',
    subject: 'App keeps crashing on login',
    category: 'Technical Issue',
    priority: 'medium',
    status: 'in_progress',
    message: 'Whenever I try to log in, the app just closes itself. I have tried reinstalling it but the issue is still there. I am using an iPhone 12.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  },
  {
    id: '4',
    ticket_number: 'MSG-2026-004',
    source: 'web',
    user_name: 'Efua Mensah',
    user_phone: '+233245556677',
    user_email: 'efua@example.com',
    subject: 'Partnership Inquiry',
    category: 'Contact',
    priority: 'low',
    status: 'open',
    message: 'Hello, I represent a local business and we would like to partner with Chop Money Raffle. Kindly let me know who to speak to.',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
  }
]);

const searchQuery = ref('');
const statusFilter = ref<string>('all');
const isModalOpen = ref(false);
const activeTicket = ref<SupportTicket | null>(null);

const filteredTickets = computed(() => {
  return tickets.value.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
      
    const matchesStatus = statusFilter.value === 'all' || ticket.status === statusFilter.value;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const openTicketDetails = (ticket: SupportTicket) => {
  activeTicket.value = { ...ticket };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  activeTicket.value = null;
};

const updateTicketStatus = (newStatus: SupportTicket['status']) => {
  if (activeTicket.value) {
    activeTicket.value.status = newStatus;
    // In a real app, we'd also make an API call here and update the main `tickets` list
    const index = tickets.value.findIndex(t => t.id === activeTicket.value!.id);
    if (index !== -1) {
      tickets.value[index] = { ...activeTicket.value };
    }
  }
};

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoString));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'resolved': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusLabel = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Support & Contacts</h1>
        <p class="text-sm text-slate-500 font-medium mt-1">Manage and respond to support tickets and contact form submissions</p>
      </div>
      
      <!-- Stats Summary -->
      <div class="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div class="px-4 py-2 bg-slate-50 rounded-xl text-center">
          <div class="text-2xl font-black text-slate-900">{{ tickets.length }}</div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</div>
        </div>
        <div class="px-4 py-2 bg-emerald-50 rounded-xl text-center">
          <div class="text-2xl font-black text-emerald-700">{{ tickets.filter(t => t.status === 'open').length }}</div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Open</div>
        </div>
        <div class="px-4 py-2 bg-amber-50 rounded-xl text-center">
          <div class="text-2xl font-black text-amber-700">{{ tickets.filter(t => t.status === 'in_progress').length }}</div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Active</div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search tickets by number, name, or subject..." 
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
        />
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FunnelIcon class="h-4 w-4 text-slate-400" />
          </div>
          <select 
            v-model="statusFilter"
            class="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer uppercase tracking-wider"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTickets.length === 0" class="bg-white rounded-3xl border border-slate-200 p-16 text-center flex flex-col items-center shadow-sm">
      <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-300">
        <InboxIcon class="w-12 h-12" />
      </div>
      <h3 class="text-xl font-black text-slate-900 uppercase tracking-wide">No Tickets Found</h3>
      <p class="text-slate-500 max-w-md mt-3 text-sm leading-relaxed">
        {{ searchQuery || statusFilter !== 'all' ? 'We couldn\'t find any tickets matching your current filters. Try adjusting your search criteria.' : 'Great job! Your support queue is completely empty.' }}
      </p>
      <button 
        v-if="searchQuery || statusFilter !== 'all'"
        @click="searchQuery = ''; statusFilter = 'all'"
        class="mt-6 text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2 bg-primary-50 px-6 py-3 rounded-xl"
      >
        Clear All Filters
      </button>
    </div>

    <!-- Ticket List View -->
    <div v-else class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/80">
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Ticket</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Customer</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Subject</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Status</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">Date</th>
              <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="ticket in filteredTickets" 
              :key="ticket.id"
              class="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              @click="openTicketDetails(ticket)"
            >
              <!-- Ticket Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900">{{ ticket.ticket_number }}</span>
                    <span v-if="ticket.source === 'web'" class="text-slate-400" title="Web App">
                      <GlobeAltIcon class="w-4 h-4" />
                    </span>
                    <span v-else-if="ticket.source === 'ussd'" class="text-slate-400" title="USSD">
                      <DevicePhoneMobileIcon class="w-4 h-4" />
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span 
                      class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-flex w-fit border"
                      :class="getPriorityColor(ticket.priority)"
                    >
                      {{ ticket.priority }}
                    </span>
                  </div>
                </div>
              </td>
              
              <!-- Customer Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xs shrink-0">
                    {{ ticket.user_name.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900">{{ ticket.user_name }}</span>
                    <span class="text-xs text-slate-500">{{ ticket.user_phone }}</span>
                  </div>
                </div>
              </td>
              
              <!-- Subject -->
              <td class="px-6 py-4 min-w-[250px]">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-slate-900 line-clamp-1">{{ ticket.subject }}</span>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs flex items-center gap-1" :class="ticket.category === 'Contact' ? 'text-purple-600 font-bold' : 'text-slate-500'">
                      <TagIcon class="w-3 h-3" />
                      {{ ticket.category }}
                    </span>
                    <span v-if="ticket.category === 'Contact'" class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200">
                      Message
                    </span>
                  </div>
                </div>
              </td>
              
              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border flex items-center gap-1.5 w-fit"
                  :class="getStatusColor(ticket.status)"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
                  {{ getStatusLabel(ticket.status) }}
                </span>
              </td>
              
              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-slate-900">{{ formatDate(ticket.created_at).split(',')[0] }}</span>
                  <span class="text-xs text-slate-500">{{ formatDate(ticket.created_at).split(',')[1] }}</span>
                </div>
              </td>
              
              <!-- Action -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button 
                  class="w-8 h-8 rounded-xl text-slate-400 group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all flex items-center justify-center ml-auto"
                >
                  <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div v-if="isModalOpen && activeTicket" class="fixed inset-0 z-[100] flex justify-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <!-- Drawer Panel -->
      <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">
              {{ activeTicket.ticket_number }}
            </h2>
            <span v-if="activeTicket.source === 'web'" class="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <GlobeAltIcon class="w-4 h-4" />
              Web
            </span>
            <span v-else-if="activeTicket.source === 'ussd'" class="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <DevicePhoneMobileIcon class="w-4 h-4" />
              USSD
            </span>
            <span 
              class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border"
              :class="getStatusColor(activeTicket.status)"
            >
              {{ getStatusLabel(activeTicket.status) }}
            </span>
          </div>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
          
          <!-- Quick Actions / Status Update -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Update Status:</span>
            <div class="flex gap-2">
              <button 
                @click="updateTicketStatus('open')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border"
                :class="activeTicket.status === 'open' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              >
                Open
              </button>
              <button 
                @click="updateTicketStatus('in_progress')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border"
                :class="activeTicket.status === 'in_progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              >
                In Progress
              </button>
              <button 
                @click="updateTicketStatus('resolved')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border"
                :class="activeTicket.status === 'resolved' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              >
                Resolved
              </button>
              <button 
                @click="updateTicketStatus('closed')"
                class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border"
                :class="activeTicket.status === 'closed' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              >
                Closed
              </button>
            </div>
          </div>

          <!-- Ticket Header Info -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-900 mb-2">{{ activeTicket.subject }}</h3>
              <div class="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                <span class="flex items-center gap-1.5" :class="activeTicket.category === 'Contact' ? 'text-purple-600 font-bold' : ''">
                  <TagIcon class="w-4 h-4" />
                  {{ activeTicket.category }}
                </span>
                <span v-if="activeTicket.category === 'Contact'" class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200">
                  Contact Message
                </span>
                <span class="flex items-center gap-1.5">
                  <ClockIcon class="w-4 h-4" />
                  {{ formatDate(activeTicket.created_at) }}
                </span>
                <span 
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                  :class="getPriorityColor(activeTicket.priority)"
                >
                  {{ activeTicket.priority }} priority
                </span>
              </div>
            </div>
            
            <div class="p-6 bg-slate-50/50 flex flex-col md:flex-row gap-6">
              <div class="flex-1 space-y-4">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Customer</h4>
                  <div class="flex items-center gap-2">
                    <UserIcon class="w-4 h-4 text-slate-400" />
                    <span class="font-medium text-slate-900">{{ activeTicket.user_name }}</span>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Contact</h4>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <PhoneIcon class="w-4 h-4 text-slate-400" />
                      <span class="text-sm text-slate-700">{{ activeTicket.user_phone }}</span>
                    </div>
                    <div v-if="activeTicket.user_email" class="flex items-center gap-2">
                      <EnvelopeIcon class="w-4 h-4 text-slate-400" />
                      <span class="text-sm text-slate-700">{{ activeTicket.user_email }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex-1 space-y-4">
                <div v-if="activeTicket.resolved_at">
                  <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Resolved On</h4>
                  <span class="text-sm text-slate-700">{{ formatDate(activeTicket.resolved_at) }}</span>
                </div>
                <div v-if="activeTicket.rating">
                  <h4 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Customer Rating</h4>
                  <div class="flex items-center gap-1 text-amber-400">
                    <template v-for="i in 5" :key="i">
                      <svg class="w-4 h-4" :class="i <= activeTicket.rating ? 'fill-current' : 'text-slate-200 fill-current'" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </template>
                  </div>
                  <p v-if="activeTicket.rating_feedback" class="text-sm text-slate-600 mt-1 italic">"{{ activeTicket.rating_feedback }}"</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Original Message -->
          <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <div class="absolute -left-3 top-6 w-6 h-6 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
              <UserIcon class="w-3 h-3 text-slate-500" />
            </div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-slate-900">Original Message</h4>
              <span class="text-xs text-slate-500">{{ formatDate(activeTicket.created_at) }}</span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{{ activeTicket.message }}</p>
            </div>
            
            <!-- Attachments (if any) -->
            <div v-if="activeTicket.attachment_urls && activeTicket.attachment_urls.length > 0" class="mt-4 pt-4 border-t border-slate-100">
              <h5 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Attachments</h5>
              <div class="flex flex-wrap gap-2">
                <a 
                  v-for="(url, idx) in activeTicket.attachment_urls" 
                  :key="idx"
                  :href="url"
                  target="_blank"
                  class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-sm text-slate-700"
                >
                  <PaperClipIcon class="w-4 h-4 text-slate-400" />
                  File {{ idx + 1 }}
                </a>
              </div>
            </div>
          </div>

          <!-- Reply Section (Mocked UI) -->
          <div class="mt-8">
            <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
              <ChatBubbleLeftRightIcon class="w-5 h-5 text-primary-500" />
              Add Response
            </h4>
            <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all">
              <textarea 
                rows="4"
                placeholder="Type your reply to the customer here..."
                class="w-full px-5 py-4 bg-transparent outline-none resize-none text-sm text-slate-700 placeholder:text-slate-400"
              ></textarea>
              <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button class="text-slate-400 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50">
                  <PaperClipIcon class="w-5 h-5" />
                </button>
                <button 
                  class="bg-primary-900 hover:bg-primary-800 text-white px-6 py-2 rounded-xl font-bold tracking-wider uppercase text-xs flex items-center gap-2 shadow-md shadow-primary-900/20 transition-all active:scale-95"
                >
                  Send Reply
                </button>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-wider font-bold">
              Sending a reply will automatically notify the customer via SMS/Email
            </p>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>
