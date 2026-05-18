"use client";

import { useIdeas } from "@/hooks/use-ideas";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { IdeaStatus } from "@prisma/client";

const statusColors: Record<IdeaStatus, { border: string; label: string; bg: string }> = {
  ACTIVE: { border: "border-l-4 border-l-blue-600", label: "Active", bg: "bg-blue-50" },
  PAUSED: { border: "border-l-4 border-l-amber-600", label: "Paused", bg: "bg-amber-50" },
  BACKLOG: { border: "border-l-4 border-l-gray-400", label: "Backlog", bg: "bg-gray-50" },
  SHIPPED: { border: "border-l-4 border-l-green-600", label: "Shipped", bg: "bg-green-50" },
  ABANDONED: { border: "border-l-4 border-l-red-600", label: "Abandoned", bg: "bg-red-50" },
};

export default function GraphPage() {
  const { data, isLoading } = useIdeas({ limit: 1000 });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((idea: any) =>
      idea.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const grouped = useMemo(() => {
    const groups = {
      ACTIVE: [] as any[],
      PAUSED: [] as any[],
      BACKLOG: [] as any[],
      SHIPPED: [] as any[],
      ABANDONED: [] as any[],
    };
    filtered.forEach((idea: any) => {
      if (groups[idea.status as IdeaStatus]) {
        groups[idea.status as IdeaStatus].push(idea);
      }
    });
    return groups;
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Big picture</h1>
        <p className="mt-2 text-gray-600">See all your ideas at a glance. React Flow graph visualization coming in Phase 4.</p>
      </div>

      <div>
        <Input
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Active Ideas */}
      {grouped.ACTIVE.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active ({grouped.ACTIVE.length})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {grouped.ACTIVE.map((idea: any) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Ideas */}
      {grouped.PAUSED.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Paused ({grouped.PAUSED.length})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {grouped.PAUSED.map((idea: any) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {/* Backlog Ideas */}
      {grouped.BACKLOG.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Backlog ({grouped.BACKLOG.length})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {grouped.BACKLOG.map((idea: any) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {/* Shipped Ideas */}
      {grouped.SHIPPED.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipped ({grouped.SHIPPED.length})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {grouped.SHIPPED.map((idea: any) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {/* Abandoned Ideas */}
      {grouped.ABANDONED.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Abandoned ({grouped.ABANDONED.length})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {grouped.ABANDONED.map((idea: any) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No ideas found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea }: { idea: any }) {
  const statusInfo = statusColors[idea.status as IdeaStatus];
  const done = idea.milestones?.filter((m: any) => m.status === "DONE").length ?? 0;
  const total = idea.milestones?.length ?? 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className={`rounded-2xl border border-gray-200 ${statusInfo.bg} ${statusInfo.border} p-4 hover:border-gray-300 transition-colors cursor-pointer h-full`}>
        <h3 className="font-semibold text-gray-900 line-clamp-2">{idea.title}</h3>

        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {idea.category}
          </Badge>
        </div>

        {idea.tags && idea.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Momentum</span>
            <span className="font-semibold">{Math.round(idea.momentumScore)}</span>
          </div>
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${Math.min(idea.momentumScore, 100)}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
            <span>{idea.totalTimeHours.toFixed(1)}h invested</span>
            <span>{idea._count?.sessions ?? 0} sessions</span>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Milestones</span>
              <span>{done}/{total}</span>
            </div>
          )}
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
