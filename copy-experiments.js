import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const experimentFolders = readdirSync('.').filter(name => name.match(/^\d{4}-\d{2}-\d{2}-/));
const skipPatterns = ['node_modules', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', '.git', 'vite.config.js', 'scripts'];

// Reusable recursive copy function
const copyRecursive = (src, dest, skip = []) => {
  const entries = readdirSync(src, { withFileTypes: true });
  entries.forEach(entry => {
    // Skip unwanted files/folders
    if (skip.includes(entry.name)) {
      return;
    }

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

// Copy experiment folders
experimentFolders.forEach(folder => {
  const destPath = join(distDir, folder);
  mkdirSync(destPath, { recursive: true });
  copyRecursive(folder, destPath, skipPatterns);
  console.log(`Copied ${folder} to dist/`);
});

// Copy shared folder
const sharedPath = './shared';
const sharedDestPath = join(distDir, 'shared');
mkdirSync(sharedDestPath, { recursive: true });
copyRecursive(sharedPath, sharedDestPath);
console.log('Copied shared/ to dist/');

console.log(`✓ Copied ${experimentFolders.length} experiment folders + shared`);
