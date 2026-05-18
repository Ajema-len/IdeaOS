"use client";

import { useIdeas } from "@/hooks/use-ideas";
import { useState, useMemo } from "react";
import Link from "next/link";
import ReactFlow, { MiniMap, Controls, Background, MarkerType } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { IdeaStatus } from "@prisma/client";
import "reactflow/dist/style.css";

const statusColumns: IdeaStatus[] = ["ACTIVE", "PAUSED", "BACKLOG", "SHIPPED", "ABANDONED"];
const statusColors: Record<IdeaStatus, { border: string; label: string; bg: string; color: string }> = {
  ACTIVE: { border: "border-l-4 border-l-blue-600", label: "Active", bg: "bg-blue-50", color: "#2563eb" },
  PAUSED: { border: "border-l-4 border-l-amber-600", label: "Paused", bg: "bg-amber-50", color: "#f59e0b" },
  BACKLOG: { border: "border-l-4 border-l-gray-400", label: "Backlog", bg: "bg-gray-50", color: "#6b7280" },
  SHIPPED: { border: "border-l-4 border-l-green-600", label: "Shipped", bg: "bg-green-50", color: "#16a34a" },
  ABANDONED: { border: "border-l-4 border-l-red-600", label: "Abandoned", bg: "bg-red-50", color: "#dc2626" },
};

function buildGraph(ideas: any[]) {
  const nodes = ideas.map((idea, index) => {
    const column = statusColumns.indexOf(idea.status as IdeaStatus);
    const row = Math.floor(index / 5);
    return {
      id: idea.id,
      position: { x: column * 320 + 40, y: row * 160 + 40 },
      data: {
        label: (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-900">{idea.title}</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-[10px]">
                {idea.category}
              </Badge>
              {idea.tags?.slice(0, 2).map((tag: string) => (
                <span key={tag} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ),
      },
      style: {
        width: 260,
        border: `2px solid ${statusColors[idea.status as IdeaStatus].color}`,
        borderRadius: 24,
        background: "white",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
      },
    };
  });

  const tagMap: Record<string, string[]> = {};
  ideas.forEach((idea) => {
    (idea.tags || []).forEach((tag: string) => {
      tagMap[tag] = tagMap[tag] || [];
      tagMap[tag].push(idea.id);
    });
  });

  const edges = Object.values(tagMap).flatMap((ideaIds) => {
    if (ideaIds.length < 2) return [];
    return ideaIds.slice(1).map((targetId, index) => ({
      id: `edge-${ideaIds[0]}-${targetId}-${index}`,
      source: ideaIds[0],
      target: targetId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 8,
        height: 6,
      },
      style: { stroke: "#9ca3af", strokeWidth: 1.2 },
      animated: false,
    }));
  });

  return { nodes, edges };
}

export default function GraphPage() {
  const { data, isLoading } = useIdeas({ limit: 1000 });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((idea: any) =>
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const graph = useMemo(() => buildGraph(filtered), [filtered]);

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
        <p className="mt-2 text-gray-600">Visualize your idea portfolio as a graph of status groups and related tags.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {statusColumns.map((status) => (
            <span key={status} className="rounded-full border px-3 py-1">
              {status}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4">
        {filtered.length === 0 ? (
          <div className="min-h-[320px] flex items-center justify-center text-gray-500">
            No ideas found. Create one to see your portfolio graph.
          </div>
        ) : (
          <div className="h-[760px]">
            <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView attributionPosition="bottom-left">
              <MiniMap
                nodeStrokeColor={(n) => {
                  const status = filtered.find((idea: any) => idea.id === n.id)?.status as IdeaStatus;
                  return statusColors[status]?.color ?? "#888";
                }}
                nodeColor={(n) => {
                  const status = filtered.find((idea: any) => idea.id === n.id)?.status as IdeaStatus;
                  return statusColors[status]?.color ?? "#aaa";
                }}
              />
              <Controls />
              <Background color="#f3f4f6" gap={16} />
            </ReactFlow>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {statusColumns.map((status) => {
          const ideasByStatus = filtered.filter((idea: any) => idea.status === status);
          if (ideasByStatus.length === 0) return null;
          return (
            <div key={status} className="rounded-3xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">{statusColors[status].label} ideas ({ideasByStatus.length})</h2>
              <div className="mt-4 space-y-3">
                {ideasByStatus.map((idea: any) => (
                  <IdeaSummary key={idea.id} idea={idea} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IdeaSummary({ idea }: { idea: any }) {
  return (
    <Link href={`/ideas/${idea.id}`} className="block rounded-2xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium text-gray-900">{idea.title}</p>
        <span className="text-xs text-gray-500">{idea.momentumScore.toFixed(0)}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{idea.description || "No description"}</p>
    </Link>
  );
}
