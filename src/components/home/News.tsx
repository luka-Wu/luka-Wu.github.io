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
            className="apple-card p-6 sm:p-8"
        >
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-primary">{resolvedTitle}</h2>
            <div className="divide-y divide-neutral-200 dark:divide-white/10">
                {items.map((item, index) => (
                    <div key={index} className="grid gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-4">
                        <span className="text-sm font-medium text-neutral-500">{item.date}</span>
                        <p className="text-[15px] leading-7 text-neutral-700">{item.content}</p>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}
