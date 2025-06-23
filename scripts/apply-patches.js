#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const patchesDir = path.join(__dirname, '..', 'patches');
const libxsltDir = path.join(__dirname, '..', 'deps', 'libxslt');

// Check if patches have already been applied
const patchedMarker = path.join(libxsltDir, '.patched');
if (fs.existsSync(patchedMarker)) {
  console.log('Patches already applied');
  process.exit(0);
}

// Get all patch files
const patches = fs.readdirSync(patchesDir)
  .filter(f => f.endsWith('.patch'))
  .sort();

console.log('Applying patches to libxslt...');

// Apply each patch
patches.forEach(patchFile => {
  const patchPath = path.join(patchesDir, patchFile);
  console.log(`Applying ${patchFile}...`);
  
  try {
    execSync(`patch -p1 < ${patchPath}`, {
      cwd: libxsltDir,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Failed to apply patch ${patchFile}`);
    process.exit(1);
  }
});

// Create marker file
fs.writeFileSync(patchedMarker, new Date().toISOString());
console.log('All patches applied successfully');