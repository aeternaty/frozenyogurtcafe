import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const allFiles = getAllFiles('src');
const files = allFiles.filter(f => f.match(/\.(astro|js|ts|jsx|tsx)$/));

const classes = new Set();
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/ri-[a-zA-Z0-9-]+/g);
  if (matches) {
    matches.forEach(m => classes.add(m));
  }
});

const baseClasses = ['ri-lg', 'ri-xl', 'ri-xxs', 'ri-xs', 'ri-sm', 'ri-1x', 'ri-2x', 'ri-3x', 'ri-4x', 'ri-5x', 'ri-6x', 'ri-7x', 'ri-8x', 'ri-9x', 'ri-10x', 'ri-fw'];
baseClasses.forEach(c => classes.add(c));

const css = fs.readFileSync('public/assets/css/remixicon.css', 'utf-8');

const headerMatch = css.match(/^[\s\S]*?(?=\.ri-[a-zA-Z0-9-]+:before)/);
const header = headerMatch ? headerMatch[0] : '';
console.log("Header length:", header.length);

let outCss = header;
for (const cls of classes) {
  // We need to escape \ properly if it occurs, but here we just construct regex
  try {
    const regex = new RegExp(`\\.${cls}:before\\s*{[^}]*}`, 'g');
    const matches = css.match(regex);
    if (matches) {
      outCss += matches.join('\n') + '\n';
    } else {
        const regex2 = new RegExp(`\\.${cls}::before\\s*{[^}]*}`, 'g');
        const matches2 = css.match(regex2);
        if (matches2) {
            outCss += matches2.join('\n') + '\n';
        }
    }
  } catch (e) {
    console.error("Regex error for", cls, e);
  }
}

console.log("Out CSS length:", outCss.length);
fs.writeFileSync('public/assets/css/remixicon.min.css', outCss.replace(/\s+/g, ' '));
console.log(`Purged remixicon.css. Found ${classes.size} unique ri- classes. Created public/assets/css/remixicon.min.css`);
