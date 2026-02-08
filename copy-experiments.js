import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = './dist';

// Auto-discover dated experiment folders (YYYY-MM-DD-name)
const experimentFolders = readdirSync('.')
  .filter(name => name.match(/^\d{4}-\d{2}-\d{2}-/));

// Skip build artifacts and config files
const skipPatterns = [
  'node_modules',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  '.git',
  'vite.config.js',
  'scripts'
];

// Recursively copy directory contents
const copyRecursive = (src, dest, skip = []) => {
  const entries = readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    if (skip.includes(entry.name)) return;

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath, skip);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
};

// Copy all experiment folders
experimentFolders.forEach(folder => {
  const destPath = join(distDir, folder);
  mkdirSync(destPath, { recursive: true });
  copyRecursive(folder, destPath, skipPatterns);
  console.log(`✓ ${folder}`);
});

// Copy shared folder if it exists
if (existsSync('./shared')) {
  const sharedDestPath = join(distDir, 'shared');
  mkdirSync(sharedDestPath, { recursive: true });
  copyRecursive('./shared', sharedDestPath);
  console.log('✓ shared/');
}

console.log(`\nCopied ${experimentFolders.length} experiments to dist/`);
