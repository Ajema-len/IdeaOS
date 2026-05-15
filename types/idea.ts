import type { Idea, WorkSession, Milestone, AIAnalysis, ChatMessage, Note } from "@prisma/client";

export type IdeaWithStats = Idea & {
  sessions: WorkSession[];
  milestones: Milestone[];
  analysis: AIAnalysis[];
  chatMessages: ChatMessage[];
  notes: Note[];
};

export type IdeaListItem = Idea & {
  _count: { sessions: number; milestones: number };
  milestones: Pick<Milestone, "status">[];
};

export type FullAnalysisResult = {
  complexity: number;
  complexityReason: string;
  feasibility: "low" | "medium" | "high" | "very_high";
  feasibilityReason: string;
  marketPotential: "niche" | "moderate" | "large" | "massive";
  marketPotentialReason: string;
  timeToMVP: string;
  primaryRisks: string[];
  suggestedStack: { frontend: string[]; backend: string[]; ai: string[]; infra: string[] };
  ideaScore: number;
  analysisVersion: string;
};

export type MilestonePlanResult = {
  milestones: Array<{
    title: string;
    description: string;
    estimatedDays: number;
    phase: "foundation" | "core" | "polish" | "launch";
  }>;
  totalEstimatedDays: number;
  criticalPath: string;
};

export type ContextRestoreResult = {
  summary: string;
  lastSessionSummary: string;
  lastAccomplished: string[];
  whereYouLeftOff: string;
  suggestedNextStep: string;
  openQuestions: string[];
};

export type DailyFocusResult = {
  recommendedIdeaId: string;
  reason: string;
  suggestedGoal: string;
  estimatedMinutes: number;
  alternativeIdeaId: string;
  alternativeReason: string;
};

export type TagSuggestion = {
  tags: string[];
};

export type GraphIdea = {
  id: string;
  title: string;
  status: string;
  category: string;
  momentumScore: number;
  totalTimeHours: number;
  sessionCount: number;
};

export type GraphRelationship = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  confidence: number;
};
