import { CheckCircle2, GripVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
  onToggleDone: () => void;
  onDelete: () => void;
};

export function MilestoneItem({ id, title, description, status, dueDate, onToggleDone, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3 text-gray-400">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <Badge variant={status === "DONE" ? "success" : status === "IN_PROGRESS" ? "info" : status === "SKIPPED" ? "danger" : "secondary"}>{status.replaceAll("_", " ")}</Badge>
        </div>
        {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
        {dueDate ? <p className="mt-2 text-xs text-gray-500">Due {new Date(dueDate).toLocaleDateString()}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleDone}>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
