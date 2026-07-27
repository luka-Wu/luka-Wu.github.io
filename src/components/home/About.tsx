'use client';

import { motion } from 'framer-motion';
import MarkdownContent from '@/components/ui/MarkdownContent';

interface AboutProps {
    content: string;
    title?: string;
    authorName?: string;
}

export default function About({ content, authorName = '吴洋洋' }: AboutProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="py-2"
        >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-medium tracking-[0.16em] text-neutral-600 shadow-sm backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#68d8bd]" />
                HELLO / 你好
            </div>
            <h1 className="mb-5 text-6xl font-semibold leading-[0.95] tracking-[-0.06em] text-primary sm:text-7xl lg:text-8xl">
                Hi,
                <span className="mt-2 block">我是{authorName}</span>
            </h1>
            <div className="mt-8 max-w-2xl rounded-2xl border border-white/65 bg-white/38 p-5 backdrop-blur-sm sm:p-6">
                <MarkdownContent content={content} compact />
            </div>
        </motion.section>
    );
}
