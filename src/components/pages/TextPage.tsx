'use client';

import { motion } from 'framer-motion';
import { TextPageConfig } from '@/types/page';
import MarkdownContent from '@/components/ui/MarkdownContent';

interface TextPageProps {
    config: TextPageConfig;
    content: string;
    embedded?: boolean;
}

export default function TextPage({ config, content, embedded = false }: TextPageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: embedded ? 0.15 : 0.05 }}
            className={embedded ? 'apple-card p-6 sm:p-8' : 'mx-auto max-w-3xl'}
        >
            <div className="mb-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rotate-12 rounded-[3px] bg-coral" />
                <span className="h-px w-10 bg-accent/35" />
                <span className="text-[10px] font-semibold tracking-[0.22em] text-neutral-500">PORTFOLIO</span>
            </div>
            <h1 className={`${embedded ? 'text-2xl' : 'text-[2.75rem] sm:text-6xl'} mb-4 font-semibold leading-[0.98] tracking-[-0.045em] text-primary`}>
                <span className="relative isolate inline-block">
                    {config.title}
                    <span aria-hidden="true" className="absolute -bottom-2 left-0 -z-10 h-1.5 w-2/3 -rotate-1 rounded-full bg-sun/65" />
                </span>
            </h1>
            {config.description && (
                <p className={`${embedded ? 'text-base' : 'text-lg'} mb-10 mt-7 max-w-2xl leading-7 text-neutral-600`}>
                    {config.description}
                </p>
            )}
            <MarkdownContent
                content={content}
                compact={embedded}
                layout={config.layout}
            />
        </motion.div>
    );
}
