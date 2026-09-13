<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import CommonButton from './CommonButton.vue';
import CommonIcon from './CommonIcon.vue';
import { useTableConfiguration } from '../../config/tableConfig';

interface CommonAlertProps {
  modelValue: boolean;
  title?: string;
  message?: string;
  buttonLabel?: string;
  icon?: string;
}

withDefaults(
  defineProps<CommonAlertProps>(),
  {
    title: 'Done',
    message: '',
    buttonLabel: 'OK',
    icon: 'heroicons:check-circle',
  }
);

const tableConfig = useTableConfiguration();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const close = (): void => {
  emit('update:modelValue', false);
  emit('close');
};

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    close();
  }
};

onMounted((): void => document.addEventListener('keydown', onKeydown));
onBeforeUnmount((): void => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="zt-dialog-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        :class="{ dark: tableConfig.darkMode.enabled }"
        role="alertdialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="close"
      >
        <Transition name="zt-dialog-scale" appear>
          <div
            v-if="modelValue"
            class="w-full max-w-md rounded-xl border border-transparent bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div class="flex items-start gap-3">
              <CommonIcon
                :icon="icon"
                class="mt-0.5 size-6 shrink-0 text-green-600 dark:text-green-400"
              />

              <div class="min-w-0 flex-1">
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {{ title }}
                </h2>
                <p v-if="message" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {{ message }}
                </p>
                <slot />
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <CommonButton
                type="button"
                color="slate"
                @click="close"
              >
                {{ buttonLabel }}
              </CommonButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
