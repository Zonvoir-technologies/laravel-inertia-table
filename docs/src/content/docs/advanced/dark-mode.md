---
title: Dark Mode Configuration
description: Enable and customize built-in dark mode themes and CSS classes for Zonvoir Table with reactive Vue props.
---

Pass a boolean to config.darkMode on ZonvoirTable. When the value is true, the adapter adds its built-in dark classes to the table, toolbar, cells, menus, pagination, loading state, and empty state.

~~~vue
<script setup lang="ts">
import { ref } from 'vue';

const checked = ref(false);
</script>

<template>
  <label class="flex items-center gap-2">
    <input v-model="checked" type="checkbox">
    Dark mode
  </label>

  <ZonvoirTable :table="employees" :config="{ darkMode: checked }" />
</template>
~~~

Vue unwraps refs in templates, so checked is passed as true or false. You can also pass a normal boolean.

~~~vue
<ZonvoirTable :table="employees" :config="{ darkMode: true }" />
~~~

## Custom dark theme

Pass an object when you need dark mode and custom class overrides. Overrides are merged with the defaults.

~~~vue
<ZonvoirTable
  :table="employees"
  :config="{
    darkMode: { enabled: checked },
    classes: {
      rootDark: 'bg-zinc-950 text-zinc-100',
      headerCell: 'bg-zinc-900 text-zinc-100',
      bodyCell: 'bg-zinc-950 text-zinc-100'
    }
  }"
/>
~~~

The table root receives data-dark-mode="enabled" when dark mode is active. The optional darkMode.class and darkMode.attribute values are exposed as data-dark-class and data-dark-attribute for application-level theme integrations.

Slot content belongs to your application. Add your own dark utilities when rendering custom headers, cells, or empty states.

See [Styling](/advanced/styling/) for all configurable classes and [Slots](/advanced/slots/) for custom markup.