---
title: Installation & Setup
description: Install Zonvoir Table in your Laravel application via Composer and the Vue 3 adapter via npm, pnpm, or yarn, with Tailwind CSS setup.
---

Install the Laravel package and Vue adapter to start using Zonvoir Table in your application. If you are new to the package, review the [Introduction to Zonvoir Table](/getting-started/introduction/) and verify your environment meets the [system requirements](/getting-started/requirements/) (PHP 8.3+, Laravel 11/12/13, Vue 3.4+).

## Install the Laravel package

Install Zonvoir Table using Composer:

```bash
composer require zonvoir/laravel-inertia-table
```

The package auto-discovers its service provider in Laravel.

## Install the Vue adapter

Install the Vue adapter using your preferred JavaScript package manager:

```bash
npm install @zonvoir/inertia-table-vue
```

Or with pnpm:

```bash
pnpm add @zonvoir/inertia-table-vue
```

Or Yarn:

```bash
yarn add @zonvoir/inertia-table-vue
```

## Import the component

Import `ZonvoirTable` wherever you need to render a table:

```vue
<script setup lang="ts">
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';
</script>
```

You can then render a table payload returned by your Laravel application:

```vue
<template>
  <ZonvoirTable :table="users" />
</template>
```

## Configure Tailwind CSS

If your application uses Tailwind CSS 4, add the Zonvoir Table package to your source scanning configuration:

```css
@import "tailwindcss";

@source "../../node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}";
```

If you are using Tailwind CSS 3, add the package path to your `tailwind.config.js` `content` array:

```js
module.exports = {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.vue',
    './node_modules/@zonvoir/inertia-table-vue/**/*.{js,vue}',
  ],
};
```

This ensures Tailwind detects classes used by the Vue adapter when building your application's CSS.

## You're ready

Zonvoir Table is now installed.

Create your first table using the Artisan generator:

```bash
php artisan make:zon-table UsersTable --model=User
```

Then pass the generated table to an Inertia page:

```php
return inertia('Users', [
    'users' => UsersTable::make(),
]);
```

And render it with the Vue adapter:

```vue
<script setup lang="ts">
import { ZonvoirTable } from '@zonvoir/inertia-table-vue';

defineProps<{
  users: object;
}>();
</script>

<template>
  <ZonvoirTable :table="users" />
</template>
```

Continue to [Basic Usage](/core-concepts/basic-usage/) to learn how to configure your first table, or see [Generating Tables](/core-concepts/generate-tables/) for Artisan scaffolding options.
