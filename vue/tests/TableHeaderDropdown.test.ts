import { DOMWrapper, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TableHeaderDropdown from '../src/components/TableHeaderDropdown.vue';
import type { TableColumn } from '../src/types/table';
import { installTableTestHooks } from './tableTestUtils';
installTableTestHooks();
const column={attribute:'name',label:'Name',sortable:true,toggleable:true,visible:true,alignment:'left',meta:{}} as TableColumn;
describe('TableHeaderDropdown',()=>{it('emits sorting, sticking and hiding actions',async()=>{const w=mount(TableHeaderDropdown,{attachTo:document.body,props:{column,canStick:true,isSticky:false}});await w.find('[role="button"]').trigger('click');await nextTick();const items=document.body.querySelectorAll<HTMLElement>('[role="menuitem"]');await new DOMWrapper(items[0]).trigger('click');expect(w.emitted('sort')?.[0]).toEqual(['asc']);await w.find('[role="button"]').trigger('click');await nextTick();await new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[2]).trigger('click');expect(w.emitted('stick')).toBeTruthy();await w.find('[role="button"]').trigger('click');await nextTick();await new DOMWrapper(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')[3]).trigger('click');expect(w.emitted('hide')).toBeTruthy();});});