<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import AppSidebar from "~/components/AppSidebar.vue";
import { USER_PAGE_SIZE_OPTIONS, USER_ROLES, type UserPageSize, type UserRole, type UserRow, useUserList } from "~/composable/useUserList";
import { useUserCRUD } from "~/composable/useUserCRUD";

type DryerAreaOption = {
  label: string;
  value: number;
};

type DryerAreaResponse = {
  success: boolean;
  data: {
    areaId: number;
    name: string;
  }[];
};

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const ALL_ROLE_FILTER_VALUE = "__ALL_ROLE_FILTER__" as const;

const toast = useToast();

const {
  current_data,
  loading: listLoading,
  error: listError,
  pagination_data,
  filter_data,
  fetch_user_list,
  set_search,
  set_roles,
  set_limit,
  next,
  prev,
  hasNext,
  hasPrev,
  page,
  total_page,
} = useUserList();

const {
  create_data,
  update_data,
  loading: crudLoading,
  create_user,
  update_user,
  delete_user,
  prepare_update_user,
  reset_create_data,
  reset_update_data,
} = useUserCRUD(fetch_user_list);

const searchInput = ref("");
const selectedRoleFilters = ref<UserRole[]>([]);
const pageSize = ref<UserPageSize>(10);
const dryerAreas = ref<DryerAreaOption[]>([]);
const dryerAreasLoading = ref(false);
const isCreateOpen = ref(false);
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const isCreateConfirmOpen = ref(false);
const isEditConfirmOpen = ref(false);
const selectedUser = ref<UserRow | null>(null);

type RoleFilterValue = UserRole | typeof ALL_ROLE_FILTER_VALUE;

const roleFilterItems = [
  { label: "ALL", value: ALL_ROLE_FILTER_VALUE },
  ...USER_ROLES.map((role) => ({ label: role, value: role })),
];

const userRoleItems = USER_ROLES.map((role) => ({ label: role, value: role }));
const pageSizeItems = USER_PAGE_SIZE_OPTIONS.map((size) => ({ label: `${size}`, value: size }));
const tableData = computed(() => current_data.value?.data ?? []);
const isInitialLoading = computed(() => listLoading.value && current_data.value === null);
const roleFilterModel = computed<RoleFilterValue[]>(() => {
  return selectedRoleFilters.value.length === 0 ? [ALL_ROLE_FILTER_VALUE] : selectedRoleFilters.value;
});

const limitedAreaRoles: UserRole[] = ["OPERATOR", "CLIENT"];

const roleColor: Record<UserRole, "primary" | "info" | "warning" | "neutral"> = {
  ADMIN: "primary",
  MANAGER: "info",
  OPERATOR: "warning",
  CLIENT: "neutral",
};

const isLimitedAreaRole = (role: UserRole) => limitedAreaRoles.includes(role);
const isUserRole = (value: RoleFilterValue): value is UserRole => value !== ALL_ROLE_FILTER_VALUE;

const createAreaIdsModel = computed<number[]>({
  get: () => create_data.value.area_ids,
  set: (value) => {
    create_data.value.area_ids = value ?? [];
  },
});

const updateAreaIdsModel = computed<number[]>({
  get: () => update_data.value.area_ids,
  set: (value) => {
    update_data.value.area_ids = value ?? [];
  },
});

const areaAccessLabel = (areaIds: number[]) => {
  if (areaIds.length === 0) {
    return "Select dryer areas";
  }

  if (areaIds.length === 1) {
    return dryerAreas.value.find((area) => area.value === areaIds[0])?.label ?? "1 selected";
  }

  return `${areaIds.length} selected`;
};

const roleFilterLabel = computed(() => {
  if (selectedRoleFilters.value.length === 0) {
    return "All roles";
  }

  if (selectedRoleFilters.value.length === 1) {
    return selectedRoleFilters.value[0];
  }

  return `${selectedRoleFilters.value.length} roles`;
});

const accessLabel = (user: UserRow) => {
  if (user.role === "ADMIN" || user.role === "MANAGER") {
    return "All Dryer Area";
  }

  return user.canAccess.map((access) => access.dryer.name).join(", ") || "No area assigned";
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      data?: { error?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };

    return maybeError.data?.error || maybeError.data?.message || maybeError.statusMessage || maybeError.message || "Unknown error";
  }

  return "Unknown error";
};

const fetchDryerAreas = async () => {
  dryerAreasLoading.value = true;

  try {
    const response = await $fetch<DryerAreaResponse>("/api/dryarea/dry_areas", {
      method: "GET",
      params: {
        limit: 100,
        offset: 0,
      },
    });

    dryerAreas.value = response.data.map((area) => ({
      label: `${area.name} (#${area.areaId})`,
      value: area.areaId,
    }));
  } catch (error) {
    toast.add({
      title: "Failed to load dryer areas",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  } finally {
    dryerAreasLoading.value = false;
  }
};

const refreshUsers = async () => {
  try {
    await fetch_user_list();
  } catch (error) {
    toast.add({
      title: "Failed to load users",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const applySearch = async () => {
  try {
    await set_search(searchInput.value.trim());
  } catch (error) {
    toast.add({
      title: "Failed to search users",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const applyRoleFilter = async () => {
  try {
    await set_roles(selectedRoleFilters.value);
  } catch (error) {
    toast.add({
      title: "Failed to filter users",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleRoleFilterChange = async (value: RoleFilterValue[] | undefined) => {
  const nextValue = value ?? [];

  if (nextValue.includes(ALL_ROLE_FILTER_VALUE)) {
    selectedRoleFilters.value = selectedRoleFilters.value.length === 0
      ? nextValue.filter(isUserRole)
      : [];
  } else {
    selectedRoleFilters.value = nextValue.filter(isUserRole);
  }

  await applyRoleFilter();
};

const changePageSize = async () => {
  try {
    await set_limit(pageSize.value);
  } catch (error) {
    toast.add({
      title: "Failed to change page size",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const clearFilters = async () => {
  searchInput.value = "";
  selectedRoleFilters.value = [];
  filter_data.value.search = "";
  filter_data.value.roles = [];
  await fetch_user_list();
};

const openCreateModal = () => {
  reset_create_data();
  isCreateConfirmOpen.value = false;
  isCreateOpen.value = true;
};

const openEditModal = (user: UserRow) => {
  selectedUser.value = user;
  prepare_update_user(user);
  isEditConfirmOpen.value = false;
  isEditOpen.value = true;
};

const openDeleteModal = (user: UserRow) => {
  selectedUser.value = user;
  isDeleteOpen.value = true;
};

const handleCreate = async () => {
  try {
    await create_user();
    isCreateOpen.value = false;
    toast.add({
      title: "User created",
      description: "The user account is ready to use.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to create user",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleUpdate = async () => {
  try {
    await update_user();
    isEditOpen.value = false;
    selectedUser.value = null;
    toast.add({
      title: "User updated",
      description: "The user account has been saved.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to update user",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const handleDelete = async () => {
  if (!selectedUser.value) {
    return;
  }

  try {
    await delete_user(selectedUser.value.userId);
    isDeleteOpen.value = false;
    selectedUser.value = null;
    toast.add({
      title: "User deleted",
      description: "The user account has been removed.",
      color: "success",
      icon: "i-lucide-circle-check",
    });
  } catch (error) {
    toast.add({
      title: "Failed to delete user",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

const requestCreateConfirmation = () => {
  isCreateConfirmOpen.value = true;
};

const requestEditConfirmation = () => {
  isEditConfirmOpen.value = true;
};

const changePage = async (direction: "next" | "prev") => {
  try {
    if (direction === "next") {
      await next();
      return;
    }

    await prev();
  } catch (error) {
    toast.add({
      title: "Failed to change page",
      description: getErrorMessage(error),
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
};

watch(
  () => create_data.value.role,
  (role) => {
    if (!isLimitedAreaRole(role)) {
      create_data.value.area_ids = [];
    }
  },
);

watch(
  () => update_data.value.role,
  (role) => {
    if (!isLimitedAreaRole(role)) {
      update_data.value.area_ids = [];
    }
  },
);

function getRowItems(row: Row<UserRow>) {
  const user = row.original;

  return [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      onSelect() {
        openEditModal(user);
      },
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect() {
        openDeleteModal(user);
      },
    },
  ];
}

const columns: TableColumn<UserRow>[] = [
  {
    id: "rowNumber",
    header: "No.",
    cell: ({ row }) => `${pagination_data.value.offset + row.index + 1}`,
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => row.getValue("username"),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => row.getValue("fullName"),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;

      return h(UBadge, { color: roleColor[role], variant: "subtle" }, () => role);
    },
  },
  {
    id: "access",
    header: "Dryer Access",
    cell: ({ row }) => h("span", { class: "text-toned" }, accessLabel(row.original)),
  },
  {
    id: "actions",
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }) => h(
      UDropdownMenu,
      {
        content: { align: "end" },
        items: getRowItems(row),
        "aria-label": "User actions",
      },
      () => h(UButton, {
        icon: "i-lucide-ellipsis-vertical",
        color: "neutral",
        variant: "ghost",
        "aria-label": "User actions",
      }),
    ),
  },
];

onMounted(async () => {
  await Promise.all([
    refreshUsers(),
    fetchDryerAreas(),
  ]);
});
</script>

<template>
  <AppSidebar :loading="isInitialLoading">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-highlighted">
            User Management
          </h1>
          <p class="text-sm text-muted">
            Manage admin, manager, operator, and client access for dryer areas.
          </p>
        </div>

        <UButton
          icon="i-lucide-user-plus"
          label="Create User"
          color="primary"
          @click="openCreateModal"
        />
      </div>

      <div class="rounded-lg border border-default bg-default">
        <div class="flex flex-col gap-3 border-b border-default p-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-1 flex-col gap-3 lg:flex-row">
            <UInput
              v-model="searchInput"
              icon="i-lucide-search"
              placeholder="Search username or full name"
              class="min-w-0 flex-1"
              @keyup.enter="applySearch"
            />

            <USelectMenu
              :model-value="roleFilterModel"
              :items="roleFilterItems"
              value-key="value"
              label-key="label"
              multiple
              placeholder="All roles"
              class="w-full lg:w-56"
              :search-input="false"
              @update:model-value="handleRoleFilterChange"
            >
              <template #default>
                <span class="truncate text-sm">
                  {{ roleFilterLabel }}
                </span>
              </template>
            </USelectMenu>
          </div>

          <div class="flex gap-2">
            <UButton
              label="Search"
              icon="i-lucide-filter"
              color="neutral"
              variant="soft"
              :loading="listLoading"
              @click="applySearch"
            />
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="ghost"
              aria-label="Reset filters"
              @click="clearFilters"
            />
          </div>
        </div>

        <UTable
          :data="tableData"
          :columns="columns"
          :loading="listLoading"
          empty="No users found"
          class="min-h-80"
        />

        <div class="border-t border-default p-4">
          <div class="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
            <UButton
              icon="i-lucide-chevron-left"
              label="Prev"
              color="neutral"
              variant="outline"
              :disabled="!hasPrev || listLoading"
              @click="changePage('prev')"
            />
            <span class="min-w-16 text-center text-sm text-muted">
              {{ page }} / {{ total_page || 1 }}
            </span>
            <USelect
              v-model="pageSize"
              :items="pageSizeItems"
              value-key="value"
              label-key="label"
              class="w-20"
              :disabled="listLoading"
              @change="changePageSize"
            />
            <UButton
              trailing-icon="i-lucide-chevron-right"
              label="Next"
              color="neutral"
              variant="outline"
              :disabled="!hasNext || listLoading"
              @click="changePage('next')"
            />
          </div>
        </div>
      </div>

      <p v-if="listError" class="text-sm text-error">
        {{ getErrorMessage(listError) }}
      </p>
    </div>

    <UModal
      v-model:open="isCreateOpen"
      title="Create User"
      description="Create a user account and assign the correct dryer access."
    >
      <template #body>
        <form id="create-user-form" class="space-y-4" @submit.prevent="handleCreate">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Username" required>
              <UInput v-model="create_data.username" autocomplete="off" class="w-full" />
            </UFormField>

            <UFormField label="Password" required>
              <UInput v-model="create_data.password" type="password" autocomplete="new-password" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Full Name" required>
            <UInput v-model="create_data.full_name" autocomplete="off" class="w-full" />
          </UFormField>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Role" required>
              <USelect
                v-model="create_data.role"
                :items="userRoleItems"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Dryer Area"
              :required="isLimitedAreaRole(create_data.role)"
              :help="isLimitedAreaRole(create_data.role) ? 'Select one or more dryer areas.' : 'Global access for admin and manager.'"
            >
              <USelectMenu
                v-if="isLimitedAreaRole(create_data.role)"
                v-model="createAreaIdsModel"
                :items="dryerAreas"
                value-key="value"
                label-key="label"
                multiple
                placeholder="Select dryer areas"
                class="w-full"
                :loading="dryerAreasLoading"
                :disabled="dryerAreasLoading"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ areaAccessLabel(create_data.area_ids) }}
                  </span>
                </template>
              </USelectMenu>
              <p v-else class="rounded-lg border border-default px-3 py-2 text-sm text-muted">
                Global access for this role.
              </p>
            </UFormField>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="crudLoading"
            @click="isCreateOpen = false"
          />
          <UButton
            label="Create User"
            icon="i-lucide-save"
            :loading="crudLoading"
            @click="requestCreateConfirmation"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isCreateConfirmOpen"
      title="Confirm Create User"
      description="Please confirm before creating this user."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Create user
            <span class="font-medium text-highlighted">{{ create_data.username || "-" }}</span>
            with role
            <span class="font-medium text-highlighted">{{ create_data.role }}</span>?
          </p>
          <p class="text-muted">
            The account and assigned dryer access will be saved to the system.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="crudLoading" @click="isCreateConfirmOpen = false" />
          <UButton type="submit" form="create-user-form" label="Confirm Create" icon="i-lucide-save" :loading="crudLoading" @click="isCreateConfirmOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isEditOpen"
      title="Edit User"
      description="Update account details, role, and dryer access."
    >
      <template #body>
        <form id="edit-user-form" class="space-y-4" @submit.prevent="handleUpdate">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Username" required>
              <UInput v-model="update_data.username" autocomplete="off" class="w-full" />
            </UFormField>

            <UFormField label="New Password">
              <UInput v-model="update_data.password" type="password" autocomplete="new-password" placeholder="Leave empty to keep current" class="w-full" />
            </UFormField>
          </div>

          <UFormField label="Full Name" required>
            <UInput v-model="update_data.full_name" autocomplete="off" class="w-full" />
          </UFormField>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Role" required>
              <USelect
                v-model="update_data.role"
                :items="userRoleItems"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Dryer Area"
              :required="isLimitedAreaRole(update_data.role)"
              :help="isLimitedAreaRole(update_data.role) ? 'Select one or more dryer areas.' : 'Global access for admin and manager.'"
            >
              <USelectMenu
                v-if="isLimitedAreaRole(update_data.role)"
                v-model="updateAreaIdsModel"
                :items="dryerAreas"
                value-key="value"
                label-key="label"
                multiple
                placeholder="Select dryer areas"
                class="w-full"
                :loading="dryerAreasLoading"
                :disabled="dryerAreasLoading"
              >
                <template #default>
                  <span class="truncate text-sm">
                    {{ areaAccessLabel(update_data.area_ids) }}
                  </span>
                </template>
              </USelectMenu>
              <p v-else class="rounded-lg border border-default px-3 py-2 text-sm text-muted">
                Global access for this role.
              </p>
            </UFormField>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="crudLoading"
            @click="isEditOpen = false"
          />
          <UButton
            label="Save Changes"
            icon="i-lucide-save"
            :loading="crudLoading"
            @click="requestEditConfirmation"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isEditConfirmOpen"
      title="Confirm Update User"
      description="Please confirm before saving changes."
    >
      <template #body>
        <div class="space-y-3 text-sm">
          <p class="text-toned">
            Save changes for
            <span class="font-medium text-highlighted">{{ update_data.username || "-" }}</span>
            with role
            <span class="font-medium text-highlighted">{{ update_data.role }}</span>?
          </p>
          <p class="text-muted">
            The existing user profile and access assignment will be updated.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" :disabled="crudLoading" @click="isEditConfirmOpen = false" />
          <UButton type="submit" form="edit-user-form" label="Confirm Save" icon="i-lucide-save" :loading="crudLoading" @click="isEditConfirmOpen = false" />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteOpen"
      title="Delete User"
      description="This action cannot be undone."
    >
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-toned">
            Delete
            <span class="font-medium text-highlighted">
              {{ selectedUser?.username }}
            </span>
            from user management?
          </p>
          <p class="text-sm text-muted">
            Users that already created lots cannot be deleted by the backend.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="crudLoading"
            @click="isDeleteOpen = false"
          />
          <UButton
            label="Delete User"
            icon="i-lucide-trash-2"
            color="error"
            :loading="crudLoading"
            @click="handleDelete"
          />
        </div>
      </template>
    </UModal>
  </AppSidebar>
</template>
