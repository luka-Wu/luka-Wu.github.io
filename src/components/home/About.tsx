'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRightIcon, MapIcon } from '@heroicons/react/24/outline';
import MarkdownContent from '@/components/ui/MarkdownContent';

interface AboutProps {
    content: string;
    title?: string;
    authorName?: string;
}

export default function About({ content, authorName = '吴洋洋' }: AboutProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="relative py-2"
        >
            <div className="portfolio-kicker mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.16em] text-neutral-600 sm:mb-7">
                <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_5px_rgba(64,203,181,0.15)]" />
                你好 · 很高兴遇见你
            </div>
            <h1 className="mb-6 text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.06em] text-primary min-[390px]:text-[3.05rem] sm:text-6xl lg:text-[5.15rem]">
                Hi,
                <span className="mt-2 block">
                    我是
                    <span className="relative isolate ml-1 inline-block text-accent">
                        {authorName}
                        <span className="absolute -bottom-1 left-0 -z-10 h-2 w-full -rotate-1 rounded-full bg-sun/55" />
                    </span>
                </span>
            </h1>
            <div className="surface-card mt-8 max-w-2xl p-5 sm:p-6">
                <MarkdownContent content={content} compact />
                <Link
                    href="/education-journey"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/[0.055] px-3.5 py-2 text-xs font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-accent/10"
                >
                    <MapIcon className="h-4 w-4" />
                    查看求学地图
                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
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
