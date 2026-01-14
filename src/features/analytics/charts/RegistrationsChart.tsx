import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface RegistrationsDatum {
  month: string;
  registrations: number;
}

interface Props {
  data: RegistrationsDatum[];
  isLoading?: boolean;
  isError?: boolean;
}

export const RegistrationsChart: React.FC<Props> = ({ data, isLoading, isError }) => {
  if (isLoading) return <div style={{ height: 280 }}>Loading…</div>;
  if (isError) return <div style={{ height: 280 }}>Couldn’t load registrations.</div>;

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-muted-fg)', fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={{ stroke: 'var(--color-border)' }}
          />

          <YAxis
            tick={{ fill: 'var(--color-muted-fg)', fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={{ stroke: 'var(--color-border)' }}
            width={36}
          />

          <Tooltip
            cursor={false}
            contentStyle={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontWeight: 700,
              color: 'var(--color-muted-fg)',
            }}
            labelStyle={{ color: 'var(--color-muted-fg)', fontWeight: 800 }}
            itemStyle={{ color: 'var(--color-primary)', fontWeight: 800 }}
          />

          <Line
            type="monotone"
            dataKey="registrations"
            stroke="var(--color-primary)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
