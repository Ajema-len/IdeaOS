"use client";

import { useIdea, useUpdateIdea } from "@/hooks/use-ideas";
import { useMilestones, useUpdateMilestone, useDeleteMilestone } from "@/hooks/use-milestones";
import { useSessions, useStartSession, useEndSession } from "@/hooks/use-sessions";
import { Spinner } from "@/components/ui/spinner";
import { AnalysisCard } from "@/components/analysis/analysis-card";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { SessionTracker } from "@/components/sessions/session-tracker";
import { IdeaStatusBadge } from "@/components/ideas/idea-status-badge";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import type { Milestone } from "@prisma/client";

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const ideaId = params.id;
  const { data: idea, isLoading: ideaLoading, isFetching: ideaFetching, refetch } = useIdea(ideaId);
  const analysis = idea?.analysis?.find((a: any) => a.analysisType === "FULL_ANALYSIS")?.result ?? null;
  const { data: milestones = [], isLoading: milestonesLoading } = useMilestones(ideaId);
  const { data: sessions = [] } = useSessions(ideaId);
  const updateIdea = useUpdateIdea(ideaId);
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const startSession = useStartSession(ideaId);
  const endSession = useEndSession(ideaId);

  const [analysisPollingStart, setAnalysisPollingStart] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState(false);

  useEffect(() => {
    if (!analysis && idea && analysisPollingStart === null) {
      setAnalysisPollingStart(Date.now());
    }
  }, [analysis, idea, analysisPollingStart]);

  useEffect(() => {
    if (analysis) {
      setAnalysisPollingStart(null);
      setAnalysisError(false);
    }
  }, [analysis]);

  useEffect(() => {
    if (analysisPollingStart && !analysis) {
      const timeout = window.setTimeout(() => setAnalysisError(true), 15000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [analysisPollingStart, analysis]);

  if (ideaLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!idea) {
    return <div className="p-8">Idea not found</div>;
  }

  const activeSession = sessions?.find((s: any) => !s.endedAt);

  const handleToggleMilestoneDone = (milestone: Milestone) => {
    const newStatus = milestone.status === "DONE" ? "TODO" : "DONE";
    updateMilestone.mutate({ id: milestone.id, ideaId, status: newStatus as any });
  };

  const handleDeleteMilestone = (milestone: Milestone) => {
    if (ideaId) {
      deleteMilestone.mutate({ id: milestone.id, ideaId });
      toast.success("Milestone deleted");
    }
  };

  const handleReanalyzeClick = () => {
    setAnalysisPollingStart(Date.now());
    setAnalysisError(false);
    refetch();
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
            <IdeaStatusBadge status={idea.status} />
          </div>
          <p className="mt-3 text-gray-600">{idea.description || "No description provided."}</p>
        </div>
        <select
          value={idea.status}
          onChange={(e) => updateIdea.mutate({ status: e.target.value as any })}
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900"
        >
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="BACKLOG">Backlog</option>
          <option value="SHIPPED">Shipped</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
      </div>

      <AnalysisCard analysis={analysis} isLoading={ideaFetching && !analysis} isError={analysisError} onReanalyze={handleReanalyzeClick} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
        {milestonesLoading ? (
          <Spinner />
        ) : milestones && milestones.length > 0 ? (
          <div className="mt-4">
            <MilestoneList
              ideaId={ideaId}
              milestones={milestones}
              ideaCreatedAt={idea.createdAt?.toISOString()}
              onToggleDone={handleToggleMilestoneDone}
              onDelete={handleDeleteMilestone}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">No milestones yet. They will be generated automatically.</p>
        )}
      </div>

      <SessionTracker
        activeSession={activeSession}
        sessions={sessions || []}
        onStart={() => startSession.mutate(undefined)}
        onEnd={(whatAccomplished: string) => {
          if (activeSession) {
            endSession.mutate({ sessionId: activeSession.id, whatAccomplished });
          }
        }}
      />
    </div>
  );
}
