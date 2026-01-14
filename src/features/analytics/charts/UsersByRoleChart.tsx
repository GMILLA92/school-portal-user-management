import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface UsersByRoleDatum {
  role: string;
  count: number;
}

interface Props {
  data: UsersByRoleDatum[];
  isLoading?: boolean;
  isError?: boolean;
}

export const UsersByRoleChart: React.FC<Props> = ({ data, isLoading, isError }) => {
  if (isLoading) return <div style={{ height: 280 }}>Loading…</div>;
  if (isError) return <div style={{ height: 280 }}>Couldn’t load users by role.</div>;

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />

          <XAxis
            dataKey="role"
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

          <Bar
            dataKey="count"
            fill="var(--color-primary)"
            radius={[10, 10, 0, 0]}
            activeBar={{ opacity: 0.9 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
