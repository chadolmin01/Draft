'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { BusinessReport } from '@/lib/types';
import { ExportMenu } from '@/components/export-menu';
import { ShareDialog, ShareButton } from './share-dialog';
import { MarketSizeChart, RevenueProjectionChart } from './report-charts';
import { SlideUp, StaggerContainer, StaggerItem } from '@/components/page-transition';
import { LogoSliced } from '@/components/logo-sliced';
import { X, FileText, BarChart3, Building2, DollarSign, Layers, Code2, Wallet, AlertTriangle, Calendar, Target, TrendingUp, Settings, Shield, Search, SquarePen, AlignLeft, Clock, UserCircle } from 'lucide-react';

interface ReportPageProps {
  report: BusinessReport;
  ideaTitle: string;
}

export function ReportPage({ report, ideaTitle }: ReportPageProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Update active section on scroll (main content div)
  useEffect(() => {
    const main = document.querySelector('.report-main-scroll');
    if (!main) return;
    const handleScroll = () => {
      const sections = document.querySelectorAll('.report-section');
      let current = 'overview';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) current = section.id;
      });
      setActiveSection(current);
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  // 기본 섹션 (Grok 스타일: lucide 아이콘)
  const baseSections = [
    { id: 'overview', label: '사업 개요', Icon: FileText },
    { id: 'market', label: '시장 분석', Icon: BarChart3 },
    { id: 'competitors', label: '경쟁사 분석', Icon: Building2 },
    { id: 'monetization', label: '수익화 모델', Icon: DollarSign },
    { id: 'structure', label: '사업 구조', Icon: Layers },
    { id: 'development', label: '개발 가이드', Icon: Code2 },
  ];

  // 추가 섹션 (있을 경우만 표시)
  const optionalSections = [
    report.sections.financials && { id: 'financials', label: '재무 계획', Icon: Wallet },
    report.sections.riskAnalysis && { id: 'risks', label: '위험 분석', Icon: AlertTriangle },
    report.sections.timeline && { id: 'timeline', label: '프로젝트 타임라인', Icon: Calendar },
  ].filter(Boolean);

  const sections = [...baseSections, ...optionalSections] as typeof baseSections;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground selection:bg-primary/20">
      {/* Sidebar - 웹페이지와 동일 */}
      <aside className="w-14 flex-col items-center py-3 hidden md:flex border-r border-border/50 flex-shrink-0">
        <Link href="/" className="mb-4 p-1">
          <LogoSliced className="w-9 h-9" />
        </Link>
        <nav className="flex flex-col gap-1">
          <Link href={`/ideas/${report.ideaId}`} className="p-2.5 rounded-lg transition-colors hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground" title="분석 페이지">
            <SquarePen className="h-5 w-5" />
          </Link>
          <button className="p-2.5 rounded-lg transition-colors hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground" title="Search">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-2.5 rounded-lg transition-colors hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground" title="Library">
            <AlignLeft className="h-5 w-5" />
          </button>
          <button className="p-2.5 rounded-lg transition-colors hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground" title="History">
            <Clock className="h-5 w-5" />
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button title="Profile" className="p-2.5 rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
            <UserCircle className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content - 웹페이지와 동일 flex 구조 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - 웹페이지 스타일 (py-4, max-w-7xl, px-6 md:px-12) */}
        <header className="z-50 border-b flex-shrink-0 bg-background py-4 border-border/60">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Link href={`/ideas/${report.ideaId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X className="w-4 h-4" />
                  닫기
                </Link>
                <div className="h-4 w-px bg-border/60 shrink-0" />
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  {report.sections.overview.title}
                </h1>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-secondary rounded uppercase tracking-widest text-muted-foreground shrink-0">
                  {report.tier}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button onClick={handlePrint} variant="outline" size="sm" className="h-8 text-xs font-medium">
                  인쇄
                </Button>
                <ExportMenu report={report} />
                <ShareButton onClick={() => setIsShareDialogOpen(true)} />
                <Button onClick={() => (window.location.href = `/ideas/${report.ideaId}/actions`)} size="sm" className="h-8 text-xs font-medium">
                  실행 액션 →
                </Button>
              </div>
            </div>
          </div>
        </header>


        {/* Section Nav - 가로 스트립 (웹페이지 Stage 바와 유사) */}
        <div className="flex-shrink-0 border-b border-border/60 bg-background">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-2">
            <div className="flex gap-1 overflow-x-auto">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === section.id ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  <section.Icon className="w-3.5 h-3.5 opacity-70" />
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content - 웹페이지와 동일 max-w-7xl, px-6 md:px-12, py-6 */}
        <main className="report-main-scroll flex-1 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          {/* Overview Section */}
          <section id="overview" className="report-section mb-12 scroll-mt-4">
            <SlideUp delay={0.1}>
              <h2 className="text-2xl font-semibold tracking-tight mb-3 text-foreground">
                {report.sections.overview.title}
              </h2>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="text-lg font-light text-muted-foreground mb-6 leading-snug">
                  {report.sections.overview.tagline}
              </p>
            </SlideUp>
            <SlideUp delay={0.3}>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {report.sections.overview.description}
              </p>
            </SlideUp>
            
            <SlideUp delay={0.4}>
              <StaggerContainer staggerDelay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <StaggerItem>
                      <motion.div 
                        className="bg-card p-5 rounded-lg border border-border/60 hover:border-foreground/20 transition-colors"
                        whileHover={{ y: -1, scale: 1.005 }}
                      >
                        <div className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Vision</div>
                        <p className="text-foreground text-sm leading-relaxed font-medium">{report.sections.overview.vision}</p>
                      </motion.div>
                    </StaggerItem>
                    <StaggerItem>
                      <motion.div 
                        className="bg-card p-5 rounded-lg border border-border/60 hover:border-foreground/20 transition-colors"
                        whileHover={{ y: -1, scale: 1.005 }}
                      >
                        <div className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Mission</div>
                        <p className="text-foreground text-sm leading-relaxed font-medium">{report.sections.overview.mission}</p>
                      </motion.div>
                    </StaggerItem>
                </div>
              </StaggerContainer>
            </SlideUp>
          </section>

          <div className="w-full h-px bg-border/60 mb-12" />

          {/* 시장 분석 */}
          <section id="market" className="report-section mb-12 scroll-mt-4">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-foreground/60" />
                <h2 className="text-lg font-semibold text-foreground">시장 분석</h2>
            </div>

            {/* 시장 규모 */}
            <div className="bg-card border border-border/60 rounded-lg p-5 mb-6">
              <h3 className="text-sm font-medium mb-4">시장 규모 (TAM-SAM-SOM)</h3>
              
              {/* 차트 */}
              <div className="mb-4">
                <MarketSizeChart
                  tam={report.sections.market.size.tam}
                  sam={report.sections.market.size.sam}
                  som={report.sections.market.size.som}
                />
              </div>
              
              {/* 숫자 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['tam', 'sam', 'som'].map((type) => (
                    <div key={type} className="bg-foreground/[0.02] p-4 rounded-lg border border-border/60 text-center">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">{type}</div>
                         {/* @ts-ignore */}
                        <div className="text-base font-bold text-foreground">{report.sections.market.size[type]}</div>
                    </div>
                ))}
              </div>
            </div>

            {/* 시장 트렌드 */}
            <div className="bg-card border border-border/60 rounded-lg p-5 mb-6">
              <h3 className="text-sm font-medium mb-4">주요 트렌드</h3>
              <ul className="space-y-3">
                {report.sections.market.trends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-foreground/[0.02] border border-border/40 text-sm">
                    <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                    <span className="text-foreground leading-relaxed">{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SWOT (기회/위협) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border/60 bg-foreground/[0.02] p-5 rounded-lg">
                <h3 className="text-sm font-medium mb-3 text-foreground/80">기회 (Opportunities)</h3>
                <ul className="space-y-2 text-sm">
                  {report.sections.market.opportunities.map((opp, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                        <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                        {opp}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-border/60 bg-foreground/[0.02] p-5 rounded-lg">
                <h3 className="text-sm font-medium mb-3 text-destructive flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> 위협 (Threats)</h3>
                <ul className="space-y-2 text-sm">
                  {report.sections.market.threats.map((threat, idx) => (
                    <li key={idx} className="text-sm text-foreground/80 flex gap-2">
                        <span className="w-1 h-1 rounded-full bg-destructive/60 mt-1.5 flex-shrink-0" />
                        {threat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <div className="w-full h-px bg-border/60 mb-12" />

          {/* 경쟁사 분석 */}
          <section id="competitors" className="report-section mb-12 scroll-mt-4">
             <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-4 h-4 text-foreground/60" />
                <h2 className="text-lg font-semibold text-foreground">경쟁사 분석</h2>
            </div>

            <div className="grid gap-4">
                {report.sections.competitors.direct.map((comp, idx) => (
                <div key={idx} className="bg-card border border-border/60 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-xl mb-2">{comp.name}</h3>
                        <p className="text-sm text-muted-foreground">{comp.description}</p>
                    </div>
                    {comp.marketShare && (
                        <span className="text-xs font-semibold bg-secondary px-3 py-1 rounded-full border border-border text-muted-foreground">
                        {comp.marketShare}
                        </span>
                    )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm pt-4 border-t border-border/60">
                    <div>
                        <div className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Strength</div>
                        <ul className="space-y-2">
                        {comp.strengths.map((s, i) => (
                            <li key={i} className="text-muted-foreground pl-3 border-l-2 border-foreground/20">{s}</li>
                        ))}
                        </ul>
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Weakness</div>
                        <ul className="space-y-2">
                        {comp.weaknesses.map((w, i) => (
                            <li key={i} className="text-muted-foreground pl-3 border-l-2 border-foreground/20">{w}</li>
                        ))}
                        </ul>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            <div className="mt-6 bg-foreground/[0.02] border border-border/60 p-5 rounded-lg">
              <h3 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2"><Target className="w-3.5 h-3.5" /> 우리의 경쟁 우위</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.sections.competitors.competitiveAdvantages.map((adv, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-background p-3 rounded-lg border border-border/60 text-sm">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-foreground/60" />
                    <span className="text-sm font-medium">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="w-full h-px bg-border/60 mb-12" />

          {/* 수익화 모델 */}
          <section id="monetization" className="report-section mb-12 scroll-mt-4">
             <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-4 h-4 text-foreground/60" />
                <h2 className="text-lg font-semibold text-foreground">수익화 모델</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 수익 구조 */}
                <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4">수익원 (Revenue Streams)</h3>
                    <div className="space-y-4">
                        {report.sections.monetization.revenueStreams.map((stream, idx) => (
                        <div key={idx} className="relative pl-6">
                            <div className="absolute left-0 top-1 w-px h-full bg-border/60" />
                            <div className="absolute left-0 top-1 w-px h-8 bg-foreground/40" />
                            <h4 className="font-bold text-foreground">{stream.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-2">{stream.description}</p>
                            <p className="text-sm font-semibold text-foreground bg-secondary border border-border inline-block px-2 py-1 rounded">
                            Est. {stream.estimatedRevenue}
                            </p>
                        </div>
                        ))}
                    </div>
                </div>

                {/* 가격 전략 */}
                <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4">가격 정책 (Pricing)</h3>
                    <div className="space-y-3">
                        {report.sections.monetization.pricingStrategy.tiers.map((tier, idx) => (
                        <div key={idx} className="border border-border/60 rounded-lg p-4 hover:border-foreground/20 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-sm">{tier.name}</h4>
                                <span className="text-lg font-bold text-foreground">{tier.price}</span>
                            </div>
                            <ul className="space-y-1.5">
                            {tier.features.map((feature, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                            </ul>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* 매출 예측 */}
             <div className="bg-card border border-border/60 rounded-lg p-5">
                <h3 className="text-sm font-medium mb-4">매출 예측 (3 Year Projection)</h3>
                
                {/* 차트 */}
                <div className="mb-4">
                  <RevenueProjectionChart data={report.sections.monetization.revenueProjection} />
                </div>
                
                {/* 상세 데이터 */}
                <div className="space-y-3">
                {report.sections.monetization.revenueProjection.map((proj, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-foreground/[0.02] rounded-lg border border-border/60 text-sm">
                        <div className="mb-2 sm:mb-0">
                            <div className="font-bold text-foreground">{proj.year}년차</div>
                            <div className="text-xs text-muted-foreground mt-1">
                            {proj.assumptions.join(', ')}
                            </div>
                        </div>
                        <div className="text-lg font-bold text-foreground tabular-nums">{proj.revenue}</div>
                    </div>
                ))}
                </div>
            </div>
          </section>

          <div className="w-full h-px bg-border/60 mb-12" />

          {/* 사업 구조 & 개발 가이드 (합쳐서 간결하게 표현) */}
          <section id="structure" className="report-section mb-12 scroll-mt-4">
             <div className="flex items-center gap-2 mb-6">
                <Layers className="w-4 h-4 text-foreground/60" />
                <h2 className="text-lg font-semibold text-foreground">운영 및 개발 계획</h2>
            </div>
            
            <div className="space-y-6">
                <div className="bg-card border border-border/60 rounded-lg p-5">
                     <h3 className="text-sm font-medium mb-4">핵심 팀 구성</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.sections.structure.team.map((member, idx) => (
                        <div key={idx} className="p-4 bg-foreground/[0.02] rounded-lg border border-border/60 text-sm">
                             <h4 className="font-bold">{member.role}</h4>
                             <p className="text-xs text-muted-foreground mt-2">{member.skills.join(', ')}</p>
                        </div>
                        ))}
                     </div>
                </div>

                <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4">MVP 기능 정의</h3>
                     <div className="space-y-2">
                        {report.sections.development.mvpFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 border border-border/60 rounded-lg text-sm">
                            <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded uppercase mt-0.5 bg-secondary border border-border text-muted-foreground">
                            {feature.priority}
                            </span>
                            <div>
                                <h4 className="font-bold text-sm text-foreground">{feature.feature}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* 재무 계획 (옵션) */}
          {report.sections.financials && (
            <>
              <div className="w-full h-px bg-border/60 mb-12" />
              <section id="financials" className="report-section mb-12 scroll-mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <Wallet className="w-4 h-4 text-foreground/60" />
                  <h2 className="text-lg font-semibold text-foreground">재무 계획</h2>
                </div>

                {/* 초기 투자 요약 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">초기 투자 필요</div>
                    <div className="text-2xl font-bold text-foreground">{report.sections.financials.initialInvestment}</div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">손익분기점</div>
                    <div className="text-2xl font-bold text-foreground">{report.sections.financials.breakEvenPoint}</div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">월간 소진율</div>
                    <div className="text-2xl font-bold text-foreground">{report.sections.financials.monthlyBurnRate}</div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">런웨이</div>
                    <div className="text-2xl font-bold text-foreground">{report.sections.financials.cashRunway}</div>
                  </div>
                </div>

                {/* 재무 예측 테이블 */}
                <div className="bg-card border border-border/60 rounded-lg p-5 mb-6 overflow-x-auto">
                  <h3 className="text-sm font-medium mb-4">재무 예측</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">기간</th>
                        <th className="text-right py-3 px-4 font-semibold">매출</th>
                        <th className="text-right py-3 px-4 font-semibold">비용</th>
                        <th className="text-right py-3 px-4 font-semibold">순이익</th>
                        <th className="text-right py-3 px-4 font-semibold">누적 이익</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sections.financials.projections.map((proj, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="py-3 px-4">{proj.period}</td>
                          <td className="text-right py-3 px-4 font-semibold text-foreground">{proj.revenue.toLocaleString()}원</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{proj.expenses.toLocaleString()}원</td>
                          <td className={`text-right py-3 px-4 font-semibold ${proj.profit >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {proj.profit.toLocaleString()}원
                          </td>
                          <td className={`text-right py-3 px-4 font-bold ${proj.cumulativeProfit >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {proj.cumulativeProfit.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 투자 전략 */}
                <div className="bg-card border border-border/60 rounded-lg p-5">
                  <h3 className="text-sm font-medium mb-4">투자 유치 전략</h3>
                  <div className="space-y-3">
                    {report.sections.financials.fundingStrategy.map((fund, idx) => (
                      <div key={idx} className="border border-border/60 rounded-lg p-4 text-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">{fund.stage}</h4>
                          <span className="text-xl font-bold text-foreground">{fund.amount}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="font-semibold mb-2">투자금 용도:</div>
                          <ul className="space-y-1">
                            {fund.usage.map((use, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                                {use}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* 위험 분석 (옵션) */}
          {report.sections.riskAnalysis && (
            <>
              <div className="w-full h-px bg-border/60 mb-12" />
              <section id="risks" className="report-section mb-12 scroll-mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-4 h-4 text-foreground/60" />
                  <h2 className="text-lg font-semibold text-foreground">위험 분석</h2>
                </div>

                {/* 전체 위험 수준 */}
                <div className="bg-card border border-border/60 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">전체 위험 수준</div>
                    <div className="text-3xl font-bold text-foreground">
                      {report.sections.riskAnalysis.overallRiskLevel === 'high' ? '높음' :
                       report.sections.riskAnalysis.overallRiskLevel === 'medium' ? '중간' : '낮음'}
                    </div>
                  </div>
                </div>

                {/* 위험 카테고리 */}
                <div className="space-y-6">
                  {/* 시장 위험 */}
                  <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-foreground/60" /> 시장 위험
                    </h3>
                    <div className="space-y-4">
                      {report.sections.riskAnalysis.marketRisks.map((risk, idx) => (
                        <div key={idx} className="border border-border/60 rounded-lg p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold flex-1">{risk.risk}</h4>
                            <div className="flex gap-2">
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                확률: {risk.probability === 'high' ? '높음' : risk.probability === 'medium' ? '중간' : '낮음'}
                              </span>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                영향: {risk.impact === 'high' ? '높음' : risk.impact === 'medium' ? '중간' : '낮음'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">대응책:</span> {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 운영 위험 */}
                  <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-foreground/60" /> 운영 위험
                    </h3>
                    <div className="space-y-4">
                      {report.sections.riskAnalysis.operationalRisks.map((risk, idx) => (
                        <div key={idx} className="border border-border/60 rounded-lg p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold flex-1">{risk.risk}</h4>
                            <div className="flex gap-2">
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                확률: {risk.probability === 'high' ? '높음' : risk.probability === 'medium' ? '중간' : '낮음'}
                              </span>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                영향: {risk.impact === 'high' ? '높음' : risk.impact === 'medium' ? '중간' : '낮음'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">대응책:</span> {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 재무 위험 */}
                  <div className="bg-card border border-border/60 rounded-lg p-5">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-foreground/60" /> 재무 위험
                    </h3>
                    <div className="space-y-4">
                      {report.sections.riskAnalysis.financialRisks.map((risk, idx) => (
                        <div key={idx} className="border border-border/60 rounded-lg p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold flex-1">{risk.risk}</h4>
                            <div className="flex gap-2">
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                확률: {risk.probability === 'high' ? '높음' : risk.probability === 'medium' ? '중간' : '낮음'}
                              </span>
                              <span className="text-xs font-bold px-2 py-1 rounded bg-secondary border border-border text-muted-foreground">
                                영향: {risk.impact === 'high' ? '높음' : risk.impact === 'medium' ? '중간' : '낮음'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">대응책:</span> {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 비상 계획 */}
                <div className="bg-foreground/[0.02] border border-border/60 rounded-lg p-5 mt-6">
                  <h3 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> 비상 대응 계획</h3>
                  <ul className="space-y-3">
                    {report.sections.riskAnalysis.contingencyPlans.map((plan, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm leading-relaxed">{plan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          )}

          {/* 프로젝트 타임라인 (옵션) */}
          {report.sections.timeline && (
            <>
              <div className="w-full h-px bg-border/60 mb-12" />
              <section id="timeline" className="report-section mb-12 scroll-mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-4 h-4 text-foreground/60" />
                  <h2 className="text-lg font-semibold text-foreground">프로젝트 타임라인</h2>
                </div>

                {/* 타임라인 개요 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">총 기간</div>
                    <div className="text-2xl font-bold text-foreground">
                      {report.sections.timeline.phases.length}개 단계
                    </div>
                  </div>
                  <div className="bg-card border border-border/60 rounded-lg p-4">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">버퍼 시간</div>
                    <div className="text-2xl font-bold text-foreground">{report.sections.timeline.bufferTime}</div>
                  </div>
                </div>

                {/* 단계별 타임라인 */}
                <div className="space-y-4">
                  {report.sections.timeline.phases.map((phase, idx) => (
                    <div key={idx} className="bg-card border border-border/60 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-2">{phase.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            기간: {phase.duration}
                            {phase.startDate && phase.endDate && (
                              <span className="ml-2">({phase.startDate} ~ {phase.endDate})</span>
                            )}
                          </div>
                        </div>
                        <span className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground text-lg font-bold border border-border/60">
                          {idx + 1}
                        </span>
                      </div>

                      {/* 마일스톤 */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground">주요 마일스톤</h4>
                        {phase.milestones.map((milestone, mIdx) => (
                          <div key={mIdx} className="border-l-2 border-foreground/30 pl-4 py-2">
                            <div className="font-semibold mb-2">{milestone.name}</div>
                            <div className="text-xs text-muted-foreground mb-2">목표일: {milestone.date}</div>
                            <ul className="space-y-1">
                              {milestone.deliverables.map((deliverable, dIdx) => (
                                <li key={dIdx} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                                  {deliverable}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* 의존성 */}
                      {phase.dependencies && phase.dependencies.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">의존성</div>
                          <div className="flex flex-wrap gap-2">
                            {phase.dependencies.map((dep, depIdx) => (
                              <span key={depIdx} className="text-xs bg-secondary px-3 py-1 rounded-full border border-border">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 크리티컬 패스 */}
                <div className="bg-foreground/[0.02] border border-border/60 rounded-lg p-5 mt-6">
                  <h3 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2"><Target className="w-3.5 h-3.5" /> 크리티컬 패스 (지연되면 안 되는 작업)</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.sections.timeline.criticalPath.map((item, idx) => (
                      <span key={idx} className="bg-secondary border border-border text-foreground px-4 py-2 rounded-lg font-semibold text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
          
           {/* Footer Action */}
           <div className="mt-12 p-8 bg-foreground/[0.02] rounded-lg text-center border border-border/60">
                <h3 className="text-lg font-bold mb-3 text-foreground">이제 실행할 차례입니다</h3>
                <p className="text-muted-foreground mb-6 text-sm">이 리포트를 바탕으로 실제 산출물을 만들어보세요.</p>
                <Button 
                    onClick={() => (window.location.href = `/ideas/${report.ideaId}/actions`)} 
                    size="sm"
                    className="h-9 px-6 text-sm font-medium"
                >
                    액션 플랜 시작하기 →
                </Button>
           </div>
          </div>
        </main>

        {/* Floating Action Bar (Mobile) */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md border border-border/60 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-3 py-2">
          <div className="flex items-center gap-1">
            <Button onClick={handlePrint} variant="ghost" size="sm" className="h-7 text-xs">인쇄</Button>
            <div className="h-3 w-px bg-border" />
            <ExportMenu report={report} />
            <div className="h-3 w-px bg-border" />
            <ShareButton onClick={() => setIsShareDialogOpen(true)} />
            <div className="h-3 w-px bg-border" />
            <Button onClick={() => (window.location.href = `/ideas/${report.ideaId}/actions`)} size="sm" className="h-7 text-xs">액션 →</Button>
          </div>
        </div>
      </div>

      {/* 공유 다이얼로그 */}
      <ShareDialog
        report={report}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
}