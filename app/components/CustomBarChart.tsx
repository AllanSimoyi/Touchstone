import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// const data = [
//   {
//     name: 'Jan',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Feb',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Mar',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Apr',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'May',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Jun',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Jul',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Aug',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Sep',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Oct',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Nov',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
//   {
//     name: 'Dec',
//     total: Math.floor(Math.random() * 5000) + 1000,
//   },
// ];

type Props = {
  items: {
    key: string;
    value: number;
  }[];
};
export function CustomBarChart(props: Props) {
  const { items } = props;

  return (
    <div className="flex flex-col items-stretch py-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="key"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
