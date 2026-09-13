<script setup lang="ts">
import { ref, type Ref } from 'vue';
import type { TableAction } from '../types/table';
import ConfirmDialog from './ConfirmDialog.vue';
import { useTableConfiguration } from '../config/tableConfig';

type ConfirmHandler = (action: TableAction) => void;
type ConfirmConfig = Exclude<TableAction['confirm'], boolean | undefined>;

const tableConfig = useTableConfiguration();
const confirmOpen: Ref<boolean> = ref(false);
const confirmTitle: Ref<string> = ref(tableConfig.value.labels.confirmTitle);
const confirmButton: Ref<string> = ref(tableConfig.value.labels.confirmButton);
const cancelButton: Ref<string> = ref(tableConfig.value.labels.cancelButton);
const confirmMessage: Ref<string> = ref('');
const pendingAction: Ref<TableAction | null> = ref(null);
const pendingConfirmHandler: Ref<ConfirmHandler | null> = ref(null);

const clearPending = (): void => {
  pendingAction.value = null;
  pendingConfirmHandler.value = null;
};

const configForAction = (action: TableAction): ConfirmConfig => {
  if (action.confirm && action.confirm !== true) {
    return action.confirm;
  }

  return {};
};

const open = (action: TableAction, handler: ConfirmHandler): void => {
  const cfg: ConfirmConfig = configForAction(action);
  confirmTitle.value = cfg.title ?? tableConfig.value.labels.confirmTitle;
  confirmMessage.value = cfg.message ?? tableConfig.value.labels.confirmMessage;
  confirmButton.value = cfg.confirmButton ?? tableConfig.value.labels.confirmButton;
  cancelButton.value = cfg.cancelButton ?? tableConfig.value.labels.cancelButton;
  pendingAction.value = action;
  pendingConfirmHandler.value = handler;
  confirmOpen.value = true;
};

const confirm = (action: TableAction, handler: ConfirmHandler): boolean => {
  if (!action.confirm) {
    return false;
  }

  open(action, handler);
  return true;
};

const onConfirm = (): void => {
  if (pendingAction.value && pendingConfirmHandler.value) {
    pendingConfirmHandler.value(pendingAction.value);
  }

  clearPending();
};

defineExpose({
  confirm,
  open
});
</script>

<template>
  <ConfirmDialog
    v-model="confirmOpen"
    :title="confirmTitle"
    :message="confirmMessage"
    :confirm-label="confirmButton"
    :cancel-label="cancelButton"
    :variant="pendingAction?.variant ?? undefined"
    :variant-color="pendingAction?.variantColor ?? undefined"
    @confirm="onConfirm"
    @cancel="clearPending"
  />
</template>
