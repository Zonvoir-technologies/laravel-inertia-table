#!/usr/bin/env node

/**
 * Validates that a Git release tag matches the version in vue/package.json and vue/package-lock.json.
 *
 * Usage:
 *   node scripts/verify-release-version.mjs [tag]
 *   GITHUB_REF_NAME=v1.0.0 node scripts/verify-release-version.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Strict SemVer 2.0.0 regex prefixed with 'v'
const TAG_REGEX = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

// SemVer 2.0.0 regex for manifest versions (without 'v')
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const EXPECTED_NPM_NAME = '@zonvoir/inertia-table-vue';

export function verifyReleaseVersion(rawTag, options = {}) {
  const baseDir = options.rootDir || rootDir;
  const tag = (rawTag || options.env?.GITHUB_REF_NAME || options.env?.RELEASE_TAG || '').trim();

  if (!tag) {
    throw new Error(
      'Missing release tag. Pass the Git tag as an argument or set GITHUB_REF_NAME.\n' +
      'Example: node scripts/verify-release-version.mjs v1.0.0'
    );
  }

  if (!TAG_REGEX.test(tag)) {
    throw new Error(
      `Invalid release tag '${tag}'. Release tags must strictly follow semantic versioning prefixed with 'v' ` +
      '(e.g., v1.0.0, v1.1.0-beta.1).'
    );
  }

  // Strip leading 'v'
  const expectedVersion = tag.slice(1);

  const pkgPath = join(baseDir, 'vue', 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`vue/package.json not found at: ${pkgPath}`);
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to parse vue/package.json: ${err.message}`);
  }

  if (pkg.name !== EXPECTED_NPM_NAME) {
    throw new Error(
      `Unexpected package name in vue/package.json: '${pkg.name}'. Expected '${EXPECTED_NPM_NAME}'.`
    );
  }

  if (!pkg.version || !SEMVER_REGEX.test(pkg.version)) {
    throw new Error(
      `Invalid version '${pkg.version}' in vue/package.json. Must be valid semantic versioning (e.g. 1.0.0).`
    );
  }

  if (pkg.version !== expectedVersion) {
    throw new Error(
      `Version mismatch detected!\n` +
      `  - Git release tag:       ${tag} (expected npm version: ${expectedVersion})\n` +
      `  - vue/package.json:      ${pkg.version}\n\n` +
      `How to fix:\n` +
      `  1. Update "version" in vue/package.json to "${expectedVersion}".\n` +
      `  2. Run 'npm install --package-lock-only' inside vue/ to update vue/package-lock.json.\n` +
      `  3. Commit and merge the version change before pushing tag '${tag}'.`
    );
  }

  const lockPath = join(baseDir, 'vue', 'package-lock.json');
  if (existsSync(lockPath)) {
    let lock;
    try {
      lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse vue/package-lock.json: ${err.message}`);
    }

    const lockVersion = lock.version;
    const rootPackageVersion = lock.packages?.['']?.version;

    if (lockVersion !== expectedVersion || (rootPackageVersion && rootPackageVersion !== expectedVersion)) {
      throw new Error(
        `vue/package-lock.json is out of sync with vue/package.json!\n` +
        `  - Expected version:              ${expectedVersion}\n` +
        `  - vue/package-lock.json version: ${lockVersion}\n` +
        (rootPackageVersion ? `  - packages[""].version:          ${rootPackageVersion}\n\n` : '\n') +
        `How to fix:\n` +
        `  Run 'npm install --package-lock-only' inside vue/ to synchronize the lockfile.`
      );
    }
  }

  return {
    tag,
    version: expectedVersion,
    packageName: pkg.name
  };
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tagArg = process.argv[2];
  try {
    const result = verifyReleaseVersion(tagArg, { env: process.env });
    console.log(
      `✓ Release version verification passed: Git tag "${result.tag}" matches ` +
      `"${result.packageName}" version "${result.version}".`
    );
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
    process.exit(1);
  }
}
