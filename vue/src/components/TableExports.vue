<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { router } from '@inertiajs/vue3';
import type { Page, PageProps } from '@inertiajs/core';
import type { TableDefinition, TableExport, TableRowKey, TableState } from '../types/table';
import { useTableContext } from '../composables/useTableContext';
import CommonButton from './Common/CommonButton.vue';
import CommonDropdown from './Common/CommonDropdown.vue';
import CommonAlert from './Common/CommonAlert.vue';
import { useTableConfiguration } from '../config/tableConfig';

type ExportExecutionPayload = { export: TableExport; response?: unknown };
type ExportAlertPayload = { title?: string | null; message?: string | null };
type ExportRequestPayload = {
  table: unknown;
  export: string;
  keys: TableRowKey[];
  state: TableState;
  data: Record<string, unknown>;
};

interface ExportPageProps extends PageProps {
  flash?: {
    table_export_dialog?: ExportAlertPayload;
    table_export?: ExportAlertPayload;
  };
  table_export_dialog?: ExportAlertPayload;
  table_export?: ExportAlertPayload;
}

interface TableExportsProps {
  exports: TableExport[];
  selectedKeys?: TableRowKey[];
  state?: TableState;
}

const props = withDefaults(
  defineProps<TableExportsProps>(),
  {
    selectedKeys: (): TableRowKey[] => [],
    state: (): TableState => ({})
  }
);

const emit = defineEmits<{
  executed: [payload: ExportExecutionPayload];
}>();

const tableConfig = useTableConfiguration();
const loadingExport: Ref<string | null> = ref(null);
const exportAlertOpen: Ref<boolean> = ref(false);
const exportAlertTitle: Ref<string> = ref(tableConfig.value.labels.exportStarted);
const exportAlertMessage: Ref<string> = ref(tableConfig.value.labels.exportProcessing);
const injectedTable = useTableContext();

const currentTable: ComputedRef<TableDefinition | null> = computed((): TableDefinition | null => injectedTable?.value ?? null);
const visibleExports: ComputedRef<TableExport[]> = computed((): TableExport[] =>
  props.exports.filter((exportAction: TableExport): boolean => !exportAction.hidden)
);

const exportEndpoint = (exportAction: TableExport): string | null => {
  if (exportAction.endpoint) {
    return exportAction.endpoint;
  }

  return typeof currentTable.value?.meta.exportEndpoint === 'string' ? currentTable.value.meta.exportEndpoint : null;
};

const xsrfToken = (): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie: string | undefined = document.cookie
    .split('; ')
    .find((value: string): boolean => value.startsWith('XSRF-TOKEN='));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.slice('XSRF-TOKEN='.length));
  } catch {
    return null;
  }
};

const xsrfHeaders = (): Record<string, string> => {
  const token: string | null = xsrfToken();

  return token ? { 'X-XSRF-TOKEN': token } : {};
};

const appendFormData = (formData: FormData, name: string, value: unknown): void => {
  if (value === null || typeof value === 'undefined') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item: unknown, index: number): void => appendFormData(formData, `${name}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]: [string, unknown]): void => appendFormData(formData, `${name}[${key}]`, item));
    return;
  }

  formData.append(name, String(value));
};

const exportPayload = (table: TableDefinition, exportAction: TableExport): ExportRequestPayload => ({
  table: table.meta.table,
  export: exportAction.key,
  keys: props.selectedKeys,
  state: props.state,
  data: exportAction.data ?? {}
});

const exportFormData = (payload: ExportRequestPayload): FormData => {
  const formData: FormData = new FormData();

  Object.entries(payload).forEach(([key, value]: [string, unknown]): void => appendFormData(formData, key, value));

  return formData;
};

const filenameFromResponse = (response: Response, fallback: string): string => {
  const disposition: string | null = response.headers.get('content-disposition');
  const match: RegExpMatchArray | null = disposition?.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i) ?? null;

  return match?.[1] ? decodeURIComponent(match[1]) : fallback;
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url: string = URL.createObjectURL(blob);
  const link: HTMLAnchorElement = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const exportAlertPayloadFromPage = (page: Page<ExportPageProps>): ExportAlertPayload | null =>
  page.props.flash?.table_export_dialog
  ?? page.props.flash?.table_export
  ?? page.props.table_export_dialog
  ?? page.props.table_export
  ?? null;

const showExportAlert = (payload: ExportAlertPayload | null = null): void => {
  exportAlertTitle.value = typeof payload?.title === 'string' && payload.title.trim() !== ''
    ? payload.title
    : tableConfig.value.labels.exportStarted;
  exportAlertMessage.value = typeof payload?.message === 'string' && payload.message.trim() !== ''
    ? payload.message
    : tableConfig.value.labels.exportProcessing;
  exportAlertOpen.value = true;
};

const shouldShowProcessingAlert = (exportAction: TableExport): boolean =>
  Boolean(exportAction.queued) || exportAction.asDownload === false;

const isDisabled = (exportAction: TableExport): boolean =>
  Boolean(exportAction.disabled)
  || loadingExport.value === exportAction.key
  || (Boolean(exportAction.limitToSelectedRows) && props.selectedKeys.length === 0);

const submitDownload = async (exportAction: TableExport): Promise<void> => {
  if (typeof document === 'undefined' || !currentTable.value) {
    return;
  }

  const endpoint: string | null = exportEndpoint(exportAction);

  if (!endpoint) {
    return;
  }

  loadingExport.value = exportAction.key;

  try {
    const response: Response = await fetch(endpoint, {
      method: 'POST',
      body: exportFormData(exportPayload(currentTable.value, exportAction)),
      credentials: 'same-origin',
      headers: xsrfHeaders()
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}.`);
    }

    downloadBlob(await response.blob(), filenameFromResponse(response, `${exportAction.key}.xlsx`));
    emit('executed', { export: exportAction });
  } finally {
    loadingExport.value = null;
  }
};

const execute = (exportAction: TableExport): void => {
  const table: TableDefinition | null = currentTable.value;

  if (isDisabled(exportAction) || !table) {
    return;
  }

  if (exportAction.asDownload) {
    void submitDownload(exportAction);
    return;
  }

  const endpoint: string | null = exportEndpoint(exportAction);

  if (!endpoint) {
    emit('executed', { export: exportAction });
    return;
  }

  loadingExport.value = exportAction.key;
  router.visit(endpoint, {
    method: 'post',
    data: exportPayload(table, exportAction),
    preserveScroll: true,
    preserveState: shouldShowProcessingAlert(exportAction),
    onSuccess: (page: Page<ExportPageProps>): void => {
      if (shouldShowProcessingAlert(exportAction)) {
        showExportAlert(exportAlertPayloadFromPage(page));
      }
    },
    onFinish: (): void => {
      loadingExport.value = null;
      emit('executed', { export: exportAction });
    }
  });
};
</script>

<template>
  <CommonDropdown v-if="visibleExports.length > 0" align="end" :width="176" :aria-label="tableConfig.labels.exports">
    <template #trigger="{ toggle }">
      <CommonButton
        type="button"
        variant="outline"
        color="slate"
        :leading-icon="tableConfig.icons.export ? 'export' : undefined"
        @click.stop="toggle"
      >
        {{ tableConfig.labels.export }}
      </CommonButton>
    </template>

    <template #default="{ close }">
      <CommonButton
        v-for="exportAction in visibleExports"
        :key="exportAction.key"
        type="button"
        role="menuitem"
        size="sm"
        :disabled="isDisabled(exportAction)"
        :class="tableConfig.classes.exportMenuItem"
        variant="ghost"
        :loading="loadingExport === exportAction.key"
        @click="() => { close(); execute(exportAction) }"
        leading-icon="export"
      >
        <span>{{ exportAction.label }}</span>
      </CommonButton>
    </template>
  </CommonDropdown>

  <CommonAlert
    v-model="exportAlertOpen"
    :title="exportAlertTitle"
    :message="exportAlertMessage"
    :button-label="tableConfig.labels.ok"
  />
</template>
