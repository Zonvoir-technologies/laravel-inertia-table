---
title: Actions API Reference
description: Complete method reference for Zonvoir\InertiaTable\Action configuring row actions, bulk actions, URLs, and callbacks.
---

`Action` is a serializable row and bulk action definition.

| Method | Purpose |
| --- | --- |
| `make()` / `create()` | Construct an action. Accepts string or callable name. |
| `name()` | Configure or dynamically resolve the action name. Accepts string or callable. |
| `key()` | Override the serialized key. |
| `url()` | Configure link metadata. |
| `handle()` | Configure backend action execution. |
| `authorize()` | Set authorization state. |
| `disabled()` | Set disabled state. |
| `hidden()` | Set hidden state. |
| `disabledAndHidden()` | Apply both states. |
| `asBulkAction()` | Enable row and bulk usage. |
| `onlyAsBulkAction()` | Enable only bulk usage. |
| `before()` / `after()` | Lifecycle callbacks. |
| `success()` / `error()` | Completion callbacks. |
| `confirm()` | Confirmation metadata. Accepts bool, string, array, or callable. |
| `icon()` / `tooltip()` | Display metadata. |
| `showLabel()` / `hideLabel()` | Label visibility. |
| `variant()` / `variantColor()` | Presentation metadata. |
| `asInfoButton()` / `asSuccessButton()` / `asDangerButton()` | Color helpers. |
| `class()` | Class metadata. |
| `meta()` / `data()` | Additional serialized metadata. |