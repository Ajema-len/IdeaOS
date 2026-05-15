import { cn } from "@/lib/utils";

type Props = {
  value: number;
};

export function ComplexityMeter({ value }: Props) {
  const normalized = Math.min(10, Math.max(0, value));
  const color = normalized <= 3 ? "bg-emerald-500" : normalized <= 6 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Complexity</span>
        <span>{normalized}/10</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${normalized * 10}%` }} />
      </div>
    </div>
  );
}
