import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const roots = ['src', 'supabase', 'scripts'].filter(existsSync);
const extensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.sql',
  '.ts',
  '.tsx',
]);

const ignoredDirectories = new Set([
  '.git',
  'backups',
  'dist',
  'node_modules',
]);

const suspiciousPatterns = [
  { label: 'mojibake Arabic marker', regex: /[\u00d8\u00d9][\u0080-\u00ff\u0600-\u06ff]?/u },
  { label: 'UTF-8 mojibake marker', regex: /[\u00c2\u00c3][\u0080-\u00ff]?/u },
  { label: 'replacement character', regex: /\uFFFD/u },
  { label: 'question-mark corruption', regex: /\?{4,}/u },
];

const findings = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!extensions.has(path.extname(entry.name))) continue;

    const text = readFileSync(fullPath, 'utf8');
    text.split(/\r?\n/).forEach((line, index) => {
      for (const pattern of suspiciousPatterns) {
        if (!pattern.regex.test(line)) continue;

        findings.push({
          file: fullPath,
          line: index + 1,
          label: pattern.label,
          preview: line.trim().slice(0, 180),
        });
        break;
      }
    });
  }
}

roots.forEach(walk);

if (findings.length) {
  console.error('Possible Arabic text encoding corruption found:');
  findings.slice(0, 80).forEach((finding) => {
    console.error(`${finding.file}:${finding.line} [${finding.label}] ${finding.preview}`);
  });

  if (findings.length > 80) {
    console.error(`...and ${findings.length - 80} more findings.`);
  }

  console.error('\nKeep Arabic source files as UTF-8. Avoid broad PowerShell Set-Content rewrites on Arabic-heavy files.');
  process.exit(1);
}

console.log('Arabic encoding check passed.');
