'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BusinessReport } from '@/lib/types';
import { ReportExporter } from '@/lib/export-manager';
import { downloadReportPDF } from '@/lib/pdf-generator';

interface ExportMenuProps {
  report: BusinessReport;
}

export function ExportMenu({ report }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          await downloadReportPDF(report);
          break;
        case 'json':
          ReportExporter.exportJSON(report);
          break;
        case 'markdown':
          ReportExporter.exportMarkdown(report);
          break;
        case 'text':
          ReportExporter.exportText(report);
          break;
        case 'csv-market':
          ReportExporter.exportMarketAnalysisCSV(report);
          break;
        case 'csv-competitors':
          ReportExporter.exportCompetitorsCSV(report);
          break;
        case 'csv-revenue':
          ReportExporter.exportRevenueProjectionCSV(report);
          break;
        default:
          break;
      }
      // 성공 메시지 (선택적)
      setTimeout(() => setIsOpen(false), 500);
    } catch (error) {
      console.error('내보내기 실패:', error);
      alert('파일 내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="h-8 text-xs font-medium"
        disabled={isExporting}
      >
        {isExporting ? '내보내는 중...' : '내보내기 ▾'}
      </Button>

      {isOpen && (
        <>
          {/* 배경 클릭 시 닫기 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-20 py-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
              문서 형식
            </div>
            
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>📄</span>
              <span>PDF 문서</span>
            </button>

            <button
              onClick={() => handleExport('markdown')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>📝</span>
              <span>Markdown (.md)</span>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>📋</span>
              <span>JSON 데이터</span>
            </button>

            <button
              onClick={() => handleExport('text')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>📃</span>
              <span>텍스트 파일 (.txt)</span>
            </button>

            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-t border-b border-border mt-1">
              CSV 데이터
            </div>

            <button
              onClick={() => handleExport('csv-market')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>📊</span>
              <span>시장 분석 (CSV)</span>
            </button>

            <button
              onClick={() => handleExport('csv-competitors')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>🏢</span>
              <span>경쟁사 분석 (CSV)</span>
            </button>

            <button
              onClick={() => handleExport('csv-revenue')}
              className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
              disabled={isExporting}
            >
              <span>💰</span>
              <span>매출 예측 (CSV)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
