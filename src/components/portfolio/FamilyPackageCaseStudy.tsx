'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const MODULES = [
  {
    id: 'sales',
    symbol: '¥',
    label: '销量进展',
    description: '分渠道、团组与销售查看家庭包销量和 GMV 进展。',
    flow: ['选择周期', '切换组织层级', '查看进展', '定位差距'],
    details: ['支持按日、周与累计周期查看', '渠道、团组、销售三级下钻', '统一销量 KPI 与 GMV 指标口径'],
    outputs: ['组织进展概览', '目标差距定位', '销售跟进线索'],
  },
  {
    id: 'calls',
    symbol: '☎',
    label: '外呼日检',
    description: '检查当日全量电销外呼的报价前确认、多孩识别与家庭包推荐执行情况。',
    flow: ['汇总外呼', '定位片段', '人工复核', '反馈改进'],
    details: ['覆盖当日全量电销外呼', '逐项检查关键销售动作', '逐用户回放语料追溯证据'],
    outputs: ['个人执行清单', '关键语料证据', '团组问题汇总'],
  },
  {
    id: 'dialogue',
    symbol: '◇',
    label: '成交话术分析',
    description: '逐单还原成交过程，沉淀优秀打法与可复用话术。',
    flow: ['筛选成交单', '还原过程', '标注动作', '沉淀话术'],
    details: ['还原完整沟通过程', '标注需求、推荐与异议节点', '提炼可复用沟通策略'],
    outputs: ['逐单成交路径', '优秀话术片段', '沟通策略归档'],
  },
  {
    id: 'loss',
    symbol: '✦',
    label: '流失归因',
    description: '对推荐家庭包后购买其他组合品的订单逐单归因，寻找流失模式。',
    flow: ['识别转购', '逐单归因', '聚合模式', '反哺策略'],
    details: ['覆盖单孩聚焦、价格、学段错位等 8 类原因', '结合家庭结构寻找模式', '反向优化产品与沟通策略'],
    outputs: ['逐单流失标签', '家庭结构模式', '策略优化建议'],
  },
  {
    id: 'playbook',
    symbol: '◆',
    label: '组合销售手册',
    description: '30 个年级组合按强推、可推与不推分档，每个组合对应一张销售卡。',
    flow: ['选择年级', '判断分档', '读取卡片', '辅助沟通'],
    details: ['覆盖 30 个常见年级组合', '明确强推、可推、不推边界', '整合提问、价值表达与异议处理'],
    outputs: ['组合销售卡', '未成交反面案例', 'CRM 沟通弹药'],
  },
  {
    id: 'research',
    symbol: '◎',
    label: '用研知识',
    description: '只读查看 Owner 已审核发布的用户研究知识。',
    flow: ['收集洞察', '审核结论', '主题归档', '业务复用'],
    details: ['来源于访谈、沟通记录与业务观察', '仅展示审核发布的研究结论', '按家庭结构与需求主题归档'],
    outputs: ['用户需求洞察', '决策因素归档', '可引用研究结论'],
  },
] as const;

const PRODUCT_VALUES = [
  {
    eyebrow: 'FAMILY',
    title: '多孩家庭',
    description: '关注一个家庭里多个孩子的长期学习权益、续费机会和跨年级规划。',
    border: 'border-l-[#2347a6]',
  },
  {
    eyebrow: 'LONG TERM',
    title: '长线陪伴',
    description: '把家庭长期学习需求、阶段性目标和服务体验串起来，支持销售持续跟进。',
    border: 'border-l-[#176545]',
  },
  {
    eyebrow: 'VALUE',
    title: '组合价值',
    description: '围绕家庭包权益、价格解释、使用场景和保障机制沉淀统一话术。',
    border: 'border-l-[#a72d25]',
  },
] as const;

type ModuleId = (typeof MODULES)[number]['id'];
type ActiveView = 'overview' | ModuleId;

const panelClass = 'border border-[#c9c4b9] border-t-[#15212a] bg-[#fffdf7]';
const monoClass = 'font-mono text-[10px] font-bold tracking-[0.1em]';

export default function FamilyPackageCaseStudy() {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const activeModule = MODULES.find((module) => module.id === activeView);

  const selectView = (view: ActiveView) => {
    setActiveView(view);
    window.requestAnimationFrame(() => {
      document.getElementById('family-package-content')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <div className="mx-auto w-full max-w-[88rem] overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="overflow-hidden border border-[#15212a] bg-[#efe9dc] text-[#15212a] shadow-[0_24px_70px_rgba(41,34,25,0.14)]">
        <div className="grid min-w-0 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-[#15212a] bg-[#fffdf7] lg:min-h-[72rem] lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-3 border-b border-[#15212a] p-4 lg:p-5">
              <span className="flex h-10 min-w-10 items-center justify-center bg-[#d8662f] px-2 font-mono text-[10px] font-bold text-white">
                家庭包
              </span>
              <div>
                <strong className="block text-sm font-extrabold">家庭包商品 OS</strong>
                <span className="mt-1 block text-[10px] leading-4 text-[#5d6360]">
                  全家共学 · 多孩家庭 · 长线陪伴
                </span>
              </div>
            </div>

            <nav aria-label="产品案例模块" className="flex w-full max-w-full overflow-x-auto lg:block">
              <button
                type="button"
                onClick={() => selectView('overview')}
                className={`flex min-w-max items-center gap-4 border-r border-[#ded8cc] px-4 py-3 text-left text-xs font-bold lg:w-full lg:border-b lg:border-r-0 ${
                  activeView === 'overview'
                    ? 'bg-[#15212a] text-[#fffdf7]'
                    : 'bg-[#fffdf7] text-[#15212a] hover:bg-[#e7ecfa]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-70">01</span>
                概览
              </button>
              {MODULES.map((module, index) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => selectView(module.id)}
                  className={`flex min-w-max items-center gap-4 border-r border-[#ded8cc] px-4 py-3 text-left text-xs font-bold lg:w-full lg:border-b lg:border-r-0 ${
                    activeView === module.id
                      ? 'bg-[#15212a] text-[#fffdf7]'
                      : 'bg-[#fffdf7] text-[#15212a] hover:bg-[#e7ecfa]'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  {module.label}
                </button>
              ))}
            </nav>
          </aside>

          <div id="family-package-content" className="min-w-0 scroll-mt-28 p-5 sm:p-8 lg:p-9">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#15212a] pt-4">
              <span className={`${monoClass} text-[#2347a6]`}>PRODUCTOS / OPERATING VIEW</span>
              <Link
                href="/internships/"
                className="inline-flex items-center gap-2 border border-[#15212a] px-3 py-2 text-xs font-bold transition-colors hover:bg-[#15212a] hover:text-[#fffdf7]"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                返回实习经历
              </Link>
            </div>

            {activeModule ? (
              <ModuleView module={activeModule} />
            ) : (
              <Overview onSelect={selectView} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview({ onSelect }: { onSelect: (view: ActiveView) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <header className="mb-4 border-b border-[#c9c4b9] pb-4">
        <h1 className="text-[2.75rem] font-black leading-none tracking-[-0.055em] sm:text-[3.25rem]">概览</h1>
        <p className="mt-2 text-xs text-[#5d6360]">先看产品是什么，再看进展到哪。</p>
      </header>

      <section className="grid min-h-44 gap-6 border border-[#15212a] bg-[#fffdf7] p-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(13rem,0.65fr)]">
        <div>
          <span className={`${monoClass} text-[#2347a6]`}>FAMILY PACKAGE WORKSPACE</span>
          <h2 className="mt-7 max-w-3xl break-words text-[1.75rem] font-black leading-[1.08] tracking-[-0.045em] sm:text-[2.65rem]">
            家庭包：全家共学 · 多孩家庭 · 长线陪伴
          </h2>
        </div>
        <div className="hidden items-end justify-end border-l border-[#c9c4b9] pl-6 sm:flex">
          <span className={`${monoClass} text-right text-[#5d6360]`}>NX / PRODUCT INTELLIGENCE</span>
        </div>
      </section>

      <section className={`${panelClass} mt-4 p-4 sm:p-5`}>
        <h2 className="text-sm font-extrabold">
          <span className={`${monoClass} mr-2 text-[#2347a6]`}>01 /</span>
          产品介绍
        </h2>
        <div className="mt-4 grid sm:grid-cols-3">
          {PRODUCT_VALUES.map((value) => (
            <article
              key={value.title}
              className={`border border-[#ded8cc] border-l-2 ${value.border} p-4 sm:-mr-px`}
            >
              <span className={`${monoClass} text-[#5d6360]`}>{value.eyebrow}</span>
              <h3 className="mt-2 text-sm font-extrabold">{value.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[#3f494d]">{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${panelClass} mt-4 p-4 sm:p-5`}>
        <h2 className="text-sm font-extrabold">
          <span className={`${monoClass} mr-2 text-[#2347a6]`}>02 /</span>
          销量进展（脱敏归档）
        </h2>
        <div className="mt-4 flex min-h-56 flex-col items-center justify-center border border-dashed border-[#c9c4b9] bg-[#e9e1d1] p-6 text-center">
          <span className="text-4xl text-[#736750]">¥</span>
          <h3 className="mt-4 text-lg font-extrabold">公开案例不展示销量数据</h3>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-[#736750]">
            销量数据、指标口径、用户信息及内部看板均已移除，仅保留原产品的信息结构与交互方式。
          </p>
          <span className="mt-5 inline-flex items-center gap-2 border border-[#2347a6] px-4 py-2 text-xs font-bold text-[#2347a6]">
            <LockClosedIcon className="h-4 w-4" />
            数据已脱敏
          </span>
        </div>
      </section>

      <section className={`${panelClass} mt-4 p-4 sm:p-5`}>
        <h2 className="text-sm font-extrabold">
          <span className={`${monoClass} mr-2 text-[#2347a6]`}>03 /</span>
          模块介绍
        </h2>
        <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((module) => (
            <article key={module.id} className="flex min-h-40 flex-col border border-[#ded8cc] p-4 sm:-mr-px sm:-mb-px">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base">{module.symbol}</span>
                <h3 className="text-sm font-extrabold">{module.label}</h3>
              </div>
              <p className="mt-3 flex-1 text-xs leading-6 text-[#3f494d]">{module.description}</p>
              <button
                type="button"
                onClick={() => onSelect(module.id)}
                className="mt-4 inline-flex w-fit items-center gap-2 border border-[#15212a] px-3 py-2 text-xs font-bold transition-colors hover:bg-[#15212a] hover:text-[#fffdf7]"
              >
                进入
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function ModuleView({ module }: { module: (typeof MODULES)[number] }) {
  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ModuleHeader module={module} />
      {module.id === 'sales' && <SalesProgressView />}
      {module.id === 'calls' && <CallsInspectionView />}
      {module.id === 'dialogue' && <DealSpeechView />}
      {module.id === 'loss' && <LossAttributionView />}
      {module.id === 'playbook' && <SalesPlaybookView />}
      {module.id === 'research' && <ResearchKnowledgeView />}
    </motion.div>
  );
}

function ModuleHeader({ module }: { module: (typeof MODULES)[number] }) {
  return (
    <header className="mb-4 border-b border-[#c9c4b9] pb-4">
      <h1 className="break-words text-[2.35rem] font-black leading-none tracking-[-0.055em] sm:text-[3.25rem]">
        {module.label}
      </h1>
      <p className="mt-2 max-w-3xl text-xs leading-6 text-[#5d6360]">{module.description}</p>
    </header>
  );
}

function SectionHeading({ number, children }: { number: string; children: ReactNode }) {
  return (
    <h2 className="text-sm font-extrabold">
      <span className={`${monoClass} mr-2 text-[#2347a6]`}>{number} /</span>
      {children}
    </h2>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex max-w-full overflow-x-auto border border-[#15212a]" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={`min-h-10 min-w-max border-r border-[#15212a] px-4 text-xs font-bold last:border-r-0 ${
            value === option ? 'bg-[#15212a] text-[#fffdf7]' : 'bg-[#fffdf7] hover:bg-[#f7f2e8]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MetricCards({ labels }: { labels: readonly string[] }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4">
      {labels.map((label) => (
        <article key={label} className="relative min-h-28 border border-[#c9c4b9] border-t-[#15212a] bg-[#fffdf7] p-4 sm:-mr-px">
          <span className={`${monoClass} text-[#5d6360]`}>{label}</span>
          <strong className="mt-5 block text-3xl font-black tracking-[-0.05em]">—</strong>
          <span className="mt-2 block text-[10px] text-[#5d6360]">公开版本已隐藏数值</span>
          <span className="absolute right-0 top-0 h-1 w-6 bg-[#2347a6]" />
        </article>
      ))}
    </div>
  );
}

function SalesProgressView() {
  const [period, setPeriod] = useState('当天数据');
  const [level, setLevel] = useState('渠道');

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={['当天数据', '历史数据']}
        value={period}
        onChange={setPeriod}
        label="销量数据周期"
      />

      <section className={`${panelClass} p-4 sm:p-5`}>
        <SectionHeading number="01">销量总览</SectionHeading>
        <p className="mt-2 text-xs leading-6 text-[#5d6360]">
          保留原系统按当天快照和历史区间查看进展的结构；真实销量、GMV 与完成率均不公开。
        </p>
        <div className="mt-4">
          <MetricCards labels={['销量 KPI', '累计销量', 'GMV', '完成进度']} />
        </div>
      </section>

      <section className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading number="02">组织下钻</SectionHeading>
          <SegmentedControl
            options={['渠道', '团组', '销售']}
            value={level}
            onChange={setLevel}
            label="组织层级"
          />
        </div>
        <div className="mt-4 overflow-x-auto border border-[#c9c4b9] bg-[#fffdf7]">
          <table className="min-w-[42rem] w-full text-left text-xs">
            <thead className="bg-[#efe9dc] font-mono text-[10px] text-[#5d6360]">
              <tr>
                <th className="border-b border-[#15212a] p-3">{level}</th>
                <th className="border-b border-[#15212a] p-3">目标</th>
                <th className="border-b border-[#15212a] p-3">销量</th>
                <th className="border-b border-[#15212a] p-3">GMV</th>
                <th className="border-b border-[#15212a] p-3">进度</th>
              </tr>
            </thead>
            <tbody>
              {['整体', '分组 A', '分组 B'].map((row) => (
                <tr key={row} className="hover:bg-[#e7ecfa]">
                  <td className="border-b border-[#ded8cc] p-3 font-bold">{level}{row}</td>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <td key={index} className="border-b border-[#ded8cc] p-3 text-[#5d6360]">已脱敏</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CallsInspectionView() {
  const [tab, setTab] = useState('外呼日检');
  const [filter, setFilter] = useState('全部');

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={['外呼日检', '外呼逐用户']}
        value={tab}
        onChange={setTab}
        label="外呼日检视图"
      />

      <section className={`${panelClass} p-4 sm:p-5`}>
        <SectionHeading number="01">执行检查</SectionHeading>
        <div className="mt-4">
          <MetricCards labels={['有效外呼', '报价前确认', '多孩识别', '推荐家庭包']} />
        </div>
      </section>

      <section className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading number="02">{tab}</SectionHeading>
          <SegmentedControl
            options={['全部', '待复核', '已完成']}
            value={filter}
            onChange={setFilter}
            label="复核状态"
          />
        </div>
        <div className="mt-4 overflow-x-auto border border-[#c9c4b9]">
          <table className="min-w-[46rem] w-full text-left text-xs">
            <thead className="bg-[#efe9dc] font-mono text-[10px] text-[#5d6360]">
              <tr>
                <th className="border-b border-[#15212a] p-3">对象</th>
                <th className="border-b border-[#15212a] p-3">报价前确认</th>
                <th className="border-b border-[#15212a] p-3">多孩识别</th>
                <th className="border-b border-[#15212a] p-3">家庭包推荐</th>
                <th className="border-b border-[#15212a] p-3">证据</th>
              </tr>
            </thead>
            <tbody>
              {['匿名记录 A', '匿名记录 B', '匿名记录 C'].map((row, index) => (
                <tr key={row} className="hover:bg-[#e7ecfa]">
                  <td className="border-b border-[#ded8cc] p-3 font-bold">{row}</td>
                  <td className="border-b border-[#ded8cc] p-3">{index === 1 ? '待复核' : '已检查'}</td>
                  <td className="border-b border-[#ded8cc] p-3">已检查</td>
                  <td className="border-b border-[#ded8cc] p-3">已检查</td>
                  <td className="border-b border-[#ded8cc] p-3 text-[#2347a6]">脱敏片段</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DealSpeechView() {
  const [tab, setTab] = useState('方法总览');

  return (
    <div className="space-y-4">
      <SegmentedControl
        options={['方法总览', '销售复盘', '逐单案例']}
        value={tab}
        onChange={setTab}
        label="成交话术分析视图"
      />

      {tab === '方法总览' && (
        <section className={`${panelClass} p-4 sm:p-5`}>
          <SectionHeading number="01">成交方法拆解</SectionHeading>
          <div className="mt-4 grid md:grid-cols-3">
            {[
              ['需求触发', '找到用户开始讨论家庭学习规划的节点。'],
              ['价值解释', '拆解权益、价格与使用场景的表达方式。'],
              ['异议回应', '整理关键异议及对应沟通策略。'],
            ].map(([title, description], index) => (
              <article key={title} className="border border-[#ded8cc] p-4 md:-mr-px">
                <span className={`${monoClass} text-[#2347a6]`}>0{index + 1}</span>
                <h3 className="mt-3 text-sm font-extrabold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#3f494d]">{description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === '销售复盘' && (
        <section className={`${panelClass} p-4 sm:p-5`}>
          <SectionHeading number="02">销售级方法复盘</SectionHeading>
          <div className="mt-4 space-y-3">
            {['需求识别打法', '组合价值表达', '异议处理建议'].map((title, index) => (
              <details key={title} className="border border-[#c9c4b9] bg-[#fffdf7]" open={index === 0}>
                <summary className="cursor-pointer p-4 text-sm font-extrabold">{title}</summary>
                <div className="border-t border-[#ded8cc] p-4 text-xs leading-6 text-[#3f494d]">
                  公开案例仅保留分析框架；原始语料、销售身份和具体订单信息均已移除。
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {tab === '逐单案例' && (
        <section className={`${panelClass} p-4 sm:p-5`}>
          <SectionHeading number="03">逐单成交路径</SectionHeading>
          <div className="mt-4 space-y-3">
            {['匿名成交案例 01', '匿名成交案例 02'].map((title) => (
              <details key={title} className="border border-[#c9c4b9] bg-[#fffdf7]">
                <summary className="cursor-pointer p-4 text-sm font-extrabold">{title}</summary>
                <div className="grid border-t border-[#ded8cc] sm:grid-cols-4">
                  {['需求触发', '产品推荐', '异议回应', '完成成交'].map((step, index) => (
                    <div key={step} className="border-b border-[#ded8cc] p-4 sm:-mr-px sm:border-r">
                      <span className={`${monoClass} text-[#2347a6]`}>0{index + 1}</span>
                      <strong className="mt-2 block text-xs">{step}</strong>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LossAttributionView() {
  const reasons = ['单孩聚焦', '价格敏感', '学段错位', '决策延迟', '权益疑问', '使用频率', '组合偏好', '其他'];
  const [reason, setReason] = useState(reasons[0]);

  return (
    <div className="space-y-4">
      <section className={`${panelClass} p-4 sm:p-5`}>
        <SectionHeading number="01">流失原因分布</SectionHeading>
        <p className="mt-2 text-xs leading-6 text-[#5d6360]">
          保留原系统的 8 类归因框架；订单数量、用户信息与内部证据均已隐藏。
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4">
          {reasons.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setReason(item)}
              className={`min-h-24 border p-4 text-left ${
                reason === item
                  ? 'border-[#15212a] bg-[#15212a] text-[#fffdf7]'
                  : 'border-[#c9c4b9] bg-[#fffdf7] hover:bg-[#e7ecfa]'
              }`}
            >
              <span className={`${monoClass} opacity-70`}>{String(index + 1).padStart(2, '0')}</span>
              <strong className="mt-3 block text-sm">{item}</strong>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${panelClass} p-4 sm:p-5`}>
          <SectionHeading number="02">家庭结构</SectionHeading>
          <div className="mt-4 flex flex-wrap gap-2">
            {['单孩家庭', '二孩同学段', '二孩跨学段', '三孩及以上'].map((item) => (
              <span key={item} className="border border-[#c9c4b9] bg-[#f7f2e8] px-3 py-2 text-xs font-bold">{item}</span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-6 text-[#3f494d]">
            将家庭结构与流失原因交叉查看，定位不同孩子数量和年级组合下的高频问题。
          </p>
        </section>

        <section className={`${panelClass} p-4 sm:p-5`}>
          <SectionHeading number="03">当前归因：{reason}</SectionHeading>
          <div className="mt-4 border border-[#c9c4b9] bg-[#fffdf7] p-4">
            <span className={`${monoClass} text-[#a72d25]`}>ANONYMIZED EVIDENCE</span>
            <p className="mt-3 text-xs leading-6 text-[#3f494d]">
              公开版本仅展示归因逻辑和分析维度，不保留真实沟通内容、订单编号或用户特征。
            </p>
            <button type="button" className="mt-4 border border-[#15212a] px-3 py-2 text-xs font-bold">
              查看脱敏归因说明
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SalesPlaybookView() {
  const combinations = ['幼儿园 × 小学', '小学低段 × 高段', '小学 × 初中', '初中 × 高中', '同年级双孩', '三孩组合'];
  const [combination, setCombination] = useState(combinations[0]);
  const [level, setLevel] = useState('强推');

  return (
    <div className="space-y-4">
      <section className={`${panelClass} p-4 sm:p-5`}>
        <SectionHeading number="01">选择年级组合</SectionHeading>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
          {combinations.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCombination(item)}
              className={`border p-4 text-left text-xs font-bold ${
                combination === item
                  ? 'border-[#15212a] bg-[#15212a] text-[#fffdf7]'
                  : 'border-[#c9c4b9] bg-[#fffdf7] hover:bg-[#e7ecfa]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading number="02">组合销售卡</SectionHeading>
          <SegmentedControl
            options={['强推', '可推', '不推']}
            value={level}
            onChange={setLevel}
            label="推荐分档"
          />
        </div>
        <div className="mt-4 border border-[#15212a] bg-[#fffdf7]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#15212a] p-4">
            <div>
              <span className={`${monoClass} text-[#2347a6]`}>SALES CARD / {level}</span>
              <h3 className="mt-2 text-xl font-black">{combination}</h3>
            </div>
            <span className={`px-3 py-2 text-xs font-black ${
              level === '强推' ? 'bg-[#a72d25] text-white' : level === '可推' ? 'bg-[#f7ecd3] text-[#7c5210]' : 'bg-[#e2d8c7]'
            }`}>
              {level}
            </span>
          </header>
          <div className="grid sm:grid-cols-2">
            {[
              ['先问一句', '先确认孩子数量、年级关系与当前学习安排。'],
              ['刺痛一句', '帮助家长识别跨年级、长周期规划中的重复决策成本。'],
              ['话术照读', '用清晰结构解释组合权益与家庭长期价值。'],
              ['价格摊薄', '按家庭使用周期说明组合方案的价值构成。'],
              ['异议秒回', '围绕价格、使用频率和学段匹配回应疑问。'],
              ['反面案例', '说明不适合推荐的场景，保留推荐边界。'],
            ].map(([title, description], index) => (
              <article key={title} className="border-b border-[#ded8cc] p-4 sm:-mr-px sm:border-r">
                <span className={`${monoClass} text-[#2347a6]`}>{String(index + 1).padStart(2, '0')}</span>
                <h4 className="mt-2 text-sm font-extrabold">{title}</h4>
                <p className="mt-2 text-xs leading-6 text-[#3f494d]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ResearchKnowledgeView() {
  const [expanded, setExpanded] = useState(false);
  const [role, setRole] = useState('销售');

  return (
    <div className="space-y-4">
      <section className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionHeading number="00">研究概览</SectionHeading>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-[#5d6360]">
              以多孩家庭的学习规划、决策因素与产品体验为主线，将研究问题、洞察和业务动作组织成可复用知识。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="border border-[#15212a] px-3 py-2 text-xs font-bold hover:bg-[#15212a] hover:text-[#fffdf7]"
          >
            {expanded ? '收起背景' : '展开完整研究背景'}
          </button>
        </div>
        {expanded && (
          <div className="mt-4 grid sm:grid-cols-3">
            {['研究对象', '核心问题', '业务应用'].map((title, index) => (
              <article key={title} className="border border-[#ded8cc] p-4 sm:-mr-px">
                <span className={`${monoClass} text-[#2347a6]`}>0{index + 1}</span>
                <h3 className="mt-2 text-sm font-extrabold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#3f494d]">
                  {index === 0 && '多孩家庭的学习安排、阶段目标与长期服务体验。'}
                  {index === 1 && '家庭如何理解组合价值并形成购买决策。'}
                  {index === 2 && '为产品策略、销售沟通与服务设计提供依据。'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={`${panelClass} p-4 sm:p-5`}>
        <SectionHeading number="01">研究问题</SectionHeading>
        <div className="mt-4 divide-y divide-[#ded8cc] border border-[#ded8cc]">
          {[
            ['家庭需求如何形成？', '关注孩子数量、年级关系与阶段目标。', '帮助销售更准确地识别家庭结构。'],
            ['组合价值如何理解？', '关注权益、价格、使用场景与保障机制。', '优化产品表达和价格解释。'],
            ['哪些因素影响决策？', '关注时机、预算、学段匹配与服务体验。', '形成策略调整与后续跟进依据。'],
          ].map(([title, focus, value], index) => (
            <article key={title} className="grid gap-3 p-4 sm:grid-cols-[2rem_minmax(0,1fr)]">
              <span className="flex h-6 w-6 items-center justify-center bg-[#e7ecfa] font-mono text-[10px] font-bold text-[#2347a6]">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#3f494d]"><strong>研究需回答：</strong>{focus}</p>
                <p className="text-xs leading-6 text-[#3f494d]"><strong>业务价值：</strong>{value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${panelClass} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading number="02">销售与策略如何使用洞察</SectionHeading>
          <SegmentedControl
            options={['销售', '策略']}
            value={role}
            onChange={setRole}
            label="洞察使用角色"
          />
        </div>
        <div className="mt-4 grid sm:grid-cols-2">
          {(role === '销售'
            ? ['识别家庭结构与真实需求', '按家庭场景组织价值表达', '记录异议并持续跟进']
            : ['校准组合边界与核心权益', '识别高频决策阻碍', '将研究结论转化为产品动作']
          ).map((item, index) => (
            <article key={item} className="border border-[#ded8cc] p-4 sm:-mr-px sm:-mb-px">
              <span className={`${monoClass} text-[#176545]`}>{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-sm font-extrabold">{item}</h3>
              <p className="mt-2 text-xs leading-6 text-[#5d6360]">点击与筛选逻辑保留，真实研究原声和内部结论不公开。</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
