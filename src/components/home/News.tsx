'use client';

import { motion } from 'framer-motion';
import { useMessages } from '@/lib/i18n/useMessages';

export interface NewsItem {
    date: string;
    content: string;
}

interface NewsProps {
    items: NewsItem[];
    title?: string;
}

export default function News({ items, title }: NewsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.news;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="apple-card relative overflow-hidden p-6 sm:p-8"
        >
            <span aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sun/18" />
            <h2 className="relative mb-6 text-2xl font-semibold tracking-tight text-primary">{resolvedTitle}</h2>
            <div className="relative">
                <div className="absolute bottom-3 left-[6.1rem] top-3 w-px bg-gradient-to-b from-accent/70 via-accent/30 to-transparent" />
                {items.map((item, index) => (
                    <div key={index} className="relative grid grid-cols-[5.5rem_1.25rem_minmax(0,1fr)] gap-2 py-3 first:pt-0 last:pb-0">
                        <span className="pt-0.5 text-right text-xs font-semibold tracking-tight text-neutral-500">{item.date}</span>
                        <span className="relative z-10 mt-1.5 h-3 w-3 justify-self-center rounded-full border-2 border-background bg-accent shadow-[0_0_0_3px_rgba(108,92,231,0.14)]" />
                        <p className="text-[15px] leading-6 text-neutral-700">{item.content}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
