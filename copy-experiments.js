import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const experimentFolders = readdirSync('.').filter(name => name.match(/^\d{4}-\d{2}-\d{2}-/));
const skipPatterns = ['node_modules', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', '.git', 'vite.config.js', 'scripts'];

experimentFolders.forEach(folder => {
  const destPath = join(distDir, folder);
  mkdirSync(destPath, { recursive: true });

  const copyRecursive = (src, dest) => {
    const entries = readdirSync(src, { withFileTypes: true });
    entries.forEach(entry => {
      // Skip unwanted files/folders
      if (skipPatterns.includes(entry.name)) {
        return;
      }

      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    });
  };

  copyRecursive(folder, destPath);
  console.log(`Copied ${folder} to dist/`);
});

console.log(`✓ Copied ${experimentFolders.length} experiment folders`);
