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
            <h1 className={`${embedded ? 'text-2xl' : 'text-4xl sm:text-5xl'} mb-4 font-semibold tracking-[-0.03em] text-primary`}>
                {config.title}
            </h1>
            {config.description && (
                <p className={`${embedded ? 'text-base' : 'text-lg'} mb-10 max-w-2xl leading-7 text-neutral-600`}>
                    {config.description}
                </p>
            )}
            <MarkdownContent content={content} compact={embedded} />
        </motion.div>
    );
}
