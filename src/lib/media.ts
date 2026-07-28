import { getSupabaseClient } from '@/lib/supabase';

export const GUESTBOOK_MEDIA_BUCKET = 'guestbook-media';
export const MEDIA_MAX_FILE_SIZE = 3 * 1024 * 1024;
export const MEDIA_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

interface IImageDimensions {
  width: number;
  height: number;
}

type MediaFolder = 'comments' | 'wall';

function getTargetDimensions(width: number, height: number): IImageDimensions {
  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('图片处理失败，请换一张图片重试。'));
        }
      },
      'image/webp',
      0.86,
    );
  });
}

async function loadHtmlImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function validateImageFile(file: File): void {
  if (!MEDIA_ACCEPTED_TYPES.includes(file.type as (typeof MEDIA_ACCEPTED_TYPES)[number])) {
    throw new Error('仅支持 JPEG、PNG 或 WebP 图片。');
  }

  if (file.size > MEDIA_MAX_FILE_SIZE) {
    throw new Error('图片不能超过 3MB。');
  }
}

export async function normalizeImage(file: File): Promise<File> {
  validateImageFile(file);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('当前浏览器无法处理图片。');
  }

  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    const dimensions = getTargetDimensions(bitmap.width, bitmap.height);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);
    bitmap.close();
  } else {
    const image = await loadHtmlImage(file);
    const dimensions = getTargetDimensions(image.naturalWidth, image.naturalHeight);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  }

  const blob = await canvasToBlob(canvas);

  if (blob.size > MEDIA_MAX_FILE_SIZE) {
    throw new Error('压缩后的图片仍超过 3MB，请选择更小的图片。');
  }

  return new File([blob], 'guestbook-image.webp', {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export async function uploadGuestbookImage(
  sourceFile: File,
  folder: MediaFolder,
): Promise<string> {
  const file = await normalizeImage(sourceFile);
  const storagePath = `${folder}/${crypto.randomUUID()}.webp`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(GUESTBOOK_MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    throw new Error('图片上传失败，请稍后再试。');
  }

  return storagePath;
}

export async function removeGuestbookImage(storagePath: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from(GUESTBOOK_MEDIA_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new Error('图片删除失败，请稍后再试。');
  }
}

export function getGuestbookImageUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;

  const supabase = getSupabaseClient();
  return supabase.storage.from(GUESTBOOK_MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
