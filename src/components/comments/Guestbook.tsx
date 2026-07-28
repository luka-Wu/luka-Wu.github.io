'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import CommentCard from '@/components/comments/CommentCard';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_FILE_SIZE,
  uploadGuestbookImage,
  validateImageFile,
} from '@/lib/media';
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_NAME_MAX_LENGTH,
  COMMENT_SUBMIT_COOLDOWN_MS,
  COMMENTS_PAGE_SIZE,
  discardOrphanCommentImage,
  fetchComments,
  isCommentServiceConfigured,
  submitComment,
  type ICommentEntry,
} from '@/lib/comments';

const COMMENT_LAST_SUBMITTED_KEY = 'prism-comment-last-submitted-at';
const COMMENT_AUTHOR_KEY = 'prism-comment-author';

interface IFormStatus {
  type: 'idle' | 'success' | 'error';
  message: string;
}

export default function Guestbook() {
  const configured = isCommentServiceConfigured();
  const formStartedAtRef = useRef(Date.now());
  const [comments, setComments] = useState<ICommentEntry[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentImagePreview, setCommentImagePreview] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(configured);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formStatus, setFormStatus] = useState<IFormStatus>({
    type: 'idle',
    message: '',
  });

  const loadFirstPage = useCallback(async () => {
    if (!configured) return;

    setLoading(true);
    setLoadError('');

    try {
      const nextComments = await fetchComments({ limit: COMMENTS_PAGE_SIZE });
      setComments(nextComments);
      setHasMore(nextComments.length === COMMENTS_PAGE_SIZE);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '评论加载失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    try {
      const savedName = window.localStorage.getItem(COMMENT_AUTHOR_KEY);
      if (savedName) setName(savedName.slice(0, COMMENT_NAME_MAX_LENGTH));
    } catch {
      // localStorage 不可用时不影响留言功能。
    }

    void loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    if (!commentImage) {
      setCommentImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(commentImage);
    setCommentImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [commentImage]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setLoadError('');

    try {
      const nextComments = await fetchComments({
        limit: COMMENTS_PAGE_SIZE,
        offset: comments.length,
      });
      setComments((currentComments) => [...currentComments, ...nextComments]);
      setHasMore(nextComments.length === COMMENTS_PAGE_SIZE);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '更多评论加载失败。');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanContent = content.trim();

    if (website) {
      setFormStatus({ type: 'error', message: '提交未通过，请刷新页面后重试。' });
      return;
    }
    if (!cleanName || cleanName.length > COMMENT_NAME_MAX_LENGTH) {
      setFormStatus({
        type: 'error',
        message: `请填写 1–${COMMENT_NAME_MAX_LENGTH} 个字符的名字。`,
      });
      return;
    }
    if (!cleanContent || cleanContent.length > COMMENT_CONTENT_MAX_LENGTH) {
      setFormStatus({
        type: 'error',
        message: `请填写 1–${COMMENT_CONTENT_MAX_LENGTH} 个字符的留言。`,
      });
      return;
    }
    if (Date.now() - formStartedAtRef.current < 800) {
      setFormStatus({ type: 'error', message: '提交得太快了，请稍后再试。' });
      return;
    }

    try {
      const lastSubmittedAt = Number(
        window.localStorage.getItem(COMMENT_LAST_SUBMITTED_KEY) || 0,
      );
      const remainingTime = COMMENT_SUBMIT_COOLDOWN_MS - (Date.now() - lastSubmittedAt);

      if (remainingTime > 0) {
        setFormStatus({
          type: 'error',
          message: `请等待 ${Math.ceil(remainingTime / 1000)} 秒后再留言。`,
        });
        return;
      }
    } catch {
      // 浏览器禁用存储时仍允许正常提交。
    }

    setSubmitting(true);
    setFormStatus({ type: 'idle', message: '' });
    let uploadedImagePath: string | null = null;

    try {
      uploadedImagePath = commentImage
        ? await uploadGuestbookImage(commentImage, 'comments')
        : null;
      const createdComment = await submitComment(cleanName, cleanContent, uploadedImagePath);
      setComments((currentComments) => [
        createdComment,
        ...currentComments.filter((comment) => comment.id !== createdComment.id),
      ]);
      setContent('');
      setCommentImage(null);
      setFormStatus({ type: 'success', message: '留言已发布，谢谢你的分享。' });
      formStartedAtRef.current = Date.now();

      try {
        window.localStorage.setItem(COMMENT_AUTHOR_KEY, cleanName);
        window.localStorage.setItem(COMMENT_LAST_SUBMITTED_KEY, String(Date.now()));
      } catch {
        // 存储失败不影响已经成功的提交。
      }
    } catch (error) {
      if (uploadedImagePath) {
        void discardOrphanCommentImage(uploadedImagePath);
      }
      setFormStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '评论提交失败，请稍后再试。',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] lg:items-start">
      <section className="surface-card p-5 sm:p-7 lg:sticky lg:top-28">
        <SectionHeader
          eyebrow="留言入口"
          title="写下你的名字和留言"
          description="无需登录。留言发布后会立即出现在这里，也可能出现在首页的滚动评论中。"
          size="compact"
          headingLevel="h2"
          accent="coral"
        />

        {!configured ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-warning/25 bg-warning/8 p-4 text-sm leading-6 text-neutral-700"
          >
            评论服务尚未连接 Supabase。完成环境变量配置后即可开放留言。
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="comment-name" className="text-sm font-semibold text-primary">
                  你的名字
                </label>
                <span className="text-[11px] text-neutral-500">
                  {name.length}/{COMMENT_NAME_MAX_LENGTH}
                </span>
              </div>
              <input
                id="comment-name"
                name="name"
                type="text"
                required
                maxLength={COMMENT_NAME_MAX_LENGTH}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="怎么称呼你？"
                className="w-full rounded-2xl border border-neutral-200 bg-white/72 px-4 py-3 text-[15px] text-primary outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10 dark:border-white/10 dark:bg-white/[0.055]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="comment-content" className="text-sm font-semibold text-primary">
                  留言
                </label>
                <span className="text-[11px] text-neutral-500">
                  {content.length}/{COMMENT_CONTENT_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="comment-content"
                name="content"
                required
                rows={6}
                maxLength={COMMENT_CONTENT_MAX_LENGTH}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="分享你的想法、建议或一句问候……"
                className="w-full resize-y rounded-2xl border border-neutral-200 bg-white/72 px-4 py-3 text-[15px] leading-7 text-primary outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10 dark:border-white/10 dark:bg-white/[0.055]"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-primary">附一张照片（可选）</span>
              <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white/45 px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:border-accent/35 hover:text-accent dark:border-white/15 dark:bg-white/[0.035]">
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {commentImage ? '重新选择照片' : '选择照片'}
                <input
                  type="file"
                  accept={MEDIA_ACCEPTED_TYPES.join(',')}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setFormStatus({ type: 'idle', message: '' });

                    if (!file) {
                      setCommentImage(null);
                      return;
                    }

                    try {
                      validateImageFile(file);
                      setCommentImage(file);
                    } catch (error) {
                      setCommentImage(null);
                      setFormStatus({
                        type: 'error',
                        message: error instanceof Error ? error.message : '图片无法使用。',
                      });
                    }
                  }}
                />
              </label>
              <p className="text-[11px] leading-5 text-neutral-500">
                JPEG、PNG 或 WebP，最大 {MEDIA_MAX_FILE_SIZE / 1024 / 1024}MB。上传前会压缩并移除定位信息。
              </p>
              {commentImagePreview && (
                <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={commentImagePreview}
                    alt="留言照片预览"
                    className="max-h-56 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setCommentImage(null)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white"
                    aria-label="移除留言照片"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="comment-website">个人网站</label>
              <input
                id="comment-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="portfolio-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {submitting ? '正在发布…' : '发布留言'}
            </button>

            <p
              aria-live="polite"
              className={`min-h-6 text-sm ${
                formStatus.type === 'error'
                  ? 'text-error'
                  : formStatus.type === 'success'
                    ? 'text-success'
                    : 'text-neutral-500'
              }`}
            >
              {formStatus.message}
            </p>
          </form>
        )}
      </section>

      <section aria-labelledby="comment-list-title" className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeader
            eyebrow="留言簿"
            title="最新留言"
            size="compact"
            headingLevel="h2"
            titleId="comment-list-title"
          />
          {configured && (
            <button
              type="button"
              onClick={() => void loadFirstPage()}
              disabled={loading}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:border-accent/25 hover:text-accent disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              刷新
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-5 space-y-3" aria-label="正在加载评论">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="surface-soft h-32 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && loadError && comments.length === 0 && (
          <div
            role="alert"
            className="mt-5 rounded-[1.35rem] border border-error/20 bg-error/5 p-5 text-sm text-neutral-700"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
              <div>
                <p>{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadFirstPage()}
                  className="mt-3 font-semibold text-accent hover:underline"
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !loadError && comments.length === 0 && (
          <div className="surface-soft mt-5 border-dashed p-8 text-center">
            <MessageCircle className="mx-auto h-7 w-7 text-accent" aria-hidden="true" />
            <p className="mt-3 font-semibold text-primary">还没有留言</p>
            <p className="mt-1 text-sm text-neutral-500">成为第一个留下足迹的人吧。</p>
          </div>
        )}

        {comments.length > 0 && (
          <div className="mt-5 space-y-3">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {loadError && comments.length > 0 && (
          <p role="alert" className="mt-4 text-center text-sm text-error">
            {loadError}
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => void handleLoadMore()}
            disabled={loadingMore}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white/55 px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-accent/25 hover:text-accent disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04]"
          >
            {loadingMore && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loadingMore ? '正在加载…' : '加载更多'}
          </button>
        )}
      </section>
    </div>
  );
}
