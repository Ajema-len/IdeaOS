import { CheckCircle2, Circle, Trash2 } from "lucide-react";
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

export function MilestoneItem({ id: _id, title, description, status, dueDate, onToggleDone, onDelete }: Props) {
  const isDone = status === "DONE";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
      {/* Checkbox */}
      <button
        onClick={onToggleDone}
        className="flex-shrink-0 mt-1 text-gray-400 hover:text-blue-600 transition-colors"
        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
      >
        {isDone ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5" />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className={`text-sm font-semibold ${isDone ? "text-gray-500 line-through" : "text-gray-900"}`}>{title}</h4>
          <Badge variant={isDone ? "success" : "secondary"}>{status.replace(/_/g, " ")}</Badge>
        </div>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        {dueDate ? <p className="mt-2 text-xs text-gray-500">Due {new Date(dueDate).toLocaleDateString()}</p> : null}
      </div>

      {/* Delete Button */}
      <Button variant="ghost" size="sm" onClick={onDelete} className="flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
