'use client';

import { motion } from 'framer-motion';
import { TextPageConfig } from '@/types/page';
import MarkdownContent from '@/components/ui/MarkdownContent';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

interface TextPageProps {
  config: TextPageConfig;
  content: string;
  embedded?: boolean;
}

function getPageEyebrow(title: string, layout?: string): string {
  if (layout === 'timeline' || title.includes('实习')) return '实践经历';
  if (title.toLowerCase().includes('cv') || title.includes('简历')) return '个人履历';
  if (title.includes('学术') || title.includes('发表')) return '研究成果';
  if (title.includes('荣誉')) return '荣誉档案';
  if (title.includes('活动')) return '实践现场';
  return '个人档案';
}

export default function TextPage({ config, content, embedded = false }: TextPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: embedded ? 0.12 : 0.04 }}
      className={cn(
        embedded ? 'surface-card p-6 sm:p-8' : 'mx-auto max-w-3xl',
      )}
    >
      <SectionHeader
        eyebrow={getPageEyebrow(config.title, config.layout)}
        title={config.title}
        description={config.description}
        size={embedded ? 'compact' : 'page'}
        accent={config.layout === 'timeline' ? 'coral' : 'accent'}
        headingLevel={embedded ? 'h2' : 'h1'}
      />
      <div className={cn(embedded ? 'mt-7' : 'mt-10 sm:mt-12')}>
        <MarkdownContent content={content} compact={embedded} layout={config.layout} />
      </div>
    </motion.div>
  );
}
