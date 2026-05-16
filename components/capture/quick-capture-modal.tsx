"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
  open?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; category?: string; tags?: string[] }) => void;
  suggestedTags?: string[];
  categories?: Array<{ value: string; label: string }>;
};

export function QuickCaptureModal({ open = false, onClose, onSubmit, suggestedTags = [], categories = [] }: Props) {
  if (!open) return null;
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      tags: formData.getAll("tags") as string[],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Capture idea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Title" name="title" placeholder="What is this idea?" required autoFocus />
          <textarea
            name="description"
            placeholder="Describe what you're thinking..."
            className="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            rows={3}
          />

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {suggestedTags.length > 0 ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="tags" value={tag} />
                    <Badge variant="secondary">{tag}</Badge>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save idea</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
