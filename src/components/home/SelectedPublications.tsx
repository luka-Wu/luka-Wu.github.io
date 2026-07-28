'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from '@/components/publications/FormattedBibTeXText';
import SectionHeader from '@/components/ui/SectionHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-5 flex items-end justify-between gap-4">
                <SectionHeader
                    eyebrow="研究成果"
                    title={resolvedTitle}
                    size="compact"
                    headingLevel="h2"
                />
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="mb-1 shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                        <SurfaceCard interactive padding="compact">
                            <h3 className="mb-2 font-semibold leading-tight text-primary">
                                <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                            </h3>
                            <p className="mb-1 text-sm text-neutral-600">
                                {pub.authors.map((author, idx) => (
                                    <span key={idx}>
                                        <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                            {author.name}
                                        </span>
                                        {author.isCorresponding && (
                                            <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600'}`}>†</sup>
                                        )}
                                        {idx < pub.authors.length - 1 && ', '}
                                    </span>
                                ))}
                            </p>
                            <p className="mb-2 text-sm font-medium text-neutral-600">
                                {pub.journal || pub.conference}
                            </p>
                            {pub.description && (
                                <p className="line-clamp-2 text-sm text-neutral-500">
                                    {pub.description}
                                </p>
                            )}
                        </SurfaceCard>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
