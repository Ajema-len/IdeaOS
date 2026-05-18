"use client";

import { useMemo, useState } from "react";
import { MilestoneItem } from "@/components/milestones/milestone-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Milestone } from "@prisma/client";

type Props = {
  ideaId: string;
  milestones: Milestone[];
  ideaCreatedAt?: string | null;
  onToggleDone: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  onAddMilestone?: (title: string, ideaId: string) => void;
};

export function MilestoneList({ ideaId, milestones, ideaCreatedAt, onToggleDone, onDelete, onAddMilestone }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const sorted = useMemo(() => [...milestones].sort((a, b) => a.orderIndex - b.orderIndex), [milestones]);
  const doneCount = sorted.filter((m) => m.status === "DONE").length;
  const progress = sorted.length > 0 ? Math.round((doneCount / sorted.length) * 100) : 0;
  const showLoadingSkeleton =
    sorted.length === 0 && ideaCreatedAt && new Date().getTime() - new Date(ideaCreatedAt).getTime() < 30000;

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    if (onAddMilestone) {
      onAddMilestone(newTitle, ideaId);
    } else {
      await fetch(`/api/ideas/${ideaId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    }
    setNewTitle("");
    setShowAddForm(false);
  };

  if (showLoadingSkeleton) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
        <p className="text-xs text-gray-400 mt-2 text-center">
          Claude is generating your milestone plan…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Milestones</h3>
          <span className="text-sm text-gray-500">{doneCount}/{sorted.length}</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            id={milestone.id}
            title={milestone.title}
            description={milestone.description}
            status={milestone.status}
            dueDate={milestone.dueDate?.toISOString() ?? null}
            onToggleDone={() => onToggleDone(milestone)}
            onDelete={() => onDelete(milestone)}
          />
        ))}
      </div>

      {showAddForm ? (
        <div className="flex gap-2">
          <Input
            placeholder="New milestone title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <Button onClick={handleAdd} size="sm">Add</Button>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setNewTitle(""); }} size="sm">Cancel</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)} className="w-full">+ Add milestone</Button>
      )}
    </div>
  );
}
