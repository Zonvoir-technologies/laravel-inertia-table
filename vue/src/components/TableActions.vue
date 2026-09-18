<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { router } from '@inertiajs/vue3';
import type { ButtonVariants, TableAction, TableMetaValue, TableDefinition, TableRow, TableRowKey } from '../types/table';
import { visitUrl } from '../helpers/visitUrl';
import { useTableContext } from '../composables/useTableContext';
import CommonButton from './Common/CommonButton.vue';
import TableActionConfirmDialog from './TableActionConfirmDialog.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import CommonTooltip from './Common/CommonTooltip.vue';
import CommonIcon from './Common/CommonIcon.vue';
import { useTableConfiguration } from '../config/tableConfig';

type ActionExecutionPayload = { action: TableAction; response?: TableMetaValue };
type SelectionMode = 'page' | 'all';

type TableActionsProps = {
  actions: TableAction[];
  table?: TableDefinition;
  row?: TableRow;
  selectedKeys?: TableRowKey[];
  selectionMode?: SelectionMode;
  dropdown?: boolean;
}

const props = withDefaults(
  defineProps<TableActionsProps>(),
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
const injectedTable = useTableContext();
const tableConfig = useTableConfiguration();

const currentTable: ComputedRef<TableDefinition | null> = computed((): TableDefinition | null => props.table ?? injectedTable?.value ?? null);
const visibleActions: ComputedRef<TableAction[]> = computed((): TableAction[] => props.actions.filter((action: TableAction): boolean => !action.hidden));

const actionText = (action: TableAction): string => action.label || action.tooltip || action.key;
const showsButtonLabel = (action: TableAction): boolean => action.showLabel !== false && Boolean(action.label);
const isDisabled = (action: TableAction): boolean =>
  Boolean(action.disabled) ||
  loadingAction.value === action.key ||
  Boolean(action.endpoint && action.type !== 'custom' && !currentTable.value);

const buttonVariant = (action: TableAction): ButtonVariants => {
  if (action.url?.url) {
    return 'link';
  }

  return (action.variant ?? 'solid') as ButtonVariants;
};

const keyForRow = (): TableRowKey | null => {
  const key: string | null | undefined = currentTable.value?.rowSelectionKey;

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
      preserveScroll: action.url.preserveScroll ?? false,
      preserveState: action.url.preserveState ?? false
    });
    return;
  }

  if (!action.endpoint || action.type === 'custom') {
    emit('executed', { action });
    return;
  }

  const table: TableDefinition | null = currentTable.value;

  if (!table) {
    return;
  }

  const keys: TableRowKey[] = props.row ? [keyForRow()].filter((key): key is TableRowKey => key !== null) : props.selectedKeys;

  loadingAction.value = action.key;
  router.visit(action.endpoint, {
    method: 'post',
    data: {
      table: table.meta.table,
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
  <CommonDropdown v-if="dropdown" align="end" :width="176" :aria-label="tableConfig.labels.rowActions">
    <template #trigger="{ open, toggle }">
      <CommonButton
        type="button"
        variant="ghost"
        color="neutral"
        size="icon-sm"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-label="tableConfig.labels.rowActions"
        @click.stop="toggle"
        leading-icon="actions"
      >
      </CommonButton>
    </template>

    <template #default="{ close }">
      <component
        :is="action.url?.url ? 'a' : 'button'"
        v-for="action in visibleActions"
        :key="action.key"
        :type="action.url?.url ? undefined : 'button'"
        role="menuitem"
        :href="action.url?.url ?? undefined"
        :target="action.url?.target ?? undefined"
        :rel="action.url?.target === '_blank' ? 'noopener noreferrer' : undefined"
        :download="action.url?.download ? '' : undefined"
        :aria-disabled="isDisabled(action) ? 'true' : undefined"
        :disabled="!action.url?.url && isDisabled(action)"
        size="sm"
        :class="[
          tableConfig.classes.actionMenuItem,
          isDisabled(action) ? 'cursor-not-allowed text-slate-300' : ''
        ]"
        @click="(event: MouseEvent) => { close(); execute(action, event) }"
      >
        <CommonIcon v-if="action.icon" :icon="action.icon" class="h-4 w-4" />
        <span>{{ loadingAction === action.key ? tableConfig.labels.working : actionText(action) }}</span>
      </component>
    </template>
  </CommonDropdown>

  <div v-else :class="tableConfig.classes.actions">
    <CommonTooltip
      v-for="action in visibleActions"
      :key="action.key"
      :text="action.tooltip || actionText(action)"
    >
      <CommonButton
        :as="action.url?.url ? 'a' : 'button'"
        :variant="buttonVariant(action)"
        :color="action.variantColor ?? undefined"
        :size="action.icon && !showsButtonLabel(action) ? 'icon-sm' : 'sm'"
        :disabled="isDisabled(action)"
        :class="action.class"
        :href="action.url?.url"
        :target="action.url?.target ?? undefined"
        :rel="action.url?.target === '_blank' ? 'noopener noreferrer' : undefined"
        :download="action.url?.download ? '' : undefined"
        :aria-disabled="action.disabled ? 'true' : undefined"
        :aria-label="actionText(action)"
        @click="execute(action, $event)"
        :leading-icon="action.icon ? action.icon : undefined"
        :loading="loadingAction === action.key"
      >
        <span v-if="showsButtonLabel(action)">{{ action.label }}</span>
      </CommonButton>
    </CommonTooltip>
  </div>

  <TableActionConfirmDialog ref="actionConfirmDialog" />
</template>
