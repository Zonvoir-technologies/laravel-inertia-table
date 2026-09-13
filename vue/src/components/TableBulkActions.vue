<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { router } from '@inertiajs/vue3';
import type { TableAction, TableMetaValue, TableDefinition, TableRow, TableRowKey } from '../types/table';
import { visitUrl } from '../helpers/visitUrl';
import CommonButton from './Common/CommonButton.vue';
import TableActionConfirmDialog from './TableActionConfirmDialog.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import { useTableConfiguration } from '../config/tableConfig';

type ActionExecutionPayload = { action: TableAction; response?: TableMetaValue };
type SelectionMode = 'page' | 'all';

type TableBulkActionsProps = {
  actions: TableAction[];
  table: TableDefinition;
  row?: TableRow;
  selectedKeys?: TableRowKey[];
  selectionMode?: SelectionMode;
  dropdown?: boolean;
}

const props = withDefaults(
  defineProps<TableBulkActionsProps>(),
  {
    row: undefined,
    selectedKeys: (): TableRowKey[] => [],
    selectionMode: 'page',
    dropdown: false
  }
);

const emit = defineEmits<{
  executed: [payload: ActionExecutionPayload];
}>();

const loadingAction: Ref<string | null> = ref(null);
const actionConfirmDialog: Ref<InstanceType<typeof TableActionConfirmDialog> | null> = ref(null);
const tableConfig = useTableConfiguration();

const visibleActions: ComputedRef<TableAction[]> = computed((): TableAction[] => props.actions.filter((action: TableAction): boolean => !action.hidden));

const actionText = (action: TableAction): string => action.label || action.tooltip || action.key;
const isDisabled = (action: TableAction): boolean => Boolean(action.disabled) || props.selectedKeys.length === 0 || loadingAction.value === action.key;

const keyForRow = (): TableRowKey | null => {
  const key: string | null = props.table.rowSelectionKey;

  if (!key || !props.row) {
    return null;
  }

  const value = props.row[key];

  return typeof value === 'string' || typeof value === 'number' ? value : null;
};

const performAction = (action: TableAction): void => {
  if (action.url?.url) {
    if (action.url.target) {
      window.open(action.url.url, action.url.target);
      emit('executed', { action });
      return;
    }

    visitUrl(action.url.url, {
      method: action.url.method ?? 'get',
      preserveScroll: action.url.preserveScroll,
      preserveState: action.url.preserveState
    });
    return;
  }

  if (!action.endpoint || action.type === 'custom') {
    emit('executed', { action });
    return;
  }

  const keys: TableRowKey[] = props.row ? [keyForRow()].filter((key): key is TableRowKey => key !== null) : props.selectedKeys;

  loadingAction.value = action.key;
  router.visit(action.endpoint, {
    method: 'post',
    data: {
      table: props.table.meta.table,
      action: action.key,
      keys,
      selectionMode: props.selectionMode,
      data: action.data ?? {}
    },
    preserveScroll: true,
    preserveState: false,
    onFinish: (): void => {
      loadingAction.value = null;
      emit('executed', { action });
    }
  });
};

const execute = (action: TableAction, event: MouseEvent): void => {
  event.stopPropagation();

  if (isDisabled(action)) {
    event.preventDefault();
    return;
  }

  event.preventDefault();

  if (actionConfirmDialog.value?.confirm(action, performAction)) {
    return;
  }

  performAction(action);
};
</script>

<template>
  <CommonDropdown v-if="visibleActions.length > 0" align="end" :aria-label="tableConfig.labels.actions">
    <template #trigger="{ toggle }">
      <CommonButton
        type="button"
        variant="outline"
        color="gray"
        @click.stop="toggle"
        trailing-icon="actions"
      >
        {{ tableConfig.labels.actions }}
      </CommonButton>
    </template>

    <template #default="{ close }">
      <CommonButton
        v-for="action in visibleActions"
        :key="action.key"
        :as="action.url?.url ? 'a' : 'button'"
        :type="action.url?.url ? undefined : 'button'"
        size="sm"
        role="menuitem"
        :href="action.url?.url ?? undefined"
        :target="action.url?.target ?? undefined"
        :rel="action.url?.target === '_blank' ? 'noopener noreferrer' : undefined"
        :download="action.url?.download ? '' : undefined"
        :aria-disabled="isDisabled(action) ? 'true' : undefined"
        :disabled="isDisabled(action)"
        :class="[
          tableConfig.classes.actionMenuItem,
        ]"
        class="w-full flex items-center justify-start gap-2 px-2 text-left"
        variant="ghost"
        @click="(event: MouseEvent) => { close(); execute(action, event) }"
        :leading-icon="action.icon ? action.icon : undefined"
        :loading="loadingAction === action.key"
      >
        <span>{{ loadingAction === action.key ? tableConfig.labels.working : actionText(action) }}</span>
      </CommonButton>
    </template>
  </CommonDropdown>

  <TableActionConfirmDialog ref="actionConfirmDialog" />
</template>
