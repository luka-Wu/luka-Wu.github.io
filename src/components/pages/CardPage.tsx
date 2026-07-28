'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CardPageConfig } from '@/types/page';
import SectionHeader from '@/components/ui/SectionHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ href = '', ...props }: React.ComponentProps<'a'>) => {
        const isExternal = /^https?:\/\//.test(href);

        return (
            <a
                {...props}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            />
        );
    },
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <SectionHeader
                eyebrow="精选档案"
                title={config.title}
                description={config.description}
                size={embedded ? 'compact' : 'page'}
                accent="coral"
                className={embedded ? 'mb-6' : 'mb-10'}
                headingLevel={embedded ? 'h2' : 'h1'}
            />

            <div className={`grid ${embedded ? "gap-4" : "gap-5 sm:grid-cols-2"}`}>
                {config.items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                        <SurfaceCard
                            interactive
                            padding={embedded ? 'compact' : 'default'}
                            className="group h-full"
                        >
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary`}>{item.title}</h3>
                                {item.date && (
                                    <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                                        {item.date}
                                    </span>
                                )}
                            </div>
                            {item.subtitle && (
                                <p className={`${embedded ? "text-sm" : "text-base"} mb-3 font-medium text-accent`}>{item.subtitle}</p>
                            )}
                            {item.content && (
                                <div className={`${embedded ? "text-sm" : "text-base"} leading-relaxed text-neutral-600`}>
                                    <ReactMarkdown components={markdownComponents}>
                                        {item.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {item.tags && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="portfolio-chip">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </SurfaceCard>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
