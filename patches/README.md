# libxslt Patches

This directory contains patches that are applied to the libxslt submodule during the build process.

## Why Patches?

Instead of modifying the libxslt submodule directly (which is bad practice), we maintain patches that are automatically applied during installation. This approach:

- Keeps the submodule clean and in sync with upstream
- Makes our modifications explicit and documented
- Allows easy updates to newer libxslt versions
- Ensures reproducible builds
- Works well with CI/CD systems

## Current Patches

### 001-fix-xmlHashScanner-signature.patch

**Purpose**: Fixes a function signature compatibility issue in `libxslt/extensions.c`

**Issue**: The `xsltHashScannerModuleFree` function has an incompatible signature with the `xmlHashScanner` function pointer type in newer versions of libxml2.

**Fix**: Changes the third parameter from `xmlChar *` to `const xmlChar *` to match the expected signature.

## How It Works

1. The `scripts/apply-patches.js` script runs during `npm install` (via the `preinstall` hook)
2. It checks if patches have already been applied (via a `.patched` marker file)
3. If not, it applies all patches in order
4. The marker file prevents re-applying patches on subsequent builds

## Adding New Patches

1. Make your changes in the libxslt submodule
2. Generate a patch: `cd deps/libxslt && git diff > ../../patches/XXX-description.patch`
3. Revert the changes in the submodule: `git checkout -- .`
4. Test that the patch applies: `node scripts/apply-patches.js`
5. Document the patch in this README

## Updating libxslt

When updating the libxslt submodule:

1. Update the submodule: `git submodule update --remote deps/libxslt`
2. Remove the `.patched` marker: `rm deps/libxslt/.patched`
3. Test if existing patches still apply: `node scripts/apply-patches.js`
4. Fix any conflicts and update patches as needed
5. Test the build: `npm rebuild`