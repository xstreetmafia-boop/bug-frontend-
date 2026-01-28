'use client';

interface BarChartProps {
  data: {
    day: string;
    found: number;
    resolved: number;
  }[];
}

export default function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.found, d.resolved]));
  const scale = (value: number) => (value / maxValue) * 100;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Bugs Found vs Resolved</h3>
          <p className="text-slate-400 text-sm">Comparison over last 7 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-slate-400">Found</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-slate-400">Resolved</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 h-48">
        {data.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-end gap-1 h-40 w-full justify-center">
              <div
                className="w-5 bg-red-500 rounded-t transition-all"
                style={{ height: `${scale(item.found)}%` }}
              ></div>
              <div
                className="w-5 bg-blue-500 rounded-t transition-all"
                style={{ height: `${scale(item.resolved)}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
