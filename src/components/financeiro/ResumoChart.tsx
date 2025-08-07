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

interface DailyEvolutionData {
  date: string;
  services_revenue: number;
  services_profit: number;
  services_count: number;
  products_revenue: number;
  products_profit: number;
  products_items_sold: number;
}

interface ResumoChartProps {
  data: DailyEvolutionData[];
  metricKey: 'services_revenue' | 'services_profit' | 'services_count' | 'products_revenue' | 'products_profit' | 'products_items_sold';
  isMobile: boolean;
}

const metricConfig = {
  services_revenue: { name: 'Faturamento de Serviços', color: '#3b82f6' }, // Azul
  services_profit: { name: 'Lucro de Serviços', color: '#8b5cf6' }, // Roxo
  services_count: { name: 'Nº de Atendimentos', color: '#16a34a' }, // Verde
  products_revenue: { name: 'Faturamento de Produtos', color: '#3b82f6' }, // Azul (mesmo que serviços)
  products_profit: { name: 'Lucro de Produtos', color: '#8b5cf6' }, // Roxo (mesmo que serviços)
  products_items_sold: { name: 'Itens Vendidos', color: '#16a34a' }, // Verde (mesmo que serviços)
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const key = payload[0].dataKey;
    const name = metricConfig[key as keyof typeof metricConfig].name;
    const isCurrency = key === 'services_revenue' || key === 'services_profit' || key === 'products_revenue' || key === 'products_profit';

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

  // Função para formatar valores do eixo Y de forma mais legível
  const formatYAxisValue = (value: number) => {
    const isCurrency = metricKey === 'services_revenue' || metricKey === 'services_profit' || metricKey === 'products_revenue' || metricKey === 'products_profit';
    
    if (isCurrency) {
      if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(1)}k`;
      } else {
        return `R$ ${value.toFixed(0)}`;
      }
    }
    return value.toString();
  };

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
            tickFormatter={formatYAxisValue}
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