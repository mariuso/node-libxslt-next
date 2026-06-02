#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('Testing package installation in path with spaces...');

// Windows is skipped for now: a fresh build into a spaced directory there is a
// separate concern (it also hits an EPERM on the loaded .node during cleanup),
// and is not yet verified. The Linux/macOS path below exercises the real fix.
if (process.platform === 'win32') {
  console.log('Skipping spaces-in-path test on Windows (not yet supported).');
  process.exit(0);
}

// Create a temporary directory with spaces in the name
const testDirName = 'test with spaces';
const testDir = path.join(os.tmpdir(), testDirName);

try {
  // Clean up any existing test directory
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  // Create test directory
  fs.mkdirSync(testDir, { recursive: true });
  console.log(`Created test directory: ${testDir}`);

  // Create a minimal package.json
  const packageJson = {
    name: 'spaces-test',
    version: '1.0.0',
    dependencies: {}
  };
  
  fs.writeFileSync(
    path.join(testDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );

  // Get the current package path and version
  const currentPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const packagePath = path.join(__dirname, '..');
  
  console.log(`Installing ${currentPackageJson.name}@${currentPackageJson.version} from ${packagePath}...`);

  // Install the current package in the test directory.
  // --install-links copies the package and BUILDS it inside the (spaced) test
  // directory, instead of symlinking back to the no-spaces source and rebuilding
  // there. Without it this test never actually compiled against a spaced path
  // and so could not catch the bug it is meant to guard (see #5).
  execSync(`npm install --install-links "${packagePath}"`, {
    cwd: testDir,
    stdio: 'inherit',
    timeout: 300000 // 5 minutes (a full from-source build)
  });

  // Require the installed package and run a real transform to confirm the native
  // module compiled, links against libxmljs2, and works from the spaced path.
  const installedPackagePath = path.join(testDir, 'node_modules', currentPackageJson.name);
  console.log(`Testing require + transform from: ${installedPackagePath}`);

  const libxslt = require(installedPackagePath);
  const stylesheet = libxslt.parse('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><out><xsl:value-of select="/in/@v"/></out></xsl:template></xsl:stylesheet>');
  const result = stylesheet.apply('<in v="spaces-ok"/>');
  if (result.indexOf('spaces-ok') === -1) {
    throw new Error('transform produced unexpected output: ' + result);
  }

  console.log('✅ SUCCESS: built, loaded and transformed in a path with spaces!');

} catch (error) {
  console.error('❌ FAILED: Error during spaces-in-path test:');
  console.error(error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
  process.exit(1);
} finally {
  // Clean up
  try {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log('Cleaned up test directory');
    }
  } catch (cleanupError) {
    console.warn('Warning: Could not clean up test directory:', cleanupError.message);
  }
}