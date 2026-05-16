export default function WeeklyReviewPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly review</h1>
        <p className="mt-2 text-gray-600">Reflect on your progress and plan next week.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Coming soon</h2>
        <p className="mt-3 text-gray-600">Weekly reviews will summarize your progress, suggest optimizations, and help you plan the week ahead.</p>
        <p className="mt-6 text-sm text-gray-500">Enable weekly reviews in settings to receive AI-generated summaries every Sunday</p>
      </div>
    </div>
  );
}
