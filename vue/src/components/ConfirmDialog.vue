<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import CommonButton from "./Common/CommonButton.vue";
import { usePageScrollLock } from '../composables/usePageScrollLock';
import { useTableConfiguration } from '../config/tableConfig';

type DialogResult = 'confirm' | 'cancel';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: string;
    variantColor?: string;
  }>(),
  {
    title: 'Are you absolutely sure?',
    message: '',
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    variant: 'solid',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const { lockPageScroll, unlockPageScroll } = usePageScrollLock();
const tableConfig = useTableConfiguration();

const close = (result: DialogResult): void => {
  emit('update:modelValue', false);

  const events: Record<DialogResult, () => void> = {
    confirm: (): void => emit('confirm'),
    cancel: (): void => emit('cancel'),
  };

  events[result]();
};

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    close('cancel');
  }
};

watch(
  () => props.modelValue,
  (isOpen: boolean): void => {
    if (isOpen) {
      lockPageScroll();
    } else {
      unlockPageScroll();
    }
  }
);

onMounted((): void => {
  document.addEventListener('keydown', onKeydown);

  if (props.modelValue) {
    lockPageScroll();
  }
});

onBeforeUnmount((): void => {
  document.removeEventListener('keydown', onKeydown);
  unlockPageScroll();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="zt-dialog-fade">
      <div
        v-if="modelValue"
        class="zt-confirm-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        :class="{ dark: tableConfig.darkMode.enabled }"
        role="alertdialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="close('cancel')"
      >
        <Transition name="zt-dialog-scale" appear>
          <div
            v-if="modelValue"
            class="w-full max-w-md rounded-xl border border-transparent bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              {{ title }}
            </h2>
            <p v-if="message" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {{ message }}
            </p>
            <slot />

            <div class="mt-6 flex justify-end gap-2">
              <CommonButton
                variant="outline"
                @click="close('cancel')"
              >
                {{cancelLabel}}
              </CommonButton>
              <CommonButton
                :color="variantColor"
                @click="close('confirm')"
              >
                {{confirmLabel}}
              </CommonButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

