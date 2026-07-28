import type { Metadata } from 'next';
import Guestbook from '@/components/comments/Guestbook';
import PhotoWall from '@/components/comments/PhotoWall';

export const metadata: Metadata = {
  title: '留言',
  description: '写下名字和留言，与吴洋洋及其他访客分享想法。',
};

export default function GuestbookPage() {
  return (
    <div className="mx-auto min-h-[calc(100vh-7rem)] max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/65 bg-white/48 px-6 py-9 shadow-[0_22px_70px_rgba(70,45,90,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:px-9 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-coral/35 via-sun/25 to-transparent blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 left-[35%] h-44 w-44 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Open Guestbook
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-primary sm:text-5xl">
            留下一点声音
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-neutral-600 sm:text-base">
            可以是一句问候、一个建议，也可以是你看完这个网站后的第一感受。
          </p>
        </div>
      </header>

      <PhotoWall />
      <Guestbook />
    </div>
  );
}
