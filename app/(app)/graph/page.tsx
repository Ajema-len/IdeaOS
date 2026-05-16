export default function GraphPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Big picture</h1>
        <p className="mt-2 text-gray-600">Visualize your idea ecosystem and relationships.</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Coming in Phase 4</h2>
        <p className="mt-3 text-gray-600">The knowledge graph will help you discover connections between ideas and uncover cross-cutting themes.</p>
        <p className="mt-6 text-sm text-gray-500">Phase 4 will add: visualization, similarity search, and relationship mapping</p>
      </div>
    </div>
  );
}
