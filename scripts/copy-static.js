const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (exists) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.join(__dirname, '..', '.next', 'static');
const destDir = path.join(__dirname, '..', 'public', '_next', 'static');

console.log('Copying .next/static to public/_next/static...');
copyRecursiveSync(srcDir, destDir);
console.log('Successfully copied static Next.js assets to public/_next/static');
