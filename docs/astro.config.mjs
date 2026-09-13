import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://zonvoir-table.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    starlight({
      disable404Route: true,
      title: 'Zonvoir Table',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Zonvoir Table Logo',
      },
      favicon: '/favicon.ico',
      description: 'Documentation for Zonvoir Table, the Laravel and Inertia Vue package for expressive, configurable Eloquent data tables.',
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: `
            const revealApiSidebar = () => {
              if (!window.location.pathname.startsWith('/api')) return;

              const sidebar = document.getElementById('starlight__sidebar');
              const apiGroup = [...document.querySelectorAll('#starlight__sidebar details')]
                .find((group) => group.querySelector('summary')?.textContent?.trim().includes('API Reference'));

              if (!sidebar || !apiGroup) return;

              apiGroup.open = true;
              requestAnimationFrame(() => {
                sidebar.scrollTo({
                  top: Math.max(0, apiGroup.offsetTop - (sidebar.clientHeight - apiGroup.offsetHeight) / 2),
                  behavior: 'instant',
                });
              });
            };

            document.addEventListener('DOMContentLoaded', revealApiSidebar);
            document.addEventListener('astro:page-load', revealApiSidebar);
          `,
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: `${site}/zonvoir-table-social-card.png`,
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'Zonvoir Table — Laravel and Inertia tables, made expressive.',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: `${site}/zonvoir-table-social-card.png`,
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Zonvoir-technologies/laravel-inertia-table',
        },
        {
          icon: 'x.com',
          label: 'X',
          href: 'https://x.com/ZonvoirTable',
        },
        {
          icon: 'linkedin',
          label: 'LinkedIn',
          href: 'https://in.linkedin.com/company/zonvoir-table',
        },
      ],
      customCss: ['./src/styles/docs.css'],
      components: {
        Head: './src/components/seo/Head.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Hero: './src/components/HomeHero.astro',
        Footer: './src/components/Footer.astro',
        PageFrame: './src/components/PageFrame.astro',
        SocialIcons: './src/components/HeaderLinks.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Requirements', slug: 'getting-started/requirements' },
            { label: 'Installation', slug: 'getting-started/installation' },
          ],
        },
        {
          label: 'Usage',
          items: [
            { label: 'Generate Tables', slug: 'core-concepts/generate-tables' },
            { label: 'Basic Usage', slug: 'core-concepts/basic-usage' },
            { label: 'Transform Data', slug: 'core-concepts/transform-data' },
            { label: 'Multiple Tables', slug: 'core-concepts/multiple-tables' },
            { label: 'Columns', slug: 'core-concepts/columns' },
            { label: 'Toggle Columns', slug: 'core-concepts/toggle-columns' },
            { label: 'Sorting', slug: 'core-concepts/sorting' },
            { label: 'Searching', slug: 'core-concepts/searching' },
            { label: 'Pagination', slug: 'core-concepts/pagination' },
            { label: 'Sticky Columns and Header', slug: 'core-concepts/sticky-columns' },
            { label: 'Empty State', slug: 'core-concepts/empty-state' },
            { label: 'Images', slug: 'core-concepts/images' },
            { label: 'Icons', slug: 'core-concepts/icons' },
            { label: 'Row Links', slug: 'core-concepts/row-links' },
            { label: 'Row Actions', slug: 'core-concepts/row-actions' },
            { label: 'Bulk Actions', slug: 'core-concepts/bulk-actions' },
            { label: 'Exports', slug: 'core-concepts/exports' },
          ],
        },
        {
          label: 'Advanced',
          items: [
            { label: 'Slots', slug: 'advanced/slots' },
            { label: 'Styling', slug: 'advanced/styling' },
            { label: 'Variants', slug: 'advanced/variants' },
            { label: 'Colors', slug: 'advanced/colors' },
            { label: 'Dark Mode', slug: 'advanced/dark-mode' },
            { label: 'Custom Table', slug: 'advanced/custom-table' },
            { label: 'Translations', slug: 'advanced/translations' },
            { label: 'Table Icons', slug: 'advanced/table-icons' },
            { label: 'Template Refs', slug: 'advanced/template-refs' },
            { label: 'TypeScript', slug: 'advanced/typescript' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Namespaces', slug: 'api' },
            { label: 'Table', slug: 'api/table' },
            { label: 'Column', slug: 'api/column' },
            { label: 'Actions', slug: 'api/actions-reference' },
            { label: 'Exports', slug: 'api/exports' },
            { label: 'Builders', slug: 'api/builders' },
            { label: 'Configuration', slug: 'api/configuration' },
            { label: 'Frontend API', slug: 'api/frontend-api' },
            { label: 'Payload Shape', slug: 'api/payload' },
            { label: 'Enums', slug: 'api/enums' },
          ],
        },
      ],
    }),
  ],
});
