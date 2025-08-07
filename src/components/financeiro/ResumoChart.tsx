import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface Metric {
  date: string;
  atendimentos: number;
  produtos: number;
  faturamento_total: number;
  lucro_liquido: number;
}

interface ResumoChartProps {
  data: Metric[];
  metricKey: 'atendimentos' | 'produtos' | 'faturamento_total' | 'lucro_liquido';
  isMobile: boolean;
}

const metricConfig = {
  atendimentos: { name: 'Atendimentos', color: '#3b82f6' },
  produtos: { name: 'Produtos', color: '#16a34a' },
  faturamento_total: { name: 'Faturamento', color: '#f97316' },
  lucro_liquido: { name: 'Lucro Líquido', color: '#8b5cf6' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const key = payload[0].dataKey;
    const name = metricConfig[key as keyof typeof metricConfig].name;
    const isCurrency = key === 'faturamento_total' || key === 'lucro_liquido';

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].color }}>
          {`${name}: ${isCurrency ? `R$ ${value.toFixed(2)}` : value}`}
        </p>
      </div>
    );
  }

  return null;
};

export default function ResumoChart({ data, metricKey, isMobile }: ResumoChartProps) {
  const config = metricConfig[metricKey];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4" style={{ height: isMobile ? 250 : 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: isMobile ? 20 : 30,
            left: isMobile ? -20 : -10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#6b7280' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => (metricKey === 'faturamento_total' || metricKey === 'lucro_liquido' ? `R$${value / 1000}k` : value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id={`color${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.6}/>
              <stop offset="95%" stopColor={config.color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={metricKey}
            stroke={config.color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color${metricKey})`}
            dot={{ r: 4, fill: config.color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: config.color, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 