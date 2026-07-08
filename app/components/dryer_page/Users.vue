<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { USER_ROLES, type UserRole, type UserRow } from "~/composable/useUserList";
import { type DryerAccessRoleFilter, useDryerAccess } from "~/composable/dryer_page/useDryerAccess";

const props = defineProps({
    areaId: {
        type: String,
        required: true,
    },
});

const toast = useToast();
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const areaIdNumber = computed(() => Number(props.areaId));
const {
    area,
    assignedUsers,
    candidateUsers,
    loading,
    saving,
    error,
    search,
    role,
    fetch_access,
    add_accesses,
} = useDryerAccess(areaIdNumber.value);

const isAddOpen = ref(false);
const selectedCandidateUserIds = ref<number[]>([]);
const pageSize = ref(10);
const pageOffset = ref(0);

const roleItems: { label: string; value: DryerAccessRoleFilter | undefined }[] = [
    { label: "All roles", value: undefined },
    ...USER_ROLES.filter((item) => item === "OPERATOR" || item === "CLIENT").map((item) => ({
        label: item,
        value: item,
    })),
];

const roleColor: Record<UserRole, "primary" | "info" | "warning" | "neutral"> = {
    ADMIN: "primary",
    MANAGER: "info",
    OPERATOR: "warning",
    CLIENT: "neutral",
};

const candidateItems = computed(() => candidateUsers.value.map((user) => ({
    label: `${user.fullName} (${user.username})`,
    value: user.userId,
})));

const selectedCandidateLabel = computed(() => {
    if (selectedCandidateUserIds.value.length === 0) {
        return "Select users";
    }

    if (selectedCandidateUserIds.value.length === 1) {
        const selectedUser = candidateUsers.value.find((user) => user.userId === selectedCandidateUserIds.value[0]);
        return selectedUser?.fullName ?? "1 selected";
    }

  return `${selectedCandidateUserIds.value.length} selected`;
});

const paginatedAssignedUsers = computed(() => {
    return assignedUsers.value.slice(pageOffset.value, pageOffset.value + pageSize.value);
});

const totalPage = computed(() => {
    if (pageSize.value <= 0) {
        return 1;
    }

    return Math.max(1, Math.ceil(assignedUsers.value.length / pageSize.value));
});

const currentPage = computed(() => {
    if (pageSize.value <= 0) {
        return 1;
    }

    return Math.floor(pageOffset.value / pageSize.value) + 1;
});

const hasPrev = computed(() => pageOffset.value > 0);
const hasNext = computed(() => pageOffset.value + pageSize.value < assignedUsers.value.length);

const pageSizeItems = [10, 25, 50].map((size) => ({ label: `${size}`, value: size }));

const getErrorMessage = (err: unknown) => {
    return err instanceof Error ? err.message : "Unknown error";
};

const refreshAccess = async () => {
    try {
        await fetch_access();
        pageOffset.value = 0;
    } catch (err) {
        toast.add({
            title: "Failed to load dryer access",
            description: getErrorMessage(err),
            color: "error",
            icon: "i-lucide-circle-alert",
        });
    }
};

const applyFilter = async () => {
    await refreshAccess();
};

const resetFilter = async () => {
    search.value = "";
    role.value = undefined;
    pageOffset.value = 0;
    await refreshAccess();
};

const changePage = async (direction: "next" | "prev") => {
    if (direction === "next" && hasNext.value) {
        pageOffset.value += pageSize.value;
    }

    if (direction === "prev" && hasPrev.value) {
        pageOffset.value -= pageSize.value;
    }
};

const changePageSize = () => {
    pageOffset.value = 0;
};

const openAddModal = () => {
    selectedCandidateUserIds.value = [];
    isAddOpen.value = true;
};

const handleAddAccess = async () => {
    if (selectedCandidateUserIds.value.length < 1) {
        toast.add({
            title: "Select users",
            description: "Choose one or more operators or clients before adding access.",
            color: "warning",
            icon: "i-lucide-circle-alert",
        });
        return;
    }

    try {
        await add_accesses(selectedCandidateUserIds.value);
        isAddOpen.value = false;
        toast.add({
            title: "Access added",
            description: "Selected users can now access this dryer area.",
            color: "success",
            icon: "i-lucide-circle-check",
        });
    } catch (err) {
        toast.add({
            title: "Failed to add access",
            description: getErrorMessage(err),
            color: "error",
            icon: "i-lucide-circle-alert",
        });
    }
};

const columns: TableColumn<UserRow>[] = [
    {
        id: "rowNumber",
        header: "No.",
        cell: ({ row }) => `${row.index + 1}`,
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
            const userRole = row.getValue("role") as UserRole;

            return h(UBadge, { color: roleColor[userRole], variant: "subtle" }, () => userRole);
        },
    },
];

onMounted(refreshAccess);
</script>

<template>
    <div class="space-y-4">
        <div class="rounded-lg border border-default bg-default">
            <div class="flex flex-col gap-3 border-b border-default p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h3 class="text-base font-semibold text-highlighted">
                        {{ area?.name || `Dryer Area #${areaId}` }}
                    </h3>
                    <p class="text-sm text-muted">
                        {{ assignedUsers.length }} users assigned
                    </p>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <UInput
                        v-model="search"
                        icon="i-lucide-search"
                        placeholder="Search user"
                        class="w-full sm:w-64"
                        @keyup.enter="applyFilter"
                    />
                    <USelect
                        v-model="role"
                        :items="roleItems"
                        value-key="value"
                        label-key="label"
                        class="w-full sm:w-36"
                        @change="applyFilter"
                    />
                    <UButton
                        icon="i-lucide-rotate-ccw"
                        color="neutral"
                        variant="ghost"
                        aria-label="Reset filters"
                        @click="resetFilter"
                    />
                    <UButton
                        icon="i-lucide-user-plus"
                        label="Add Access"
                        color="primary"
                        @click="openAddModal"
                    />
                </div>
            </div>

            <div class="overflow-x-auto">
                <UTable
                    :data="paginatedAssignedUsers"
                    :columns="columns"
                    :loading="loading"
                    empty="No users assigned"
                    class="min-w-[520px]"
                />
            </div>

            <div class="border-t border-default p-4">
                <div class="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
                    <UButton
                        icon="i-lucide-chevron-left"
                        label="Prev"
                        color="neutral"
                        variant="outline"
                        :disabled="!hasPrev || loading"
                        @click="changePage('prev')"
                    />
                    <span class="min-w-16 text-center text-sm text-muted">
                        {{ currentPage }} / {{ totalPage }}
                    </span>
                    <USelect
                        v-model="pageSize"
                        :items="pageSizeItems"
                        value-key="value"
                        label-key="label"
                        class="w-20"
                        :disabled="loading"
                        @change="changePageSize"
                    />
                    <UButton
                        trailing-icon="i-lucide-chevron-right"
                        label="Next"
                        color="neutral"
                        variant="outline"
                        :disabled="!hasNext || loading"
                        @click="changePage('next')"
                    />
                </div>
            </div>
        </div>

        <p v-if="error" class="text-sm text-error">
            {{ getErrorMessage(error) }}
        </p>

        <UModal
            v-model:open="isAddOpen"
            title="Add Dryer Access"
            description="Assign this dryer area to an operator or client."
        >
            <template #body>
                <div class="space-y-4">
                    <div class="flex items-center justify-between gap-3">
                        <p class="text-sm text-muted">
                            {{ selectedCandidateUserIds.length }} selected
                        </p>
                        <UButton
                            v-if="selectedCandidateUserIds.length"
                            label="Clear"
                            size="sm"
                            color="neutral"
                            variant="ghost"
                            @click="selectedCandidateUserIds = []"
                        />
                    </div>

                    <USelectMenu
                        v-model="selectedCandidateUserIds"
                        :items="candidateItems"
                        value-key="value"
                        label-key="label"
                        multiple
                        placeholder="Select users"
                        class="w-full"
                        :disabled="candidateUsers.length === 0"
                    >
                        <template #default>
                            <span class="truncate text-sm">
                                {{ selectedCandidateLabel }}
                            </span>
                        </template>
                    </USelectMenu>

                    <div
                        v-if="candidateUsers.length === 0"
                        class="rounded-lg border border-default px-3 py-8 text-center text-sm text-muted"
                    >
                        No available operator or client found.
                    </div>

                    <div
                        v-else-if="selectedCandidateUserIds.length"
                        class="flex flex-wrap gap-2"
                    >
                        <UBadge
                            v-for="userId in selectedCandidateUserIds"
                            :key="userId"
                            color="neutral"
                            variant="subtle"
                        >
                            {{ candidateUsers.find((user) => user.userId === userId)?.fullName ?? userId }}
                        </UBadge>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex w-full justify-end gap-2">
                    <UButton
                        label="Cancel"
                        color="neutral"
                        variant="ghost"
                        :disabled="saving"
                        @click="isAddOpen = false"
                    />
                    <UButton
                        label="Add Access"
                        icon="i-lucide-user-plus"
                        :loading="saving"
                        @click="handleAddAccess"
                    />
                </div>
            </template>
        </UModal>

    </div>
</template>
