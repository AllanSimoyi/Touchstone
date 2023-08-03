import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Props = {
  items: {
    key: string;
    value: number;
  }[];
};
export function CustomBarChart(props: Props) {
  const { items } = props;

  return (
    <div className="flex flex-col items-stretch overflow-x-auto py-4">
      <ResponsiveContainer width="90%" height={250}>
        <BarChart data={items} className="p-0">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="key"
            stroke="#888888"
            fontSize={12}
            tickLine={true}
            axisLine={true}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={true}
            axisLine={true}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-md border border-zinc-50 bg-white/50 px-6 py-2 shadow-lg backdrop-blur-lg">
                    <span className="label">
                      {label} has {payload[0]?.value ?? '0'} accounts
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            fill="#8884d8"
            barSize={20}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
