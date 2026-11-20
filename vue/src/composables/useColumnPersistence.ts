import { ref, type Ref } from 'vue';
import type { TableDefinition, TableResource, TableColumn } from '../types/table';

export interface UseColumnPersistenceOptions {
  table?: TableDefinition | TableResource;
  tableName?: string;
  endpoint?: string;
  resetEndpoint?: string;
  debounceMs?: number;
}

export interface UseColumnPersistenceReturn {
  isSaving: Ref<boolean>;
  persistColumnOrder: (columns: Array<string | TableColumn>) => Promise<boolean>;
  resetColumnOrder: () => Promise<boolean>;
}

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

export function useColumnPersistence(
  options: UseColumnPersistenceOptions = {}
): UseColumnPersistenceReturn {
  const isSaving = ref(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const debounceMs = options.debounceMs ?? 300;

  const resolveTableName = (): string => {
    if (options.tableName) {
      return options.tableName;
    }

    const table = options.table;
    if (table) {
      if (typeof table.name === 'string' && table.name !== '') {
        return table.name;
      }
      const tableMetaVal = table.meta?.table;
      if (typeof tableMetaVal === 'string' && tableMetaVal !== '') {
        return tableMetaVal;
      }
    }

    return '';
  };

  const resolveEndpoint = (isReset = false): string => {
    const meta = options.table?.meta;
    if (isReset) {
      if (options.resetEndpoint) {
        return options.resetEndpoint;
      }
      if (typeof meta?.preferenceResetEndpoint === 'string') {
        return meta.preferenceResetEndpoint;
      }
    } else {
      if (options.endpoint) {
        return options.endpoint;
      }
      if (typeof meta?.preferenceEndpoint === 'string') {
        return meta.preferenceEndpoint;
      }
    }

    return '/zonvoir-table/preferences';
  };

  const persistColumnOrder = (columns: Array<string | TableColumn>): Promise<boolean> => {
    const tableName = resolveTableName();
    if (!tableName) {
      return Promise.resolve(false);
    }

    const columnKeys: string[] = columns.map((col: string | TableColumn): string =>
      typeof col === 'string' ? col : (col.attribute ?? col.key ?? col.name ?? '')
    ).filter(Boolean);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    return new Promise<boolean>((resolve) => {
      debounceTimer = setTimeout(async () => {
        isSaving.value = true;
        try {
          const endpoint = resolveEndpoint(false);
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...xsrfHeaders(),
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({
              table: tableName,
              columns: columnKeys,
            }),
          });

          resolve(response.ok);
        } catch {
          resolve(false);
        } finally {
          isSaving.value = false;
        }
      }, debounceMs);
    });
  };

  const resetColumnOrder = async (): Promise<boolean> => {
    const tableName = resolveTableName();
    if (!tableName) {
      return false;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    isSaving.value = true;
    try {
      const endpoint = resolveEndpoint(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...xsrfHeaders(),
      };

      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers,
        body: JSON.stringify({
          table: tableName,
        }),
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return {
    isSaving,
    persistColumnOrder,
    resetColumnOrder,
  };
}
