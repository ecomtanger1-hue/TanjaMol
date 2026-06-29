type Env = {
  PRODUCT_IMAGES: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  PUBLIC_IMAGE_BASE_URL: string;
  ALLOWED_ORIGINS?: string;
  MIGRATION_UPLOAD_SECRET?: string;
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type, x-migration-secret',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function safeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';
}

function mimeExtension(type: string) {
  if (type === 'image/webp') return 'webp';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/gif') return 'gif';
  if (type === 'image/svg+xml') return 'svg';
  return 'bin';
}

function makeObjectKey(folder: string, file: File) {
  const extension = mimeExtension(file.type);
  const token = crypto.randomUUID();
  return `${safeSegment(folder)}/${Date.now()}-${token}.${extension}`;
}

async function verifySupabaseAdmin(request: Request, env: Env) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const userResponse = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: authHeader,
    },
  });

  if (!userResponse.ok) return false;
  const user = await userResponse.json<{ id?: string }>();
  if (!user.id) return false;

  const adminUrl = new URL(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/admin_users`);
  adminUrl.searchParams.set('select', 'user_id');
  adminUrl.searchParams.set('user_id', `eq.${user.id}`);
  adminUrl.searchParams.set('limit', '1');

  const adminResponse = await fetch(adminUrl, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: authHeader,
    },
  });

  if (!adminResponse.ok) return false;
  const rows = await adminResponse.json<unknown[]>();
  return rows.length > 0;
}

function verifyMigrationSecret(request: Request, env: Env) {
  const configuredSecret = env.MIGRATION_UPLOAD_SECRET;
  if (!configuredSecret) return false;
  return request.headers.get('x-migration-secret') === configuredSecret;
}

export default {
  async fetch(request: Request, env: Env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, cors);

    const url = new URL(request.url);
    if (url.pathname !== '/upload') return jsonResponse({ error: 'Not found' }, 404, cors);

    const authorized = verifyMigrationSecret(request, env) || await verifySupabaseAdmin(request, env);
    if (!authorized) return jsonResponse({ error: 'Unauthorized' }, 401, cors);

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'product');
    if (!(file instanceof File)) return jsonResponse({ error: 'Missing image file' }, 400, cors);
    if (!file.type.startsWith('image/')) return jsonResponse({ error: 'Only image uploads are allowed' }, 400, cors);
    if (file.size > MAX_UPLOAD_BYTES) return jsonResponse({ error: 'Image is too large' }, 413, cors);

    const key = makeObjectKey(folder, file);
    await env.PRODUCT_IMAGES.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const publicBase = env.PUBLIC_IMAGE_BASE_URL.replace(/\/$/, '');
    return jsonResponse({ url: `${publicBase}/${key}`, key }, 200, cors);
  },
};
