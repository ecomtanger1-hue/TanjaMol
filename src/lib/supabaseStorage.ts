import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';

function safeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'product';
}

function safeFileName(file: File, index: number) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  return `${Date.now()}-${index + 1}.${extension}`;
}

export async function uploadProductImages(files: File[], folder = 'product') {
  if (!supabase || !files.length) return [];

  const productFolder = safeSegment(folder);
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    const path = `${productFolder}/${safeFileName(file, index)}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return urls;
}
