<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import type { TableAction } from '../types/table';
import CommonIcon from './Common/CommonIcon.vue';
import TableActions from './TableActions.vue';
import { useTableConfiguration } from '../config/tableConfig';

type EmptyStateProps = {
  title?: string | null;
  message?: string | null;
  icon?: string | null;
  action?: TableAction | null;
  colspan?: number;
}

const props = withDefaults(
  defineProps<EmptyStateProps>(),
  {
    title: null,
    message: null,
    icon: null,
    action: null,
    colspan: 1
  }
);
const tableConfig = useTableConfiguration();
const resolvedTitle: ComputedRef<string | null> = computed((): string | null => props.title ?? tableConfig.value.labels.noResults);
</script>

<template>
  <tbody>
    <tr>
      <td :colspan="colspan" :class="tableConfig.classes.emptyCell">
        <slot>
          <div :class="tableConfig.classes.emptyContent">
            <CommonIcon v-if="icon" :icon="icon" :class="tableConfig.classes.emptyIcon" />
            <div class="space-y-1">
              <p v-if="resolvedTitle" :class="['text-sm font-medium text-slate-900', tableConfig.darkMode.enabled ? 'dark:text-slate-100' : '']">{{ resolvedTitle }}</p>
              <p v-if="message" :class="['text-sm text-slate-500', tableConfig.darkMode.enabled ? 'dark:text-slate-400' : '']">{{ message }}</p>
            </div>
            <TableActions
              v-if="action"
              :actions="[action]"
            />
          </div>
        </slot>
      </td>
    </tr>
  </tbody>
</template>
