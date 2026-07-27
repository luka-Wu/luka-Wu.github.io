import type { Metadata } from 'next';
import EducationJourneyMap from '@/components/portfolio/EducationJourneyMap';

export const metadata: Metadata = {
  title: '求学地图｜吴洋洋',
  description: '从长沙到武汉，再到北京的求学经历。',
};

export default function EducationJourneyPage() {
  return <EducationJourneyMap />;
}
