"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Quote, RefreshCw, AlertCircle, FileText, Globe } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

interface DocumentChatProps {
  documentText?: string;
  documentType?: string;
  documentSummary?: string;
}

const SUGGESTED_QUESTIONS = [
  "What should I do?",
  "What is the deadline?",
  "Am I eligible?",
  "What documents are required?",
  "Explain simply",
];

export default function DocumentChat({
  documentText = "",
  documentType = "",
  documentSummary = "",
}: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasDocument = documentText && documentText.trim().length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Reset chat if the document changes or gets cleared
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [documentText]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userQuestion = textToSend.trim();
    setInputValue("");
    setError(null);

    // Add user message to state
    const userMsg: ChatMessage = { role: "user", content: userQuestion };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          documentText: documentText,
          documentType: documentType,
          documentSummary: documentSummary,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get an answer.");
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        source: data.source || "general",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestedClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[520px] border border-gray-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/60 shadow-soft overflow-hidden smooth-transition">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400">
            <MessageSquare className="h-4.5 w-4.5" />
            <span className={`absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full ${hasDocument ? "bg-indigo-500" : "bg-emerald-500"} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-gray-950 dark:text-zinc-50 leading-none">
              BhashaBuddy Assistant
            </h3>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">
              {hasDocument ? "Hybrid Mode (Document + AI Knowledge)" : "General Knowledge AI Mode"}
            </span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-[10px] font-extrabold text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-zinc-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-850 text-gray-400 dark:text-zinc-400 mb-3 border border-gray-100 dark:border-zinc-800">
              <Bot className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-gray-800 dark:text-zinc-300 mb-1">
              {hasDocument ? "Ask anything about this document" : "Ask BhashaBuddy anything"}
            </p>
            <p className="text-[11px] max-w-[220px] leading-relaxed mb-4">
              {hasDocument
                ? "Get eligibility conditions, critical dates, required attachments, or ask general questions."
                : "Type a query or get explanations about Indian policies, circulars, or form terms."}
            </p>

            {/* Suggested prompts in empty state */}
            {hasDocument && (
              <div className="flex flex-wrap gap-2 justify-center max-w-sm mt-2">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedClick(question)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl px-2.5 py-1.5 transition-all text-center"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[90%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                } animate-fade-in`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs ${
                    isUser
                      ? "bg-indigo-650 text-white border-indigo-750"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-650 dark:text-zinc-300 border-gray-250 dark:border-zinc-700"
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  {/* Source Indicator Badge */}
                  {!isUser && msg.source && (
                    <div className="flex items-center gap-1.5 self-start">
                      {msg.source === "document" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/35">
                          <FileText className="h-2.5 w-2.5" />
                          <span>Document Answer</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/35">
                          <Globe className="h-2.5 w-2.5" />
                          <span>AI Knowledge</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                        : "bg-gray-100 dark:bg-zinc-850 text-gray-800 dark:text-zinc-200 rounded-tl-none border border-gray-200/50 dark:border-zinc-800/80 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Citations block for assistant response */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-col gap-1 px-1 mt-1">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Quote className="h-2.5 w-2.5" />
                        <span>Source Citations:</span>
                      </span>
                      {msg.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="bg-indigo-50/50 dark:bg-indigo-950/10 border-l-2 border-indigo-500 rounded-r-lg p-2 text-[10px] text-indigo-800 dark:text-indigo-300 italic leading-snug"
                        >
                          &quot;{cite.quote}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Animated Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto animate-fade-in">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="bg-gray-100 dark:bg-zinc-850 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200/50 dark:border-zinc-800/80 flex items-center justify-center shadow-sm">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2 p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-150 dark:border-red-950/45 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts in footer if we have messages (for quick follow-ups) */}
      {hasDocument && messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-850/50 bg-white dark:bg-zinc-900/30 overflow-x-auto flex gap-2 no-scrollbar">
          {SUGGESTED_QUESTIONS.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(question)}
              disabled={isLoading}
              className="whitespace-nowrap text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/25 border border-indigo-100/40 dark:border-indigo-900/30 rounded-lg px-2 py-1 transition-all"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-150 dark:border-zinc-800 bg-gray-50/20 dark:bg-zinc-950/10 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={hasDocument ? "Ask about the document or general questions..." : "Ask BhashaBuddy anything..."}
          disabled={isLoading}
          className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-sm"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
