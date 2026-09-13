import { mount } from '@vue/test-utils';
import ImageColumn from '../src/components/Column/ImageColumn.vue';
import type { ImageConfig, TableColumn, TableRow } from '../src/types/table';

const column = (type = 'image'): TableColumn => ({
  attribute: 'photo', label: 'Photo', type, sortable: false, toggleable: true,
  visible: true, alignment: 'left', meta: {}, cellClass: null,
});
const row = (photo: unknown): TableRow => ({ id: 1, photo } as TableRow);
const image = (overrides: Partial<ImageConfig> = {}): ImageConfig => ({
  url: '', urls: [], icon: null, size: 'medium', width: null, height: null,
  rounded: false, position: 'start', class: '', alt: 'Profile', title: '', limit: null,
  ...overrides,
});

describe('ImageColumn', () => {
  it('derives a single image from a non-empty image cell', () => {
    const wrapper = mount(ImageColumn, { props: { column: column(), row: row('https://example.test/a.png') } });
    expect(wrapper.find('[data-test="table-image"]').attributes('src')).toBe('https://example.test/a.png');
    expect(wrapper.find('[data-test="table-image"]').classes()).toContain('size-6');
  });

  it('renders image lists, overflow, dimensions, positioning, and slotted content', () => {
    const wrapper = mount(ImageColumn, {
      props: { column: column(), row: row(null), showContent: true, image: image({
        urls: ['a.png', '', 'b.png', 'c.png'], limit: 1, width: 24, height: 32,
        rounded: true, position: 'end', class: 'custom-image', title: 'Images',
      }) },
      slots: { default: 'Details' },
    });
    expect(wrapper.findAll('[data-test="table-image"]')).toHaveLength(1);
    expect(wrapper.find('[data-test="table-image-overflow"]').text()).toBe('+2');
    expect(wrapper.find('[data-test="table-image"]').attributes('style')).toContain('width: 24px');
    expect(wrapper.find('[data-test="table-image-wrapper"]').classes()).toContain('flex-row-reverse');
    expect(wrapper.text()).toContain('Details');
  });

  it('renders configured icons and content without an image', () => {
    const icon = mount(ImageColumn, { props: { column: column(), row: row(null), image: image({ icon: 'heroicons:user', size: 'large' }) } });
    expect(icon.find('[data-test="table-image-icon"]').attributes('data-icon')).toBe('heroicons:user');
    const content = mount(ImageColumn, { props: { column: column('text'), row: row(''), showContent: true }, slots: { default: 'Empty' } });
    expect(content.text()).toBe('Empty');
  });
});
