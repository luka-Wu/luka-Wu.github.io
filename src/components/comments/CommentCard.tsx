import type { ICommentEntry } from '@/lib/comments';

const AVATAR_STYLES = [
  'from-accent/90 to-accent-light',
  'from-coral to-[#ff9d8f]',
  'from-mint to-[#8ee7d8]',
  'from-sun to-[#f29b65]',
] as const;

interface ICommentCardProps {
  comment: ICommentEntry;
  compact?: boolean;
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

export default function CommentCard({ comment, compact = false }: ICommentCardProps) {
  const firstCharacter = Array.from(comment.name.trim())[0] || '访';
  const colorIndex = Array.from(comment.name).reduce(
    (total, character) => total + (character.codePointAt(0) || 0),
    0,
  ) % AVATAR_STYLES.length;

  return (
    <article
      className={`group rounded-[1.35rem] border border-white/70 bg-white/72 shadow-[0_14px_42px_rgba(64,43,83,0.08)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.055] ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex items-start gap-3.5">
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
        </div>
      </div>
    </article>
  );
}
