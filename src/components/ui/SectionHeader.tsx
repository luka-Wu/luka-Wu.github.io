import { cn } from '@/lib/utils';

interface ISectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  size?: 'hero' | 'page' | 'section' | 'compact';
  accent?: 'accent' | 'coral' | 'mint' | 'sun';
  className?: string;
  titleClassName?: string;
  headingLevel?: 'h1' | 'h2';
  titleId?: string;
}

const TITLE_SIZES = {
  hero: 'text-[3.3rem] leading-[0.92] sm:text-7xl lg:text-[5.25rem]',
  page: 'text-[2.75rem] leading-[0.96] sm:text-6xl lg:text-[4.25rem]',
  section: 'text-3xl leading-tight sm:text-4xl',
  compact: 'text-2xl leading-tight sm:text-3xl',
} as const;

const EYEBROW_ACCENTS = {
  accent: 'border-accent/20 bg-accent/8 text-accent',
  coral: 'border-coral/25 bg-coral/8 text-coral',
  mint: 'border-mint/25 bg-mint/8 text-mint',
  sun: 'border-sun/30 bg-sun/10 text-neutral-700',
} as const;

const EYEBROW_DOTS = {
  accent: 'bg-accent',
  coral: 'bg-coral',
  mint: 'bg-mint',
  sun: 'bg-sun',
} as const;

export default function SectionHeader({
  eyebrow,
  title,
  description,
  size = 'page',
  accent = 'accent',
  className,
  titleClassName,
  headingLevel = 'h1',
  titleId,
}: ISectionHeaderProps) {
  const Heading = headingLevel;

  return (
    <header className={cn('max-w-3xl', className)}>
      <span
        className={cn(
          'portfolio-kicker inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em]',
          EYEBROW_ACCENTS[accent],
        )}
      >
        <span className={cn('h-1.5 w-1.5 rotate-12 rounded-[2px]', EYEBROW_DOTS[accent])} />
        {eyebrow}
      </span>
      <Heading
        id={titleId}
        className={cn(
          'mt-5 text-balance font-semibold tracking-[-0.05em] text-primary',
          TITLE_SIZES[size],
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            'text-pretty text-neutral-600',
            size === 'compact'
              ? 'mt-3 text-sm leading-6'
              : size === 'section'
                ? 'mt-4 text-base leading-7'
                : 'mt-6 text-base leading-7 sm:text-lg sm:leading-8',
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}
