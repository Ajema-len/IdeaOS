"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  open?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; category?: string; tags?: string[] }) => void;
  isSubmitting?: boolean;
};

export function QuickCaptureModal({ open = false, onClose, onSubmit, isSubmitting = false }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Debounce title input to fetch tag suggestions
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (title.trim().length >= 3) {
        setLoadingTags(true);
        try {
          const res = await fetch("/api/ideas/quick-tag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          const json = await res.json();
          setSuggestedTags(json.data?.tags ?? []);
        } catch (error) {
          console.error("Failed to fetch tag suggestions:", error);
          setSuggestedTags([]);
        } finally {
          setLoadingTags(false);
        }
      } else {
        setSuggestedTags([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [title, open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      category: category || undefined,
      tags: selectedTags,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedTags([]);
    setSuggestedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Capture idea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this idea?"
              required
              autoFocus
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're thinking..."
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select a category</option>
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

          {/* Tag Suggestions */}
          {(suggestedTags.length > 0 || loadingTags) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Suggested tags</label>
                {loadingTags && <Spinner size="sm" />}
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Selected tags ({selectedTags.length})</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Form Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Saving..." : "Capture idea"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
