'use client';

import { AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// 숫자에서 요약 추출 (예: "50조원" -> "50조")
function extractAmount(str: string): string {
  const m = str.match(/([\d.]+)\s*(조|억|만|billion|million|B|M)/i);
  return m ? `${m[1]}${m[2]}` : '';
}

// 시장 규모 차트 (TAM/SAM/SOM) - 트렌디한 중첩 사각형 다이어그램
interface MarketSizeData {
  tam: string;
  sam: string;
  som: string;
}

export function MarketSizeChart({ tam, sam, som }: MarketSizeData) {
  return (
    <div className="w-full">
      <div className="relative w-full max-w-[420px] mx-auto aspect-[2/1] flex items-center justify-center">
        {/* TAM - 외곽 */}
        <div className="group/tam absolute inset-0 rounded-2xl border border-foreground/20 bg-foreground/[0.02] flex items-center justify-center cursor-default transition-all duration-300 hover:bg-foreground/[0.04] hover:border-foreground/30">
          <span className="absolute top-2 left-3 text-[10px] font-semibold text-foreground/80 tracking-wide">
            TAM: {extractAmount(tam) || tam}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-lg bg-background/95 backdrop-blur-sm border border-foreground/10 text-[11px] text-foreground/85 leading-relaxed max-w-[260px] opacity-0 invisible group-hover/tam:opacity-100 group-hover/tam:visible transition-all duration-200 z-20 pointer-events-none shadow-lg">
            {tam}
          </div>
        </div>
        {/* SAM - 중간 */}
        <div className="group/sam absolute inset-y-[16%] inset-x-[13%] rounded-xl border border-foreground/30 bg-foreground/[0.04] flex items-center justify-center cursor-default transition-all duration-300 hover:bg-foreground/[0.06] hover:border-foreground/40">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground/80 tracking-wide">
            SAM: {extractAmount(sam) || sam}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-lg bg-background/95 backdrop-blur-sm border border-foreground/10 text-[11px] text-foreground/85 leading-relaxed max-w-[260px] opacity-0 invisible group-hover/sam:opacity-100 group-hover/sam:visible transition-all duration-200 z-20 pointer-events-none shadow-lg">
            {sam}
          </div>
        </div>
        {/* SOM - 내부 */}
        <div className="group/som absolute inset-y-[34%] inset-x-[26%] rounded-lg border border-foreground/40 bg-foreground/[0.08] flex items-center justify-center cursor-default transition-all duration-300 hover:bg-foreground/[0.12] hover:border-foreground/50">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold text-foreground/90 tracking-wide">
            SOM: {extractAmount(som) || som}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 rounded-lg bg-background/95 backdrop-blur-sm border border-foreground/10 text-[11px] text-foreground/85 leading-relaxed max-w-[260px] opacity-0 invisible group-hover/som:opacity-100 group-hover/som:visible transition-all duration-200 z-20 pointer-events-none shadow-lg">
            {som}
          </div>
        </div>
      </div>
    </div>
  );
}

// 수익 예측 차트 (3년) - 트렌디한 그라데이션 영역 차트
interface RevenueProjection {
  year: number;
  revenue: string;
}

function parseKoreanNumber(str: string): number {
  const cleanStr = str.replace(/\s+/g, '').toLowerCase();
  if (cleanStr.includes('조')) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    return num * 1000000000000;
  }
  if (cleanStr.includes('억')) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    return num * 100000000;
  }
  if (cleanStr.includes('만')) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    return num * 10000;
  }
  if (cleanStr.includes('billion') || cleanStr.includes('b')) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    return num * 1000000000;
  }
  if (cleanStr.includes('million') || cleanStr.includes('m')) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
    return num * 1000000;
  }
  return parseFloat(cleanStr.replace(/[^0-9.]/g, '')) || 0;
}

export function RevenueProjectionChart({ data }: { data: RevenueProjection[] }) {
  const chartData = data.map(item => ({
    year: `${item.year}년차`,
    revenue: parseKoreanNumber(item.revenue),
    displayRevenue: item.revenue,
  }));

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickFormatter={(v) => v >= 1000000000000 ? `${(v / 1000000000000).toFixed(0)}조` : v >= 100000000 ? `${(v / 100000000).toFixed(0)}억` : v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background) / 0.98)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '8px 12px',
            }}
            formatter={(value: unknown, _name: unknown, props: { payload?: { displayRevenue: string } }) => [String(props.payload?.displayRevenue ?? value), '예상 매출']}
            cursor={{ stroke: 'hsl(var(--foreground) / 0.2)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--foreground) / 0.85)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            dot={{ fill: 'hsl(var(--background))', stroke: 'hsl(var(--foreground) / 0.85)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2, fill: 'hsl(var(--background))', stroke: 'hsl(var(--foreground))' }}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 경쟁 포지셔닝 맵 - 트렌디한 미니멀 스타일
interface CompetitorPosition {
  name: string;
  x: number;
  y: number;
}

interface PositioningData {
  competitors: CompetitorPosition[];
  ourPosition: CompetitorPosition;
  xAxisLabel: string;
  yAxisLabel: string;
}

export function CompetitorPositioningMap({ competitors, ourPosition, xAxisLabel, yAxisLabel }: PositioningData) {
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 24, right: 24, left: 24, bottom: 32 }}>
          <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} horizontal={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -8, fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 10]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--foreground) / 0.15)', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: 'hsl(var(--background) / 0.98)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '8px 12px',
            }}
            formatter={(value: unknown, name?: string) => [String(value), (name === 'x' ? xAxisLabel : name === 'y' ? yAxisLabel : name) ?? '']}
            labelFormatter={(_label: unknown, payload: readonly { payload?: { name?: string } }[]) => (payload?.[0] as { payload?: { name?: string } })?.payload?.name ?? ''}
          />
          <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <Scatter
            name="경쟁사"
            data={competitors}
            fill="hsl(var(--foreground) / 0.5)"
            shape="circle"
          />
          <Scatter
            name="우리"
            data={[ourPosition]}
            fill="hsl(var(--foreground))"
            shape="diamond"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// 가격 비교 차트 - 트렌디한 호리즌탈 바
interface PricingComparison {
  competitor: string;
  price: string;
}

export function PricingComparisonChart({ data }: { data: PricingComparison[] }) {
  const parsePrice = (priceStr: string): number => {
    const cleanStr = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleanStr) || 0;
  };

  const chartData = data.map(item => ({
    name: item.competitor,
    price: parsePrice(item.price),
    displayPrice: item.price,
  }));

  const maxPrice = Math.max(...chartData.map(d => d.price), 1);

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="0" stroke="hsl(var(--border))" strokeOpacity={0.4} horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background) / 0.98)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '8px 12px',
            }}
            formatter={(value: unknown, _name: unknown, props: { payload?: { displayPrice: string } }) => [String(props.payload?.displayPrice ?? value), '가격']}
          />
          <Bar dataKey="price" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={`hsl(var(--foreground) / ${0.3 + (entry.price / maxPrice) * 0.5})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
