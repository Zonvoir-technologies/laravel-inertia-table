import { inject, provide, type ComponentInternalInstance, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import { performCustomAction, type ActionExecutionPayload, type CustomActionContext, type CustomActionHandler } from './useActions';
import type { TableAction, TableDefinition, TableRow, TableRowKey } from '../types/table';

type TableContext = ComputedRef<TableDefinition>;

const tableContextKey: InjectionKey<TableContext> = Symbol('ZonvoirTableContext');

export const provideTableContext = <T extends TableRow>(table: ComputedRef<TableDefinition<T>>): void => {
  provide(tableContextKey, table as ComputedRef<TableDefinition>);
};

export const useTableContext = (): TableContext | null => inject(tableContextKey, null);
type NestedCustomActionHandler = (
  action: TableAction,
  keys: TableRowKey[],
  onFinish: () => void,
  context?: CustomActionContext,
  hasChildListener?: boolean,
) => void | PromiseLike<void>;

const customActionKey: InjectionKey<NestedCustomActionHandler> = Symbol('ZonvoirCustomAction');

export const provideCustomActionHandler = (handler: NestedCustomActionHandler): void => provide(customActionKey, handler);
export const useCustomActionHandler = (): NestedCustomActionHandler | null => inject(customActionKey, null);

export const hasCustomActionListener = (instance: ComponentInternalInstance | null): boolean => {
  const props = instance?.vnode.props;

  return Boolean(
    props?.onCustomAction ||
    props?.['onCustom-action'] ||
    props?.onCustomActionOnce ||
    props?.['onCustom-actionOnce']
  );
};

type DispatchCustomActionOptions = {
  action: TableAction;
  keys: TableRowKey[];
  loadingAction: Ref<string | null>;
  instance: ComponentInternalInstance | null;
  emit: CustomActionHandler;
  parentHandler: NestedCustomActionHandler | null;
  context?: CustomActionContext;
  onExecuted?: (payload: ActionExecutionPayload) => void;
};

export const dispatchCustomAction = (options: DispatchCustomActionOptions): void => {
  performCustomAction(
    options.action,
    options.keys,
    options.loadingAction,
    (action, keys, onFinish, context) => {
      const hasChildListener = hasCustomActionListener(options.instance);
      options.emit(action, keys, onFinish, context);

      if (options.parentHandler) {
        return options.parentHandler(action, keys, onFinish, context, hasChildListener);
      }

      if (!hasChildListener) {
        onFinish();
      }
    },
    options.onExecuted,
    options.context,
  );
};
