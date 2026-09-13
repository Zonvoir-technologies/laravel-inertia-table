import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "astro build" first.');
  process.exit(1);
}

console.log('🔍 Starting production SEO verification...');

let errors = [];
let warnings = [];

// 1. Verify robots.txt
const robotsPath = path.join(distDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  errors.push('Missing robots.txt in build output.');
} else {
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  if (!robotsContent.includes('Sitemap: https://zonvoir-table.com/sitemap-index.xml')) {
    errors.push('robots.txt does not reference https://zonvoir-table.com/sitemap-index.xml');
  }
}

// 2. Verify sitemap
const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
if (!fs.existsSync(sitemapIndexPath)) {
  errors.push('Missing sitemap-index.xml in build output.');
}

const sitemapPath = path.join(distDir, 'sitemap-0.xml');
if (!fs.existsSync(sitemapPath)) {
  errors.push('Missing sitemap-0.xml in build output.');
}

// Helper to crawl all HTML files
function walk(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...walk(p));
    } else if (p.endsWith('.html')) {
      results.push(p);
    }
  }
  return results;
}

const htmlFiles = walk(distDir);
console.log(`Found ${htmlFiles.length} rendered HTML files in dist/`);

const pageIds = new Map();
const routes = new Set();

// First pass: register routes and IDs
for (const file of htmlFiles) {
  const rel = '/' + path.relative(distDir, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const route = rel === '//' ? '/' : rel;
  routes.add(route);

  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  pageIds.set(route, ids);
}

// Second pass: audit SEO tags, structured data, and links
for (const file of htmlFiles) {
  const rel = '/' + path.relative(distDir, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const route = rel === '//' ? '/' : rel;
  const is404 = route === '/404.html' || route === '/404/';
  const html = fs.readFileSync(file, 'utf8');

  // Title audit
  const titleMatches = [...html.matchAll(/<title>([^<]*)<\/title>/g)];
  if (titleMatches.length === 0) {
    errors.push(`[${route}] Missing <title> tag.`);
  } else if (titleMatches.length > 1) {
    errors.push(`[${route}] Duplicate <title> tags (${titleMatches.length}).`);
  } else {
    const title = titleMatches[0][1];
    if (!title || title.trim() === '') {
      errors.push(`[${route}] Empty <title> tag.`);
    }
    const brandOccurrences = (title.match(/Zonvoir Table/g) || []).length;
    if (brandOccurrences > 1) {
      errors.push(`[${route}] Duplicate brand in title: "${title}".`);
    }
    if (!is404) {
      if (title.length < 30) {
        errors.push(`[${route}] Title too short (${title.length} chars, recommended 30-60): "${title}".`);
      } else if (title.length > 60) {
        errors.push(`[${route}] Title too long (${title.length} chars, recommended 30-60): "${title}".`);
      }
    }
  }

  // Meta description audit (excluding 404)
  if (!is404) {
    const descMatches = [...html.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/g)];
    if (descMatches.length === 0) {
      errors.push(`[${route}] Missing <meta name="description"> tag.`);
    } else if (descMatches.length > 1) {
      errors.push(`[${route}] Duplicate <meta name="description"> tags (${descMatches.length}).`);
    } else if (!descMatches[0][1] || descMatches[0][1].trim() === '') {
      errors.push(`[${route}] Empty <meta name="description"> tag.`);
    }

    // Canonical link audit
    const canonicalMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]*)"/g)];
    if (canonicalMatches.length === 0) {
      errors.push(`[${route}] Missing <link rel="canonical"> tag.`);
    } else if (canonicalMatches.length > 1) {
      errors.push(`[${route}] Duplicate <link rel="canonical"> tags (${canonicalMatches.length}).`);
    } else {
      const canonical = canonicalMatches[0][1];
      if (!canonical.startsWith('https://zonvoir-table.com')) {
        errors.push(`[${route}] Canonical URL does not start with production domain: "${canonical}".`);
      }
      if (!canonical.endsWith('/')) {
        errors.push(`[${route}] Canonical URL does not end with trailing slash: "${canonical}".`);
      }
    }

    // Structured Data (JSON-LD) audit
    const ldJsonMatches = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    if (ldJsonMatches.length === 0) {
      errors.push(`[${route}] Missing JSON-LD structured data.`);
    } else {
      for (const m of ldJsonMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          if (!parsed['@context'] || !parsed['@graph']) {
            warnings.push(`[${route}] JSON-LD graph does not have standard @graph format.`);
          }
        } catch (e) {
          errors.push(`[${route}] Malformed JSON-LD: ${e.message}`);
        }
      }
    }

    // OpenGraph & Twitter audit
    if (!html.includes('property="og:title"')) errors.push(`[${route}] Missing og:title.`);
    if (!html.includes('property="og:description"')) errors.push(`[${route}] Missing og:description.`);
    if (!html.includes('property="og:url"')) errors.push(`[${route}] Missing og:url.`);
    if (!html.includes('property="og:image"')) errors.push(`[${route}] Missing og:image.`);
    if (!html.includes('name="twitter:card"')) errors.push(`[${route}] Missing twitter:card.`);
    if (!html.includes('name="twitter:site"')) errors.push(`[${route}] Missing twitter:site.`);
  }

  // Broken image source check
  if (html.includes('src="public/')) {
    errors.push(`[${route}] Invalid public/ asset path in rendered HTML.`);
  }

  // Image alt attribute check
  const imgMatches = [...html.matchAll(/<img([^>]*)>/g)];
  for (const m of imgMatches) {
    const attrs = m[1];
    const altMatch = attrs.match(/alt="([^"]*)"/);
    if (!altMatch || !altMatch[1] || altMatch[1].trim() === '') {
      errors.push(`[${route}] Image missing or empty alt attribute: <img${attrs}>`);
    }
  }

  // Internal link audit: only evaluate <a href="...">
  const anchorMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of anchorMatches) {
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:') ||
      href.startsWith('#')
    ) {
      if (href.startsWith('#')) {
        const hash = href.slice(1);
        const currentIds = pageIds.get(route);
        if (currentIds && !currentIds.has(hash)) {
          errors.push(`[${route}] Broken self-anchor link to "${href}".`);
        }
      }
      continue;
    }

    const [pathPart, hash] = href.split('#');
    let targetRoute = pathPart ? pathPart : route;
    if (targetRoute.startsWith('./')) targetRoute = targetRoute.slice(1);
    if (!targetRoute.endsWith('/') && !targetRoute.includes('.')) targetRoute += '/';

    // Check if target is a static file in dist/
    const staticFilePath = path.join(distDir, pathPart.startsWith('/') ? pathPart.slice(1) : pathPart);
    const isStaticFile = fs.existsSync(staticFilePath);

    // Check if internal route exists
    if (pathPart && !routes.has(targetRoute) && !routes.has(pathPart) && !isStaticFile) {
      errors.push(`[${route}] Broken internal link to "${href}" (resolved as "${targetRoute}").`);
    }

    // Check anchor validity if target route is an HTML page
    if (hash && (routes.has(targetRoute) || routes.has(pathPart))) {
      const targetIds = pageIds.get(targetRoute) || pageIds.get(pathPart);
      if (targetIds && !targetIds.has(hash)) {
        errors.push(`[${route}] Broken anchor link to "${href}" (anchor id "${hash}" not found in ${targetRoute}).`);
      }
    }
  }
}

console.log('--- Verification Summary ---');
if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('   ' + w));
}

if (errors.length > 0) {
  console.error(`❌ ${errors.length} SEO error(s) detected:`);
  errors.forEach((e) => console.error('   ' + e));
  process.exit(1);
} else {
  console.log('✅ ALL SEO AUDIT & VALIDATION CHECKS PASSED WITH ZERO ERRORS!');
}
