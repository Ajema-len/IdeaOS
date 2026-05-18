import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplexityMeter } from "@/components/analysis/complexity-meter";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { FullAnalysisResult } from "@/types/idea";

type Props = {
  analysis: FullAnalysisResult | null;
  isLoading?: boolean;
  isError?: boolean;
  onReanalyze?: () => void;
};

export function AnalysisCard({ analysis, isLoading = false, isError = false, onReanalyze }: Props) {
  // State 1: Loading with no data yet - show skeleton
  if (isLoading && !analysis) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-16" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  // State 2: Error state - polling timed out
  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">Analysis failed</p>
        <p className="text-xs text-red-600 mt-1">Claude could not analyze this idea. Please try again.</p>
        {onReanalyze ? (
          <Button onClick={onReanalyze} variant="outline" className="mt-4 text-red-600 hover:text-red-700">
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  // State 3: No analysis yet but polling - show "Analysis running"
  if (!analysis) {
    return (
      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm font-medium text-blue-900">Analysis running…</p>
          <p className="text-xs text-blue-700">Claude is analyzing your idea. This takes ~10 seconds.</p>
        </div>
      </div>
    );
  }

  // State 4: Analysis complete - show full card
  // Color coding for ideaScore
  const scoreColor = analysis.ideaScore < 40 ? "text-red-600" : analysis.ideaScore < 70 ? "text-amber-600" : "text-green-600";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Idea analysis</h2>
          <p className="mt-2 text-sm text-gray-600">High-level AI recommendations for technical direction and risk.</p>
        </div>
        {onReanalyze ? (
          <Button variant="outline" onClick={onReanalyze}>
            Re-analyze
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Idea Score */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Idea score</h3>
          <div className={`mt-3 text-4xl font-bold ${scoreColor}`}>{analysis.ideaScore}</div>
          <p className="mt-2 text-xs text-gray-600">Based on complexity, feasibility, and market potential.</p>
        </div>

        {/* Feasibility */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Feasibility</h3>
          <Badge
            variant={
              analysis.feasibility === "high" || analysis.feasibility === "very_high"
                ? "success"
                : analysis.feasibility === "medium"
                  ? "warning"
                  : "danger"
            }
            className="mt-3"
          >
            {analysis.feasibility.replace(/_/g, " ")}
          </Badge>
          <p className="mt-3 text-sm text-gray-600">{analysis.feasibilityReason}</p>
        </div>

        {/* Market Potential */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Market potential</h3>
          <Badge
            variant={
              analysis.marketPotential === "massive"
                ? "success"
                : analysis.marketPotential === "large"
                  ? "info"
                  : analysis.marketPotential === "moderate"
                    ? "warning"
                    : "secondary"
            }
            className="mt-3"
          >
            {analysis.marketPotential}
          </Badge>
          <p className="mt-3 text-sm text-gray-600">{analysis.marketPotentialReason}</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <ComplexityMeter value={analysis.complexity} />

        {/* Time to MVP */}
        {analysis.timeToMVP ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Time to MVP</h3>
            <p className="mt-2 text-sm text-gray-600">{analysis.timeToMVP}</p>
          </div>
        ) : null}

        {/* Primary Risks */}
        {analysis.primaryRisks && analysis.primaryRisks.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Primary risks</h3>
            <ul className="mt-3 space-y-2">
              {analysis.primaryRisks.slice(0, 3).map((risk, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Suggested Stack */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Suggested stack</h3>
          <div className="mt-3 space-y-3">
            {analysis.suggestedStack?.frontend && analysis.suggestedStack.frontend.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Frontend</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedStack.frontend.map((item) => (
                    <Badge key={item} variant="info">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {analysis.suggestedStack?.backend && analysis.suggestedStack.backend.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Backend</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedStack.backend.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {analysis.suggestedStack?.ai && analysis.suggestedStack.ai.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">AI/ML</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedStack.ai.map((item) => (
                    <Badge key={item} variant="warning">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {analysis.suggestedStack?.infra && analysis.suggestedStack.infra.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Infrastructure</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedStack.infra.map((item) => (
                    <Badge key={item} variant="success">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
