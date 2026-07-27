import type { Metadata } from 'next';
import FamilyPackageCaseStudy from '@/components/portfolio/FamilyPackageCaseStudy';

export const metadata: Metadata = {
  title: '家庭包商品 OS｜作品集',
  description: '家庭包商品 OS 的脱敏产品案例与交互式流程展示。',
};

export default function FamilyPackageCaseStudyPage() {
  return <FamilyPackageCaseStudy />;
}
