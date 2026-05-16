"use client";

import { useState } from "react";
import { useIdeas } from "@/hooks/use-ideas";
import { IdeaCard } from "@/components/ideas/idea-card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const { data, isLoading } = useIdeas({
    search: search || undefined,
    status: status || undefined,
    page: 1,
    limit: 50,
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your ideas</h1>
        <p className="mt-2 text-gray-600">Explore all your ideas and track progress.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-3">
        <Input label="Search ideas" placeholder="Find by title or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="BACKLOG">Backlog</option>
          <option value="SHIPPED">Shipped</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">No ideas found. Create your first idea!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
