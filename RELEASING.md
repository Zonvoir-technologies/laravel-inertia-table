# Releasing Zonvoir Table

This monorepo publishes two synchronized packages from a single canonical Git release tag:

- **Root Composer package**: `zonvoir/laravel-inertia-table` (auto-discovered by Packagist from Git tags).
- **Vue npm package (`vue/`)**: `@zonvoir/inertia-table-vue` (published to npm via GitHub Actions using OIDC Trusted Publishing).

---

## Release Architecture

| Package | Registry | Source Path | Version Source | Publishing Mechanism |
| --- | --- | --- | --- | --- |
| `zonvoir/laravel-inertia-table` | [Packagist](https://packagist.org/packages/zonvoir/laravel-inertia-table) | `/` (repo root) | Git tag (`vX.Y.Z`) | GitHub Webhook / Packagist auto-discovery |
| `@zonvoir/inertia-table-vue` | [npm](https://www.npmjs.com/package/@zonvoir/inertia-table-vue) | `vue/` | `vue/package.json` | GitHub Actions (`.github/workflows/publish-npm.yml`) via OIDC |

---

## One-Time Registry Setup

### 1. npm Trusted Publishing (OIDC)

Because `@zonvoir/inertia-table-vue` already exists on npm, configure **npm Trusted Publishing** to allow GitHub Actions to publish without static npm tokens:

1. Sign in to [npmjs.com](https://www.npmjs.com) with the owner/maintainer account for `@zonvoir`.
2. Navigate to: `https://www.npmjs.com/package/@zonvoir/inertia-table-vue/access`
3. Scroll down to **Trusted Publishers** and click **Add Trusted Publisher**.
4. Select **GitHub Actions**.
5. Configure the publisher parameters:
   - **GitHub organization or user**: `Zonvoir-technologies`
   - **Repository**: `laravel-inertia-table`
   - **Workflow filename**: `publish-npm.yml`
   - **Environment**: Leave blank (unless using a protected environment)
6. Save the trusted publisher.

> [!NOTE]
> No `NPM_TOKEN` repository secret is required when Trusted Publishing is configured. The workflow uses GitHub Actions OIDC (`id-token: write`).

### 2. Packagist Webhook Setup

1. Verify the package is registered at [Packagist](https://packagist.org/packages/zonvoir/laravel-inertia-table).
2. Ensure the repository URL is `https://github.com/Zonvoir-technologies/laravel-inertia-table`.
3. Set up the GitHub webhook or Packagist integration:
   - On GitHub: go to **Settings > Webhooks**.
   - Ensure the Packagist webhook payload URL is configured (`https://packagist.org/api/github?username=zonvoir`).
   - Alternatively, test manual synchronization on Packagist using the **Update** button.

---

## Maintainer Release Procedure

### Phase 1: Pre-Release Checklist

Before creating a release, complete and verify the following on your local machine:

1. **Clean default branch**:
   ```bash
   git checkout main
   git pull origin main
   git status
   ```
   Ensure the working tree is clean and all planned PRs are merged.

2. **Select semantic version**:
   Choose the next semantic version (e.g. `0.1.1` or `1.0.1`).
   > [!IMPORTANT]
   > npm versions and public Git tags are **immutable**. Check that the target version does not already exist:
   > ```bash
   > npm view @zonvoir/inertia-table-vue@<version>
   > git tag -l "v<version>"
   > ```

3. **Bump Vue package version**:
   Update `"version"` in `vue/package.json`:
   ```json
   {
     "name": "@zonvoir/inertia-table-vue",
     "version": "<version>"
   }
   ```
   Synchronize `vue/package-lock.json`:
   ```bash
   cd vue
   npm install --package-lock-only
   cd ..
   ```

4. **Update CHANGELOG.md**:
   Add a new section `## [<version>] - YYYY-MM-DD` detailing all additions, changes, and fixes.

5. **Verify Composer package has no version**:
   Ensure root `composer.json` does **not** contain a `"version"` property. Packagist infers versions from the Git tag.

6. **Execute local verification gates**:
   ```bash
   # 1. PHP Quality Gates
   composer validate --strict
   composer lint
   composer test

   # 2. Vue Adapter Quality Gates
   cd vue
   npm run typecheck
   npm run lint
   npm test
   npm run build
   npm pack --dry-run
   cd ..

   # 3. Release Version Alignment Check
   node scripts/verify-release-version.mjs v<version>
   ```

7. **Inspect npm package contents**:
   Review the output of `npm pack --dry-run` in `vue/`. Ensure it contains only:
   - `dist/` artifacts (`zonvoir-table.js`, `zonvoir-table.cjs`, declaration files)
   - `README.md`
   - `LICENSE`
   - `package.json`
   Ensure no test files, node_modules, or config files are included in the tarball.

8. **Commit and push release preparation**:
   ```bash
   git checkout -b release/v<version>
   git add vue/package.json vue/package-lock.json CHANGELOG.md
   git commit -m "chore(release): prepare v<version>"
   git push origin release/v<version>
   ```
   Open a pull request to `main`, wait for CI to pass, and merge.

---

### Phase 2: Create the GitHub Release

1. Navigate to **Releases > Draft a new release** on GitHub (`https://github.com/Zonvoir-technologies/laravel-inertia-table/releases/new`).
2. Fill in the release details:

| Field | Value | Example |
| --- | --- | --- |
| **Tag** | Create new tag `v<version>` | `v0.1.1` |
| **Target** | `main` (the merged commit) | `main` |
| **Title** | `v<version> - <Summary>` | `v0.1.1 - Maintenance & Release Automation` |
| **Release label** | None | None |
| **Pre-release** | Disabled | Unchecked |
| **Set as latest release** | Enabled | Checked |
| **Binary attachments** | None | Do not attach vendor or node_modules zips |

3. Copy the release notes for this version from `CHANGELOG.md`.
4. Click **Publish release**.

---

### Phase 3: Automated Publication

Once published, GitHub triggers `.github/workflows/publish-npm.yml`:

1. Open the Actions tab and monitor the **Publish Vue package** workflow run.
2. The workflow will:
   - Check out the exact tag `v<version>`.
   - Set up Node.js 24.
   - Verify that the Git tag matches `vue/package.json` and `vue/package-lock.json`.
   - Install dependencies (`npm ci`).
   - Run linter, type check, and Vitest suite.
   - Build the production distribution (`npm run build`).
   - Verify export targets exist in `dist/`.
   - Run `npm pack --dry-run`.
   - Publish to npm with `npm publish --access public` via OIDC Trusted Publishing.
3. Simultaneously, Packagist receives the tag event and registers the new version for `zonvoir/laravel-inertia-table`.

---

### Phase 4: Post-Release Verification

Run read-only verification commands to confirm registry visibility:

```bash
# Verify npm publication
npm view @zonvoir/inertia-table-vue version
npm view @zonvoir/inertia-table-vue dist-tags
npm view @zonvoir/inertia-table-vue@<version>

# Verify Packagist publication
composer show zonvoir/laravel-inertia-table --all
```

Verify consumer installations in clean temporary environments:

```bash
# Test Composer package install
composer require zonvoir/laravel-inertia-table:^<major>.<minor>

# Test Vue package install
npm install @zonvoir/inertia-table-vue@^<version>
```

---

## Failure and Recovery Rules

- **Validation fails before publication**: Fix the issue in a commit, update tests, and merge via PR before publishing.
- **Workflow / Network failure after release**: If the release tag was pushed and the workflow failed due to an ephemeral infrastructure issue (with no code defect), re-run the failed job from the GitHub Actions UI.
- **Defective code published**:
  - Never move, delete, or overwrite a public Git tag.
  - Never attempt to republish an existing npm version. npm versions are permanent.
  - Fix the defect in a new commit, bump to the next patch version (e.g. `v0.1.2`), and publish a new GitHub Release.
  - If necessary, deprecate the flawed npm version:
    ```bash
    npm deprecate @zonvoir/inertia-table-vue@<bad-version> "Critical defect: please upgrade to <new-version>"
    ```
