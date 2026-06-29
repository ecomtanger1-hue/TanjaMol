import { spawnSync } from 'node:child_process';

const bucket = process.env.R2_BUCKET_NAME || 'tanjamall-product-images';
const domain = process.env.R2_PUBLIC_DOMAIN || 'images.tanjamall.com';
const workerDir = 'cloudflare/r2-upload-worker';

function run(command, args, options = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('This script prepares Cloudflare R2 resources for TanjaMall images.');
console.log(`Bucket: ${bucket}`);
console.log(`Public domain to connect in Cloudflare dashboard: ${domain}`);

run('npx', ['wrangler', 'r2', 'bucket', 'create', bucket]);

console.log('\nNow set Worker secrets. Paste values when Wrangler asks:');
console.log('- SUPABASE_URL: your Supabase project URL');
console.log('- SUPABASE_ANON_KEY: your public Supabase anon key');
console.log('- MIGRATION_UPLOAD_SECRET: a long random secret used only by the migration script');

run('npx', ['wrangler', 'secret', 'put', 'SUPABASE_URL'], { cwd: workerDir });
run('npx', ['wrangler', 'secret', 'put', 'SUPABASE_ANON_KEY'], { cwd: workerDir });
run('npx', ['wrangler', 'secret', 'put', 'MIGRATION_UPLOAD_SECRET'], { cwd: workerDir });
run('npx', ['wrangler', 'deploy'], { cwd: workerDir });

console.log('\nManual Cloudflare dashboard step still required:');
console.log(`Connect ${domain} as a custom domain for the ${bucket} R2 bucket.`);
console.log('After the Worker deploys, put its /upload URL in VITE_R2_UPLOAD_ENDPOINT.');
