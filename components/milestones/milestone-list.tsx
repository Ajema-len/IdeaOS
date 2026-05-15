import { useMemo } from "react";
import { MilestoneItem } from "@/components/milestones/milestone-item";
import type { Milestone } from "@prisma/client";

type Props = {
  milestones: Milestone[];
  onToggleDone: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
};

export function MilestoneList({ milestones, onToggleDone, onDelete }: Props) {
  const sorted = useMemo(() => [...milestones].sort((a, b) => a.orderIndex - b.orderIndex), [milestones]);

  return (
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
  );
}
