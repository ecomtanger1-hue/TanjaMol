import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function readEnvFile(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const env = readEnvFile('.env.local');
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
  process.exitCode = 1;
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.storage.from('product-images').list('', { limit: 1 });

  if (error) {
    console.error(`product-images bucket check failed: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log('product-images bucket is reachable.');
  }
}
