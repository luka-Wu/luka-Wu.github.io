'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
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
            className="relative py-2"
        >
            <div className="portfolio-kicker mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.16em] text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_5px_rgba(64,203,181,0.15)]" />
                HELLO · 你好
            </div>
            <h1 className="mb-6 text-[3.5rem] font-semibold leading-[0.92] tracking-[-0.065em] text-primary sm:text-7xl lg:text-[5.4rem]">
                Hi,
                <span className="mt-2 block">
                    我是
                    <span className="relative isolate ml-1 inline-block text-accent">
                        {authorName}
                        <span className="absolute -bottom-1 left-0 -z-10 h-2 w-full -rotate-1 rounded-full bg-sun/55" />
                    </span>
                </span>
            </h1>
            <div className="mt-8 max-w-2xl rounded-[1.75rem] border border-white/65 bg-white/42 p-5 shadow-[0_16px_42px_rgba(78,57,107,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:p-6">
                <MarkdownContent content={content} compact />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
                <span className="portfolio-chip">人机交互</span>
                <span className="portfolio-chip">健康传播</span>
                <span className="portfolio-chip">广告与创意</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/internships" className="portfolio-button portfolio-button-secondary">
                    浏览实习经历
                    <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/publications" className="portfolio-button portfolio-button-primary">
                    查看学术成果
                    <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
            </div>
        </motion.section>
    );
}
