'use client';

import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';

interface FooterProps {
  lastUpdated?: string;
  lastUpdatedByLocale?: Record<string, string | undefined>;
  defaultLocale?: string;
}

export default function Footer({ lastUpdated, lastUpdatedByLocale, defaultLocale = 'en' }: FooterProps) {
  const locale = useLocaleStore((state) => state.locale);
  const messages = useMessages();

  const resolvedLastUpdated =
    lastUpdatedByLocale?.[locale] ||
    (defaultLocale ? lastUpdatedByLocale?.[defaultLocale] : undefined) ||
    lastUpdated ||
    new Date().toLocaleDateString(locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <footer className="px-4 pb-5 pt-8">
      <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-white/60 bg-white/32 px-5 py-6 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03] sm:px-7">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="flex items-center gap-2 text-xs tracking-wide text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-mint" />
            {messages.footer.lastUpdated}: {resolvedLastUpdated}
          </p>
          <p className="flex items-center text-xs text-neutral-500">
            <a className="transition-colors hover:text-accent" href="https://github.com/xyjoey/PRISM" target="_blank" rel="noopener noreferrer">
              {messages.footer.builtWithPrism}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
