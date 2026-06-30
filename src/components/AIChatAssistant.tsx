/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

export default function AIChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "chat-init",
      sender: "ai",
      text: "Welcome to Sarika's Interior Design Studio. I am your elite AI Interior Stylist and Vastu Shastra Consultant. How can I help you elevate, structure, or harmonize your space today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error("API server failed to respond.");
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setError("AI was unable to answer. Please verify that the server is online and try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What colors go well with slate gray and brass?",
    "Explain South-West Vastu bedroom stability rules.",
    "Recommend a lighting scheme for a boutique salon.",
    "How do I optimize space in a narrow 10x12 studio?"
  ];

  return (
    <div className="flex flex-col h-[75vh] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm" id="ai-chat-assistant">
      {/* Header */}
      <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Bespoke AI Chat Assistant</h2>
            <p className="text-[10px] text-stone-400">Sarika Premium Design Consultant &bull; Online</p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
          >
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-stone-950 text-white dark:bg-stone-800 rounded-tr-none"
                  : "bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-100 dark:border-stone-800"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-stone-400 mt-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start mr-auto max-w-[80%]">
            <div className="p-3 bg-stone-50 dark:bg-stone-950 text-stone-500 border border-stone-100 dark:border-stone-800 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span>Sarika AI Stylist is typing...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Quick suggestions panel */}
      {messages.length === 1 && !loading && (
        <div className="p-4 border-t border-stone-100 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-950/25">
          <p className="text-[10px] text-stone-400 font-bold uppercase mb-2">Suggested Topics:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                className="text-left text-[11px] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask about layouts, textures, paint codes, or Vastu alignments..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:bg-stone-100"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
