'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import CommentCard from '@/components/comments/CommentCard';
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
      className="mt-10 grid gap-5 overflow-hidden rounded-[2rem] border border-white/65 bg-white/42 p-5 shadow-[0_20px_60px_rgba(68,45,89,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:mt-12 sm:p-7 lg:grid-cols-[minmax(15rem,0.7fr)_minmax(0,1.3fr)] lg:p-8"
    >
      <div className="flex flex-col justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/8 px-3 py-1.5 text-xs font-semibold tracking-wide text-accent">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            大家的留言
          </span>
          <h2
            id="home-comments-title"
            className="mt-5 text-3xl font-bold tracking-[-0.04em] text-primary sm:text-4xl"
          >
            有人在这里
            <br className="hidden lg:block" />
            留下了声音
          </h2>
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
        className="comment-ticker-shell relative min-h-72 overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.025] sm:min-h-80"
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
