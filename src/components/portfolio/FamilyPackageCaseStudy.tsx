'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const MODULES = [
  {
    id: 'overview',
    symbol: '⌂',
    label: '项目概览',
    title: '家庭包商品 OS',
    description: '将多孩家庭的长期学习需求、组合权益与销售服务过程汇总到一个工作台。',
    highlights: [
      ['FAMILY', '多孩家庭', '识别一个家庭中多个孩子的年级与长期学习需求'],
      ['LONG TERM', '长线陪伴', '串联阶段目标、服务体验与后续跟进'],
      ['VALUE', '组合价值', '统一权益、价格、场景与保障机制的表达'],
    ],
    flow: ['识别家庭', '匹配组合', '解释价值', '持续跟进'],
    details: [
      '目标用户：一个家庭中有多个孩子、存在跨年级学习规划的用户',
      '核心对象：家庭、孩子、年级组合、权益、价格解释与销售跟进',
      '产品边界：业务工作流由商品 OS 承接，销量指标统一由数据看板管理',
    ],
    outputs: ['统一的家庭包产品介绍', '模块化业务工作入口', '从执行检查到知识沉淀的闭环'],
  },
  {
    id: 'sales',
    symbol: '¥',
    label: '销量进展',
    title: '销量与 GMV 进展',
    description: '按渠道、团组与销售查看家庭包销量和 GMV 进展，统一指标口径。',
    highlights: [
      ['CHANNEL', '渠道视角', '对比不同渠道的销量与结构表现'],
      ['GROUP', '团组视角', '定位团组目标、进展与差距'],
      ['SALES', '销售视角', '查看个人进展并支持后续跟进'],
    ],
    flow: ['选择周期', '切换组织层级', '查看进展', '定位差距'],
    details: [
      '时间范围：支持按日、周与累计周期查看进展',
      '组织维度：渠道、团组、销售三级下钻',
      '指标口径：销量 KPI、完成进度与 GMV 由统一数据系统承接',
    ],
    outputs: ['组织进展概览', '目标差距定位', '后续销售跟进线索'],
  },
  {
    id: 'calls',
    symbol: '☎',
    label: '外呼日检',
    title: '外呼执行检查',
    description: '围绕关键销售动作逐项检查，帮助团队快速发现执行偏差。',
    highlights: [
      ['CHECK 01', '报价前确认', '是否先完成需求与权益确认'],
      ['CHECK 02', '多孩识别', '是否识别家庭中的多个孩子'],
      ['CHECK 03', '推荐执行', '是否结合家庭结构推荐合适组合'],
    ],
    flow: ['汇总外呼', '定位关键片段', '人工复核', '反馈改进'],
    details: [
      '检查范围：当日全量电销外呼',
      '检查动作：报价前确认、多孩识别、是否推荐家庭包',
      '证据方式：逐用户定位语料片段，支持回放与人工复核',
    ],
    outputs: ['个人执行清单', '关键语料证据', '团组问题汇总与改进反馈'],
  },
  {
    id: 'dialogue',
    symbol: '◇',
    label: '成交话术',
    title: '成交话术分析',
    description: '逐单还原沟通过程，将有效表达转化为团队可复用的方法。',
    highlights: [
      ['TRIGGER', '需求触发', '找到用户开始讨论家庭学习规划的节点'],
      ['VALUE', '价值解释', '拆解权益、价格与使用场景的表达方式'],
      ['RESPONSE', '异议回应', '整理关键异议及对应沟通策略'],
    ],
    flow: ['筛选成交单', '还原过程', '标注关键动作', '沉淀话术'],
    details: [
      '分析对象：已成交家庭包订单的完整沟通过程',
      '标注内容：需求触发、产品推荐、价格解释、异议处理与成交节点',
      '沉淀方式：从单个案例提炼可复用的话术与优秀打法',
    ],
    outputs: ['逐单成交路径', '优秀话术片段', '可复用沟通策略'],
  },
  {
    id: 'loss',
    symbol: '✦',
    label: '流失归因',
    title: '家庭包流失归因',
    description: '分析推荐家庭包后转购其他组合的原因，反向优化产品与沟通策略。',
    highlights: [
      ['WHO', '家庭结构', '结合孩子数量、年级与学习阶段理解需求'],
      ['WHY', '流失类型', '归纳价格、单孩聚焦与学段错位等原因'],
      ['NEXT', '优化建议', '将高频原因转化为策略与话术改进方向'],
    ],
    flow: ['识别转购', '逐单归因', '聚合模式', '反哺策略'],
    details: [
      '分析对象：推荐家庭包后最终购买其他组合品的订单',
      '归因框架：单孩聚焦、价格、学段错位等 8 类原因',
      '分析维度：结合家庭结构、孩子数量与年级组合寻找模式',
    ],
    outputs: ['逐单流失标签', '家庭结构模式', '产品与话术优化建议'],
  },
  {
    id: 'playbook',
    symbol: '◆',
    label: '销售手册',
    title: '组合销售手册',
    description: '把复杂的年级组合整理成可快速检索和直接使用的销售卡片。',
    highlights: [
      ['MATCH', '年级组合', '按家庭中孩子的年级关系组织内容'],
      ['LEVEL', '推荐分档', '明确强推、可推与不推的组合边界'],
      ['CARD', '销售卡片', '整合提问、价值表达、价格解释与异议处理'],
    ],
    flow: ['选择年级', '判断分档', '读取卡片', '辅助沟通'],
    details: [
      '组合范围：覆盖 30 个常见年级组合',
      '推荐分档：强推、可推、不推，明确推荐边界',
      '卡片结构：先问一句、刺痛一句、话术照读、价格摊薄、异议秒回',
    ],
    outputs: ['一组合一张销售卡', '未成交反面案例', '可直接调用的 CRM 弹药'],
  },
  {
    id: 'research',
    symbol: '◎',
    label: '用研知识',
    title: '用户研究知识库',
    description: '集中保存经过审核的用户研究结论，为销售与产品判断提供依据。',
    highlights: [
      ['REVIEW', '审核发布', '确保进入知识库的内容具备明确来源'],
      ['TOPIC', '主题归档', '按家庭结构、需求与决策因素组织研究'],
      ['SHARE', '团队复用', '让结论可检索、可引用并持续更新'],
    ],
    flow: ['收集洞察', '审核结论', '主题归档', '业务复用'],
    details: [
      '内容来源：访谈、沟通记录与业务观察中形成的用户洞察',
      '发布机制：仅展示经 Owner 审核发布的研究结论',
      '使用权限：业务侧只读查看，避免未经验证的信息扩散',
    ],
    outputs: ['用户需求洞察', '决策因素归档', '可引用的研究结论'],
  },
] as const;

const JOURNEY = [
  ['01', '识别需求', '先确认家庭结构、孩子年级与阶段目标。'],
  ['02', '匹配方案', '根据家庭组合定位适合的产品与推荐边界。'],
  ['03', '辅助沟通', '调用价格解释、价值表达和异议处理卡片。'],
  ['04', '复盘沉淀', '把执行、成交与流失信息重新沉淀为知识。'],
] as const;

export default function FamilyPackageCaseStudy() {
  const [activeId, setActiveId] = useState<(typeof MODULES)[number]['id']>('overview');
  const activeModule = MODULES.find((module) => module.id === activeId) ?? MODULES[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="page-shell overflow-hidden p-5 sm:p-8 lg:p-12">
        <div aria-hidden="true" className="portfolio-grid pointer-events-none absolute inset-0 opacity-30" />

        <div className="relative">
          <Link
            href="/internships/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-accent"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            返回实习经历
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
            <div>
              <div className="portfolio-kicker mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
                PORTFOLIO CASE · 01
              </div>
              <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.055em] text-primary sm:text-6xl lg:text-7xl">
                家庭包商品
                <span className="ml-3 text-accent">OS</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                面向多孩家庭与长期学习服务的产品工作台。下方为根据公开产品框架重建的交互式脱敏案例。
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-accent/12 bg-accent/[0.055] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <LockClosedIcon className="h-4 w-4 text-accent" />
                脱敏展示
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                不包含真实销量、用户信息、内部语料与账号权限，离职后仍可长期保留。
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ['7', '核心模块'],
              ['30', '年级组合'],
              ['8', '流失归因类型'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-white/65 bg-white/42 px-4 py-4 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
              >
                <strong className="block text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
                  {value}
                </strong>
                <span className="mt-1 block text-xs text-neutral-500">{label}</span>
              </div>
            ))}
          </div>

          <section className="mt-10 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/58 shadow-[0_24px_65px_rgba(73,53,105,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex h-11 items-center gap-2 border-b border-neutral-200/70 px-4 dark:border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-coral" />
              <span className="h-2.5 w-2.5 rounded-full bg-sun" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint" />
              <span className="ml-3 text-[10px] font-semibold tracking-[0.18em] text-neutral-400">
                FAMILY PACKAGE WORKSPACE
              </span>
            </div>

            <div className="grid lg:grid-cols-[13rem_minmax(0,1fr)]">
              <div className="flex gap-2 overflow-x-auto border-b border-neutral-200/70 p-3 lg:block lg:space-y-1 lg:border-b-0 lg:border-r lg:p-4 dark:border-white/10">
                {MODULES.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setActiveId(module.id)}
                    className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all lg:w-full ${
                      activeId === module.id
                        ? 'bg-accent text-white shadow-[0_8px_20px_rgba(108,92,231,0.24)]'
                        : 'text-neutral-600 hover:bg-accent/8 hover:text-primary'
                    }`}
                  >
                    <span className="w-5 text-center text-base">{module.symbol}</span>
                    {module.label}
                  </button>
                ))}
              </div>

              <div className="min-h-[31rem] p-5 sm:p-7 lg:p-9">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-accent">
                      {activeModule.label.toUpperCase()}
                    </span>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-primary">
                      {activeModule.title}
                    </h2>
                    <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
                      {activeModule.description}
                    </p>

                    <div className="mt-7 grid gap-3 md:grid-cols-3">
                      {activeModule.highlights.map(([eyebrow, title, description], index) => (
                        <motion.article
                          key={title}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          className="rounded-[1.25rem] border border-white/70 bg-white/62 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
                        >
                          <span className="text-[9px] font-semibold tracking-[0.18em] text-accent">
                            {eyebrow}
                          </span>
                          <h3 className="mt-2 font-semibold text-primary">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
                        </motion.article>
                      ))}
                    </div>

                    <div className="mt-7 rounded-[1.25rem] border border-neutral-200/70 bg-neutral-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="flex flex-wrap items-center gap-2">
                        {activeModule.flow.map((step, index) => (
                          <div key={step} className="flex items-center gap-2">
                            <span className="rounded-full border border-accent/12 bg-white/75 px-3 py-2 text-xs font-semibold text-primary dark:bg-white/5">
                              {step}
                            </span>
                            {index < activeModule.flow.length - 1 && (
                              <ArrowRightIcon className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <section className="rounded-[1.25rem] border border-white/70 bg-white/48 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                        <span className="text-[9px] font-semibold tracking-[0.18em] text-accent">
                          PRESERVED DETAILS
                        </span>
                        <h3 className="mt-2 font-semibold text-primary">保留的功能细节</h3>
                        <ul className="mt-3 space-y-2">
                          {activeModule.details.map((detail) => (
                            <li key={detail} className="flex gap-2 text-sm leading-6 text-neutral-600">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="rounded-[1.25rem] border border-white/70 bg-white/48 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                        <span className="text-[9px] font-semibold tracking-[0.18em] text-accent">
                          OUTPUTS
                        </span>
                        <h3 className="mt-2 font-semibold text-primary">交互结果与产出</h3>
                        <div className="mt-3 space-y-2">
                          {activeModule.outputs.map((output, index) => (
                            <div
                              key={output}
                              className="flex items-center gap-3 rounded-xl border border-accent/8 bg-accent/[0.035] px-3 py-2.5"
                            >
                              <span className="text-xs font-semibold text-accent">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className="text-sm text-neutral-600">{output}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-6">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-accent">USER JOURNEY</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-primary">核心交互过程</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {JOURNEY.map(([number, title, description]) => (
                <article
                  key={number}
                  className="group rounded-[1.5rem] border border-white/65 bg-white/45 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_16px_40px_rgba(75,54,110,0.1)] dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="text-2xl font-semibold text-accent/35 transition-colors group-hover:text-accent">
                    {number}
                  </span>
                  <h3 className="mt-5 font-semibold text-primary">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
