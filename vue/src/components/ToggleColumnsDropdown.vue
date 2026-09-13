<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { TableColumn } from '../types/table';
import Switch from './Switch.vue';
import CommonButton from './Common/CommonButton.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import { useTableConfiguration } from '../config/tableConfig';

type ToggleColumnsDropdownProps = {
  columns: TableColumn[];
  isColumnVisible: (attribute: string) => boolean;
}

const props = defineProps<ToggleColumnsDropdownProps>();
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  toggle: [attribute: string];
}>();

const search: Ref<string> = ref('');

const filteredColumns: ComputedRef<TableColumn[]> = computed((): TableColumn[] => {
  const term: string = search.value.trim().toLowerCase();

  if (!term) {
    return props.columns;
  }

  return props.columns.filter((column: TableColumn): boolean =>
    column.label.toLowerCase().includes(term) || column.attribute.toLowerCase().includes(term)
  );
});
</script>

<template>
  <CommonDropdown
    :width="210"
    :offset="8"
    align="start"
  >
    <template #trigger="{ toggle, open }">
      <CommonButton
        type="button"
        variant="outline"
        color="slate"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click="toggle"
        leading-icon="columns"
      >
        {{ tableConfig.labels.columns }}
      </CommonButton>
    </template>

    <template #default>
      <div :class="tableConfig.classes.dropdownHeader">
        {{ tableConfig.labels.toggleColumns }}
      </div>

      <div :class="tableConfig.classes.dropdownSearchWrapper">
        <input
          v-model="search"
          type="search"
          :class="tableConfig.classes.dropdownSearchInput"
          :placeholder="tableConfig.labels.toggleColumnSearch"
          @click.stop
        >
      </div>

      <div class="max-h-72 overflow-y-auto py-1">
        <div
          v-for="column in filteredColumns"
          :key="column.attribute"
          tabindex="0"
          :class="tableConfig.classes.dropdownItem"
          role="menuitemcheckbox"
          :aria-checked="isColumnVisible(column.attribute)"
          @click="emit('toggle', column.attribute)"
        >
        <span>
          {{ column.label }}
        </span>

          <span
            class="ml-auto"
            @click.stop
          >
          <Switch
            size="sm"
            :checked="isColumnVisible(column.attribute)"
            @update:checked="
              emit('toggle', column.attribute)
            "
          />
        </span>
        </div>

        <div
          v-if="filteredColumns.length === 0"
          :class="tableConfig.classes.dropdownEmpty"
        >
          {{ tableConfig.labels.noColumnsFound }}
        </div>
      </div>
    </template>
  </CommonDropdown>
</template>
