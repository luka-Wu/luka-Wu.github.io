export const COMMENT_NAME_MAX_LENGTH = 30;
export const COMMENT_CONTENT_MAX_LENGTH = 300;
export const COMMENT_SUBMIT_COOLDOWN_MS = 20_000;
export const COMMENTS_PAGE_SIZE = 12;

export interface ICommentEntry {
  id: string;
  name: string;
  content: string;
  image_path: string | null;
  created_at: string;
}

interface IFetchCommentsOptions {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

interface ICommentServiceConfig {
  url: string;
  anonKey: string;
}

interface ISupabaseError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

function getCommentServiceConfig(): ICommentServiceConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

function createHeaders(config: ICommentServiceConfig): HeadersInit {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
  };
}

function isCommentEntry(value: unknown): value is ICommentEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.content === 'string' &&
    (typeof entry.image_path === 'string' || entry.image_path === null) &&
    typeof entry.created_at === 'string'
  );
}

async function readError(response: Response): Promise<Error> {
  let error: ISupabaseError = {};

  try {
    error = (await response.json()) as ISupabaseError;
  } catch {
    return new Error('评论服务暂时不可用，请稍后再试。');
  }

  const message = `${error.message || ''} ${error.details || ''}`;

  if (message.includes('COMMENT_DUPLICATE')) {
    return new Error('请勿重复发送相同的留言。');
  }
  if (message.includes('COMMENT_NAME_INVALID')) {
    return new Error(`名字需要填写 1–${COMMENT_NAME_MAX_LENGTH} 个字符。`);
  }
  if (message.includes('COMMENT_CONTENT_INVALID')) {
    return new Error(`留言需要填写 1–${COMMENT_CONTENT_MAX_LENGTH} 个字符。`);
  }
  if (
    message.includes('COMMENT_IMAGE_PATH_INVALID') ||
    message.includes('COMMENT_IMAGE_NOT_FOUND')
  ) {
    return new Error('留言图片无法使用，请重新选择。');
  }

  return new Error('评论提交失败，请稍后再试。');
}

export function isCommentServiceConfigured(): boolean {
  return getCommentServiceConfig() !== null;
}

export async function fetchComments({
  limit = COMMENTS_PAGE_SIZE,
  offset = 0,
  signal,
}: IFetchCommentsOptions = {}): Promise<ICommentEntry[]> {
  const config = getCommentServiceConfig();

  if (!config) {
    throw new Error('评论服务尚未完成配置。');
  }

  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50);
  const safeOffset = Math.max(Math.floor(offset), 0);
  const query = new URLSearchParams({
    select: 'id,name,content,image_path,created_at',
    order: 'created_at.desc',
    limit: String(safeLimit),
    offset: String(safeOffset),
  });
  const response = await fetch(`${config.url}/rest/v1/comments?${query.toString()}`, {
    headers: createHeaders(config),
    method: 'GET',
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('评论加载失败，请稍后再试。');
  }

  const payload: unknown = await response.json();
  return Array.isArray(payload) ? payload.filter(isCommentEntry) : [];
}

export async function submitComment(
  name: string,
  content: string,
  imagePath?: string | null,
): Promise<ICommentEntry> {
  const config = getCommentServiceConfig();

  if (!config) {
    throw new Error('评论服务尚未完成配置。');
  }

  const response = await fetch(`${config.url}/rest/v1/rpc/submit_comment`, {
    method: 'POST',
    headers: {
      ...createHeaders(config),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      p_name: name,
      p_content: content,
      p_image_path: imagePath || null,
    }),
  });

  if (!response.ok) {
    throw await readError(response);
  }

  const payload: unknown = await response.json();
  const entry = Array.isArray(payload) ? payload[0] : payload;

  if (!isCommentEntry(entry)) {
    throw new Error('评论已提交，但返回数据无法读取，请刷新页面查看。');
  }

  return entry;
}

export async function discardOrphanCommentImage(imagePath: string): Promise<void> {
  const config = getCommentServiceConfig();
  if (!config) return;

  await fetch(`${config.url}/rest/v1/rpc/discard_orphan_comment_image`, {
    method: 'POST',
    headers: createHeaders(config),
    body: JSON.stringify({ p_image_path: imagePath }),
  });
}
