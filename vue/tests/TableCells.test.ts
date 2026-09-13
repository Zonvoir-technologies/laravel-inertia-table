import { mount } from '@vue/test-utils';
import { Table } from '../src';
import { installTableTestHooks, imageConfig } from './tableTestUtils';

installTableTestHooks();

describe('Table Cells', () => {
  it('renders a single image with cell content', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{
            id: 1,
            name: 'Ada',
            _column_images: { name: imageConfig({ rounded: true, alt: 'Ada avatar' }) }
          }]
        }
      }
    });

    const image = wrapper.find('[data-test="table-image"]');

    expect(image.attributes('src')).toBe('/avatars/ada.png');
    expect(image.attributes('alt')).toBe('Ada avatar');
    expect(image.classes()).toContain('size-6');
    expect(image.classes()).toContain('rounded-full');
    expect(wrapper.text()).toContain('Ada');
  });

  it('renders multiple images', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{
            id: 1,
            name: 'Ada',
            _column_images: { name: imageConfig({ url: null, urls: ['/1.png', '/2.png', '/3.png'] }) }
          }]
        }
      }
    });

    expect(wrapper.findAll('[data-test="table-image"]')).toHaveLength(3);
  });

  it('renders icons instead of images', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{
            id: 1,
            name: 'Ada',
            _column_images: { name: imageConfig({ url: null, icon: 'user' }) }
          }]
        }
      }
    });

    expect(wrapper.find('[data-test="table-image-icon"]').attributes('data-icon')).toBe('user');
    expect(wrapper.find('[data-test="table-image"]').exists()).toBe(false);
  });

  it('positions images after content', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{
            id: 1,
            name: 'Ada',
            _column_images: { name: imageConfig({ position: 'end' }) }
          }]
        }
      }
    });

    expect(wrapper.find('[data-test="table-image-wrapper"]').classes()).toContain('flex-row-reverse');
  });

  it('renders an overflow indicator when image limits hide images', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'name', label: 'Name' }],
          rows: [{
            id: 1,
            name: 'Ada',
            _column_images: {
              name: imageConfig({ url: null, urls: ['/1.png', '/2.png', '/3.png', '/4.png', '/5.png'], limit: 3 })
            }
          }]
        }
      }
    });

    expect(wrapper.findAll('[data-test="table-image"]')).toHaveLength(3);
    expect(wrapper.find('[data-test="table-image-overflow"]').text()).toBe('+2');
  });

  it('uses custom dimensions instead of size classes', () => {
    const wrapper = mount(Table, {
      props: {
        selectable: false,
        table: {
          name: 'Users',
          columns: [{ attribute: 'avatar', label: 'Avatar', type: 'image' }],
          rows: [{
            id: 1,
            avatar: '/avatars/ada.png',
            _column_images: { avatar: imageConfig({ width: 40, height: 24, size: 'extra-large' }) }
          }]
        }
      }
    });

    const image = wrapper.find('[data-test="table-image"]');

    expect(image.attributes('style')).toContain('width: 40px');
    expect(image.attributes('style')).toContain('height: 24px');
    expect(image.classes()).not.toContain('size-10');
    expect(wrapper.find('tbody td[data-column="avatar"]').text()).not.toContain('/avatars/ada.png');
  });
});
