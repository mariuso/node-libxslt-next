#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const patchesDir = path.join(__dirname, '..', 'patches');
const libxsltDir = path.join(__dirname, '..', 'deps', 'libxslt');

// Function to check if specific patches are applied
function isPatched() {
  const extensionsFile = path.join(libxsltDir, 'libxslt', 'extensions.c');
  if (!fs.existsSync(extensionsFile)) {
    return false;
  }
  
  const content = fs.readFileSync(extensionsFile, 'utf8');
  // Check for our specific patch - the const xmlChar parameter
  return content.includes('const xmlChar * name ATTRIBUTE_UNUSED');
}

// Check if patches have already been applied
const patchedMarker = path.join(libxsltDir, '.patched');
if (fs.existsSync(patchedMarker) && isPatched()) {
  console.log('Patches already applied');
  process.exit(0);
}

// Remove stale marker if patches aren't actually applied
if (fs.existsSync(patchedMarker)) {
  fs.unlinkSync(patchedMarker);
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
    execSync(`patch -p1 < "${patchPath}"`, {
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