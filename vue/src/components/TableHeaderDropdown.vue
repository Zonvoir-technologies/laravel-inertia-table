<script setup lang="ts">
import type { TableColumn } from '../types/table';
import { useTableConfiguration } from '../config/tableConfig';
import CommonButton from './Common/CommonButton.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import CommonIcon from "./Common/CommonIcon.vue";

type SortDirection = 'asc' | 'desc';

type TableHeaderDropdownProps = {
  column: TableColumn;
  canStick: boolean;
  isSticky: boolean;
  triggerClass?: string | string[];
}

defineProps<TableHeaderDropdownProps>();
const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  sort: [direction: SortDirection];
  stick: [];
  hide: [];
}>();
</script>

<template>
  <CommonDropdown align="start" :width="120" :aria-label="column.label">
    <template #trigger="{ open, toggle }">
      <div
        :class="triggerClass"
        role="button"
        :aria-expanded="open"
        aria-haspopup="menu"
        @click.stop="toggle"
      >
        <slot />

        <CommonIcon icon="sort" />
      </div>
    </template>

    <template #default="{ close }">
      <div v-if="column.sortable">
        <CommonButton
          type="button"
          variant="ghost"
          color="gray"
          size="sm"
          role="menuitem"
          leading-icon="sortAscending"
          :class="tableConfig.classes.headerMenuItem"
          @click="close(); emit('sort', 'asc')"
        >
          <span>{{ tableConfig.labels.ascending }}</span>
        </CommonButton>
        <CommonButton
          type="button"
          variant="ghost"
          color="gray"
          size="sm"
          role="menuitem"
          leading-icon="sortDescending"
          :class="tableConfig.classes.headerMenuItem"
          @click="close(); emit('sort', 'desc')"
        >
          <span>{{ tableConfig.labels.descending }}</span>
        </CommonButton>
      </div>
      <div v-if="column.sortable" class="my-1 border-t border-slate-100" />
      <CommonButton
        v-if="canStick"
        type="button"
        variant="ghost"
        color="gray"
        size="sm"
        role="menuitem"
        :class="tableConfig.classes.headerMenuItem"
        :leading-icon="isSticky ? 'unstick' : 'stick'"
        @click="close(); emit('stick')"
      >
        <span>{{ isSticky ? tableConfig.labels.unstick : tableConfig.labels.stick }}</span>
      </CommonButton>
      <CommonButton
        v-if="column.toggleable"
        type="button"
        variant="ghost"
        color="gray"
        size="sm"
        role="menuitem"
        :class="tableConfig.classes.headerMenuItem"
        leading-icon="hide"
        @click="close(); emit('hide')"
      >
        <span>{{ tableConfig.labels.hide }}</span>
      </CommonButton>
    </template>
  </CommonDropdown>
</template>
