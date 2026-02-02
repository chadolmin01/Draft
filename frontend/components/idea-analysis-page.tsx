'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@/lib/gsap-config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RateLimitNotice } from '@/components/rate-limit-notice';
import { isMockMode } from '@/lib/mock-mode';
import { cn } from '@/lib/utils';
import { StaggerContainer, StaggerItem, SlideUp } from '@/components/page-transition';
import { Target, AlertCircle, Lightbulb, DollarSign, TrendingUp, Building2, AlertTriangle, BarChart3, Crosshair, Globe, MessageSquare, FileText, Sliders, ChevronLeft, ChevronRight, Search, SquarePen, AlignLeft, Clock, UserCircle, Lock, LogOut, X, Home, Settings, CreditCard } from 'lucide-react';
import { LogoSliced } from '@/components/logo-sliced';
import { useAuth } from '@/lib/auth-context';
import { getAllIdeasFromStorage } from '@/lib/ideas-local';
import type { 
  GetIdeaResponse, 
  Tier,
  Stage,
  Stage2MarketAnalysis,
  DeepAnalysisGroup,
  MarketDeepAnalysis,
  StrategyAnalysis,
  ExternalAnalysis
} from '@/lib/types';

interface IdeaAnalysisPageProps {
  data: GetIdeaResponse;
}

type PanelType = 'search' | 'library' | 'history' | null;

interface IdeaListItem {
  id: string;
  idea: string;
  tier: string;
  createdAt: string;
}

// 심화 분석 상태 타입
interface DeepAnalysisState {
  'market-deep': MarketDeepAnalysis | null;
  'strategy': StrategyAnalysis | null;
  'external': ExternalAnalysis | null;
}

interface DeepAnalysisLoadingState {
  'market-deep': boolean;
  'strategy': boolean;
  'external': boolean;
}

// 메인 분석 결과 요약 (토큰 최적화용)
function summarizeMainAnalysis(main: Stage2MarketAnalysis) {
  return {
    market_size: main.market_analysis.market_size,
    growth: main.market_analysis.growth_rate,
    top_competitors: main.competitors.slice(0, 3).map(c => c.name),
    main_risks: main.risks.slice(0, 2),
    feasibility: main.feasibility_score
  };
}

export function IdeaAnalysisPage({ data }: IdeaAnalysisPageProps) {
  // Mock 모드 체크 (URL에서 demo- 로 시작하는지 확인)
  const isInMockMode = typeof window !== 'undefined' && window.location.pathname.includes('/demo-');
  
  // 데이터 유효성 검사
  console.log('🔍 Mock Mode:', isInMockMode);
  console.log('🔍 IdeaAnalysisPage received data:', data);
  console.log('🔍 data.idea type:', typeof data?.idea);
  console.log('🔍 data.idea value:', data?.idea);
  console.log('🔍 data.idea.idea type:', typeof data?.idea?.idea);
  console.log('🔍 data.idea.idea value:', data?.idea?.idea);
  
  // Mock 모드일 때는 데이터 문제가 있어도 빈 레이아웃 표시
  let idea = data?.idea;
  let analysis = data?.analysis;
  let currentStage = data?.currentStage || 1;
  
  // 데이터가 없거나 잘못된 경우 Mock 모드면 더미 데이터 생성
  if (isInMockMode && (!data || !idea || !analysis)) {
    console.log('⚠️ Mock 모드: 데이터 오류 발생, 빈 레이아웃 표시');
    idea = {
      id: 'mock-demo',
      idea: 'Mock 아이디어 (레이아웃 미리보기)',
      tier: 'pro' as Tier,
      createdAt: new Date().toISOString(),
      stage: 1 as Stage,
    };
    analysis = {
      target: '타겟 고객층',
      problem: '해결하려는 문제',
      solution: '제안하는 솔루션',
      summary: '타겟·문제·솔루션 분석이 완료되었습니다.',
      one_liner: '아이디어 핵심 요약',
      next_teaser: '시장 규모와 경쟁사 포지셔닝을 확인해보세요.',
      canEdit: false,
    };
    currentStage = 1;
  }
  
  // Mock 모드가 아닐 때는 기존대로 오류 표시
  if (!isInMockMode) {
    if (!data) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">데이터 없음</h2>
            <p className="text-sm text-muted-foreground">data가 null 또는 undefined입니다.</p>
          </div>
        </div>
      );
    }
    
    if (!idea || !analysis) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">데이터 구조 오류</h2>
            <p className="text-sm text-muted-foreground mb-4">
              idea: {idea ? '있음' : '없음'}, 
              analysis: {analysis ? '있음' : '없음'}
            </p>
          </div>
        </div>
      );
    }
  }
  const { user, signOut } = useAuth();
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<IdeaListItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<IdeaListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [marketAnalysis, setMarketAnalysis] = useState<Stage2MarketAnalysis | null>(
    typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem(`idea_${idea.id}_stage2`) || 'null')
      : null
  );
  const [isLoadingMarketAnalysis, setIsLoadingMarketAnalysis] = useState(false);
  const [marketAnalysisError, setMarketAnalysisError] = useState<string | null>(null);

  // 심화 분석 상태
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysisState>(() => {
    if (typeof window === 'undefined') {
      return { 'market-deep': null, 'strategy': null, 'external': null };
    }
    return {
      'market-deep': JSON.parse(localStorage.getItem(`idea_${idea.id}_deep_market-deep`) || 'null'),
      'strategy': JSON.parse(localStorage.getItem(`idea_${idea.id}_deep_strategy`) || 'null'),
      'external': JSON.parse(localStorage.getItem(`idea_${idea.id}_deep_external`) || 'null'),
    };
  });
  const [deepAnalysisLoading, setDeepAnalysisLoading] = useState<DeepAnalysisLoadingState>({
    'market-deep': false,
    'strategy': false,
    'external': false,
  });
  const [deepAnalysisError, setDeepAnalysisError] = useState<Record<DeepAnalysisGroup, string | null>>({
    'market-deep': null,
    'strategy': null,
    'external': null,
  });

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmittingFeedback(true);
    console.log('피드백 제출:', feedback);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      alert('백엔드 연동 예정입니다');
      setFeedback('');
    }, 1000);
  };

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    if (!analysis) return;
    
    setIsGeneratingReport(true);

    try {
      const stage1Analysis = {
        target: analysis.target,
        problem: analysis.problem,
        solution: analysis.solution,
        revenue_analysis: analysis.revenue_analysis,
      };

      const stage2MainData = marketAnalysis || undefined;
      const stage2DeepData = (idea.tier !== 'light' && (deepAnalysis['market-deep'] || deepAnalysis['strategy'] || deepAnalysis['external']))
        ? {
            'market-deep': deepAnalysis['market-deep'] || undefined,
            'strategy': deepAnalysis['strategy'] || undefined,
            'external': deepAnalysis['external'] || undefined,
          }
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isMockMode()) {
        headers['x-mock-mode'] = 'true';
      }
      
      const response = await fetch(`/api/ideas/${idea.id}/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          stage1: stage1Analysis,
          stage2Main: stage2MainData,
          stage2Deep: stage2DeepData,
          tier: idea.tier,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem(`idea_${idea.id}_report`, JSON.stringify(result.data));
        window.location.href = `/ideas/${idea.id}/report`;
      } else {
        alert('리포트 생성 실패: ' + result.error?.message);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('리포트 생성에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateMarketAnalysis = async () => {
    if (!analysis) return;
    
    setIsLoadingMarketAnalysis(true);
    setMarketAnalysisError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isMockMode()) {
        headers['x-mock-mode'] = 'true';
      }

      const response = await fetch(`/api/ideas/${idea.id}/market-analysis`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          stage1Output: {
            target: analysis.target,
            problem: analysis.problem,
            solution: analysis.solution,
          },
          tier: idea.tier,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setMarketAnalysis(result.data);
        localStorage.setItem(`idea_${idea.id}_stage2`, JSON.stringify(result.data));
      } else {
        const errorMsg = result.error?.message || '알 수 없는 오류';
        setMarketAnalysisError(errorMsg);
      }
    } catch (error) {
      console.error('Market analysis error:', error);
      setMarketAnalysisError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoadingMarketAnalysis(false);
    }
  };

  const handleGenerateDeepAnalysis = async (group: DeepAnalysisGroup) => {
    if (!marketAnalysis || !analysis) return;

    setDeepAnalysisLoading(prev => ({ ...prev, [group]: true }));
    setDeepAnalysisError(prev => ({ ...prev, [group]: null }));

    try {
      const mainSummary = summarizeMainAnalysis(marketAnalysis);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isMockMode()) {
        headers['x-mock-mode'] = 'true';
      }

      const response = await fetch(`/api/ideas/${idea.id}/deep-analysis`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          group,
          target: analysis.target,
          problem: analysis.problem,
          solution: analysis.solution,
          mainAnalysisSummary: mainSummary,
          tier: idea.tier,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDeepAnalysis(prev => ({
          ...prev,
          [group]: result.data,
        }));
        localStorage.setItem(`idea_${idea.id}_deep_${group}`, JSON.stringify(result.data));
      } else {
        const errorMsg = result.error?.code === 'RATE_LIMIT_EXCEEDED'
          ? `RATE_LIMIT: ${result.error.message}`
          : result.error?.message || '알 수 없는 오류';
        setDeepAnalysisError(prev => ({ ...prev, [group]: errorMsg }));
      }
    } catch (error) {
      console.error(`Deep analysis (${group}) error:`, error);
      setDeepAnalysisError(prev => ({ ...prev, [group]: '네트워크 오류가 발생했습니다.' }));
    } finally {
      setDeepAnalysisLoading(prev => ({ ...prev, [group]: false }));
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">데이터 분석 중...</p>
        </div>
      </div>
    );
  }

  const analysisCardsRef = useRef<HTMLDivElement>(null);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Profile menu outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  // Load history when panel opens
  useEffect(() => {
    if (openPanel !== 'history') return;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        if (user) {
          const res = await fetch('/api/ideas');
          const json = await res.json();
          setHistoryItems(json.success && json.data ? json.data : []);
        } else {
          setHistoryItems(getAllIdeasFromStorage());
        }
      } catch {
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [openPanel, user]);

  // Load library when panel opens
  useEffect(() => {
    if (openPanel !== 'library') return;
    const loadLibrary = async () => {
      setLibraryLoading(true);
      try {
        if (user) {
          const res = await fetch('/api/ideas');
          const json = await res.json();
          setLibraryItems(json.success && json.data ? json.data : []);
        } else {
          setLibraryItems(getAllIdeasFromStorage());
        }
      } catch {
        setLibraryItems([]);
      } finally {
        setLibraryLoading(false);
      }
    };
    loadLibrary();
  }, [openPanel, user]);

  const handlePanelToggle = (panel: PanelType) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };

  // Keyboard navigation for sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentSection < 3) {
        setCurrentSection(prev => prev + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection]);

  useEffect(() => {
    const cards = analysisCardsRef.current?.querySelectorAll('.analysis-card-reveal');
    if (!cards?.length) return;

    cards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        onEnter: () => {
          gsap.fromTo(card, 
            { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.8, delay: i * 0.1, ease: 'power4.out' }
          );
        },
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [analysis]);

  // Stage별 동적 메시지 - 전체 제거
  const getStageMessage = () => {
    return null;
  };

  // Stage 완료 상태 - currentSection 기반으로 변경
  const stages = [
    { number: 1, label: '아이디어 분석', completed: currentSection > 0, active: currentSection === 0 },
    { number: 2, label: '시장 조사', completed: currentSection > 1, active: currentSection === 1 },
    { number: 3, label: '전략 수립', completed: currentSection > 2, active: currentSection === 2 },
    { number: 4, label: '최종 리포트', completed: currentSection > 3, active: currentSection === 3 }
  ];

  // Slide animation variants - simplified to fade only
  const slideVariants = {
    enter: {
      opacity: 0
    },
    center: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  };

  const paginate = (newDirection: number) => {
    const newSection = currentSection + newDirection;
    if (newSection >= 0 && newSection < 4) {
      setCurrentSection(newSection);
    }
  };

  // Calculate total sections - 항상 4개 고정
  const getTotalSections = () => 4;

  // Section names - 프로그레스 바와 동일하게
  const getSectionName = (index: number) => {
    const sections = ['아이디어 분석', '시장 조사', '전략 수립', '최종 리포트'];
    return sections[index] || '';
  };

  // Render section content
  const renderSection = () => {
    // Section 0: 아이디어 분석 (Stage 1)
    if (currentSection === 0) {
      return (
        <div className="min-h-[60vh]">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">아이디어 분석</h2>
            <p className="text-xs text-muted-foreground font-light">
              타겟 고객, 문제 정의, 솔루션 검증
            </p>
            {/* 한줄 핵심 (데이터에 있으면 표시) */}
            {analysis.one_liner && (
              <p className="mt-4 text-sm font-medium text-foreground/90 italic font-sans max-w-xl mx-auto">
                &ldquo;{analysis.one_liner}&rdquo;
              </p>
            )}
          </div>
          
          {/* Core Analysis Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <AnalysisCard
              icon={<Target className="w-4 h-4" />}
              title="타겟 고객"
              content={analysis.target}
              tier={idea.tier}
            />
            <AnalysisCard
              icon={<AlertCircle className="w-4 h-4" />}
              title="문제 정의"
              content={analysis.problem}
              tier={idea.tier}
            />
            <AnalysisCard
              icon={<Lightbulb className="w-4 h-4" />}
              title="솔루션"
              content={analysis.solution}
              tier={idea.tier}
              highlight
            />
          </div>

          {/* 종합 총평 (데이터에 있으면 표시) */}
          {analysis.summary && (
            <div className="mb-6 p-5 bg-card border border-border/60 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-foreground/60" />
                <h3 className="text-sm font-medium text-foreground">종합 총평</h3>
              </div>
              <p className="text-xs text-foreground/80 font-sans leading-relaxed">{analysis.summary}</p>
            </div>
          )}
          
          {/* Revenue Analysis for Pro/Heavy tier - 2 columns */}
          {idea.tier !== 'light' && analysis.revenue_analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Left Card: Revenue Streams & Cost Structure */}
              <div className="bg-card border border-border/60 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-foreground/60" />
                  <h3 className="text-sm font-medium text-foreground">수익 & 비용</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">주요 수익원</div>
                    <ul className="space-y-1.5">
                      {analysis.revenue_analysis.revenue_streams.map((stream, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                          <span className="font-sans">{stream}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">비용 구조</div>
                    <ul className="space-y-1.5">
                      {analysis.revenue_analysis.cost_structure.map((cost, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                          <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                          <span className="font-sans">{cost}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Card: Pricing Strategy */}
              <div className="bg-card border border-border/60 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-foreground/60" />
                  <h3 className="text-sm font-medium text-foreground">가격 전략</h3>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">전략</div>
                  <p className="text-xs text-foreground/80 font-sans leading-relaxed">{analysis.revenue_analysis.pricing_strategy}</p>
                </div>
              </div>
            </div>
          )}

          {/* 다음 단계 미리보기 (데이터에 있으면 표시) */}
          {analysis.next_teaser && (
            <div className="mt-6 p-4 bg-foreground/[0.02] border border-foreground/10 rounded-lg flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-foreground/40 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">다음 단계 미리보기</div>
                <p className="text-xs text-foreground/80 font-sans">{analysis.next_teaser}</p>
                <button
                  type="button"
                  onClick={() => setCurrentSection(1)}
                  className="mt-2 text-[10px] font-medium text-foreground/70 hover:text-foreground uppercase tracking-widest transition-colors"
                >
                  시장 조사로 이동 →
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Section 1: 시장 조사 (Stage 2)
    if (currentSection === 1) {
      return (
        <div className="min-h-[60vh]">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">시장 조사</h2>
            <p className="text-xs text-muted-foreground font-light">
              시장 규모, 경쟁사 분석, 위험 요소 평가
            </p>
          </div>

          {!marketAnalysis ? (
            // Market Analysis CTA
            idea.tier !== 'light' ? (
              <div className="bg-card border border-border/60 rounded-lg p-5 text-center">
                <div className="flex justify-center mb-3">
                  <BarChart3 className="w-8 h-8 text-foreground/40" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1.5">시장 분석 준비 완료</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-sans">
                  AI 기반 시장 규모 분석, 경쟁사 조사, 위험 요소 평가를 시작합니다.
                </p>
                <Button
                  onClick={handleGenerateMarketAnalysis}
                  disabled={isLoadingMarketAnalysis}
                  className="px-5 h-8 text-xs font-medium"
                >
                  {isLoadingMarketAnalysis ? (
                    <span className="flex items-center gap-2 font-sans">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      분석 중
                    </span>
                  ) : (
                    <span className="font-sans">시장 분석 시작</span>
                  )}
                </Button>
              </div>
            ) : (
              // Tier Lock for Light users: Pro 레이아웃 미리보기 + 블러 + 잠금
              <div className="relative">
                {/* Pro 레이아웃 미리보기 (목업 데이터) */}
                <div className="blur-[2px] opacity-85 pointer-events-none select-none">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-card border border-border/60 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-foreground/60" />
                        <h3 className="text-sm font-medium text-foreground">시장 분석</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/40">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">시장 규모</span>
                          <span className="text-sm font-semibold text-foreground font-sans">—</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/40">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">성장률</span>
                          <span className="text-sm font-semibold text-foreground font-sans">—</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-foreground/5 rounded border border-foreground/10">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">실현 가능성</span>
                          <span className="text-sm font-semibold text-foreground font-sans">—/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border/60 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-4 h-4 text-foreground/60" />
                        <h3 className="text-sm font-medium text-foreground">경쟁사 분석</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-3 bg-secondary/20 rounded border border-border/40">
                            <h4 className="text-xs font-medium text-foreground mb-1.5">경쟁사 {i}</h4>
                            <p className="text-[10px] text-muted-foreground font-sans line-clamp-2">—</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-2 bg-card border border-border/60 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-foreground/60" />
                        <h3 className="text-sm font-medium text-foreground">주요 위험 요소</h3>
                      </div>
                      <ul className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <li key={i} className="flex items-start gap-2 p-2 bg-foreground/[0.02] rounded border border-foreground/5">
                            <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 font-sans">—</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* 잠금 오버레이 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[2px] rounded-lg">
                  <Lock className="w-12 h-12 text-foreground/60 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Pro 플랜 전용</p>
                  <p className="text-xs text-muted-foreground mb-4">심층적인 시장 데이터와 경쟁사 분석</p>
                  <Link href="/upgrade">
                    <Button className="text-xs font-medium h-8 font-sans px-5">
                      업그레이드
                    </Button>
                  </Link>
                </div>
              </div>
            )
          ) : (
            // Market Analysis Results
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Market Analysis */}
              <div className="bg-card border border-border/60 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-foreground/60" />
                  <h3 className="text-sm font-medium text-foreground">시장 분석</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">시장 규모</span>
                    <span className="text-sm font-semibold text-foreground font-sans">{marketAnalysis.market_analysis.market_size}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/40">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">성장률</span>
                    <span className="text-sm font-semibold text-foreground font-sans">{marketAnalysis.market_analysis.growth_rate}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-foreground/5 rounded border border-foreground/10">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">실현 가능성</span>
                    <span className="text-sm font-semibold text-foreground font-sans">{marketAnalysis.feasibility_score}/100</span>
                  </div>
                </div>
              </div>

              {/* Competitors */}
              {marketAnalysis.competitors.length > 0 && (
                <div className="bg-card border border-border/60 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-foreground/60" />
                    <h3 className="text-sm font-medium text-foreground">경쟁사 분석</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {marketAnalysis.competitors.slice(0, 3).map((comp, idx) => (
                      <div key={idx} className="p-3 bg-secondary/20 rounded border border-border/40">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-medium text-foreground">{comp.name}</h4>
                          {comp.url && (
                            <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-foreground hover:underline uppercase tracking-widest">
                              SITE
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans line-clamp-2">{comp.strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {marketAnalysis.risks.length > 0 && (
                <div className="bg-card border border-border/60 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-foreground/60" />
                    <h3 className="text-sm font-medium text-foreground">주요 위험 요소</h3>
                  </div>
                  <ul className="space-y-2">
                    {marketAnalysis.risks.slice(0, 3).map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-foreground/[0.02] rounded border border-foreground/5">
                        <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-foreground/80 font-sans">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Section 2: 전략 수립 (Stage 3)
    if (currentSection === 2) {
      // Mock 모드가 아니고 시장 분석이 없으면 먼저 완료하도록 안내
      if (!isInMockMode && !marketAnalysis) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-base font-semibold text-foreground mb-2">시장 조사 먼저 완료해주세요</h2>
              <p className="text-xs text-muted-foreground font-light mb-6">
                전략 수립을 위해서는 시장 조사가 선행되어야 합니다.
              </p>
              <Button
                onClick={() => setCurrentSection(1)}
                className="px-6 h-9 text-xs font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1.5" />
                시장 조사로 이동
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[60vh]">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">전략 수립</h2>
            <p className="text-xs text-muted-foreground font-light">
              SWOT 분석, 시장 진입 전략, 자원 추정
            </p>
          </div>

          {idea.tier !== 'light' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                {/* Market Deep Analysis Card */}
                <DeepAnalysisCard
                group="market-deep"
                title="시장 심화 분석"
                icon={<TrendingUp className="w-6 h-6" />}
                description="TAM/SAM/SOM, 포지셔닝 맵, 가격 벤치마킹"
                isLoaded={!!deepAnalysis['market-deep']}
                isLoading={deepAnalysisLoading['market-deep']}
                error={deepAnalysisError['market-deep']}
                onGenerate={() => handleGenerateDeepAnalysis('market-deep')}
              >
                {deepAnalysis['market-deep'] && (
                  <MarketDeepContent data={deepAnalysis['market-deep']} />
                )}
              </DeepAnalysisCard>

              {/* Strategy Analysis Card */}
              <DeepAnalysisCard
                group="strategy"
                title="전략 & 실행"
                icon={<Crosshair className="w-6 h-6" />}
                description="SWOT 분석, 시장 진입 전략, 필요 자원 추정"
                isLoaded={!!deepAnalysis['strategy']}
                isLoading={deepAnalysisLoading['strategy']}
                error={deepAnalysisError['strategy']}
                onGenerate={() => handleGenerateDeepAnalysis('strategy')}
              >
                {deepAnalysis['strategy'] && (
                  <StrategyContent data={deepAnalysis['strategy']} />
                )}
              </DeepAnalysisCard>

              {/* External Analysis Card */}
              <DeepAnalysisCard
                group="external"
                title="외부 환경"
                icon={<Globe className="w-6 h-6" />}
                description="규제 이슈, 투자 트렌드, 유사 사례 분석"
                isLoaded={!!deepAnalysis['external']}
                isLoading={deepAnalysisLoading['external']}
                error={deepAnalysisError['external']}
                onGenerate={() => handleGenerateDeepAnalysis('external')}
              >
                {deepAnalysis['external'] && (
                  <ExternalContent data={deepAnalysis['external']} />
                )}
              </DeepAnalysisCard>
            </div>
          ) : (
            // Tier Lock for Light users: Pro 레이아웃 미리보기 + 블러 + 잠금
            <div className="relative">
              {/* Pro 레이아웃 미리보기 (3열 카드) */}
              <div className="blur-[2px] opacity-85 pointer-events-none select-none">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                  {[
                    { title: '시장 심화 분석', desc: 'TAM/SAM/SOM, 포지셔닝 맵, 가격 벤치마킹', icon: <TrendingUp className="w-6 h-6" /> },
                    { title: '전략 & 실행', desc: 'SWOT 분석, 시장 진입 전략, 필요 자원 추정', icon: <Crosshair className="w-6 h-6" /> },
                    { title: '외부 환경', desc: '규제 이슈, 투자 트렌드, 유사 사례 분석', icon: <Globe className="w-6 h-6" /> },
                  ].map((card, i) => (
                    <div key={i} className="relative rounded-lg border border-border/60 overflow-hidden bg-card min-h-[300px] flex flex-col items-center justify-center p-5">
                      <div className="flex justify-center text-foreground/40 mb-3">{card.icon}</div>
                      <h4 className="text-sm font-medium text-foreground mb-2">{card.title}</h4>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed text-center">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 잠금 오버레이 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[2px] rounded-lg">
                <Lock className="w-12 h-12 text-foreground/60 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Pro 플랜 전용</p>
                <p className="text-xs text-muted-foreground mb-4">전략 분석 및 자원 추정</p>
                <Link href="/upgrade">
                  <Button className="text-xs font-medium h-8 font-sans px-5">
                    업그레이드
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Section 3: 최종 리포트 (Stage 4)
    if (currentSection === 3) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center">
          <div className="text-center mb-8 max-w-2xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">최종 리포트</h2>
            <p className="text-xs text-muted-foreground font-light mb-8">
              지금까지의 분석을 종합하여 상세 리포트를 생성합니다
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">분석 완료</div>
                <div className="text-2xl font-semibold text-foreground">Stage {currentStage}</div>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-4">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">티어</div>
                <div className="text-2xl font-semibold text-foreground uppercase">{idea.tier}</div>
              </div>
            </div>

            {/* Generate Report Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full h-10 text-xs font-medium border border-foreground/10 shadow-sm"
              size="lg"
            >
              {isGeneratingReport ? (
                <span className="flex items-center gap-2 font-sans">
                  <motion.svg 
                    className="h-3.5 w-3.5" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </motion.svg>
                  생성 중
                </span>
              ) : (
                <span className="font-sans">상세 리포트 생성 →</span>
              )}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - GrokLayout 스타일 (초기 화면과 동일) */}
      <aside className="relative z-10 w-11 flex flex-col items-center py-2 hidden md:flex border-r border-border/50 flex-shrink-0">
        <Link href="/" className="mb-2 p-0.5">
          <LogoSliced className="w-7 h-7" />
        </Link>
        <nav className="flex flex-col gap-0.5">
          <button
            onClick={() => handlePanelToggle('search')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'search' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              "text-muted-foreground hover:text-foreground"
            )}
            title="New Chat"
          >
            <SquarePen className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handlePanelToggle('library')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'library' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Library"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePanelToggle('history')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "hover:bg-secondary/80 dark:hover:bg-secondary/40",
              openPanel === 'history' ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="History"
          >
            <Clock className="h-4 w-4" />
          </button>
        </nav>
        {user && (
          <div className="mt-auto flex flex-col gap-0.5 relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              title="Profile"
              className={cn(
                "p-1.5 rounded-md transition-colors",
                "hover:bg-secondary/80 dark:hover:bg-secondary/40",
                profileMenuOpen ? "bg-secondary/80 dark:bg-secondary/40 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCircle className="h-4 w-4" />
            </button>
            {profileMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1.5 w-40 py-1.5 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg shadow-xl z-50">
                <Link
                  href="/"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  홈으로 가기
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  설정
                </Link>
                <Link
                  href="/upgrade"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Upgrade
                </Link>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/50 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Fixed Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="z-50 border-b flex-shrink-0 bg-background py-4 border-border/60"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Meta Info */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-sans">
                DRAFT v1.{currentSection + 1}
              </span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-sans">
                Stage {currentSection + 1}/4
              </span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="px-2 py-0.5 text-[10px] font-medium text-foreground bg-secondary rounded uppercase tracking-widest">
                {idea.tier}
              </span>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-1.5 mb-4">
              {stages.map((stage) => (
                <div 
                  key={stage.number}
                  className="flex-1 group"
                >
                  <div 
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-500",
                      stage.completed || stage.active
                        ? "bg-foreground" 
                        : "bg-foreground/20"
                    )}
                  />
                  <div className={cn(
                    "text-[9px] mt-1.5 font-medium uppercase tracking-wider transition-colors",
                    stage.completed || stage.active
                      ? "text-foreground/70"
                      : "text-muted-foreground/40"
                  )}>
                    {stage.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight tracking-tight">
              {typeof idea?.idea === 'string' ? idea.idea : (idea?.id || 'Untitled')}
            </h1>
          </div>
        </motion.div>

      {/* Scrollable Content Area - data-lenis-prevent: Lenis가 이 영역 스크롤을 가로채지 않도록 */}
      <div className="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
        {/* Main Content - Horizontal Slide Sections */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>

        {/* Left Navigation Arrow (Desktop) */}
        <button
          onClick={() => paginate(-1)}
          disabled={currentSection === 0}
          aria-label="이전 섹션"
          className={cn(
            "hidden md:flex fixed left-12 top-1/2 -translate-y-1/2 z-40",
            "p-3 rounded-lg items-center justify-center",
            "opacity-30 hover:opacity-100 transition-all duration-300",
            "hover:bg-secondary/20",
            currentSection === 0 ? "cursor-not-allowed opacity-10" : "cursor-pointer"
          )}
        >
          <ChevronLeft 
            className={cn(
              "w-8 h-8 transition-colors",
              currentSection === 0 ? "text-foreground/10" : "text-foreground/40 hover:text-foreground/70"
            )} 
            strokeWidth={1.5}
          />
        </button>

        {/* Right Navigation Arrow (Desktop) */}
        <button
          onClick={() => paginate(1)}
          disabled={currentSection === getTotalSections() - 1}
          aria-label="다음 섹션"
          className={cn(
            "hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40",
            "p-3 rounded-lg items-center justify-center",
            "opacity-30 hover:opacity-100 transition-all duration-300",
            "hover:bg-secondary/20",
            currentSection === getTotalSections() - 1 ? "cursor-not-allowed opacity-10" : "cursor-pointer"
          )}
        >
          <ChevronRight 
            className={cn(
              "w-8 h-8 transition-colors",
              currentSection === getTotalSections() - 1 ? "text-foreground/10" : "text-foreground/40 hover:text-foreground/70"
            )} 
            strokeWidth={1.5}
          />
        </button>

        {/* Mobile Navigation Dots */}
        <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              {Array.from({ length: getTotalSections() }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSection(idx);
                  }}
                  aria-label={`섹션 ${idx + 1}로 이동`}
                  className={cn(
                    "transition-all rounded-full",
                    idx === currentSection
                      ? "w-6 h-1.5 bg-foreground"
                      : "w-1.5 h-1.5 bg-border"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

          {/* Hidden ref for GSAP */}
          <div ref={analysisCardsRef} className="hidden" />
        </div>
      </div>

        {/* Side Panel (GrokLayout과 동일) */}
        {openPanel && (
          <>
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20"
              onClick={() => setOpenPanel(null)}
            />
            <div className="absolute top-0 right-0 h-full w-96 bg-background border-l border-border/50 z-30 shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h2 className="text-lg font-semibold">
                    {openPanel === 'search' && 'Search'}
                    {openPanel === 'library' && 'Library'}
                    {openPanel === 'history' && 'History'}
                  </h2>
                  <button
                    onClick={() => setOpenPanel(null)}
                    className="p-2 rounded-lg hover:bg-secondary/80 dark:hover:bg-secondary/40 transition-colors"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {openPanel === 'search' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-lg border border-border/50 bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="text-sm text-muted-foreground text-center py-8">
                        Search results will appear here
                      </div>
                    </div>
                  )}
                  {openPanel === 'library' && (
                    <div className="space-y-3">
                      {libraryLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-8">로딩 중...</div>
                      ) : libraryItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">저장한 아이디어가 없어요</div>
                      ) : (
                        <ul className="space-y-1">
                          {libraryItems.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/ideas/${item.id}`}
                                onClick={() => setOpenPanel(null)}
                                className="block px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm text-foreground truncate"
                              >
                                {item.idea || '(제목 없음)'}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {openPanel === 'history' && (
                    <div className="space-y-3">
                      {historyLoading ? (
                        <div className="text-sm text-muted-foreground text-center py-8">로딩 중...</div>
                      ) : historyItems.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">아직 아이디어가 없어요</div>
                      ) : (
                        <ul className="space-y-1">
                          {historyItems.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/ideas/${item.id}`}
                                onClick={() => setOpenPanel(null)}
                                className="block px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm text-foreground truncate"
                              >
                                {item.idea || '(제목 없음)'}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Analysis Card Component
function AnalysisCard({
  icon,
  title,
  content,
  tier,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  tier: Tier;
  highlight?: boolean;
}) {
  return (
    <div
      className={`analysis-card-reveal bg-card rounded-lg p-4 transition-all overflow-hidden ${
        highlight 
          ? 'border border-foreground/20' 
          : 'border border-border/60'
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="text-foreground/60">{icon}</div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-foreground/70 text-xs leading-relaxed whitespace-pre-line font-sans">
        {content}
      </p>
    </div>
  );
}

// Deep Analysis Card Component
function DeepAnalysisCard({
  group,
  title,
  icon,
  description,
  isLoaded,
  isLoading,
  error,
  onGenerate,
  children,
}: {
  group: DeepAnalysisGroup;
  title: string;
  icon: React.ReactNode;
  description: string;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  children: React.ReactNode;
}) {
  const isRateLimitError = error?.startsWith('RATE_LIMIT:');
  const errorMessage = isRateLimitError && error ? error.substring(11) : error;
  const retryMatch = errorMessage?.match(/(\d+)\s*초/);
  const retryAfter = retryMatch ? parseInt(retryMatch[1]) : undefined;

  return (
    <div className="relative rounded-lg border border-border/60 overflow-hidden bg-card min-h-[300px]">
      {!isLoaded && (
        <div className="absolute inset-0 backdrop-blur-sm bg-background/70 flex flex-col items-center justify-center z-10 p-5">
          <div className="text-center space-y-3 max-w-sm">
            <div className="flex justify-center text-foreground/40">
              {icon}
            </div>
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">{description}</p>
            
            {isRateLimitError ? (
              <div className="w-full">
                <RateLimitNotice 
                  retryAfter={retryAfter}
                  onRetry={onGenerate}
                  message="무료 티어 일일 한도(20개)를 초과했습니다."
                />
              </div>
            ) : (
              <>
                {error && !isRateLimitError && (
                  <p className="text-destructive text-xs mb-3">{error}</p>
                )}
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      {icon}
                    </motion.div>
                    <p className="text-xs text-muted-foreground font-sans">분석 생성 중...</p>
                  </motion.div>
                ) : (
                  <Button 
                    onClick={onGenerate} 
                    disabled={isLoading}
                    className="px-4 h-8 text-xs font-medium font-sans"
                  >
                    {title} 생성
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {isLoaded && children}
    </div>
  );
}

// 금액 추출 (예: "글로벌 시장 총 규모: 50조원" → "50조원")
function extractAmount(text: string): string | null {
  const match = text.match(/[\d,]+(?:조|억)\s*원|[\d,]+(?:조|억)원/);
  return match ? match[0].trim() : null;
}

// Market Deep Content Component
function MarketDeepContent({ data }: { data: MarketDeepAnalysis }) {
  const [positioningTooltip, setPositioningTooltip] = useState<{ name: string; x: number; y: number; isOurs?: boolean } | null>(null);
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-foreground/60" />
        <h3 className="text-sm font-medium text-foreground">시장 심화 분석</h3>
      </div>

      {/* TAM/SAM/SOM - Diagram with amount in each area, tooltip on hover */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          시장 규모 (TAM/SAM/SOM)
        </div>
        
        {/* Wide nested rounded rects - amount inside, tooltip on hover */}
        <div className="relative w-full max-w-[420px] mx-auto">
          <div className="aspect-[2/1] relative flex items-center justify-center">
            {/* TAM - outer */}
            <div className="group/tam absolute inset-0 rounded-2xl border-[0.5px] border-foreground/25 bg-foreground/[0.02] flex items-center justify-center cursor-default">
              <span className="absolute top-2 left-3 text-[10px] font-semibold text-foreground/80">
                TAM: {extractAmount(data.tam_sam_som.tam) || '—'}
              </span>
              {/* Tooltip - Grok 스타일 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-md bg-background/95 backdrop-blur-sm border-[0.5px] border-foreground/15 text-[11px] text-foreground/85 font-sans leading-relaxed max-w-[260px] opacity-0 invisible group-hover/tam:opacity-100 group-hover/tam:visible transition-opacity duration-200 z-20 pointer-events-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {data.tam_sam_som.tam}
              </div>
            </div>
            {/* SAM - middle */}
            <div className="group/sam absolute inset-y-[16%] inset-x-[13%] rounded-xl border-[0.5px] border-foreground/35 bg-foreground/[0.04] flex items-center justify-center cursor-default">
              <span className="absolute top-2 left-[30%] -translate-x-1/2 text-[10px] font-semibold text-foreground/80">
                SAM: {extractAmount(data.tam_sam_som.sam) || '—'}
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-md bg-background/95 backdrop-blur-sm border-[0.5px] border-foreground/15 text-[11px] text-foreground/85 font-sans leading-relaxed max-w-[260px] opacity-0 invisible group-hover/sam:opacity-100 group-hover/sam:visible transition-opacity duration-200 z-20 pointer-events-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {data.tam_sam_som.sam}
              </div>
            </div>
            {/* SOM - inner */}
            <div className="group/som absolute inset-y-[34%] inset-x-[26%] rounded-lg border-[0.5px] border-foreground/50 bg-foreground/[0.08] flex items-center justify-center cursor-default">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-foreground/80">
                SOM: {extractAmount(data.tam_sam_som.som) || '—'}
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-md bg-background/95 backdrop-blur-sm border-[0.5px] border-foreground/15 text-[11px] text-foreground/85 font-sans leading-relaxed max-w-[260px] opacity-0 invisible group-hover/som:opacity-100 group-hover/som:visible transition-opacity duration-200 z-20 pointer-events-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {data.tam_sam_som.som}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Positioning Map - 그래프 틀 (축, 좌표) */}
      {data.positioning_map && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            포지셔닝 맵
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg border border-border/40">
            {/* 축 레이블 */}
            <div className="flex justify-between text-[9px] text-muted-foreground mb-2 font-sans">
              <span>X: {data.positioning_map.x_axis}</span>
              <span>Y: {data.positioning_map.y_axis}</span>
            </div>
            
            {/* 그래프 영역 - 중간값(5)을 원점(0,0), -5~+5 스케일 */}
            <div className="relative w-full max-w-[280px] mx-auto">
              {/* 호버 툴팁 - Grok 스타일 */}
              {positioningTooltip && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-3 py-2.5 rounded-md bg-background/95 backdrop-blur-sm border-[0.5px] border-foreground/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-w-[100px] text-center pointer-events-none">
                  <div className="text-[10px] font-semibold text-foreground uppercase tracking-widest">{positioningTooltip.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-sans">({positioningTooltip.x}, {positioningTooltip.y})</div>
                </div>
              )}
              <svg viewBox="0 0 240 220" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
                    <path d="M 18 0 L 0 0 0 18" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
                  </pattern>
                </defs>
                {/* 그리드 */}
                <rect x="40" y="20" width="180" height="180" fill="url(#grid)" />
                {/* 축 */}
                <line x1="40" y1="110" x2="220" y2="110" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                <line x1="130" y1="200" x2="130" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                {/* X축 눈금 (-5 ~ +5) */}
                {[-5, -3, -1, 0, 1, 3, 5].map((t) => {
                  const px = 130 + (t / 5) * 90;
                  return (
                    <g key={`x-${t}`}>
                      <line x1={px} y1="110" x2={px} y2="115" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                      <text x={px} y="125" textAnchor="middle" fill="currentColor" fontSize="8" opacity="0.7">{t}</text>
                    </g>
                  );
                })}
                {/* Y축 눈금 (-5 ~ +5) */}
                {[-5, -3, -1, 0, 1, 3, 5].map((t) => {
                  const py = 110 - (t / 5) * 90;
                  return (
                    <g key={`y-${t}`}>
                      <line x1="125" y1={py} x2="130" y2={py} stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                      <text x="25" y={py + 3} textAnchor="end" fill="currentColor" fontSize="8" opacity="0.7">{t}</text>
                    </g>
                  );
                })}
                {/* 경쟁사 포인트 (원본 0-10 → -5~+5 변환: val - 5) */}
                {data.positioning_map.competitors.map((comp, i) => {
                  const vx = Math.min(10, Math.max(0, comp.x)) - 5;
                  const vy = Math.min(10, Math.max(0, comp.y)) - 5;
                  const px = 130 + (vx / 5) * 90;
                  const py = 110 - (vy / 5) * 90;
                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setPositioningTooltip({ name: comp.name, x: comp.x, y: comp.y })}
                      onMouseLeave={() => setPositioningTooltip(null)}
                    >
                      <circle cx={px} cy={py} r="8" fill="transparent" />
                      <circle cx={px} cy={py} r="4" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
                      <text x={px} y={py - 8} textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.8">{comp.name}</text>
                    </g>
                  );
                })}
                {/* 우리 위치 */}
                {(() => {
                  const vx = Math.min(10, Math.max(0, data.positioning_map.our_position.x)) - 5;
                  const vy = Math.min(10, Math.max(0, data.positioning_map.our_position.y)) - 5;
                  const ox = 130 + (vx / 5) * 90;
                  const oy = 110 - (vy / 5) * 90;
                  return (
                    <g
                      className="cursor-pointer"
                      onMouseEnter={() => setPositioningTooltip({ name: '우리 위치', x: data.positioning_map.our_position.x, y: data.positioning_map.our_position.y, isOurs: true })}
                      onMouseLeave={() => setPositioningTooltip(null)}
                    >
                      <circle cx={ox} cy={oy} r="10" fill="transparent" />
                      <circle cx={ox} cy={oy} r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.9" />
                      <circle cx={ox} cy={oy} r="2" fill="currentColor" opacity="0.9" />
                      <text x={ox} y={oy - 10} textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="600" opacity="0.9">우리</text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Price Benchmark */}
      {data.price_benchmark && data.price_benchmark.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            가격 벤치마크
          </div>
          <div className="space-y-2">
            {data.price_benchmark.map((bench, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded border border-border/40">
                <span className="text-xs font-medium text-foreground">{bench.product}</span>
                <span className="text-xs font-semibold text-foreground">{bench.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Strategy Content Component
function StrategyContent({ data }: { data: StrategyAnalysis }) {
  const [scale, setScale] = useState(1);
  
  const scaleLabels = [
    { value: 1, label: 'MVP 단위', desc: '초기 검증' },
    { value: 2, label: '지역 단위', desc: '지역 확장' },
    { value: 3, label: '전국 단위', desc: '전국 사업' },
    { value: 4, label: '글로벌 단위', desc: '글로벌 진출' }
  ];
  
  const getScaledResource = (baseValue: string, multiplier: number) => {
    const match = baseValue.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*([만억조]?원?|명|개월|년)/);
    if (!match) return baseValue;
    
    const [, numStr, unit] = match;
    const num = parseFloat(numStr.replace(/,/g, ''));
    const scaled = num * multiplier;
    
    return `${scaled.toLocaleString()}${unit}`;
  };
  
  const scaleMultipliers = [1, 3, 10, 50];
  const currentMultiplier = scaleMultipliers[scale - 1];
  
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-foreground/60" />
        <h3 className="text-sm font-medium text-foreground">전략 & 실행</h3>
      </div>

      {/* SWOT */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          SWOT 분석
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-foreground/[0.02] p-4 rounded border border-foreground/10">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">강점 (S)</div>
            <ul className="space-y-1">
              {data.swot.strengths.map((s, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                  <span className="font-sans">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-foreground/[0.02] p-4 rounded border border-foreground/10">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">약점 (W)</div>
            <ul className="space-y-1">
              {data.swot.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                  <span className="font-sans">{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-foreground/[0.02] p-4 rounded border border-foreground/10">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">기회 (O)</div>
            <ul className="space-y-1">
              {data.swot.opportunities.map((o, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                  <span className="font-sans">{o}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-foreground/[0.02] p-4 rounded border border-foreground/10">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">위협 (T)</div>
            <ul className="space-y-1">
              {data.swot.threats.map((t, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                  <span className="font-sans">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Entry Strategy */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          시장 진입 전략
        </div>
        <div className="bg-secondary/20 p-4 rounded border border-border/40">
          <p className="text-xs text-foreground/80 leading-relaxed font-sans mb-2">{data.entry_strategy.approach}</p>
          <p className="text-[10px] text-muted-foreground font-sans italic mb-3">{data.entry_strategy.rationale}</p>
          {data.entry_strategy.steps && data.entry_strategy.steps.length > 0 && (
            <div className="space-y-1.5">
              {data.entry_strategy.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-foreground/70">
                  <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1 flex-shrink-0" />
                  <span className="font-sans">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resource Estimate with Scale Slider */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            필요 자원 추정
          </div>
          <Sliders className="w-3 h-3 text-muted-foreground" />
        </div>
        
        {/* Scale Slider */}
        <div className="mb-4 p-4 bg-secondary/20 rounded border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-foreground">사업 규모</span>
            <span className="text-xs font-semibold text-foreground">{scaleLabels[scale - 1].label}</span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
            className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-foreground"
          />
          <div className="flex justify-between mt-2">
            {scaleLabels.map((s) => (
              <button
                key={s.value}
                onClick={() => setScale(s.value)}
                className={`text-[9px] transition-colors ${
                  scale === s.value ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {s.desc}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-secondary/30 p-4 rounded border border-border/40">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">초기 자본</div>
            <div className="text-base font-semibold text-foreground">
              {getScaledResource(data.resource_estimate.initial_capital, currentMultiplier)}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">×{currentMultiplier} 배율</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded border border-border/40">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">팀 규모</div>
            <div className="text-base font-semibold text-foreground">
              {getScaledResource(data.resource_estimate.team_size, currentMultiplier)}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">×{currentMultiplier} 배율</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded border border-border/40">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">핵심 채용</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.resource_estimate.key_hires.map((hire, i) => (
                <span key={i} className="text-[10px] bg-foreground/5 text-foreground px-2 py-0.5 rounded font-medium">
                  {hire}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-secondary/30 p-4 rounded border border-border/40">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">예상 타임라인</div>
            <div className="text-sm font-semibold text-foreground">{data.resource_estimate.timeline}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// External Content Component
function ExternalContent({ data }: { data: ExternalAnalysis }) {
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
      case '높음':
        return 'bg-foreground/5 text-foreground border-foreground/10';
      case 'medium':
      case '중간':
        return 'bg-foreground/[0.03] text-foreground border-foreground/5';
      case 'low':
      case '낮음':
        return 'bg-foreground/[0.02] text-foreground/70 border-foreground/5';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-foreground/60" />
        <h3 className="text-sm font-medium text-foreground">외부 환경</h3>
      </div>

      {/* Regulations */}
      {data.regulations && data.regulations.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            규제 이슈
          </div>
          <div className="space-y-2">
            {data.regulations.map((reg, idx) => (
              <div key={idx} className="p-3 bg-secondary/20 rounded border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-foreground">{reg.area}</h4>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded border font-medium uppercase tracking-widest",
                    getRiskLevelColor(reg.risk_level)
                  )}>
                    {reg.risk_level}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-sans">{reg.requirement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Trends */}
      {data.investment_trends && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            투자 트렌드
          </div>
          <div className="bg-secondary/20 p-4 rounded border border-border/40 space-y-3">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">총 투자 규모</div>
              <p className="text-xs text-foreground font-semibold">{data.investment_trends.total_funding}</p>
            </div>
            {data.investment_trends.notable_deals && data.investment_trends.notable_deals.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">주요 딜</div>
                <ul className="space-y-1">
                  {data.investment_trends.notable_deals.map((deal, i) => (
                    <li key={i} className="text-[10px] text-foreground/80 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1 flex-shrink-0" />
                      <span className="font-sans">{deal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">투자자 관심도</div>
              <p className="text-xs text-foreground/80 font-sans">{data.investment_trends.investor_interest}</p>
            </div>
          </div>
        </div>
      )}

      {/* Similar Cases */}
      {data.similar_cases && data.similar_cases.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            유사 사례 분석
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.similar_cases.map((caseItem, idx) => (
              <div key={idx} className="bg-secondary/20 rounded p-4 border border-border/40">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <FileText className="w-3.5 h-3.5 text-foreground/60" />
                  <h4 className="font-medium text-xs text-foreground">{caseItem.name}</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2 font-sans">{caseItem.outcome}</p>
                <p className="text-[10px] text-foreground font-sans italic">&ldquo;{caseItem.lessons}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
