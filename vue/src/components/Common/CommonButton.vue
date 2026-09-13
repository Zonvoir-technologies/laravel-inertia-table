<script setup lang="ts">
import { computed, type ButtonHTMLAttributes, type ComputedRef, normalizeClass, useAttrs } from 'vue';
import { twMerge } from 'tailwind-merge';
import Spinner from "../Spinner.vue";
import CommonIcon from "./CommonIcon.vue";
import {ButtonVariants} from "../../types/table";
import { useTableConfiguration } from '../../config/tableConfig';

defineOptions({ inheritAttrs: false });

type Variant = ButtonVariants;
type Size = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  color?: string;
  disabled?: boolean;
  as?: 'button' | 'a';
  leadingIcon?: string;
  trailingIcon?: string;
  loading?: boolean;
}

const attrs = useAttrs();
const tableConfig = useTableConfiguration();

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    variant: 'solid',
    size: 'default',
    color: 'neutral',
    disabled: false,
    as: 'button',
    loading: false
  }
);

const normalizeVariant = (variant: string): Variant => {
  if (['solid', 'outline', 'ghost', 'link'].includes(variant)) {
    return variant as Variant;
  }

  return 'solid';
};

const buttonVariantClasses = {
  slate: {
    solid: 'bg-slate-500 hover:bg-slate-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-slate-700 border-slate-300 border font-medium hover:bg-slate-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-slate-700 hover:bg-slate-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-slate-700 hover:text-slate-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  gray: {
    solid: 'bg-gray-500 hover:bg-gray-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-gray-700 border-gray-300 border font-medium hover:bg-gray-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-gray-700 hover:text-gray-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  zinc: {
    solid: 'bg-zinc-500 hover:bg-zinc-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-zinc-700 border-zinc-300 border font-medium hover:bg-zinc-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-zinc-700 hover:bg-zinc-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-zinc-700 hover:text-zinc-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  neutral: {
    solid: 'bg-neutral-500 hover:bg-neutral-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-neutral-700 border-neutral-300 border font-medium hover:bg-neutral-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-neutral-700 hover:bg-neutral-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-neutral-700 hover:text-neutral-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  stone: {
    solid: 'bg-stone-500 hover:bg-stone-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-stone-700 border-stone-300 border font-medium hover:bg-stone-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-stone-700 hover:bg-stone-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-stone-700 hover:text-stone-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  red: {
    solid: 'bg-red-500 hover:bg-red-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-red-700 border-red-300 border font-medium hover:bg-red-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-red-700 hover:bg-red-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-red-700 hover:text-red-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  orange: {
    solid: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-orange-700 border-orange-300 border font-medium hover:bg-orange-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-orange-700 hover:bg-orange-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-orange-700 hover:text-orange-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  amber: {
    solid: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-amber-700 border-amber-300 border font-medium hover:bg-amber-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-amber-700 hover:bg-amber-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-amber-700 hover:text-amber-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  yellow: {
    solid: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-yellow-700 border-yellow-300 border font-medium hover:bg-yellow-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-yellow-700 hover:bg-yellow-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-yellow-700 hover:text-yellow-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  lime: {
    solid: 'bg-lime-500 hover:bg-lime-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-lime-700 border-lime-300 border font-medium hover:bg-lime-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-lime-700 hover:bg-lime-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-lime-700 hover:text-lime-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  green: {
    solid: 'bg-green-500 hover:bg-green-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-green-700 border-green-300 border font-medium hover:bg-green-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-green-700 hover:bg-green-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-green-700 hover:text-green-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  emerald: {
    solid: 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-emerald-700 border-emerald-300 border font-medium hover:bg-emerald-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-emerald-700 hover:bg-emerald-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-emerald-700 hover:text-emerald-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  teal: {
    solid: 'bg-teal-500 hover:bg-teal-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-teal-700 border-teal-300 border font-medium hover:bg-teal-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-teal-700 hover:bg-teal-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-teal-700 hover:text-teal-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  cyan: {
    solid: 'bg-cyan-500 hover:bg-cyan-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-cyan-700 border-cyan-300 border font-medium hover:bg-cyan-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-cyan-700 hover:bg-cyan-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-cyan-700 hover:text-cyan-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  sky: {
    solid: 'bg-sky-500 hover:bg-sky-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-sky-700 border-sky-300 border font-medium hover:bg-sky-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-sky-700 hover:bg-sky-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-sky-700 hover:text-sky-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  blue: {
    solid: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-blue-700 border-blue-300 border font-medium hover:bg-blue-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-blue-700 hover:bg-blue-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-blue-700 hover:text-blue-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  indigo: {
    solid: 'bg-indigo-500 hover:bg-indigo-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-indigo-700 border-indigo-300 border font-medium hover:bg-indigo-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-indigo-700 hover:bg-indigo-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-indigo-700 hover:text-indigo-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  violet: {
    solid: 'bg-violet-500 hover:bg-violet-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-violet-700 border-violet-300 border font-medium hover:bg-violet-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-violet-700 hover:bg-violet-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-violet-700 hover:text-violet-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  purple: {
    solid: 'bg-purple-500 hover:bg-purple-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-purple-700 border-purple-300 border font-medium hover:bg-purple-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-purple-700 hover:bg-purple-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-purple-700 hover:text-purple-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  fuchsia: {
    solid: 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-fuchsia-700 border-fuchsia-300 border font-medium hover:bg-fuchsia-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-fuchsia-700 hover:bg-fuchsia-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-fuchsia-700 hover:text-fuchsia-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  pink: {
    solid: 'bg-pink-500 hover:bg-pink-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-pink-700 border-pink-300 border font-medium hover:bg-pink-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-pink-700 hover:bg-pink-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-pink-700 hover:text-pink-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
  rose: {
    solid: 'bg-rose-500 hover:bg-rose-600 text-white border-transparent shadow-sm disabled:opacity-50',
    outline: 'bg-white text-rose-700 border-rose-300 border font-medium hover:bg-rose-50 disabled:opacity-50',
    ghost: 'bg-transparent border-transparent text-rose-700 hover:bg-rose-50 disabled:opacity-50',
    link: 'bg-transparent border-transparent text-rose-700 hover:text-rose-800 underline underline-offset-4 shadow-none disabled:opacity-50',
  },
};
type ButtonColor = keyof typeof buttonVariantClasses;

const normalizeColor = (color: string): string => {
  const normalizedColor = color.toLowerCase();
  const aliases: Record<string, string> = {
    default: 'neutral',
    destructive: 'red',
    danger: 'red',
    success: 'green',
    warning: 'amber',
    muted: 'gray',
  };

  return aliases[normalizedColor] ?? normalizedColor;
};
const neutralColors = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone']);

const semanticDarkClasses: Record<string, string> = {
  red: 'dark:bg-red-950/40 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/70',
  orange: 'dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/70',
  amber: 'dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/70',
  yellow: 'dark:bg-yellow-950/40 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/70',
  lime: 'dark:bg-lime-950/40 dark:border-lime-800 dark:text-lime-400 dark:hover:bg-lime-950/70',

  green: 'dark:bg-green-950/40 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/70',
  emerald: 'dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/70',
  teal: 'dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/70',
  cyan: 'dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-950/70',

  sky: 'dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950/70',
  blue: 'dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/70',
  indigo: 'dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/70',

  violet: 'dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/70',
  purple: 'dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/70',
  fuchsia: 'dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-400 dark:hover:bg-fuchsia-950/70',
  pink: 'dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-950/70',
  rose: 'dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/70',
};

const darkVariantClasses: ComputedRef<string> = computed((): string => {
  const color = normalizeColor(props.color ?? 'neutral');
  const variant = normalizeVariant(props.variant);

  if (neutralColors.has(color)) {
    if (variant === 'solid' || variant === 'outline') {
      return 'dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900';
    }
    return 'dark:text-slate-100 dark:hover:bg-slate-900';
  }

  if (variant !== 'outline') {
    return '';
  }

  const staticDark = semanticDarkClasses[color];
  if (staticDark) {
    return staticDark;
  }

  return `dark:bg-${color}-950/40 dark:border-${color}-800 dark:text-${color}-400 dark:hover:bg-${color}-950/70`;
});

const variantClass: ComputedRef<string> = computed((): string => {
  const color = normalizeColor(props.color ?? 'neutral');
  const variant = normalizeVariant(props.variant);
  const staticClasses = buttonVariantClasses[color as ButtonColor]?.[variant];

  if (staticClasses) {
    return staticClasses;
  }

  const dynamicClasses: Record<Variant, string> = {
    solid: `bg-${color}-500 hover:bg-${color}-600 text-white border-transparent shadow-sm disabled:opacity-50`,
    outline: `bg-white text-${color}-700 border-${color}-300 border font-medium hover:bg-${color}-50 disabled:opacity-50`,
    ghost: `bg-transparent border-transparent text-${color}-700 hover:bg-${color}-50 disabled:opacity-50`,
    link: `bg-transparent border-transparent text-${color}-700 hover:text-${color}-800 underline underline-offset-4 shadow-none disabled:opacity-50`,
  };

  return dynamicClasses[variant];
});

const sizeClass: ComputedRef<string> = computed((): string => {
  const sizes: Record<Size, string> = {
    default: 'h-9 px-4 text-[13px]',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9 p-0',
    'icon-sm': 'h-8 w-8 p-0',
    'icon-lg': 'h-10 w-10 p-0'
  };

  return sizes[props.size];
});

const buttonClass: ComputedRef<string> = computed((): string =>
  twMerge([
    'cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg border font-medium transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    normalizeVariant(props.variant) !== 'link' ? sizeClass.value : 'h-auto p-0',
    variantClass.value,
    tableConfig.value.darkMode.enabled ? darkVariantClasses.value : '',
    props.disabled ? 'cursor-not-allowed' : '',
    normalizeClass(attrs.class)
  ].join(' '))
);

const buttonAttrs = computed((): Omit<ButtonHTMLAttributes, 'class'> => {
  const rest = { ...attrs };

  delete rest.class;

  return rest as Omit<ButtonHTMLAttributes, 'class'>;
});
</script>

<template>
  <component
    :is="as"
    :class="buttonClass"
    :disabled="disabled || loading"
    v-bind="buttonAttrs"
  >
    <Spinner v-if="loading" />

    <template v-else>
      <CommonIcon
        v-if="leadingIcon"
        :icon="leadingIcon"
        :class="['sm', 'icon', 'icon-sm'].includes(props.size) ? 'size-4' : 'size-5'"
      />

      <slot />

      <CommonIcon
        v-if="trailingIcon"
        :icon="trailingIcon"
        :class="['sm', 'icon', 'icon-sm'].includes(props.size) ? 'size-4' : 'size-5'"
      />
    </template>
  </component>
</template>

