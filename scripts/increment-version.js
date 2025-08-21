
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const versionPath = join(__dirname, '../client/src/lib/version.ts');

try {
  // Read the current version file
  const versionContent = readFileSync(versionPath, 'utf8');
  
  // Extract current version using regex
  const versionMatch = versionContent.match(/version:\s*"v?(\d+)\.(\d+)\.(\d+)"/);
  
  if (!versionMatch) {
    console.error('Could not find version in version.ts');
    process.exit(1);
  }
  
  const [, major, minor, patch] = versionMatch;
  const newMinor = parseInt(minor) + 1;
  const newVersion = `v${major}.${newMinor}.${patch}`;
  
  // Get current date for build date
  const buildDate = new Date().toISOString().split('T')[0];
  
  // Create new version content
  const newContent = `export const VERSION_INFO = {
  version: "${newVersion}",
  buildDate: "${buildDate}",
  releaseName: "Stable Release",
};
`;
  
  // Write the updated version file
  writeFileSync(versionPath, newContent);
  
  console.log(`Version updated to ${newVersion} (build date: ${buildDate})`);
  
} catch (error) {
  console.error('Error updating version:', error.message);
  process.exit(1);
}
