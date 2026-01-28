'use client';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  total: number;
}

export default function PieChart({ data, total }: PieChartProps) {
  // Calculate percentages and angles
  let cumulativePercent = 0;
  const segments = data.map((item) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...item,
      percent,
      startPercent,
    };
  });

  // Create conic gradient
  const gradient = segments
    .map((seg) => `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`)
    .join(', ');

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Issues by Severity</h3>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="relative">
          <div
            className="w-40 h-40 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          >
            {/* Center hole for donut effect */}
            <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-white">{total}</span>
                <p className="text-xs text-slate-400">TOTAL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
              <span className="text-sm text-slate-400">{Math.round(item.percent)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
