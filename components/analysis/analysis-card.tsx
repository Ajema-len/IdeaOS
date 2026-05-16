import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplexityMeter } from "@/components/analysis/complexity-meter";
import type { FullAnalysisResult } from "@/types/idea";

type Props = {
  analysis: FullAnalysisResult | null;
  onReanalyze?: () => void;
};

export function AnalysisCard({ analysis, onReanalyze }: Props) {
  if (!analysis) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No analysis available yet. Generate one after the idea is created.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Idea analysis</h2>
          <p className="mt-2 text-sm text-gray-600">High-level AI recommendations for technical direction and risk.</p>
        </div>
        {onReanalyze ? <Button variant="outline" onClick={onReanalyze}>Re-analyze</Button> : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Feasibility</h3>
          <Badge variant={analysis.feasibility === "high" || analysis.feasibility === "very_high" ? "success" : analysis.feasibility === "medium" ? "warning" : "danger"} className="mt-3">{analysis.feasibility.replace(/_/g, " ")}</Badge>
          <p className="mt-3 text-sm text-gray-600">{analysis.feasibilityReason}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Market potential</h3>
          <Badge variant={analysis.marketPotential === "massive" ? "success" : analysis.marketPotential === "large" ? "info" : analysis.marketPotential === "moderate" ? "warning" : "secondary"} className="mt-3">{analysis.marketPotential}</Badge>
          <p className="mt-3 text-sm text-gray-600">{analysis.marketPotentialReason}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Score</h3>
          <div className="mt-3 text-3xl font-bold text-gray-900">{analysis.ideaScore}</div>
          <p className="mt-2 text-sm text-gray-600">Based on complexity, feasibility, and market potential.</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <ComplexityMeter value={analysis.complexity} />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Suggested stack</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.suggestedStack.frontend.map((item) => (
              <Badge key={item} variant="info">{item}</Badge>
            ))}
            {analysis.suggestedStack.backend.map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
            {analysis.suggestedStack.ai.map((item) => (
              <Badge key={item} variant="warning">{item}</Badge>
            ))}
            {analysis.suggestedStack.infra.map((item) => (
              <Badge key={item} variant="success">{item}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
