'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  compact?: boolean;
  layout?: 'default' | 'timeline';
}

export default function MarkdownContent({
  content,
  compact = false,
  layout = 'default',
}: MarkdownContentProps) {
  const isTimeline = layout === 'timeline';

  return (
    <div
      className={
        `${compact
          ? 'text-[16px] leading-7'
          : 'text-[17px] leading-8'
        } text-neutral-700 ${
          isTimeline
            ? 'relative before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-neutral-200 dark:before:bg-white/10'
            : ''
        }`
      }
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-5 mt-12 text-3xl font-semibold tracking-[-0.035em] text-primary first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={
                isTimeline
                  ? 'relative mb-2 mt-10 pl-10 text-sm font-semibold tracking-[0.08em] text-accent first:mt-0 before:absolute before:left-0 before:top-[0.45rem] before:size-[15px] before:rounded-full before:border-[4px] before:border-background before:bg-accent before:shadow-[0_0_0_1px_rgba(108,92,231,0.24)]'
                  : 'surface-soft mb-5 mt-12 px-5 py-4 text-2xl font-semibold tracking-[-0.025em] text-primary first:mt-0'
              }
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`${isTimeline ? 'mb-3 mt-0 pl-10 text-[1.35rem] sm:text-2xl' : 'mb-3 mt-8 text-xl'} font-semibold tracking-tight text-primary`}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`${isTimeline ? 'pl-10' : ''} my-4 text-pretty first:mt-0 last:mb-0`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`${isTimeline ? 'ml-10' : ''} my-5 list-outside list-disc space-y-2 pl-6 marker:text-neutral-400`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`${isTimeline ? 'ml-10' : ''} my-5 list-outside list-decimal space-y-2 pl-7 marker:font-medium marker:text-neutral-500`}>
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1 text-pretty">{children}</li>,
          a: ({ href = '', children, ...props }) => {
            const isExternal = /^https?:\/\//.test(href);

            return (
              <a
                {...props}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-2xl border-l-4 border-accent/50 bg-accent/[0.045] px-5 py-3 text-neutral-600">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
          em: ({ children }) => <em className="italic text-neutral-600">{children}</em>,
          hr: () => <hr className="my-10 border-neutral-200 dark:border-white/10" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
