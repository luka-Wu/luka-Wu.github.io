'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import CommentCard from '@/components/comments/CommentCard';
import SectionHeader from '@/components/ui/SectionHeader';
import {
  fetchComments,
  isCommentServiceConfigured,
  type ICommentEntry,
} from '@/lib/comments';

const TICKER_COMMENT_LIMIT = 8;
const COMMENT_REFRESH_INTERVAL_MS = 45_000;

export default function CommentTicker() {
  const configured = isCommentServiceConfigured();
  const reduceMotion = useReducedMotion();
  const [comments, setComments] = useState<ICommentEntry[]>([]);
  const [loading, setLoading] = useState(configured);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!configured) return;

    const controller = new AbortController();

    const loadLatestComments = async () => {
      try {
        const nextComments = await fetchComments({
          limit: TICKER_COMMENT_LIMIT,
          signal: controller.signal,
        });
        setComments(nextComments);
        setLoadFailed(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setLoadFailed(true);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadLatestComments();
    const intervalId = window.setInterval(
      () => void loadLatestComments(),
      COMMENT_REFRESH_INTERVAL_MS,
    );

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [configured]);

  const shouldAnimate = !reduceMotion && comments.length > 2;
  const visibleComments = reduceMotion ? comments.slice(0, 3) : comments;

  return (
    <section
      aria-labelledby="home-comments-title"
      className="surface-card mt-10 grid gap-5 overflow-hidden p-5 sm:mt-12 sm:p-7 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1.3fr)] lg:p-8"
    >
      <div className="flex flex-col justify-between">
        <div>
          <SectionHeader
            eyebrow="大家的留言"
            title="有人在这里留下了声音"
            size="section"
            headingLevel="h2"
            titleId="home-comments-title"
            titleClassName="lg:max-w-xs"
          />
          <p className="mt-3 max-w-md text-sm leading-7 text-neutral-600">
            留言会在这里慢慢流动。你也可以写下一句问候、建议或此刻的想法。
          </p>
        </div>

        <Link
          href="/guestbook/"
          className="portfolio-button mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-background"
        >
          去留言
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div
        className="comment-ticker-shell surface-soft relative min-h-72 overflow-hidden p-3 sm:min-h-80"
        aria-live="polite"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[color:var(--background)]/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-[color:var(--background)]/60 to-transparent"
        />

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[1.35rem] bg-white/55 dark:bg-white/[0.055]"
              />
            ))}
          </div>
        )}

        {!loading && (!configured || loadFailed) && (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <MessageCircle className="h-7 w-7 text-accent" aria-hidden="true" />
            <p className="mt-3 font-semibold text-primary">
              {configured ? '留言暂时没有加载成功' : '留言功能即将开放'}
            </p>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              {configured ? '稍后刷新页面再看看。' : '完成评论服务配置后，大家的留言会显示在这里。'}
            </p>
          </div>
        )}

        {!loading && configured && !loadFailed && comments.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <MessageCircle className="h-7 w-7 text-accent" aria-hidden="true" />
            <p className="mt-3 font-semibold text-primary">等待第一条留言</p>
            <p className="mt-1 text-sm text-neutral-500">你的声音可以从这里开始。</p>
          </div>
        )}

        {!loading && comments.length > 0 && (
          <div className={shouldAnimate ? 'comment-ticker-track' : ''}>
            <div className={shouldAnimate ? 'comment-ticker-group' : 'space-y-3'}>
              {visibleComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} compact />
              ))}
            </div>
            {shouldAnimate && (
              <div className="comment-ticker-group" aria-hidden="true">
                {visibleComments.map((comment) => (
                  <CommentCard key={`duplicate-${comment.id}`} comment={comment} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
