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
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

import type { Role, Permission } from "~/models";
import { isEmpty, debounce } from "lodash-es";
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

useHead({
  title: 'Roles | NSAA BO'
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

const roleList = ref<Role[]>([]);
const permissionList = ref<Permission[]>([]);

const isShimmerLoading = ref(true);

const isModalOpen = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);

const isDeleteModalOpen = ref(false);
const isDeletingRole = ref(false);
const roleIdToDelete = ref('');

const roleForm = reactive({
  id: '',
  name: '',
  displayName: '',
  description: '',
  permissions: [] as Permission[]
});

const openAddModal = () => {
  isEditMode.value = false;
  roleForm.id = '';
  roleForm.name = '';
  roleForm.displayName = '';
  roleForm.description = '';
  roleForm.permissions = [];
  isModalOpen.value = true;
};

const openEditModal = (role: Role) => {
  isEditMode.value = true;
  roleForm.id = role.id;
  roleForm.name = role.name;
  roleForm.displayName = role.displayName;
  roleForm.description = role.description || '';

  // API may return permissions as strings or objects — normalize to full Permission objects
  // so VueMultiselect can resolve selected items correctly via track-by="systemName"
  const rawPermissions = (role.permissions || []) as (string | Permission)[];
  roleForm.permissions = rawPermissions
    .map(p => {
      const key = typeof p === 'string' ? p : p.systemName;
      return permissionList.value.find(perm => perm.systemName === key);
    })
    .filter(Boolean) as Permission[];

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveRole = async () => {
  
  if (!roleForm.name || !roleForm.displayName) {
    toast.error('Name and Display Name are required');
    return;
  }
  
  isSaving.value = true;
  try {
    const payload = {
      id: roleForm.id,
      name: roleForm.name,
      displayName: roleForm.displayName,
      description: roleForm.description,
      permissions: roleForm.permissions
    };

    let isSuccessful = false;
    if (isEditMode.value) {
      isSuccessful = await updateRole(payload);
    } else {
      isSuccessful = await createRole(payload);
    }

    if (isSuccessful) {
      closeModal();
      toast.success(isEditMode.value ? 'Role updated successfully' : 'Role created successfully');
      getPaginatedRoles();
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
  roleIdToDelete.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  isDeletingRole.value = true;
  try {
    const isSuccessful = await deleteRole(roleIdToDelete.value);
    if (isSuccessful) {
      toast.success('Role deleted successfully');
      getPaginatedRoles();
      isDeleteModalOpen.value = false;
    } else {
      toast.error('Failed to delete role');
    }
  } catch (error) {
    toast.error('An error occurred while deleting role');
  } finally {
    isDeletingRole.value = false;
  }
};

const getAllPermissions = async () => {
    try {
      const result = await getPermissions();
      
      permissionList.value = result.data;
     
    } catch (error) {
        console.error('Error fetching user permissions:', error);
    }
}

const getPaginatedRoles = async () => {
    isShimmerLoading.value = true;
    try {
        let result = await getRoles(filters);
        if (result && result.data && Array.isArray(result.data)) {
            roleList.value = result.data;
            paginationParams.totalPages = result.totalPages || 0;
            paginationParams.totalCount = result.totalCount || 0;
            paginationParams.lowerBound = result.lowerBound || 0;
            paginationParams.upperBound = result.upperBound || 0;
        } else {
            roleList.value = [];
        }
    } catch (error) {
        toast.error('Unable to fetch roles!');
    } finally {
        isShimmerLoading.value = false;
    }
}

const debouncedSearch = debounce(() => {
    filters.pageNo = 1;
    getPaginatedRoles();
}, 300);

watch(() => filters.query, debouncedSearch);

const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationParams.totalPages) {
        filters.pageNo = page;
        getPaginatedRoles();
    }
}

onMounted(async () => {
    await Promise.all([
        getPaginatedRoles(), getAllPermissions()
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
        Add New Role
      </button>
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
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-wider transition-colors">
          <FunnelIcon class="w-4 h-4" />
          Filter
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Created At</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role Name</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</th>
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
            <template v-else-if="roleList.length > 0">
              <tr v-for="role in roleList" :key="role.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-5">
                  <span class="text-xs font-bold text-slate-500">{{ standardDateFormat(role.createdAt) }}</span>
                </td>
                 
                <td class="px-6 py-5 text-sm font-bold text-slate-600">
                  {{ role.name }}
                </td>

                <td class="px-6 py-5 text-sm font-bold text-slate-600">
                  {{ role.displayName }}
                </td>
                  
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      @click="openEditModal(role)"
                      class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button 
                      @click="openDeleteModal(role.id)"
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

    <!-- Role Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#C82323] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
              <ShieldCheckIcon class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">{{ isEditMode ? 'Edit Role' : 'Add New Role' }}</h2>
              <p class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Role Configuration</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveRole" class="flex-1 overflow-y-auto p-8 flex flex-col gap-5">
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Role Name <span class="text-red-500">*</span></label>
            <input 
              v-model="roleForm.name" 
              type="text" 
              required
              placeholder="e.g. system_admin" 
              @keydown.space.prevent
              @input="roleForm.name = roleForm.name.replace(/\s/g, '')"
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Display Name <span class="text-red-500">*</span></label>
            <input 
              v-model="roleForm.displayName" 
              type="text" 
              required
              placeholder="e.g. System Administrator" 
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Description</label>
            <textarea 
              v-model="roleForm.description" 
              rows="3"
              placeholder="Brief description of this role" 
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400 resize-none"
            ></textarea>
          </div>

          <div class="pb-10">
            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Permissions</label>
            <VueMultiselect
              v-model="roleForm.permissions"
              :options="permissionList"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select permissions"
              label="displayName"
              track-by="systemName"
              class="custom-multiselect"
            >
              <template #selection="{ values, isOpen }">
                <span class="multiselect__single" v-if="values.length" v-show="!isOpen">
                  {{ values.length }} permission(s) selected
                </span>
              </template>
            </VueMultiselect>
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
            @click="saveRole"
            :disabled="isSaving"
            class="flex-[1.5] px-8 py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] text-white bg-[#C82323] hover:bg-[#A01D1D] shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            <span v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSaving ? 'Saving...' : (isEditMode ? 'Commit Changes' : 'Initialize Role') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal 
      :is-open="isDeleteModalOpen"
      :is-deleting="isDeletingRole"
      title="Delete Role"
      description="Are you sure you want to delete this role? This action will permanently remove all access associated with it."
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
:deep(.custom-multiselect .multiselect__tags) {
  @apply bg-slate-50/50 border border-slate-200 rounded-xl p-3 min-h-[48px] text-sm font-bold text-slate-700 transition-all;
}
:deep(.custom-multiselect .multiselect__input) {
  @apply bg-transparent text-sm font-bold text-slate-700;
}
:deep(.custom-multiselect .multiselect__placeholder) {
  @apply text-slate-400 font-medium pt-1;
}
:deep(.custom-multiselect .multiselect__option--highlight) {
  @apply bg-[#C82323] text-white;
}
:deep(.custom-multiselect .multiselect__option--highlight::after) {
  @apply bg-[#A01D1D] text-white;
}
:deep(.custom-multiselect .multiselect__tag) {
  @apply bg-slate-200 text-slate-700 font-bold rounded-lg;
}
:deep(.custom-multiselect .multiselect__tag-icon:focus),
:deep(.custom-multiselect .multiselect__tag-icon:hover) {
  @apply bg-slate-300 text-slate-800;
}
:deep(.custom-multiselect .multiselect__content-wrapper) {
  @apply border border-slate-200 rounded-xl shadow-lg z-50 mt-1;
}
</style>
