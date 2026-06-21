import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';

function uploadError(message: string, cause?: unknown) {
  return new Error(`Supabase Storage upload failed: ${message}`, { cause });
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

function safeFileName(file: File, index: number) {
  const extension = (file.name.includes('.') ? file.name.split('.').pop() : 'jpg')?.replace(/[^a-z0-9]/gi, '') || 'jpg';
  return `${Date.now()}-${index + 1}.${extension}`;
}

export async function uploadProductImages(files: File[], folder = 'product') {
  if (!files.length) return [];
  if (!supabase) throw uploadError('Supabase is not configured.');

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw uploadError(sessionError.message, sessionError);
  if (!sessionData.session) throw uploadError('No active admin session. Sign in again and retry.');

  const productFolder = safeSegment(folder);
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const path = `${productFolder}/${safeFileName(file, index)}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) throw uploadError(error.message, error);

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return urls;
}
