import { Badge } from "@/components/ui/badge";
import type { IdeaStatus } from "@prisma/client";

type Props = {
  status: IdeaStatus;
};

const statusVariants: Record<IdeaStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  BACKLOG: "default",
  SHIPPED: "info",
  ABANDONED: "danger",
};

export function IdeaStatusBadge({ status }: Props) {
  return <Badge variant={statusVariants[status]}>{status.replace(/_/g, " ")}</Badge>;
}
