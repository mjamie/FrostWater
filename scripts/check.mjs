import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
let checked = 0;
const failures = [];
function verify(file, reference) {
  if (!reference || /^(?:[a-z]+:|\/\/|#)/i.test(reference)) return;
  const clean = reference.split(/[?#]/)[0];
  if (!clean || clean === '/') return;
  const target = path.resolve(reference.startsWith('/') ? root : path.dirname(file), clean.replace(/^\//, ''));
  checked++;
  if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)} -> ${reference}`);
}
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
for (const page of pages) {
  const file = path.join(root, page);
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/(?:src|href|action|poster)="([^"]+)"/g)) verify(file, match[1]);
}
for (const name of fs.readdirSync(path.join(root, 'assets/css'))) {
  const file = path.join(root, 'assets/css', name);
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) verify(file, match[1]);
}
const media = fs.readFileSync(path.join(root, 'assets/js/demo-media.js'), 'utf8');
for (const match of media.matchAll(/src:\s*'([^']+)'/g)) verify(path.join(root, 'index.html'), match[1]);
verify(path.join(root, 'contact.php'), 'includes/contact-email.php');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`PASS: ${checked} local page, stylesheet, font, module, media and PHP references.`);
