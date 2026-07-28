import { getSupabaseClient } from '@/lib/supabase';

export const PHOTO_TITLE_MAX_LENGTH = 60;
export const PHOTO_CATEGORY_MAX_LENGTH = 30;
export const PHOTO_CAPTION_MAX_LENGTH = 240;

export interface IInterestPhoto {
  id: string;
  title: string;
  category: string;
  caption: string;
  shot_date: string | null;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface ICreateInterestPhotoInput {
  title: string;
  category: string;
  caption: string;
  shotDate: string | null;
  storagePath: string;
}

function isInterestPhoto(value: unknown): value is IInterestPhoto {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Record<string, unknown>;

  return (
    typeof photo.id === 'string' &&
    typeof photo.title === 'string' &&
    typeof photo.category === 'string' &&
    typeof photo.caption === 'string' &&
    (typeof photo.shot_date === 'string' || photo.shot_date === null) &&
    typeof photo.storage_path === 'string' &&
    typeof photo.sort_order === 'number' &&
    typeof photo.created_at === 'string'
  );
}

export async function fetchInterestPhotos(): Promise<IInterestPhoto[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('interest_photos')
    .select('id,title,category,caption,shot_date,storage_path,sort_order,created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('照片墙加载失败，请稍后再试。');
  }

  return Array.isArray(data) ? data.filter(isInterestPhoto) : [];
}

export async function createInterestPhoto(
  input: ICreateInterestPhotoInput,
): Promise<IInterestPhoto> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('interest_photos')
    .insert({
      title: input.title.trim(),
      category: input.category.trim(),
      caption: input.caption.trim(),
      shot_date: input.shotDate || null,
      storage_path: input.storagePath,
    })
    .select('id,title,category,caption,shot_date,storage_path,sort_order,created_at')
    .single();

  if (error || !isInterestPhoto(data)) {
    throw new Error('照片信息保存失败，请稍后再试。');
  }

  return data;
}

export async function deleteInterestPhoto(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('interest_photos').delete().eq('id', id);

  if (error) {
    throw new Error('照片信息删除失败，请稍后再试。');
  }
}
