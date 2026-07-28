'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import SectionHeader from '@/components/ui/SectionHeader';

const EDUCATION_STOPS = [
  {
    id: 'qingzhuhu',
    order: '01',
    stage: '初中',
    city: '长沙',
    school: '长沙青竹湖湘一外国语学校',
    href: 'https://mp.weixin.qq.com/s/V0Pu9BUwk3b1VO1TBUiuBg',
    linkLabel: '学校官方发布',
    description: '在长沙完成初中阶段学习。',
    point: { x: 6890, y: 6350 },
  },
  {
    id: 'changsha-no1',
    order: '02',
    stage: '高中',
    city: '长沙',
    school: '湖南省长沙市第一中学',
    href: 'http://www.hnfms.com.cn/',
    linkLabel: '学校官网',
    description: '在长沙完成高中阶段学习。',
    point: { x: 7010, y: 6250 },
  },
  {
    id: 'wuhan',
    order: '03',
    stage: '本科 · 2022 级',
    city: '武汉',
    school: '武汉大学新闻与传播学院',
    href: 'https://journal.whu.edu.cn/',
    linkLabel: '学院官网',
    description: '就读广告学，持续开展传播、健康与人机交互相关研究。',
    point: { x: 7200, y: 5550 },
  },
  {
    id: 'beijing',
    order: '04',
    stage: '硕士 · 已推免',
    city: '北京',
    school: '北京大学新闻与传播学院',
    href: 'https://sjc.pku.edu.cn/',
    linkLabel: '学院官网',
    description: '已推免至北京大学新闻与传播学院，开启下一阶段学习。',
    point: { x: 7770, y: 3400 },
  },
] as const;

export default function EducationJourneyMap() {
  const [activeId, setActiveId] = useState<(typeof EDUCATION_STOPS)[number]['id']>('wuhan');
  const activeStop = EDUCATION_STOPS.find((stop) => stop.id === activeId) ?? EDUCATION_STOPS[2];

  return (
    <div className="site-page">
      <div className="site-shell p-5 sm:p-8 lg:p-12">
        <div aria-hidden="true" className="portfolio-grid pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-accent"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回个人介绍
          </Link>

          <SectionHeader
            eyebrow="求学地图"
            title="从长沙出发，一路向北。"
            description="在长沙完成中学阶段学习，前往武汉攻读本科，下一站是北京。"
            accent="mint"
          />

          <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.65fr)]">
            <div className="surface-card relative overflow-hidden p-3 sm:p-5">
              <div className="absolute left-5 top-5 z-10 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-neutral-500 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                中国 · 位置示意
              </div>

              <svg
                viewBox="0 0 10851 8359"
                role="img"
                aria-label="包含台湾省、南海诸岛和南海断续线的中国地图，以及长沙、武汉与北京求学路线"
                className="h-auto min-h-[24rem] w-full"
              >
                <defs>
                  <linearGradient id="routeLine" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--coral)" />
                    <stop offset="52%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--mint)" />
                  </linearGradient>
                  <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#6c5ce7" floodOpacity="0.18" />
                  </filter>
                </defs>

                <motion.image
                  href="/china-map.svg"
                  x="0"
                  y="0"
                  width="10851"
                  height="8359"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 0.92, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  style={{ transformOrigin: 'center' }}
                />

                <motion.path
                  d="M6890 6350 C6930 6320 6980 6280 7010 6250 C7080 6100 7140 5760 7200 5550 C7380 4860 7600 4020 7770 3400"
                  fill="none"
                  stroke="url(#routeLine)"
                  strokeWidth="70"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.25 }}
                  filter="url(#softShadow)"
                />

                {EDUCATION_STOPS.map((stop, index) => {
                  const isActive = stop.id === activeId;

                  return (
                    <g
                      key={stop.id}
                      onClick={() => setActiveId(stop.id)}
                      className="cursor-pointer focus:outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${stop.stage}：${stop.school}`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          setActiveId(stop.id);
                        }
                      }}
                    >
                      <circle
                        cx={stop.point.x}
                        cy={stop.point.y}
                        r="390"
                        fill="transparent"
                      />
                      <motion.circle
                        cx={stop.point.x}
                        cy={stop.point.y}
                        r={isActive ? 266 : 210}
                        fill="var(--background)"
                        stroke={isActive ? 'var(--accent)' : 'var(--primary)'}
                        strokeWidth={isActive ? 70 : 42}
                        animate={{ scale: isActive ? [1, 1.12, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        style={{ transformOrigin: `${stop.point.x}px ${stop.point.y}px` }}
                      />
                      <text
                        x={stop.point.x}
                        y={stop.point.y + 56}
                        textAnchor="middle"
                        fill={isActive ? 'var(--accent)' : 'var(--primary)'}
                        fontSize="154"
                        fontWeight="700"
                      >
                        {index + 1}
                      </text>
                      {index !== 1 && (
                        <text
                          x={stop.point.x + (index === 0 ? -18 : 22)}
                          y={stop.point.y + (index === 0 ? 434 : 56)}
                          textAnchor={index === 0 ? 'end' : 'start'}
                          fill="var(--neutral-600)"
                          fontSize="182"
                          fontWeight="600"
                        >
                          {stop.city}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              <p className="px-2 pb-2 text-xs leading-5 text-neutral-500">
                路线点位仅用于展示求学经历。
              </p>
            </div>

            <div className="surface-card p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex h-full min-h-[16rem] flex-col lg:min-h-[20rem]"
                >
                  <span className="text-5xl font-semibold text-accent/25">{activeStop.order}</span>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">
                    <MapPinIcon className="h-4 w-4" />
                    {activeStop.city}
                  </div>
                  <span className="mt-3 text-xs font-semibold tracking-[0.14em] text-neutral-500">
                    {activeStop.stage}
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-[-0.03em] text-primary">
                    {activeStop.school}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{activeStop.description}</p>
                  <a
                    href={activeStop.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-button portfolio-button-secondary mt-auto self-start"
                  >
                    {activeStop.linkLabel}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <section className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {EDUCATION_STOPS.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setActiveId(stop.id)}
                className={`min-w-[16rem] snap-start rounded-[1.35rem] border p-4 text-left transition-all duration-300 sm:min-w-0 ${
                  stop.id === activeId
                    ? 'border-accent/30 bg-accent/10 shadow-[0_12px_30px_rgba(108,92,231,0.12)]'
                    : 'border-white/65 bg-white/38 hover:-translate-y-1 hover:bg-white/65 dark:border-white/10 dark:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent">{stop.order}</span>
                  <span className="text-xs text-neutral-500">{stop.city}</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-primary">{stop.school}</p>
                <p className="mt-1 text-xs text-neutral-500">{stop.stage}</p>
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
