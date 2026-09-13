<script setup lang="ts">
import { computed, type ComputedRef, type CSSProperties } from 'vue';
import { twMerge } from 'tailwind-merge';
import type { ImageConfig, TableCellValue, TableColumn, TableRow } from '../../types/table';
import CommonIcon from "../Common/CommonIcon.vue";

type ImageColumnProps = {
  column: TableColumn;
  row: TableRow;
  image?: ImageConfig | null;
  showContent?: boolean;
}

const props = withDefaults(
  defineProps<ImageColumnProps>(),
  {
    image: null,
    showContent: false
  }
);

const sizeClasses: Record<ImageConfig['size'], string> = {
  small: 'size-4',
  medium: 'size-6',
  large: 'size-8',
  'extra-large': 'size-10'
};

const value: ComputedRef<TableCellValue> = computed((): TableCellValue => props.row[props.column.attribute] as TableCellValue);

const image: ComputedRef<ImageConfig | null> = computed((): ImageConfig | null => {
  if (props.image) {
    return props.image;
  }

  if (props.column.type === 'image' && typeof value.value === 'string' && value.value.trim() !== '') {
    return {
      url: value.value,
      urls: [],
      icon: null,
      size: 'medium',
      width: null,
      height: null,
      rounded: false,
      position: 'start',
      class: '',
      alt: '',
      title: '',
      limit: null
    };
  }

  return null;
});

const imageUrls: ComputedRef<string[]> = computed((): string[] => {
  if (!image.value || image.value.icon) {
    return [];
  }

  const urls: string[] = image.value.urls.length > 0 ? image.value.urls : image.value.url ? [image.value.url] : [];

  return urls.filter((url: string): boolean => url.trim() !== '');
});

const visibleUrls: ComputedRef<string[]> = computed((): string[] => {
  const limit: number | null | undefined = image.value?.limit;

  if (limit === null || limit === undefined) {
    return imageUrls.value;
  }

  return imageUrls.value.slice(0, Math.max(0, limit));
});

const overflowCount: ComputedRef<number> = computed((): number => Math.max(0, imageUrls.value.length - visibleUrls.value.length));
const hasCustomDimensions: ComputedRef<boolean> = computed((): boolean => image.value?.width !== null || image.value?.height !== null);

const mediaClasses: ComputedRef<string> = computed((): string =>
  twMerge([
    'inline-flex shrink-0 items-center justify-center bg-slate-100 object-cover text-xs font-medium text-slate-700',
    image.value && !hasCustomDimensions.value ? sizeClasses[image.value.size] : '',
    image.value?.rounded ? 'rounded-full' : 'rounded',
    image.value?.class ?? ''
  ].filter(Boolean).join(' '))
);

const mediaStyle: ComputedRef<CSSProperties> = computed((): CSSProperties => ({
  width: image.value?.width !== null && image.value?.width !== undefined ? `${image.value.width}px` : undefined,
  height: image.value?.height !== null && image.value?.height !== undefined ? `${image.value.height}px` : undefined
}));

const wrapperClasses: ComputedRef<string> = computed((): string =>
  twMerge([
    'inline-flex min-w-0 items-center gap-2 align-middle',
    image.value?.position === 'end' ? 'flex-row-reverse' : ''
  ].filter(Boolean).join(' '))
);
</script>

<template>
  <span v-if="image" :class="wrapperClasses" data-test="table-image-wrapper">
    <span
      v-if="image.icon"
      :class="twMerge(
        'inline-flex shrink-0 items-center justify-center bg-slate-100 text-slate-500',
        image?.width == null && image?.height == null ? sizeClasses[image?.size ?? 'medium'] : '',
        'rounded-full',
        image?.class ?? ''
      )"
      :style="mediaStyle"
      :title="image.title || undefined"
      :data-icon="image.icon"
      data-test="table-image-icon"
    >
      <CommonIcon :icon="image.icon" class="size-3/4" />
    </span>

    <span v-else-if="imageUrls.length > 0" class="inline-flex shrink-0 items-center -space-x-1.5" data-test="table-image-list">
      <img
        v-for="(url, index) in visibleUrls"
        :key="`${url}-${index}`"
        :src="url"
        :alt="image.alt"
        :title="image.title || undefined"
        :class="mediaClasses"
        :style="mediaStyle"
        data-test="table-image"
      >
      <span
        v-if="overflowCount > 0"
        :class="mediaClasses"
        :style="mediaStyle"
        data-test="table-image-overflow"
      >+{{ overflowCount }}</span>
    </span>

    <span v-if="showContent" class="min-w-0">
      <slot />
    </span>
  </span>

  <span v-else-if="showContent">
    <slot />
  </span>
</template>
