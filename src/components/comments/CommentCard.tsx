'use client';

import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { LoaderCircle, X } from 'lucide-react';
import type { ICommentEntry } from '@/lib/comments';
import { getGuestbookImageUrl } from '@/lib/media';

const AVATAR_STYLES = [
  'from-accent/90 to-accent-light',
  'from-coral to-[#ff9d8f]',
  'from-mint to-[#8ee7d8]',
  'from-sun to-[#f29b65]',
] as const;

interface ICommentCardProps {
  comment: ICommentEntry;
  compact?: boolean;
  deleting?: boolean;
  onDelete?: () => void;
}

function formatCommentDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '刚刚';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function CommentCard({
  comment,
  compact = false,
  deleting = false,
  onDelete,
}: ICommentCardProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const firstCharacter = Array.from(comment.name.trim())[0] || '访';
  const colorIndex = Array.from(comment.name).reduce(
    (total, character) => total + (character.codePointAt(0) || 0),
    0,
  ) % AVATAR_STYLES.length;
  const imageUrl = getGuestbookImageUrl(comment.image_path);

  return (
    <>
      <article
        className={`surface-card group relative transition-transform duration-300 hover:-translate-y-0.5 ${
          compact ? 'p-4' : 'p-5 sm:p-6'
        }`}
      >
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white/85 text-neutral-500 shadow-sm transition hover:border-error/30 hover:bg-error hover:text-white disabled:opacity-60 dark:border-white/10 dark:bg-neutral-900/85"
            aria-label={`删除${comment.name}的留言`}
            title="删除留言"
          >
            {deleting ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}
        <div className={`flex items-start gap-3.5 ${onDelete ? 'pr-9' : ''}`}>
          <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm ${
              AVATAR_STYLES[colorIndex]
            } ${compact ? 'h-9 w-9 text-sm' : 'h-11 w-11 text-base'}`}
          >
            {firstCharacter}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="break-words font-semibold text-primary">{comment.name}</h3>
              <time
                dateTime={comment.created_at}
                className="shrink-0 text-[11px] tracking-wide text-neutral-500"
              >
                {formatCommentDate(comment.created_at)}
              </time>
            </div>
            <p
              className={`mt-2 whitespace-pre-wrap break-words text-neutral-700 ${
                compact ? 'line-clamp-3 text-sm leading-6' : 'text-[15px] leading-7'
              }`}
            >
              {comment.content}
            </p>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className={`mt-3 block overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 ${
                  compact ? 'h-20 w-28' : 'max-h-80 w-full'
                }`}
                aria-label={`查看${comment.name}的留言照片`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`${comment.name}的留言照片`}
                  loading="lazy"
                  className={`w-full object-cover transition duration-300 hover:scale-[1.02] ${
                    compact ? 'h-full' : 'max-h-80'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </article>

      <Dialog open={imageOpen} onClose={setImageOpen} className="relative z-[90]">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="relative max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#151318] shadow-2xl">
              <button
                type="button"
                onClick={() => setImageOpen(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white"
                aria-label="关闭留言大图"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={`${comment.name}的留言照片`}
                  className="max-h-[88vh] max-w-full object-contain"
                />
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
