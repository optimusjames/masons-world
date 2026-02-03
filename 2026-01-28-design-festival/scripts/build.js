#!/usr/bin/env node

import { execSync } from 'child_process'
import { readdirSync, unlinkSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const assetsDir = join(rootDir, 'assets')
const indexPath = join(rootDir, 'index.html')

console.log('Build script starting...\n')

// Step 1: Clean old hashed assets
console.log('1. Cleaning old hashed assets...')
try {
  const files = readdirSync(assetsDir)
  const hashedFiles = files.filter(f => /index-[A-Za-z0-9]+\.(js|css)$/.test(f))
  hashedFiles.forEach(f => {
    unlinkSync(join(assetsDir, f))
    console.log(`   Removed: ${f}`)
  })
  if (hashedFiles.length === 0) {
    console.log('   No old hashed files to remove')
  }
} catch (e) {
  console.log('   Assets directory empty or not found, continuing...')
}

// Step 2: Reset index.html to dev mode
console.log('\n2. Resetting index.html to dev mode...')
let html = readFileSync(indexPath, 'utf-8')

// Remove prod script/link tags and add dev script
html = html.replace(/<script type="module" crossorigin src="\.\/assets\/index-[^"]+\.js"><\/script>\s*\n?\s*/g, '')
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/index-[^"]+\.css">\s*\n?\s*/g, '')

// Add dev script if not present
if (!html.includes('src="/src/main.jsx"')) {
  html = html.replace('</head>', '    <script type="module" src="/src/main.jsx"></script>\n  </head>')
}

writeFileSync(indexPath, html)
console.log('   Reset to dev mode')

// Step 3: Run vite build
console.log('\n3. Running vite build...')
try {
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' })
  console.log('\nBuild complete! index.html is ready to commit.')
} catch (e) {
  console.error('\nBuild failed!')
  process.exit(1)
}
