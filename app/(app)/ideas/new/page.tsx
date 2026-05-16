"use client";

import { useCreateIdea } from "@/hooks/use-ideas";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewIdeaPage() {
  const router = useRouter();
  const createIdea = useCreateIdea();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createIdea.mutateAsync({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        category: (formData.get("category") as string) || undefined,
        tags: formData.getAll("tags") as string[],
      });
      toast.success("Idea created!");
      router.push(`/ideas/${result.data.id}`);
    } catch (error) {
      toast.error("Failed to create idea");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Capture a new idea</h1>
        <p className="mt-2 text-gray-600">AI will analyze and generate a plan automatically.</p>
      </div>

      <div className="max-w-2xl rounded-3xl border border-gray-200 bg-white p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Idea title" name="title" placeholder="One line summary of your idea" required autoFocus />

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              placeholder="Elaborate on the idea, why it matters, what problem it solves..."
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              defaultValue="OTHER"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ML_RESEARCH">ML Research</option>
              <option value="ML_PRODUCT">ML Product</option>
              <option value="WEB_APP">Web App</option>
              <option value="MOBILE_APP">Mobile App</option>
              <option value="TOOL">Tool</option>
              <option value="PLATFORM">Platform</option>
              <option value="API_SERVICE">API Service</option>
              <option value="CONTENT">Content</option>
              <option value="BUSINESS">Business</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createIdea.isPending}>
              {createIdea.isPending ? "Creating..." : "Create idea"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
