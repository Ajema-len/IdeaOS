"use client";

import { use, useState, useRef, useEffect } from "react";
import { useChatHistory } from "@/hooks/use-chat";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function IdeaChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: ideaId } = use(params);
  const { data: messages = [], isLoading } = useChatHistory(ideaId);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input;
    setInput("");
      setLocalMessages((prev: typeof messages) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setLocalMessages((prev: any) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              setLocalMessages((prev: typeof messages) => {
                const updated = [...prev];
                if (updated[updated.length - 1].role === "assistant") {
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantMessage };
                }
                return updated;
              });
            } catch {
              // Skip parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-8 space-y-4">
        {localMessages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about this idea..."
            className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isStreaming}>
            {isStreaming ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
