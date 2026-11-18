<script setup lang="ts">
import { computed, normalizeClass, useAttrs } from 'vue';
import { twMerge } from 'tailwind-merge';
import CommonIcon from "./CommonIcon.vue";
import { useTableConfiguration } from '../../config/tableConfig';

defineOptions({ inheritAttrs: false });

type BadgeVariant = 'solid' | 'outline' | 'ghost';
type BadgeSize = 'default' | 'sm' | 'xs';

interface BadgeProps {
  variant?: string;
  color?: string;
  icon?: string;
  size?: BadgeSize;
  round?: boolean;
}

const attrs = useAttrs();

const props = withDefaults(
  defineProps<BadgeProps>(),
  {
    variant: 'outline',
    color: 'primary',
    icon: '',
    size: 'default',
    round: false,
  }
);

const tableConfig = useTableConfiguration();

const normalizeVariant = (variant: string): BadgeVariant => {
  return ['solid', 'outline', 'ghost'].includes(variant) ? variant as BadgeVariant : 'outline';
};

const badgeVariantClasses = {
  slate: {
    solid: 'bg-slate-500 text-white border border-slate-500',
    outline: 'bg-slate-50 text-slate-700 border border-slate-300',
    ghost: 'bg-transparent text-slate-700 border border-transparent',
  },
  gray: {
    solid: 'bg-gray-500 text-white border border-gray-500',
    outline: 'bg-gray-50 text-gray-700 border border-gray-300',
    ghost: 'bg-transparent text-gray-700 border border-transparent',
  },
  zinc: {
    solid: 'bg-zinc-500 text-white border border-zinc-500',
    outline: 'bg-zinc-50 text-zinc-700 border border-zinc-300',
    ghost: 'bg-transparent text-zinc-700 border border-transparent',
  },
  neutral: {
    solid: 'bg-neutral-500 text-white border border-neutral-500',
    outline: 'bg-neutral-50 text-neutral-700 border border-neutral-300',
    ghost: 'bg-transparent text-neutral-700 border border-transparent',
  },
  stone: {
    solid: 'bg-stone-500 text-white border border-stone-500',
    outline: 'bg-stone-50 text-stone-700 border border-stone-300',
    ghost: 'bg-transparent text-stone-700 border border-transparent',
  },
  red: {
    solid: 'bg-red-500 text-white border border-red-500',
    outline: 'bg-red-50 text-red-700 border border-red-300',
    ghost: 'bg-transparent text-red-700 border border-transparent',
  },
  orange: {
    solid: 'bg-orange-500 text-white border border-orange-500',
    outline: 'bg-orange-50 text-orange-700 border border-orange-300',
    ghost: 'bg-transparent text-orange-700 border border-transparent',
  },
  amber: {
    solid: 'bg-amber-500 text-white border border-amber-500',
    outline: 'bg-amber-50 text-amber-700 border border-amber-300',
    ghost: 'bg-transparent text-amber-700 border border-transparent',
  },
  yellow: {
    solid: 'bg-yellow-500 text-white border border-yellow-500',
    outline: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
    ghost: 'bg-transparent text-yellow-700 border border-transparent',
  },
  lime: {
    solid: 'bg-lime-500 text-white border border-lime-500',
    outline: 'bg-lime-50 text-lime-700 border border-lime-300',
    ghost: 'bg-transparent text-lime-700 border border-transparent',
  },
  green: {
    solid: 'bg-green-500 text-white border border-green-500',
    outline: 'bg-green-50 text-green-700 border border-green-300',
    ghost: 'bg-transparent text-green-700 border border-transparent',
  },
  emerald: {
    solid: 'bg-emerald-500 text-white border border-emerald-500',
    outline: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    ghost: 'bg-transparent text-emerald-700 border border-transparent',
  },
  teal: {
    solid: 'bg-teal-500 text-white border border-teal-500',
    outline: 'bg-teal-50 text-teal-700 border border-teal-300',
    ghost: 'bg-transparent text-teal-700 border border-transparent',
  },
  cyan: {
    solid: 'bg-cyan-500 text-white border border-cyan-500',
    outline: 'bg-cyan-50 text-cyan-700 border border-cyan-300',
    ghost: 'bg-transparent text-cyan-700 border border-transparent',
  },
  sky: {
    solid: 'bg-sky-500 text-white border border-sky-500',
    outline: 'bg-sky-50 text-sky-700 border border-sky-300',
    ghost: 'bg-transparent text-sky-700 border border-transparent',
  },
  blue: {
    solid: 'bg-blue-500 text-white border border-blue-500',
    outline: 'bg-blue-50 text-blue-700 border border-blue-300',
    ghost: 'bg-transparent text-blue-700 border border-transparent',
  },
  indigo: {
    solid: 'bg-indigo-500 text-white border border-indigo-500',
    outline: 'bg-indigo-50 text-indigo-700 border border-indigo-300',
    ghost: 'bg-transparent text-indigo-700 border border-transparent',
  },
  violet: {
    solid: 'bg-violet-500 text-white border border-violet-500',
    outline: 'bg-violet-50 text-violet-700 border border-violet-300',
    ghost: 'bg-transparent text-violet-700 border border-transparent',
  },
  purple: {
    solid: 'bg-purple-500 text-white border border-purple-500',
    outline: 'bg-purple-50 text-purple-700 border border-purple-300',
    ghost: 'bg-transparent text-purple-700 border border-transparent',
  },
  fuchsia: {
    solid: 'bg-fuchsia-500 text-white border border-fuchsia-500',
    outline: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-300',
    ghost: 'bg-transparent text-fuchsia-700 border border-transparent',
  },
  pink: {
    solid: 'bg-pink-500 text-white border border-pink-500',
    outline: 'bg-pink-50 text-pink-700 border border-pink-300',
    ghost: 'bg-transparent text-pink-700 border border-transparent',
  },
  rose: {
    solid: 'bg-rose-500 text-white border border-rose-500',
    outline: 'bg-rose-50 text-rose-700 border border-rose-300',
    ghost: 'bg-transparent text-rose-700 border border-transparent',
  },
  primary: {
    solid: 'bg-[var(--zt-primary,#0f172a)] text-[var(--zt-primary-foreground,#ffffff)] border border-[var(--zt-primary,#0f172a)]',
    outline: 'bg-[var(--zt-primary-50,#ffffff)] text-[var(--zt-primary,#0f172a)] border border-[var(--zt-primary,#0f172a)] dark:bg-slate-900',
    ghost: 'bg-transparent text-[var(--zt-primary,#0f172a)] border border-transparent',
  },
};
type BadgeColor = keyof typeof badgeVariantClasses;

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
  red: 'dark:bg-red-950/40 dark:border-red-800 dark:text-red-400',
  orange: 'dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-400',
  amber: 'dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400',
  yellow: 'dark:bg-yellow-950/40 dark:border-yellow-800 dark:text-yellow-400',
  lime: 'dark:bg-lime-950/40 dark:border-lime-800 dark:text-lime-400',

  green: 'dark:bg-green-950/40 dark:border-green-800 dark:text-green-400',
  emerald: 'dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400',
  teal: 'dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400',
  cyan: 'dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-400',

  sky: 'dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-400',
  blue: 'dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400',
  indigo: 'dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400',

  violet: 'dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-400',
  purple: 'dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-400',
  fuchsia: 'dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-400',
  pink: 'dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-400',
  rose: 'dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400',
};

const darkVariantClasses = computed((): string => {
  const color = normalizeColor(props.color);
  const variant = normalizeVariant(props.variant);

  if (neutralColors.has(color)) {
    if (variant === 'solid') {
      return 'dark:border-slate-700 dark:bg-slate-950 dark:text-white';
    }
    return 'dark:border-slate-700 dark:bg-transparent dark:text-slate-100';
  }

  if (color === 'primary') {
    if (variant === 'solid') {
      return 'dark:bg-[var(--zt-primary,#f8fafc)] dark:text-[var(--zt-primary-foreground,#020617)] dark:border-[var(--zt-primary,#f8fafc)]';
    }
    return 'dark:border-[var(--zt-primary,#f8fafc)] dark:bg-[var(--zt-primary-50,#000000)] dark:text-[var(--zt-primary,#f8fafc)]';
  }

  if (variant !== 'outline') {
    return '';
  }

  const staticDark = semanticDarkClasses[color];
  if (staticDark) {
    return staticDark;
  }

  return `dark:bg-${color}-950/40 dark:border-${color}-800 dark:text-${color}-400`;
});

const badgeClasses = computed((): string => {
  const color = normalizeColor(props.color);
  const variant = normalizeVariant(props.variant);
  const staticClasses = badgeVariantClasses[color as BadgeColor]?.[variant];

  if (staticClasses) {
    return staticClasses;
  }

  const dynamicClasses: Record<BadgeVariant, string> = {
    solid: `bg-${color}-500 text-white border border-${color}-500`,
    outline: `bg-${color}-50 text-${color}-700 border border-${color}-300`,
    ghost: `bg-transparent text-${color}-700 border border-transparent`,
  };

  return dynamicClasses[variant];
});

const sizeClasses: Record<BadgeSize, string> = {
  default: 'min-w-16 px-3 py-1 text-xs leading-4 rounded-md',
  sm: 'min-w-10 px-2 py-0.5 text-xs leading-4 rounded-md',
  xs: 'min-w-4 px-1.5 py-0.5 text-[10px] leading-3 rounded-full',
};

const rootClasses = computed((): string =>
  twMerge([
    'zt-badge inline-flex items-center justify-center gap-1 font-medium',
    sizeClasses[props.size] ?? sizeClasses.default,
    props.round ? 'rounded-full' : '',
    badgeClasses.value,
    tableConfig.value.darkMode.enabled ? darkVariantClasses.value : '',
    normalizeClass(attrs.class)
  ].join(' '))
);

const spanAttrs = computed(() => {
  const rest = { ...attrs };
  delete rest.class;
  return rest;
});
</script>

<template>
  <span
    :data-variant="normalizeVariant(props.variant)"
    :data-color="normalizeColor(props.color)"
    :class="rootClasses"
    v-bind="spanAttrs"
  >
    <CommonIcon v-if="icon" :icon="icon" :data-icon="icon" aria-hidden="true" class="size-4 shrink-0" />
    <slot />
  </span>
</template>
