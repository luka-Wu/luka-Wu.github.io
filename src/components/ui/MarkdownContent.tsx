'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  compact?: boolean;
}

export default function MarkdownContent({
  content,
  compact = false,
}: MarkdownContentProps) {
  return (
    <div
      className={
        compact
          ? 'text-[16px] leading-7 text-neutral-700 dark:text-neutral-700'
          : 'text-[17px] leading-8 text-neutral-700 dark:text-neutral-700'
      }
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-5 mt-12 text-3xl font-semibold tracking-tight text-primary first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-5 mt-12 border-b border-neutral-200 pb-3 text-2xl font-semibold tracking-tight text-primary first:mt-0 dark:border-white/10">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-primary">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-4 text-pretty first:mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-5 list-outside list-disc space-y-2 pl-6 marker:text-neutral-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 list-outside list-decimal space-y-2 pl-7 marker:font-medium marker:text-neutral-500">
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
            <blockquote className="my-6 rounded-r-2xl border-l-4 border-accent/50 bg-neutral-100/70 px-5 py-3 text-neutral-600 dark:bg-white/5 dark:text-neutral-600">
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
