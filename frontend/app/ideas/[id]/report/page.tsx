'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportPage } from '@/components/report-page';
import { getMockReport } from '@/lib/mock-data';
import type { BusinessReport } from '@/lib/types';
import { BarChart3, FileText, Lightbulb, AlertTriangle } from 'lucide-react';

export default function Report() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [ideaTitle, setIdeaTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock 모드 확인
    const isMock = localStorage.getItem('MOCK_MODE') === 'true';
    
    // localStorage에서 리포트 로드
    const stored = localStorage.getItem(`idea_${id}_report`);
    const ideaData = localStorage.getItem(`idea_${id}`);
    
    if (stored && ideaData) {
      try {
        const reportData = JSON.parse(stored);
        const idea = JSON.parse(ideaData);
        setReport(reportData);
        setIdeaTitle(idea.idea);
      } catch (error) {
        console.error('리포트 데이터 파싱 오류:', error);
        setReport(null);
      }
    } else if (ideaData && !stored) {
      // 아이디어는 있지만 리포트가 없는 경우
      try {
        const idea = JSON.parse(ideaData);
        
        // Mock 모드면 자동으로 Mock 리포트 표시
        if (isMock) {
          console.log('Mock 모드: 자동으로 Mock 리포트를 표시합니다.');
          const mockReport = getMockReport(id);
          if (mockReport) {
            setReport(mockReport);
            setIdeaTitle(idea.idea);
          } else {
            // 분석 페이지로 리다이렉트
            console.log('Mock 리포트도 없습니다. 분석 페이지로 이동합니다.');
            window.location.href = `/ideas/${id}`;
            return;
          }
        } else {
          // 일반 모드면 분석 페이지로 리다이렉트
          console.log('리포트가 없습니다. 분석 페이지로 이동합니다.');
          window.location.href = `/ideas/${id}`;
          return;
        }
      } catch (error) {
        console.error('아이디어 데이터 파싱 오류:', error);
      }
    } else {
      // 아이디어 데이터도 없는 경우 -> Mock 데이터 폴백
      const mockReport = getMockReport(id);
      if (mockReport) {
        setReport(mockReport);
        setIdeaTitle('Mock 리포트');
      } else {
        // demo 데이터로 최종 폴백
        const demoReport = getMockReport('demo-light');
        if (demoReport) {
          setReport(demoReport);
          setIdeaTitle('Demo 사업 계획서');
        } else {
          setReport(null);
        }
      }
    }
    
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">리포트 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 px-6 max-w-lg">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <BarChart3 className="w-16 h-16 text-foreground/40" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">리포트를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground">
              리포트가 생성되지 않았거나 데이터가 삭제되었습니다.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <a
              href={`/ideas/${id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FileText className="w-4 h-4" />
              분석 페이지로 이동 (리포트 생성하기)
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-foreground font-medium rounded-lg border border-border hover:bg-secondary/80 transition-colors"
            >
              홈으로 돌아가기
            </a>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-secondary/50 transition-colors"
            >
              뒤로 가기
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="text-left border border-border/60 rounded-lg p-4 bg-foreground/[0.02]">
              <div className="font-semibold mb-2 text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-foreground/60" />
                해결 방법
              </div>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>"분석 페이지로 이동"</strong> 버튼을 클릭하여 리포트를 생성하세요
                </li>
                <li>
                  또는 새로운 아이디어를 입력하여 처음부터 시작하세요
                </li>
                <li>
                  Mock 모드를 활성화하면 샘플 리포트를 볼 수 있습니다
                </li>
              </ol>
            </div>
            
            <div className="text-xs text-muted-foreground border border-border/60 bg-foreground/[0.02] rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-foreground/60" />
              <span><strong>참고:</strong> 리포트는 브라우저의 로컬 저장소에 저장됩니다. 
              브라우저 캐시를 삭제하거나 시크릿 모드를 사용하면 데이터가 사라질 수 있습니다.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ReportPage report={report} ideaTitle={ideaTitle} />;
}
