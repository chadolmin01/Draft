'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SectionOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  required?: boolean;
}

interface ReportCustomizerProps {
  availableSections: SectionOption[];
  onGenerate: (selectedSections: string[]) => void;
  isGenerating?: boolean;
}

export function ReportCustomizer({ availableSections, onGenerate, isGenerating = false }: ReportCustomizerProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>(
    availableSections.filter(s => s.required).map(s => s.id)
  );

  const toggleSection = (sectionId: string) => {
    const section = availableSections.find(s => s.id === sectionId);
    if (section?.required) return; // 필수 섹션은 해제 불가

    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectAll = () => {
    setSelectedSections(availableSections.map(s => s.id));
  };

  const deselectAll = () => {
    setSelectedSections(availableSections.filter(s => s.required).map(s => s.id));
  };

  const handleGenerate = () => {
    if (selectedSections.length === 0) {
      alert('최소 1개 이상의 섹션을 선택해주세요.');
      return;
    }
    onGenerate(selectedSections);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">리포트 커스터마이징</h3>
          <p className="text-sm text-muted-foreground">
            리포트에 포함할 섹션을 선택하세요 ({selectedSections.length}개 선택됨)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} disabled={isGenerating}>
            전체 선택
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll} disabled={isGenerating}>
            선택 해제
          </Button>
        </div>
      </div>

      {/* 섹션 선택 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {availableSections.map((section) => {
          const isSelected = selectedSections.includes(section.id);
          const isRequired = section.required;

          return (
            <div
              key={section.id}
              onClick={() => !isGenerating && toggleSection(section.id)}
              className={`
                relative p-5 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card'
                }
                ${isRequired ? 'opacity-100' : 'opacity-100 hover:opacity-90'}
                ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {/* 체크 표시 */}
              <div className="absolute top-3 right-3">
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${isSelected
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* 섹션 정보 */}
              <div className="flex items-start gap-3 pr-8">
                <span className="text-3xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{section.label}</h4>
                    {isRequired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded uppercase">
                        필수
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 생성 버튼 */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          선택된 섹션이 많을수록 리포트 생성 시간이 길어집니다
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || selectedSections.length === 0}
          size="lg"
          className="h-11 px-8 font-semibold"
        >
          {isGenerating ? '생성 중...' : '커스텀 리포트 생성'}
        </Button>
      </div>
    </div>
  );
}

// 사전 정의된 섹션 옵션
export const defaultSectionOptions: SectionOption[] = [
  {
    id: 'overview',
    label: '사업 개요',
    icon: '📋',
    description: '비전, 미션, 사업 설명',
    required: true,
  },
  {
    id: 'market',
    label: '시장 분석',
    icon: '📊',
    description: 'TAM/SAM/SOM, 시장 트렌드, 기회와 위협',
    required: true,
  },
  {
    id: 'competitors',
    label: '경쟁사 분석',
    icon: '🏢',
    description: '직접/간접 경쟁사, 경쟁 우위',
  },
  {
    id: 'monetization',
    label: '수익화 모델',
    icon: '💰',
    description: '수익원, 가격 전략, 매출 예측',
  },
  {
    id: 'structure',
    label: '사업 구조',
    icon: '🏗️',
    description: '팀 구성, 운영 프로세스, 마일스톤',
  },
  {
    id: 'development',
    label: '개발 가이드',
    icon: '💻',
    description: '기술 스택, MVP 기능, 로드맵',
  },
  {
    id: 'financials',
    label: '재무 계획',
    icon: '💵',
    description: '투자 계획, 재무 예측, 손익분기점',
  },
  {
    id: 'risks',
    label: '위험 분석',
    icon: '⚠️',
    description: '시장/운영/재무 위험, 대응책',
  },
  {
    id: 'timeline',
    label: '프로젝트 타임라인',
    icon: '📅',
    description: '단계별 일정, 마일스톤, 크리티컬 패스',
  },
];
