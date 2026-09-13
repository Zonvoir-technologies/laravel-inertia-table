<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import type { TableAction, TableErrorRetryAction } from '../types/table';
import CommonButton from './Common/CommonButton.vue';
import CommonIcon from './Common/CommonIcon.vue';
import TableActions from './TableActions.vue';
import { useTableConfiguration } from '../config/tableConfig';

type TableErrorStateProps = {
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  retry?: boolean | TableErrorRetryAction;
  action?: TableAction | null;
  colspan?: number;
}

const props = withDefaults(
  defineProps<TableErrorStateProps>(),
  {
    title: null,
    message: null,
    icon: null,
    retry: true,
    action: null,
    colspan: 1
  }
);
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  retry: [];
}>();

const retryConfig: ComputedRef<TableErrorRetryAction | null> = computed((): TableErrorRetryAction | null => {
  if (!props.retry) {
    return null;
  }

  return typeof props.retry === 'object' ? props.retry : {};
});

const resolvedTitle: ComputedRef<string | null> = computed((): string | null => props.title ?? tableConfig.value.labels.errorTitle);
const resolvedMessage: ComputedRef<string | null> = computed((): string | null => props.message ?? tableConfig.value.labels.errorMessage);
const resolvedIcon: ComputedRef<string | null> = computed((): string | null => props.icon ?? 'error');
</script>

<template>
  <tbody>
    <tr>
      <td :colspan="colspan" :class="tableConfig.classes.errorCell">
        <div :class="tableConfig.classes.errorContent">
          <CommonIcon v-if="resolvedIcon" :icon="resolvedIcon" class="h-8 w-8 text-red-500" />
          <div class="space-y-1">
            <p v-if="resolvedTitle" class="text-sm font-medium text-slate-900">{{ resolvedTitle }}</p>
            <p v-if="resolvedMessage" class="text-sm text-slate-500">{{ resolvedMessage }}</p>
          </div>
          <div v-if="retryConfig || action" class="flex flex-wrap items-center justify-center gap-2">
            <CommonButton
              v-if="retryConfig"
              type="button"
              variant="outline"
              color="neutral"
              size="sm"
              :leading-icon="retryConfig.icon ?? 'retry'"
              @click="emit('retry')"
            >
              {{ retryConfig.label ?? tableConfig.labels.tryAgain }}
            </CommonButton>
            <TableActions
              v-if="action"
              :actions="[action]"
            />
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</template>
