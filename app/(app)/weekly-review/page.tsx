"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGenerateWeeklyReview, useWeeklyReviews } from "@/hooks/use-weekly-reviews";
import { toast } from "sonner";
import { format } from "date-fns";

export default function WeeklyReviewPage() {
  const generateReview = useGenerateWeeklyReview();
  const { data: reviews, isLoading: reviewsLoading } = useWeeklyReviews();

  const handleGenerateReview = async () => {
    try {
      await generateReview.mutateAsync();
      toast.success("Weekly review generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate review");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly review</h1>
        <p className="mt-2 text-gray-600">Reflect on your progress and plan next week.</p>
      </div>

      {/* Generate Section */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Generate this week's review</h2>
        <p className="mt-2 text-sm text-gray-600">Claude Opus will analyze your ideas, sessions, and progress to provide strategic insights.</p>
        <Button
          onClick={handleGenerateReview}
          disabled={generateReview.isPending}
          className="mt-4"
        >
          {generateReview.isPending && <Spinner size="sm" />}
          {generateReview.isPending ? "Generating..." : "Generate review"}
        </Button>
        {generateReview.isPending && (
          <p className="mt-3 text-xs text-gray-500">Claude Opus is reviewing your portfolio… This takes 20-40 seconds.</p>
        )}
      </div>

      {/* Past Reviews Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Past reviews</h2>
        {reviewsLoading ? (
          <div className="mt-4 flex justify-center">
            <Spinner />
          </div>
        ) : !reviews?.data || reviews.data.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">No reviews yet. Generate your first review to get started!</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.data.map((review: any) => (
              <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">Week of {format(new Date(review.weekOf), "MMM d, yyyy")}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{review.content}</p>
                  </div>
                  <a
                    href={`#review-${review.id}`}
                    className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View
                  </a>
                </div>
                <p className="mt-2 text-xs text-gray-400">Generated {format(new Date(review.createdAt), "MMM d, h:mm a")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
