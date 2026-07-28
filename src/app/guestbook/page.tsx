import type { Metadata } from 'next';
import Guestbook from '@/components/comments/Guestbook';
import PhotoWall from '@/components/comments/PhotoWall';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: '留言',
  description: '写下名字和留言，与吴洋洋及其他访客分享想法。',
};

export default function GuestbookPage() {
  return (
    <div className="site-page">
      <div className="site-shell p-5 sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-gradient-to-br from-coral/30 via-sun/20 to-transparent blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 left-[35%] h-44 w-44 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative">
          <SectionHeader
            eyebrow="互动空间"
            title="留下一点声音"
            description="可以是一句问候、一个建议，也可以是你看完这个网站后的第一感受。"
            accent="coral"
            className="px-1 py-5 sm:px-2 sm:py-7"
          />
          <div className="mt-7 sm:mt-9">
            <PhotoWall />
            <Guestbook />
          </div>
        </div>
      </div>
    </div>
  );
}
