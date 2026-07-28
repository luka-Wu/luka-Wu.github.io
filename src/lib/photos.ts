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
  approved: boolean;
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
    typeof photo.approved === 'boolean' &&
    typeof photo.created_at === 'string'
  );
}

export async function fetchInterestPhotos(): Promise<IInterestPhoto[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('interest_photos')
    .select('id,title,category,caption,shot_date,storage_path,sort_order,approved,created_at')
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
      approved: true,
    })
    .select('id,title,category,caption,shot_date,storage_path,sort_order,approved,created_at')
    .single();

  if (error || !isInterestPhoto(data)) {
    throw new Error('照片信息保存失败，请稍后再试。');
  }

  return data;
}

export async function submitInterestPhoto(
  input: ICreateInterestPhotoInput,
): Promise<IInterestPhoto> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('submit_interest_photo', {
    p_title: input.title.trim(),
    p_category: input.category.trim(),
    p_caption: input.caption.trim(),
    p_shot_date: input.shotDate || null,
    p_storage_path: input.storagePath,
  });

  if (error || !isInterestPhoto(data)) {
    throw new Error('照片提交失败，请稍后再试。');
  }

  return data;
}

export async function approveInterestPhoto(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('interest_photos')
    .update({ approved: true })
    .eq('id', id);

  if (error) {
    throw new Error('照片审核失败，请稍后再试。');
  }
}

export async function deleteInterestPhoto(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('interest_photos').delete().eq('id', id);

  if (error) {
    throw new Error('照片信息删除失败，请稍后再试。');
  }
}

export async function discardOrphanWallImage(storagePath: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.rpc('discard_orphan_wall_image', {
    p_storage_path: storagePath,
  });
}
