<script setup lang="ts">
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  UsersIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import type { User, UserStats, Role } from "~/models";
import { debounce } from "lodash-es";
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

useHead({
  title: 'Users | NSAA BO'
})

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

const userList = ref<User[]>([]);
const stats = ref<UserStats>({
  totalUsers: 0,
  activeUsers: 0,
  lockedOutUsers: 0
});

const isShimmerLoading = ref(true);
const roleList = ref<Role[]>([]);

// Modal state
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);

// Delete modal state
const isDeleteModalOpen = ref(false);
const isDeletingUser = ref(false);
const userIdToDelete = ref('');

const userForm = reactive({
  id: '',
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  isAdmin: false,
  isActive: true,
  roles: [] as Role[],
});

const openAddModal = () => {
  isEditMode.value = false;
  userForm.id = '';
  userForm.firstName = '';
  userForm.lastName = '';
  userForm.username = '';
  userForm.email = '';
  userForm.phoneNumber = '';
  userForm.isAdmin = false;
  userForm.isActive = true; // default to active for new users
  userForm.roles = [];
  isModalOpen.value = true;
};

const openEditModal = (user: User) => {
  isEditMode.value = true;
  userForm.id = user.id;
  userForm.firstName = user.firstName;
  userForm.lastName = user.lastName;
  userForm.username = user.username;
  userForm.email = user.email;
  userForm.phoneNumber = user.phoneNumber;
  userForm.isAdmin = user.isAdmin;
  userForm.isActive = user.isActive;
  // Match role objects from the full roleList
  const rawRoles = (user as any).roles as (string | Role)[] || [];
  userForm.roles = rawRoles
    .map(r => {
      const key = typeof r === 'string' ? r : r.id;
      return roleList.value.find(role => role.id === key);
    })
    .filter(Boolean) as Role[];
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveUser = async () => {
  if (!userForm.firstName || !userForm.lastName || !userForm.email) {
    toast.error('First name, last name, and email are required');
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      id: userForm.id,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      username: userForm.username,
      email: userForm.email,
      phoneNumber: userForm.phoneNumber,
      isAdmin: userForm.isAdmin,
      isActive: userForm.isActive,
      roles: userForm.roles.map(r => r.id),
    };

    let isSuccessful = false;
    if (isEditMode.value) {
      isSuccessful = await updateUser(payload);
    } else {
      isSuccessful = await createUser(payload);
    }

    if (isSuccessful) {
      closeModal();
      toast.success(isEditMode.value ? 'User updated successfully' : 'User created successfully');
      getPaginatedUsers(); fetchUserStats();
    } else {
      toast.error('Operation failed');
    }
  } catch (error) {
    console.log(error);
    toast.error('An error occurred');
  } finally {
    isSaving.value = false;
  }
};

const openDeleteModal = (id: string) => {
  userIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeletingUser.value = true;
  try {
    const isSuccessful = await deleteUser(userIdToDelete.value);
    if (isSuccessful) {
      toast.success('User deleted successfully');
      getPaginatedUsers(); fetchUserStats();
      isDeleteModalOpen.value = false;
    } else {
      toast.error('Failed to delete user');
    }
  } catch (error) {
    toast.error('An error occurred while deleting user');
  } finally {
    isDeletingUser.value = false;
  }
};

const fetchUserStats = async () => {
    try {
        const result = await getUserStats();
        if (result) {
            stats.value = result;
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
}

const getPaginatedUsers = async () => {
    isShimmerLoading.value = true;
    try {
        let result = await getUsers(filters);
        if (result && result.data && Array.isArray(result.data)) {
            userList.value = result.data;
            paginationParams.totalPages = result.totalPages || 0;
            paginationParams.totalCount = result.totalCount || 0;
            paginationParams.lowerBound = result.lowerBound || 0;
            paginationParams.upperBound = result.upperBound || 0;
        } else {
            userList.value = [];
        }
    } catch (error) {
        toast.error('Unable to fetch users!');
    } finally {
        isShimmerLoading.value = false;
    }
}

const debouncedSearch = debounce(() => {
    filters.pageNo = 1;
    getPaginatedUsers();
}, 300);

watch(() => filters.query, debouncedSearch);

const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationParams.totalPages) {
        filters.pageNo = page;
        getPaginatedUsers();
    }
}

const getAllRoles = async () => {
    try {
        const result = await getAllRolesForSelect();
        if (Array.isArray(result)) {
            roleList.value = result;
        }
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

onMounted(async () => {
    await Promise.all([
        fetchUserStats(),
        getPaginatedUsers(),
        getAllRoles(),
    ]);
});
</script>

<template>
  <div class="space-y-8 font-sans pb-12">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">System Users</h1>
        <p class="text-slate-500 text-sm font-medium">Manage administrative access and roles.</p>
      </div>
      
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 bg-[#C82323] hover:bg-[#A01D1D] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
      >
        <PlusIcon class="w-5 h-5" />
        Add New User
      </button>
      
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Users -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-100 transition-colors group">
        <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <UsersIcon class="w-7 h-7" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Total Users</p>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ toNumber(stats.totalUsers) }}</p>
        </div>
      </div>

      <!-- Active Users -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-emerald-100 transition-colors group">
        <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <CheckBadgeIcon class="w-7 h-7" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Active Now</p>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ toNumber(stats.activeUsers) }}</p>
        </div>
      </div>

      <!-- Locked Out -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-amber-100 transition-colors group">
        <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
          <ShieldCheckIcon class="w-7 h-7" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-0.5">Locked Out</p>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ toNumber(stats.lockedOutUsers) }}</p>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          v-model="filters.query"
          type="text" 
          placeholder="Search by name, email or username..." 
          class="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-medium transition-all"
        />
      </div>
       
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Created At</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Username</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Type</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <template v-if="isShimmerLoading">
               <tr v-for="i in 5" :key="i" class="animate-pulse">
                 <td v-for="j in 7" :key="j" class="px-6 py-6">
                   <div class="h-4 bg-slate-100 rounded-full w-2/3"></div>
                 </td>
               </tr>
            </template>
            <template v-else-if="userList.length > 0">
              <tr v-for="user in userList" :key="user.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-5">
                  <span class="text-xs font-bold text-slate-500">{{ standardDateFormat(user.createdAt) }}</span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs ring-2 ring-white">
                      {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-black text-slate-900 capitalize">{{ user.firstName }} {{ user.lastName }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-sm font-bold text-slate-600">
                  @{{ user.username }}
                </td>
                <td class="px-6 py-5">
                  <div class="space-y-0.5">
                    <p class="text-xs font-bold text-slate-700">{{ user.email }}</p>
                    <p class="text-[10px] font-bold text-slate-400">{{ user.phoneNumber }}</p>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block"
                    :class="user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-center">
                  <span v-if="user.isAdmin" class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50">
                    Admin
                  </span>
                  <span v-else class="text-xs font-bold text-slate-400">Standard User</span>
                </td>

                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="openEditModal(user)"
                      class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      @click="openDeleteModal(user.id)"
                      class="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
              </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="7" class="px-6 py-20 text-center">
                <div class="max-w-xs mx-auto">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <UserIcon class="w-8 h-8" />
                    </div>
                    <h3 class="text-slate-900 font-black mb-1">No users found</h3>
                    <p class="text-slate-500 text-sm font-medium">Try adjusting your filters or search query to find what you're looking for.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="paginationParams.totalPages > 1" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <div class="text-xs font-bold text-slate-400">
          Showing <span class="text-slate-900">{{ paginationParams.lowerBound }}</span> to <span class="text-slate-900">{{ paginationParams.upperBound }}</span> of <span class="text-slate-900">{{ paginationParams.totalCount }}</span>
        </div>
        <div class="flex gap-1">
          <button 
            @click="goToPage(filters.pageNo - 1)"
            :disabled="filters.pageNo === 1"
            class="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          
          <button 
            v-for="p in paginationParams.totalPages" 
            :key="p"
            @click="goToPage(p)"
            class="w-10 h-10 rounded-lg text-xs font-black transition-all"
            :class="filters.pageNo === p ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-white border border-transparent hover:border-slate-200 text-slate-500'"
          >
            {{ p }}
          </button>

          <button 
            @click="goToPage(filters.pageNo + 1)"
            :disabled="filters.pageNo === paginationParams.totalPages"
            class="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#C82323] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
              <UserIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
              <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">User Administration</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveUser" class="flex-1 overflow-y-auto p-8 flex flex-col gap-5">
          <!-- First Name & Last Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">First Name <span class="text-red-500">*</span></label>
              <input 
                v-model="userForm.firstName" 
                type="text" 
                required
                placeholder="e.g. John" 
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Last Name <span class="text-red-500">*</span></label>
              <input 
                v-model="userForm.lastName" 
                type="text" 
                required
                placeholder="e.g. Doe" 
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <!-- Username & Email -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Username <span class="text-red-500">*</span></label>
              <input 
                v-model="userForm.username"
                type="text" 
                required
                placeholder="e.g. john_doe"
                @keydown.space.prevent
                @input="userForm.username = userForm.username.replace(/\s/g, '')"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Email <span class="text-red-500">*</span></label>
              <input 
                v-model="userForm.email" 
                type="email" 
                required
                placeholder="e.g. john@example.com"  
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
 
          <!-- Phone & Roles -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Phone Number <span class="text-red-500">*</span></label>
              <input 
                v-model="userForm.phoneNumber" 
                type="tel"
                required
                placeholder="e.g. +233 20 000 0000" 
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Roles</label>
              <VueMultiselect
                v-model="userForm.roles"
                :options="roleList"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select roles"
                label="displayName"
                track-by="id"
              >
                <template #selection="{ values, isOpen }">
                  <span class="multiselect__single font-bold text-sm" v-if="values.length" v-show="!isOpen">
                    {{ values.length }} role(s) selected
                  </span>
                </template>
              </VueMultiselect>
            </div>
          </div>
 

          <!-- Status toggles -->
          <div class="flex items-center justify-between gap-4">
            <!-- Active toggle -->
            <div class="flex flex-1 items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p class="text-sm font-black text-slate-700">Active</p>
                <p class="text-xs font-medium text-slate-400 mt-0.5">User can log in</p>
              </div>
              <button
                type="button"
                @click="userForm.isActive = !userForm.isActive"
                class="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
                :class="userForm.isActive ? 'bg-emerald-500' : 'bg-slate-200'"
              >
                <span 
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  :class="userForm.isActive ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>

            <!-- Admin toggle -->
            <div class="flex flex-1 items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p class="text-sm font-black text-slate-700">Administrator</p>
                <p class="text-xs font-medium text-slate-400 mt-0.5">Grant full admin privileges</p>
              </div>
              <button
                type="button"
                @click="userForm.isAdmin = !userForm.isAdmin"
                class="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
                :class="userForm.isAdmin ? 'bg-[#C82323]' : 'bg-slate-200'"
              >
                <span 
                  class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  :class="userForm.isAdmin ? 'translate-x-6' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
        </form>

        <!-- Actions -->
        <div class="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4 shrink-0">
          <button 
            type="button"
            @click="closeModal"
            class="flex-1 px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.15em] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            @click="saveUser"
            :disabled="isSaving"
            class="flex-[1.5] px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSaving ? 'Saving...' : (isEditMode ? 'Edit User' : 'Create User') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal 
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeletingUser"
      title="Delete User"
      description="Are you sure you want to delete this user? They will lose all access immediately."
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>

</style>
