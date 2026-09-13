import { inject, provide, type ComputedRef, type InjectionKey } from 'vue';
import type { TableDefinition, TableRow } from '../types/table';

type TableContext = ComputedRef<TableDefinition>;

const tableContextKey: InjectionKey<TableContext> = Symbol('ZonvoirTableContext');

export const provideTableContext = <T extends TableRow>(table: ComputedRef<TableDefinition<T>>): void => {
  provide(tableContextKey, table as ComputedRef<TableDefinition>);
};

export const useTableContext = (): TableContext | null => inject(tableContextKey, null);