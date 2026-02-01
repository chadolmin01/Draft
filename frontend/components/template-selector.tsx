'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { reportTemplates, templateOrder, sectionLabels, type ReportTemplate } from '@/lib/report-templates';
import type { Tier } from '@/lib/types';

interface TemplateSelectorProps {
  tier: Tier;
  onSelectTemplate: (template: ReportTemplate) => void;
  isGenerating?: boolean;
}

export function TemplateSelector({ tier, onSelectTemplate, isGenerating = false }: TemplateSelectorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 티어별 사용 가능한 템플릿 필터링
  const tierHierarchy = { light: 1, pro: 2, heavy: 3 };
  const userTierLevel = tierHierarchy[tier];

  const availableTemplates = templateOrder
    .map(id => reportTemplates[id])
    .filter(template => {
      const templateTierLevel = tierHierarchy[template.recommendedTier];
      return templateTierLevel <= userTierLevel;
    });

  const lockedTemplates = templateOrder
    .map(id => reportTemplates[id])
    .filter(template => {
      const templateTierLevel = tierHierarchy[template.recommendedTier];
      return templateTierLevel > userTierLevel;
    });

  const selectedTemplate = selectedTemplateId ? reportTemplates[selectedTemplateId] : null;

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplateId(template.id);
    setShowPreview(true);
  };

  const handleGenerate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">리포트 템플릿 선택</h2>
        <p className="text-muted-foreground">
          목적에 맞는 템플릿을 선택하면 최적화된 리포트를 빠르게 생성할 수 있습니다
        </p>
      </div>

      {/* 사용 가능한 템플릿 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">사용 가능한 템플릿</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => !isGenerating && handleSelectTemplate(template)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border hover:border-primary/50 bg-card hover:shadow-md'
                  }
                  ${isGenerating ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {/* 선택 표시 */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* 아이콘 */}
                <div className="text-5xl mb-4">{template.icon}</div>

                {/* 템플릿 정보 */}
                <h4 className="font-bold text-lg mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* 메타 정보 */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">대상:</span>
                    <span>{template.targetAudience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">분량:</span>
                    <span>{template.estimatedPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      template.recommendedTier === 'heavy' ? 'bg-purple-100 text-purple-700' :
                      template.recommendedTier === 'pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {template.recommendedTier} Tier
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 잠긴 템플릿 */}
      {lockedTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🔒</span>
            <span>상위 티어 전용 템플릿</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedTemplates.map((template) => (
              <div
                key={template.id}
                className="relative p-6 rounded-2xl border-2 border-border bg-card opacity-60 cursor-not-allowed"
              >
                {/* 잠금 아이콘 */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">🔒</span>
                </div>

                <div className="text-5xl mb-4 grayscale">{template.icon}</div>
                <h4 className="font-bold text-lg mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="text-xs">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-muted text-muted-foreground`}>
                    {template.recommendedTier} Tier 필요
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미리보기 및 생성 */}
      {showPreview && selectedTemplate && (
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-6xl">{selectedTemplate.icon}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h3>
              <p className="text-muted-foreground mb-4">{selectedTemplate.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">대상 독자:</span>
                  <p>{selectedTemplate.targetAudience}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">예상 분량:</span>
                  <p>{selectedTemplate.estimatedPages}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">스타일:</span>
                  <p className="capitalize">{selectedTemplate.style}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">권장 티어:</span>
                  <p className="uppercase">{selectedTemplate.recommendedTier}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 포함 섹션 */}
          <div className="border-t border-border pt-6">
            <h4 className="font-semibold mb-3">포함될 섹션</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedTemplate.sections.map((sectionId) => (
                <span
                  key={sectionId}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20"
                >
                  {sectionLabels[sectionId] || sectionId}
                </span>
              ))}
            </div>

            {/* 생성 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={isGenerating}
              >
                다른 템플릿 선택
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="h-12 px-8 font-semibold"
              >
                {isGenerating ? '생성 중...' : '이 템플릿으로 생성'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
