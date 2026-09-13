<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import { useTableConfiguration } from '../config/tableConfig';

type LoadingStateProps = {
  colspan?: number;
  message?: string;
}

const props = withDefaults(
  defineProps<LoadingStateProps>(),
  {
    colspan: 1,
    message: undefined
  }
);
const tableConfig = useTableConfiguration();
const resolvedMessage: ComputedRef<string> = computed((): string => props.message ?? tableConfig.value.labels.loading);
</script>

<template>
  <tbody>
    <tr>
      <td :colspan="colspan" :class="tableConfig.classes.loadingCell">
        <div :class="tableConfig.classes.loadingContent">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <span>{{ resolvedMessage }}</span>
        </div>
      </td>
    </tr>
  </tbody>
</template>
