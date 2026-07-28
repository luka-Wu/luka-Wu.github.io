import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ISurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'soft' | 'card' | 'elevated';
  padding?: 'none' | 'compact' | 'default' | 'spacious';
  interactive?: boolean;
}

const TONES = {
  soft: 'surface-soft',
  card: 'surface-card',
  elevated: 'surface-elevated',
} as const;

const PADDING = {
  none: '',
  compact: 'p-4 sm:p-5',
  default: 'p-5 sm:p-6',
  spacious: 'p-6 sm:p-8 lg:p-9',
} as const;

export default function SurfaceCard({
  tone = 'card',
  padding = 'default',
  interactive = false,
  className,
  ...props
}: ISurfaceCardProps) {
  return (
    <div
      className={cn(
        TONES[tone],
        PADDING[padding],
        interactive && 'surface-interactive',
        className,
      )}
      {...props}
    />
  );
}
