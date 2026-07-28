'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import {
  Camera,
  Check,
  ImagePlus,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  approveInterestPhoto,
  createInterestPhoto,
  deleteInterestPhoto,
  discardOrphanWallImage,
  fetchInterestPhotos,
  PHOTO_CAPTION_MAX_LENGTH,
  PHOTO_CATEGORY_MAX_LENGTH,
  PHOTO_TITLE_MAX_LENGTH,
  submitInterestPhoto,
  type IInterestPhoto,
} from '@/lib/photos';
import {
  getGuestbookImageUrl,
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_FILE_SIZE,
  removeGuestbookImage,
  uploadGuestbookImage,
  validateImageFile,
} from '@/lib/media';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  SITE_ADMIN_EMAIL,
} from '@/lib/supabase';

const ALL_CATEGORIES = '全部';
const PENDING_CATEGORY = '待审核';

interface IUploadForm {
  title: string;
  category: string;
  caption: string;
  shotDate: string;
  file: File | null;
}

const EMPTY_UPLOAD_FORM: IUploadForm = {
  title: '',
  category: '',
  caption: '',
  shotDate: '',
  file: null,
};

function formatPhotoDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function PhotoWall() {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? getSupabaseClient() : null), [configured]);
  const [photos, setPhotos] = useState<IInterestPhoto[]>([]);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [selectedPhoto, setSelectedPhoto] = useState<IInterestPhoto | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loginMode, setLoginMode] = useState(false);
  const [uploadForm, setUploadForm] = useState<IUploadForm>(EMPTY_UPLOAD_FORM);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(configured);
  const [uploading, setUploading] = useState(false);
  const [approvingId, setApprovingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [submissionNotice, setSubmissionNotice] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(configured);
  const [magicLinkSending, setMagicLinkSending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const isOwner = authEmail.toLowerCase() === SITE_ADMIN_EMAIL;
  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...(isOwner && photos.some((photo) => !photo.approved) ? [PENDING_CATEGORY] : []),
      ...Array.from(new Set(photos.map((photo) => photo.category))).sort((a, b) =>
        a.localeCompare(b, 'zh-CN'),
      ),
    ],
    [isOwner, photos],
  );
  const visiblePhotos =
    activeCategory === PENDING_CATEGORY
      ? photos.filter((photo) => !photo.approved)
      : activeCategory === ALL_CATEGORIES
      ? photos
      : photos.filter((photo) => photo.category === activeCategory);

  const loadPhotos = useCallback(async () => {
    if (!configured) return;

    setLoading(true);
    setLoadError('');

    try {
      setPhotos(await fetchInterestPhotos());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '照片墙加载失败。');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void loadPhotos();
  }, [isOwner, loadPhotos]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthEmail(data.session?.user.email || '');
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthEmail(session?.user.email || '');
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!uploadForm.file) {
      setPreviewUrl('');
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(uploadForm.file);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [uploadForm.file]);

  const sendMagicLink = async () => {
    if (!supabase) return;

    setMagicLinkSending(true);
    setUploadError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: SITE_ADMIN_EMAIL,
        options: {
          emailRedirectTo: `${window.location.origin}/guestbook/`,
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch {
      setUploadError('登录链接发送失败，请稍后再试。');
    } finally {
      setMagicLinkSending(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    setUploadError('');

    if (!file) {
      setUploadForm((currentForm) => ({ ...currentForm, file: null }));
      return;
    }

    try {
      validateImageFile(file);
      setUploadForm((currentForm) => ({ ...currentForm, file }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '图片无法使用。');
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = uploadForm.title.trim();
    const category = uploadForm.category.trim();

    if (!title || title.length > PHOTO_TITLE_MAX_LENGTH) {
      setUploadError(`标题需要填写 1–${PHOTO_TITLE_MAX_LENGTH} 个字符。`);
      return;
    }
    if (!category || category.length > PHOTO_CATEGORY_MAX_LENGTH) {
      setUploadError(`分类需要填写 1–${PHOTO_CATEGORY_MAX_LENGTH} 个字符。`);
      return;
    }
    if (uploadForm.caption.trim().length > PHOTO_CAPTION_MAX_LENGTH) {
      setUploadError(`照片说明不能超过 ${PHOTO_CAPTION_MAX_LENGTH} 个字符。`);
      return;
    }
    if (!uploadForm.file) {
      setUploadError('请选择一张照片。');
      return;
    }

    setUploading(true);
    setUploadError('');
    setSubmissionNotice('');
    let storagePath = '';

    try {
      storagePath = await uploadGuestbookImage(uploadForm.file, 'wall');
      const photoInput = {
        title,
        category,
        caption: uploadForm.caption,
        shotDate: uploadForm.shotDate || null,
        storagePath,
      };
      const createdPhoto = isOwner
        ? await createInterestPhoto(photoInput)
        : await submitInterestPhoto(photoInput);

      if (isOwner) {
        setPhotos((currentPhotos) => [createdPhoto, ...currentPhotos]);
      } else {
        setSubmissionNotice('照片已提交，审核通过后会出现在照片墙。');
      }
      setActiveCategory(ALL_CATEGORIES);
      setUploadForm(EMPTY_UPLOAD_FORM);
      setUploadOpen(false);
    } catch (error) {
      if (storagePath) {
        void discardOrphanWallImage(storagePath);
      }
      setUploadError(error instanceof Error ? error.message : '照片上传失败。');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (photo: IInterestPhoto) => {
    if (!isOwner) return;

    setApprovingId(photo.id);
    setLoadError('');

    try {
      await approveInterestPhoto(photo.id);
      setPhotos((currentPhotos) =>
        currentPhotos.map((currentPhoto) =>
          currentPhoto.id === photo.id
            ? { ...currentPhoto, approved: true }
            : currentPhoto,
        ),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '照片审核失败。');
    } finally {
      setApprovingId('');
    }
  };

  const handleDelete = async (photo: IInterestPhoto) => {
    const actionLabel = photo.approved ? '删除' : '拒绝并删除';
    if (!isOwner || !window.confirm(`确认${actionLabel}“${photo.title}”吗？`)) return;

    setDeletingId(photo.id);

    try {
      await deleteInterestPhoto(photo.id);
      setPhotos((currentPhotos) =>
        currentPhotos.filter((currentPhoto) => currentPhoto.id !== photo.id),
      );
      setSelectedPhoto((currentPhoto) => (currentPhoto?.id === photo.id ? null : currentPhoto));
      try {
        await removeGuestbookImage(photo.storage_path);
      } catch {
        setLoadError('照片记录已删除，但存储文件清理失败。');
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '照片删除失败。');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section
      aria-labelledby="photo-wall-title"
      className="surface-card mb-8 overflow-hidden p-5 sm:p-7 lg:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/8 px-3 py-1.5 text-xs font-semibold tracking-wide text-coral">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            兴趣相册
          </span>
          <h2
            id="photo-wall-title"
            className="mt-4 text-3xl font-bold tracking-[-0.04em] text-primary sm:text-4xl"
          >
            兴趣切片
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
            每个人都可以投稿。照片会先进入审核，通过后再公开展示。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner ? (
            <button
              type="button"
              onClick={() => void supabase?.auth.signOut()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white/55 px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:text-accent dark:border-white/10 dark:bg-white/[0.04]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              退出管理
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLoginMode(true);
                setUploadError('');
                setMagicLinkSent(false);
                setUploadOpen(true);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white/55 px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:text-accent dark:border-white/10 dark:bg-white/[0.04]"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              审核登录
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setLoginMode(false);
              setUploadError('');
              setMagicLinkSent(false);
              setUploadOpen(true);
            }}
            className="portfolio-button inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            上传照片
          </button>
        </div>
      </div>

      {submissionNotice && (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-success/25 bg-success/8 px-4 py-3 text-sm text-neutral-700"
        >
          {submissionNotice}
        </p>
      )}

      {categories.length > 1 && (
        <div
          className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="照片分类"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`min-h-9 min-w-max rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeCategory === category
                  ? 'bg-primary text-background'
                  : 'border border-neutral-200 bg-white/55 text-neutral-600 hover:text-accent dark:border-white/10 dark:bg-white/[0.04]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="正在加载照片">
          {[180, 230, 195].map((height, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[1.35rem] bg-white/55 dark:bg-white/[0.055]"
              style={{ height }}
            />
          ))}
        </div>
      )}

      {!loading && loadError && photos.length === 0 && (
        <div role="alert" className="mt-6 rounded-2xl border border-error/20 bg-error/5 p-5">
          <p className="text-sm text-neutral-700">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadPhotos()}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            重新加载
          </button>
        </div>
      )}

      {!loading && !loadError && photos.length === 0 && (
        <div className="surface-soft mt-6 border-dashed px-6 py-12 text-center">
          <Camera className="mx-auto h-8 w-8 text-coral" aria-hidden="true" />
          <p className="mt-3 font-semibold text-primary">照片墙还在等待第一张照片</p>
          <p className="mt-1 text-sm text-neutral-500">从一个喜欢的瞬间开始记录吧。</p>
        </div>
      )}

      {!loading && visiblePhotos.length > 0 && (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visiblePhotos.map((photo) => {
            const imageUrl = getGuestbookImageUrl(photo.storage_path);

            return (
              <article
                key={photo.id}
                className="surface-card group relative mb-4 break-inside-avoid overflow-hidden"
              >
                {!photo.approved && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-warning px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                    待审核
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="block w-full text-left"
                  aria-label={`查看照片：${photo.title}`}
                >
                  {imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={photo.title}
                      loading="lazy"
                      className="h-auto w-full bg-neutral-100 object-cover transition duration-500 group-hover:scale-[1.025] dark:bg-neutral-800"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-coral">
                        {photo.category}
                      </span>
                      {photo.shot_date && (
                        <time
                          dateTime={photo.shot_date}
                          className="text-[11px] text-neutral-500"
                        >
                          {formatPhotoDate(photo.shot_date)}
                        </time>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-primary">{photo.title}</h3>
                    {photo.caption && (
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{photo.caption}</p>
                    )}
                  </div>
                </button>
                {isOwner && (
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    {!photo.approved && (
                      <button
                        type="button"
                        onClick={() => void handleApprove(photo)}
                        disabled={approvingId === photo.id}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-success px-3 text-xs font-bold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                        aria-label={`通过照片：${photo.title}`}
                      >
                        {approvingId === photo.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                        通过
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(photo)}
                      disabled={deletingId === photo.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-error disabled:opacity-60"
                      aria-label={`${photo.approved ? '删除' : '拒绝'}照片：${photo.title}`}
                    >
                      {deletingId === photo.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {loadError && photos.length > 0 && (
        <p role="alert" className="mt-4 text-sm text-error">
          {loadError}
        </p>
      )}

      <Dialog
        open={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        className="relative z-[80]"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="relative w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#151318] text-white shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"
                aria-label="关闭大图"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              {selectedPhoto && getGuestbookImageUrl(selectedPhoto.storage_path) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getGuestbookImageUrl(selectedPhoto.storage_path) || ''}
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-full object-contain"
                />
              )}
              {selectedPhoto && (
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">
                      {selectedPhoto.category}
                    </span>
                    {selectedPhoto.shot_date && (
                      <time
                        dateTime={selectedPhoto.shot_date}
                        className="text-xs text-white/55"
                      >
                        {formatPhotoDate(selectedPhoto.shot_date)}
                      </time>
                    )}
                  </div>
                  <DialogTitle className="mt-1 text-2xl font-bold">
                    {selectedPhoto.title}
                  </DialogTitle>
                  {selectedPhoto.caption && (
                    <p className="mt-2 text-sm leading-7 text-white/70">
                      {selectedPhoto.caption}
                    </p>
                  )}
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={uploadOpen}
        onClose={() => {
          if (!uploading) {
            setUploadOpen(false);
            setLoginMode(false);
          }
        }}
        className="relative z-[80]"
      >
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="relative w-full max-w-xl rounded-[1.75rem] bg-background p-5 shadow-2xl sm:p-7">
              <button
                type="button"
                onClick={() => {
                  setUploadOpen(false);
                  setLoginMode(false);
                }}
                disabled={uploading}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 dark:border-white/10"
                aria-label="关闭上传窗口"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <DialogTitle className="pr-12 text-2xl font-bold tracking-tight text-primary">
                {loginMode ? '本人审核登录' : isOwner ? '上传兴趣照片' : '投稿到照片墙'}
              </DialogTitle>

              {loginMode && authLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <LoaderCircle className="h-6 w-6 animate-spin text-accent" aria-label="正在检查登录状态" />
                </div>
              ) : loginMode && !isOwner ? (
                <div className="mt-5">
                  <p className="text-sm leading-7 text-neutral-600">
                    审核入口只对站点本人开放。点击后，登录链接会发送到管理员邮箱。
                  </p>
                  {magicLinkSent ? (
                    <div className="mt-5 rounded-2xl border border-success/25 bg-success/8 p-4 text-sm leading-6 text-neutral-700">
                      登录链接已发送。请在同一浏览器中打开邮件里的链接，然后回到这里上传。
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void sendMagicLink()}
                      disabled={magicLinkSending}
                      className="portfolio-button mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
                    >
                      {magicLinkSending && (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      )}
                      {magicLinkSending ? '正在发送…' : '发送 Magic Link'}
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpload} className="mt-5 space-y-4">
                  {!isOwner && (
                    <p className="rounded-2xl border border-accent/15 bg-accent/[0.045] p-4 text-sm leading-6 text-neutral-600">
                      投稿无需登录。提交后将由站点本人审核，审核通过才会公开展示。
                    </p>
                  )}
                  <label className="block">
                    <span className="text-sm font-semibold text-primary">照片</span>
                    <input
                      type="file"
                      accept={MEDIA_ACCEPTED_TYPES.join(',')}
                      onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
                      className="mt-2 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:font-semibold file:text-accent"
                    />
                    <span className="mt-1 block text-[11px] text-neutral-500">
                      JPEG、PNG 或 WebP，最大 {MEDIA_MAX_FILE_SIZE / 1024 / 1024}MB。上传时会移除定位信息。
                    </span>
                  </label>

                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="待上传照片预览"
                      className="max-h-64 w-full rounded-2xl bg-neutral-100 object-contain dark:bg-neutral-800"
                    />
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-semibold text-primary">标题</span>
                      <input
                        required
                        maxLength={PHOTO_TITLE_MAX_LENGTH}
                        value={uploadForm.title}
                        onChange={(event) =>
                          setUploadForm((currentForm) => ({
                            ...currentForm,
                            title: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/65 px-4 py-3 text-sm text-primary outline-none focus:border-accent/50 dark:border-white/10 dark:bg-white/[0.05]"
                        placeholder="这一刻叫什么？"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-primary">兴趣分类</span>
                      <input
                        required
                        maxLength={PHOTO_CATEGORY_MAX_LENGTH}
                        value={uploadForm.category}
                        onChange={(event) =>
                          setUploadForm((currentForm) => ({
                            ...currentForm,
                            category: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/65 px-4 py-3 text-sm text-primary outline-none focus:border-accent/50 dark:border-white/10 dark:bg-white/[0.05]"
                        placeholder="旅行 / 阅读 / 运动"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-primary">照片说明</span>
                    <textarea
                      rows={3}
                      maxLength={PHOTO_CAPTION_MAX_LENGTH}
                      value={uploadForm.caption}
                      onChange={(event) =>
                        setUploadForm((currentForm) => ({
                          ...currentForm,
                          caption: event.target.value,
                        }))
                      }
                      className="mt-2 w-full resize-y rounded-2xl border border-neutral-200 bg-white/65 px-4 py-3 text-sm leading-6 text-primary outline-none focus:border-accent/50 dark:border-white/10 dark:bg-white/[0.05]"
                      placeholder="写一点这张照片背后的故事……"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-primary">拍摄日期（可选）</span>
                    <input
                      type="date"
                      value={uploadForm.shotDate}
                      onChange={(event) =>
                        setUploadForm((currentForm) => ({
                          ...currentForm,
                          shotDate: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white/65 px-4 py-3 text-sm text-primary outline-none focus:border-accent/50 dark:border-white/10 dark:bg-white/[0.05]"
                    />
                  </label>

                  {uploadError && (
                    <p role="alert" className="text-sm text-error">
                      {uploadError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={uploading}
                    className="portfolio-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background disabled:opacity-60"
                  >
                    {uploading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                    {uploading
                      ? '正在上传…'
                      : isOwner
                        ? '发布到照片墙'
                        : '提交审核'}
                  </button>
                </form>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
