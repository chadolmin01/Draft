import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { BusinessReport } from './types';

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #3b82f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  tagline: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 8,
  },
  metadata: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 10,
  },
  section: {
    marginTop: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0f172a',
    paddingBottom: 6,
    borderBottom: '1 solid #e2e8f0',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#334155',
  },
  text: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 1.6,
  },
  listItem: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 6,
    paddingLeft: 15,
    lineHeight: 1.5,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    border: '1 solid #e2e8f0',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e293b',
  },
  cardText: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 4,
  },
  gridLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  badge: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    padding: '4 8',
    borderRadius: 3,
    textTransform: 'uppercase',
  },
  competitorCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 12,
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  competitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  competitorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  competitorDesc: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 8,
  },
  strengthWeakness: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  strengthTitle: {
    color: '#16a34a',
  },
  weaknessTitle: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
});

interface PDFReportProps {
  report: BusinessReport;
}

export const PDFReport: React.FC<PDFReportProps> = ({ report }) => {
  return (
    <Document>
      {/* 페이지 1: 개요 */}
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.sections.overview.title}</Text>
          <Text style={styles.tagline}>{report.sections.overview.tagline}</Text>
          <Text style={styles.metadata}>
            Generated: {new Date(report.generatedAt).toLocaleDateString('ko-KR')} | Tier: {report.tier.toUpperCase()}
          </Text>
        </View>

        {/* 사업 개요 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 사업 개요</Text>
          <Text style={styles.text}>{report.sections.overview.description}</Text>
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Vision</Text>
              <Text style={styles.cardText}>{report.sections.overview.vision}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Mission</Text>
              <Text style={styles.cardText}>{report.sections.overview.mission}</Text>
            </View>
          </View>
        </View>

        {/* 시장 분석 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 시장 분석</Text>
          
          <Text style={styles.subsectionTitle}>시장 규모 (TAM-SAM-SOM)</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>TAM</Text>
              <Text style={styles.gridValue}>{report.sections.market.size.tam}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>SAM</Text>
              <Text style={styles.gridValue}>{report.sections.market.size.sam}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>SOM</Text>
              <Text style={styles.gridValue}>{report.sections.market.size.som}</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>주요 트렌드</Text>
          {report.sections.market.trends.map((trend, idx) => (
            <Text key={idx} style={styles.listItem}>• {trend}</Text>
          ))}

          <Text style={styles.subsectionTitle}>기회 (Opportunities)</Text>
          {report.sections.market.opportunities.map((opp, idx) => (
            <Text key={idx} style={styles.listItem}>✓ {opp}</Text>
          ))}

          <Text style={styles.subsectionTitle}>위협 (Threats)</Text>
          {report.sections.market.threats.map((threat, idx) => (
            <Text key={idx} style={styles.listItem}>! {threat}</Text>
          ))}
        </View>

        <Text style={styles.footer}>Page 1 of 3 | {report.sections.overview.title}</Text>
      </Page>

      {/* 페이지 2: 경쟁사 & 수익화 */}
      <Page size="A4" style={styles.page}>
        {/* 경쟁사 분석 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 경쟁사 분석</Text>
          
          {report.sections.competitors.direct.map((comp, idx) => (
            <View key={idx} style={styles.competitorCard}>
              <View style={styles.competitorHeader}>
                <Text style={styles.competitorName}>{comp.name}</Text>
                {comp.marketShare && (
                  <Text style={styles.badge}>{comp.marketShare}</Text>
                )}
              </View>
              <Text style={styles.competitorDesc}>{comp.description}</Text>
              
              <View style={styles.strengthWeakness}>
                <View style={styles.column}>
                  <Text style={[styles.columnTitle, styles.strengthTitle]}>Strengths</Text>
                  {comp.strengths.map((s, i) => (
                    <Text key={i} style={styles.cardText}>• {s}</Text>
                  ))}
                </View>
                <View style={styles.column}>
                  <Text style={[styles.columnTitle, styles.weaknessTitle]}>Weaknesses</Text>
                  {comp.weaknesses.map((w, i) => (
                    <Text key={i} style={styles.cardText}>• {w}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>🎯 우리의 경쟁 우위</Text>
          {report.sections.competitors.competitiveAdvantages.map((adv, idx) => (
            <Text key={idx} style={styles.listItem}>✓ {adv}</Text>
          ))}
        </View>

        {/* 수익화 모델 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 수익화 모델</Text>
          
          <Text style={styles.subsectionTitle}>수익원 (Revenue Streams)</Text>
          {report.sections.monetization.revenueStreams.map((stream, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardTitle}>{stream.name}</Text>
              <Text style={styles.cardText}>{stream.description}</Text>
              <Text style={[styles.cardText, { color: '#3b82f6', fontWeight: 'bold' }]}>
                Est. {stream.estimatedRevenue}
              </Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>가격 정책 (Pricing)</Text>
          {report.sections.monetization.pricingStrategy.tiers.map((tier, idx) => (
            <View key={idx} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.cardTitle}>{tier.name}</Text>
                <Text style={[styles.cardTitle, { color: '#3b82f6' }]}>{tier.price}</Text>
              </View>
              {tier.features.map((feature, i) => (
                <Text key={i} style={styles.cardText}>✓ {feature}</Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Page 2 of 3 | {report.sections.overview.title}</Text>
      </Page>

      {/* 페이지 3: 구조 & 개발 */}
      <Page size="A4" style={styles.page}>
        {/* 매출 예측 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 매출 예측 (3 Year Projection)</Text>
          {report.sections.monetization.revenueProjection.map((proj, idx) => (
            <View key={idx} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{proj.year}년차</Text>
                  <Text style={styles.cardText}>{proj.assumptions.join(', ')}</Text>
                </View>
                <Text style={[styles.cardTitle, { fontSize: 16, color: '#3b82f6' }]}>{proj.revenue}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 사업 구조 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏗️ 운영 및 개발 계획</Text>
          
          <Text style={styles.subsectionTitle}>핵심 팀 구성</Text>
          {report.sections.structure.team.map((member, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardTitle}>{member.role}</Text>
              <Text style={styles.cardText}>{member.skills.join(', ')}</Text>
            </View>
          ))}

          <Text style={styles.subsectionTitle}>MVP 기능 정의</Text>
          {report.sections.development.mvpFeatures.map((feature, idx) => (
            <View key={idx} style={styles.card}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <Text style={[
                  styles.badge,
                  { backgroundColor: feature.priority === 'must-have' ? '#dc2626' : '#eab308' }
                ]}>
                  {feature.priority}
                </Text>
                <Text style={styles.cardTitle}>{feature.feature}</Text>
              </View>
              <Text style={styles.cardText}>{feature.description}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Page 3 of 3 | {report.sections.overview.title}</Text>
      </Page>
    </Document>
  );
};

// PDF 생성 및 다운로드 함수
export async function downloadReportPDF(report: BusinessReport) {
  // 동적 import로 번들 크기 최적화
  const { pdf } = await import('@react-pdf/renderer');
  
  const blob = await pdf(<PDFReport report={report} />).toBlob();
  
  // 다운로드
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `business-report-${report.id}-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
