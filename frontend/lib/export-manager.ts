import type { BusinessReport } from './types';

/**
 * 리포트를 다양한 포맷으로 내보내는 유틸리티 클래스
 */
export class ReportExporter {
  /**
   * 파일 다운로드 헬퍼 함수
   */
  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * JSON 포맷으로 내보내기
   */
  static exportJSON(report: BusinessReport): void {
    const json = JSON.stringify(report, null, 2);
    const filename = `business-report-${report.id}-${Date.now()}.json`;
    this.downloadFile(json, filename, 'application/json');
  }

  /**
   * Markdown 포맷으로 내보내기
   */
  static exportMarkdown(report: BusinessReport): void {
    const md = this.convertToMarkdown(report);
    const filename = `business-report-${report.id}-${Date.now()}.md`;
    this.downloadFile(md, filename, 'text/markdown');
  }

  /**
   * CSV 포맷으로 내보내기 (특정 섹션용)
   */
  static exportCSV(data: any[], filename: string): void {
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, filename, 'text/csv');
  }

  /**
   * BusinessReport를 Markdown 문자열로 변환
   */
  private static convertToMarkdown(report: BusinessReport): string {
    const { sections } = report;
    const generatedDate = new Date(report.generatedAt).toLocaleDateString('ko-KR');

    let md = '';

    // 헤더
    md += `# ${sections.overview.title}\n\n`;
    md += `> ${sections.overview.tagline}\n\n`;
    md += `**생성일:** ${generatedDate} | **티어:** ${report.tier.toUpperCase()}\n\n`;
    md += `---\n\n`;

    // 사업 개요
    md += `## 📋 사업 개요\n\n`;
    md += `${sections.overview.description}\n\n`;
    md += `### Vision\n\n`;
    md += `${sections.overview.vision}\n\n`;
    md += `### Mission\n\n`;
    md += `${sections.overview.mission}\n\n`;
    md += `---\n\n`;

    // 시장 분석
    md += `## 📊 시장 분석\n\n`;
    md += `### 시장 규모 (TAM-SAM-SOM)\n\n`;
    md += `| TAM | SAM | SOM |\n`;
    md += `|-----|-----|-----|\n`;
    md += `| ${sections.market.size.tam} | ${sections.market.size.sam} | ${sections.market.size.som} |\n\n`;

    md += `### 주요 트렌드\n\n`;
    sections.market.trends.forEach((trend) => {
      md += `- ${trend}\n`;
    });
    md += `\n`;

    md += `### 기회 (Opportunities)\n\n`;
    sections.market.opportunities.forEach((opp) => {
      md += `- ✅ ${opp}\n`;
    });
    md += `\n`;

    md += `### 위협 (Threats)\n\n`;
    sections.market.threats.forEach((threat) => {
      md += `- ⚠️ ${threat}\n`;
    });
    md += `\n---\n\n`;

    // 경쟁사 분석
    md += `## 🏢 경쟁사 분석\n\n`;
    sections.competitors.direct.forEach((comp) => {
      md += `### ${comp.name}`;
      if (comp.marketShare) {
        md += ` (${comp.marketShare})`;
      }
      md += `\n\n`;
      md += `${comp.description}\n\n`;
      md += `**강점 (Strengths):**\n\n`;
      comp.strengths.forEach((s) => {
        md += `- ${s}\n`;
      });
      md += `\n**약점 (Weaknesses):**\n\n`;
      comp.weaknesses.forEach((w) => {
        md += `- ${w}\n`;
      });
      md += `\n`;
    });

    md += `### 🎯 우리의 경쟁 우위\n\n`;
    sections.competitors.competitiveAdvantages.forEach((adv) => {
      md += `- ✅ ${adv}\n`;
    });
    md += `\n---\n\n`;

    // 수익화 모델
    md += `## 💰 수익화 모델\n\n`;
    md += `### 수익원 (Revenue Streams)\n\n`;
    sections.monetization.revenueStreams.forEach((stream) => {
      md += `#### ${stream.name}\n\n`;
      md += `${stream.description}\n\n`;
      md += `**예상 수익:** ${stream.estimatedRevenue}\n\n`;
    });

    md += `### 가격 정책 (Pricing)\n\n`;
    md += `**모델:** ${sections.monetization.pricingStrategy.model}\n\n`;
    sections.monetization.pricingStrategy.tiers.forEach((tier) => {
      md += `#### ${tier.name} - ${tier.price}\n\n`;
      tier.features.forEach((feature) => {
        md += `- ${feature}\n`;
      });
      md += `\n`;
    });

    md += `### 매출 예측 (3 Year Projection)\n\n`;
    md += `| 년차 | 예상 매출 | 가정 |\n`;
    md += `|------|----------|------|\n`;
    sections.monetization.revenueProjection.forEach((proj) => {
      md += `| ${proj.year}년차 | ${proj.revenue} | ${proj.assumptions.join(', ')} |\n`;
    });
    md += `\n---\n\n`;

    // 사업 구조
    md += `## 🏗️ 운영 및 개발 계획\n\n`;
    md += `### 핵심 팀 구성\n\n`;
    sections.structure.team.forEach((member) => {
      md += `#### ${member.role}\n\n`;
      md += `**스킬:** ${member.skills.join(', ')}\n\n`;
    });

    md += `### MVP 기능 정의\n\n`;
    sections.development.mvpFeatures.forEach((feature) => {
      md += `#### ${feature.feature} [${feature.priority.toUpperCase()}]\n\n`;
      md += `${feature.description}\n\n`;
    });

    md += `---\n\n`;
    md += `*이 리포트는 AI 스타트업 플랫폼에서 자동 생성되었습니다.*\n`;

    return md;
  }

  /**
   * 배열 데이터를 CSV 문자열로 변환
   */
  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // 헤더 추출
    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';

    // 데이터 행 추가
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // CSV 이스케이프 처리
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * 시장 분석 데이터를 CSV로 내보내기
   */
  static exportMarketAnalysisCSV(report: BusinessReport): void {
    const marketData = [
      { Type: 'TAM', Value: report.sections.market.size.tam },
      { Type: 'SAM', Value: report.sections.market.size.sam },
      { Type: 'SOM', Value: report.sections.market.size.som },
    ];
    
    const filename = `market-analysis-${report.id}-${Date.now()}.csv`;
    this.exportCSV(marketData, filename);
  }

  /**
   * 경쟁사 데이터를 CSV로 내보내기
   */
  static exportCompetitorsCSV(report: BusinessReport): void {
    const competitorData = report.sections.competitors.direct.map((comp) => ({
      Name: comp.name,
      Description: comp.description,
      MarketShare: comp.marketShare || 'N/A',
      Strengths: comp.strengths.join('; '),
      Weaknesses: comp.weaknesses.join('; '),
      Pricing: comp.pricing || 'N/A',
    }));
    
    const filename = `competitors-${report.id}-${Date.now()}.csv`;
    this.exportCSV(competitorData, filename);
  }

  /**
   * 수익 예측을 CSV로 내보내기
   */
  static exportRevenueProjectionCSV(report: BusinessReport): void {
    const revenueData = report.sections.monetization.revenueProjection.map((proj) => ({
      Year: `${proj.year}년차`,
      Revenue: proj.revenue,
      Assumptions: proj.assumptions.join('; '),
    }));
    
    const filename = `revenue-projection-${report.id}-${Date.now()}.csv`;
    this.exportCSV(revenueData, filename);
  }

  /**
   * 텍스트 포맷으로 내보내기 (간단한 텍스트 파일)
   */
  static exportText(report: BusinessReport): void {
    const { sections } = report;
    let text = '';

    text += `${sections.overview.title}\n`;
    text += `${'='.repeat(sections.overview.title.length)}\n\n`;
    text += `${sections.overview.tagline}\n\n`;
    text += `생성일: ${new Date(report.generatedAt).toLocaleDateString('ko-KR')}\n`;
    text += `티어: ${report.tier.toUpperCase()}\n\n`;
    text += `${'='.repeat(50)}\n\n`;

    text += `사업 개요\n`;
    text += `${'-'.repeat(50)}\n`;
    text += `${sections.overview.description}\n\n`;
    text += `Vision: ${sections.overview.vision}\n`;
    text += `Mission: ${sections.overview.mission}\n\n`;

    text += `시장 분석\n`;
    text += `${'-'.repeat(50)}\n`;
    text += `TAM: ${sections.market.size.tam}\n`;
    text += `SAM: ${sections.market.size.sam}\n`;
    text += `SOM: ${sections.market.size.som}\n\n`;

    text += `주요 트렌드:\n`;
    sections.market.trends.forEach((trend, idx) => {
      text += `${idx + 1}. ${trend}\n`;
    });
    text += `\n`;

    // 나머지 섹션들도 유사하게 추가...
    text += `\n${'='.repeat(50)}\n`;
    text += `이 리포트는 AI 스타트업 플랫폼에서 자동 생성되었습니다.\n`;

    const filename = `business-report-${report.id}-${Date.now()}.txt`;
    this.downloadFile(text, filename, 'text/plain');
  }
}
