import { siteConfig } from './config';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.company.name,
    url: siteConfig.company.url,
    logo: siteConfig.company.logo,
    sameAs: [
      siteConfig.company.github,
      siteConfig.company.x,
      siteConfig.company.linkedin,
    ],
  };
}

export function generateSoftwareSourceCodeSchema() {
  return {
    '@type': 'SoftwareSourceCode',
    '@id': `${siteConfig.siteUrl}/#software`,
    name: siteConfig.name,
    programmingLanguage: ['PHP', 'Vue', 'TypeScript'],
    codeRepository: siteConfig.repository,
    license: siteConfig.license,
    description: siteConfig.defaultDescription,
    runtimePlatform: 'PHP 8.3+, Laravel 11/12/13, Inertia.js 2.x/3.x, Vue 3.4+, Tailwind CSS 3.4+/4.0+',
    author: {
      '@id': `${siteConfig.siteUrl}/#organization`,
    },
  };
}

export function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${siteConfig.siteUrl}/#website`,
    url: siteConfig.siteUrl,
    name: `${siteConfig.name} Documentation`,
    description: siteConfig.defaultDescription,
    inLanguage: siteConfig.defaultLocale,
    publisher: {
      '@id': `${siteConfig.siteUrl}/#organization`,
    },
  };
}

const sectionLabels: Record<string, string> = {
  'getting-started': 'Getting Started',
  'core-concepts': 'Usage & Core Concepts',
  advanced: 'Advanced Guides',
  api: 'API Reference',
};

const sectionLandingUrls: Record<string, string> = {
  'getting-started': `${siteConfig.siteUrl}/getting-started/introduction/`,
  'core-concepts': `${siteConfig.siteUrl}/core-concepts/basic-usage/`,
  advanced: `${siteConfig.siteUrl}/advanced/slots/`,
  api: `${siteConfig.siteUrl}/api/`,
};

export function generateBreadcrumbSchema(slug: string, title: string) {
  if (!slug || slug === 'index' || slug === '/') {
    return null;
  }

  const parts = slug.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    { name: 'Docs Home', url: `${siteConfig.siteUrl}/` },
  ];

  if (parts.length > 1) {
    const section = parts[0];
    const sectionName = sectionLabels[section] || section;
    const sectionUrl = sectionLandingUrls[section] || `${siteConfig.siteUrl}/${section}/`;
    items.push({ name: sectionName, url: sectionUrl });
  }

  items.push({
    name: title,
    url: `${siteConfig.siteUrl}/${slug}/`,
  });

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateTechArticleSchema(
  slug: string,
  title: string,
  description?: string,
  canonicalUrl?: string
) {
  if (!slug || slug === 'index' || slug === '/') {
    return null;
  }

  const url = canonicalUrl || `${siteConfig.siteUrl}/${slug}/`;
  const parts = slug.split('/').filter(Boolean);
  const section = parts.length > 1 ? parts[0] : 'Documentation';
  const sectionName = sectionLabels[section] || section;

  return {
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: title,
    description: description || siteConfig.defaultDescription,
    url,
    mainEntityOfPage: url,
    inLanguage: siteConfig.defaultLocale,
    isPartOf: {
      '@id': `${siteConfig.siteUrl}/#website`,
    },
    about: {
      '@id': `${siteConfig.siteUrl}/#software`,
    },
    publisher: {
      '@id': `${siteConfig.siteUrl}/#organization`,
    },
    articleSection: sectionName,
    proficiencyLevel: 'Intermediate',
  };
}
