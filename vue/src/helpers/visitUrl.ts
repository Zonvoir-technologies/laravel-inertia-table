import { router } from '@inertiajs/vue3';
import type { TableMeta } from '../types/table';

export type VisitUrlOptions = {
  replace?: boolean;
  data?: TableMeta;
  only?: string[];
  except?: string[];
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  preserveScroll?: boolean;
  preserveState?: boolean;
}

export function visitUrl(url: string, options: VisitUrlOptions = {}): void {
  router.visit(url, {
    preserveState: true,
    preserveScroll: true,
    ...options
  });
}
