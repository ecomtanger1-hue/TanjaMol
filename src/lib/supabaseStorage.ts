import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const MAX_IMAGE_EDGE = 1600;
const IMAGE_QUALITY = 0.82;
const DEFAULT_R2_UPLOAD_ENDPOINT = 'https://tanjamall-r2-upload.ecomtanger1.workers.dev/upload';
const r2UploadEndpoint = (import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined) || DEFAULT_R2_UPLOAD_ENDPOINT;

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
  const extension = mimeExtension(file.type)
    || (file.name.includes('.') ? file.name.split('.').pop() : 'jpg')?.replace(/[^a-z0-9]/gi, '')
    || 'jpg';
  return `${Date.now()}-${index + 1}.${extension}`;
}

function mimeExtension(type: string) {
  if (type === 'image/webp') return 'webp';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/gif') return 'gif';
  return '';
}

function canCompressImage(file: File) {
  if (!file.type.startsWith('image/')) return false;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return false;
  return typeof createImageBitmap === 'function' && typeof document !== 'undefined';
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

function compressedImageName(file: File, type: string) {
  const extension = mimeExtension(type) || 'webp';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return `${baseName}.${extension}`;
}

async function compressImageForUpload(file: File) {
  if (!canCompressImage(file)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / bitmap.width, MAX_IMAGE_EDGE / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const webpBlob = await canvasToBlob(canvas, 'image/webp', IMAGE_QUALITY);
    const fallbackBlob = webpBlob || await canvasToBlob(canvas, 'image/jpeg', IMAGE_QUALITY);
    if (!fallbackBlob || fallbackBlob.size >= file.size) return file;

    return new File([fallbackBlob], compressedImageName(file, fallbackBlob.type), {
      type: fallbackBlob.type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

async function uploadImageToR2(file: File, folder: string, accessToken: string) {
  if (!r2UploadEndpoint) return null;

  const formData = new FormData();
  formData.append('folder', folder);
  formData.append('file', file);

  const response = await fetch(r2UploadEndpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw uploadError(`Cloudflare R2 upload failed (${response.status}). ${message}`.trim());
  }

  const data = await response.json() as { url?: string };
  if (!data.url) throw uploadError('Cloudflare R2 upload did not return a URL.');
  return data.url;
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
    const uploadFile = await compressImageForUpload(file);
    if (r2UploadEndpoint && sessionData.session.access_token) {
      try {
        const r2Url = await uploadImageToR2(uploadFile, productFolder, sessionData.session.access_token);
        if (r2Url) {
          urls.push(r2Url);
          continue;
        }
      } catch (error) {
        console.warn('Cloudflare R2 upload failed. Falling back to Supabase Storage.', error);
      }
    }

    const path = `${productFolder}/${safeFileName(uploadFile, index)}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, uploadFile, {
        cacheControl: '31536000',
        contentType: uploadFile.type || undefined,
        upsert: false,
      });

    if (error) throw uploadError(error.message, error);

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return urls;
}
