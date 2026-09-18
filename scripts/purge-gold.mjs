import fs from 'fs';
import path from 'path';

const dirsToScan = ['components', 'app'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace specific common patterns
  content = content.replace(/hover:text-\[#C5A880\]/gi, 'hover:text-[#73706A]');
  content = content.replace(/group-hover:text-\[#C5A880\]/gi, 'group-hover:text-[#73706A]');
  content = content.replace(/text-\[#C5A880\]/gi, 'text-[#0E0E0E]');
  content = content.replace(/bg-\[#C5A880\]\/15/gi, 'bg-[#F5F3EF]');
  content = content.replace(/bg-\[#C5A880\]\/20/gi, 'bg-[#F5F3EF]');
  content = content.replace(/bg-\[#C5A880\]\/30/gi, 'bg-[#F5F3EF]');
  content = content.replace(/bg-\[#C5A880\]/gi, 'bg-[#0E0E0E]');
  content = content.replace(/hover:bg-\[#C5A880\]/gi, 'hover:bg-[#262626]');
  content = content.replace(/hover:bg-\[#b5966c\]/gi, 'hover:bg-[#262626]');
  content = content.replace(/border-\[#C5A880\]\/30/gi, 'border-[#E8E5DE]');
  content = content.replace(/border-\[#C5A880\]/gi, 'border-[#0E0E0E]');
  content = content.replace(/fill-\[#C5A880\]/gi, 'fill-[#0E0E0E]');
  content = content.replace(/#C5A880/gi, '#0E0E0E');
  content = content.replace(/#A9895E/gi, '#262626');
  content = content.replace(/#8A6A3E/gi, '#0E0E0E');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Purged gold from: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

for (const dir of dirsToScan) {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
}
console.log('Gold purge completed.');
