import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IdeaListItem } from "@/types/idea";
import { IdeaStatusBadge } from "@/components/ideas/idea-status-badge";

type Props = {
  idea: IdeaListItem;
};

export function IdeaCard({ idea }: Props) {
  const progress = idea.milestones.length > 0 ? Math.round((idea.milestones.filter((m) => m.status === "DONE").length / idea.milestones.length) * 100) : 0;

  return (
    <Link href={`/ideas/${idea.id}`} className="block rounded-3xl border border-gray-200 bg-white p-5 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{idea.description || "No description yet."}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={idea.isPinned ? "info" : "secondary"}>{idea.category.toLowerCase().replace(/_/g, " ")}</Badge>
          <IdeaStatusBadge status={idea.status} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Momentum {Math.round(idea.momentumScore)}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full transition-all", progress > 66 ? "bg-emerald-500" : progress > 33 ? "bg-amber-500" : "bg-blue-500")} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span>{formatRelativeTime(idea.lastWorkedAt ?? idea.createdAt)}</span>
          <span>{idea._count.sessions} sessions</span>
        </div>
      </div>
    </Link>
  );
}
