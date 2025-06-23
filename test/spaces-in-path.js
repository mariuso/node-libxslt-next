#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('Testing package installation in path with spaces...');

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

  // Install the current package in the test directory
  execSync(`npm install "${packagePath}"`, {
    cwd: testDir,
    stdio: 'inherit',
    timeout: 120000 // 2 minutes timeout
  });

  // Try to require the installed package
  const installedPackagePath = path.join(testDir, 'node_modules', currentPackageJson.name);
  console.log(`Testing require from: ${installedPackagePath}`);
  
  // This will verify that the native module compiled and can be loaded
  require(installedPackagePath);
  
  console.log('✅ SUCCESS: Package installed and loaded successfully in path with spaces!');

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