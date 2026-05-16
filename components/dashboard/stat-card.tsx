import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  change?: number;
  subtext?: string;
};

export function StatCard({ label, value, change, subtext }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change !== undefined ? (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        ) : null}
      </div>
      {subtext ? <p className="mt-3 text-xs text-gray-500">{subtext}</p> : null}
    </div>
  );
}
