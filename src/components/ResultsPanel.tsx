"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Globe,
  Compass,
  Heart,
  Quote,
  AlertOctagon,
  Activity,
  ClipboardList,
  Loader2,
  CheckCircle,
  UserCheck,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentAnalysis, SupportedLanguage } from "@/lib/types";
import { languageNativeLabels } from "@/lib/types";
import VoiceControls from "./VoiceControls";

interface ResultsPanelProps {
  analysis: DocumentAnalysis;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isTranslating: boolean;
  selectedLanguage: SupportedLanguage;
}

type TabId = "summary" | "actions" | "dates" | "eligibility" | "docs" | "risks";

export default function ResultsPanel({
  analysis,
  onLanguageChange,
  isTranslating,
  selectedLanguage
}: ResultsPanelProps) {
  const [grandmaMode, setGrandmaMode] = useState(false);
  const [highlightedCitationId, setHighlightedCitationId] = useState<string | null>(null);
  const [animateMeter, setAnimateMeter] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  const {
    classification,
    summary,
    actions,
    deadlines,
    risks,
    eligibility,
    requiredDocuments,
    urgency,
    citations,
    translations
  } = analysis;

  useEffect(() => {
    // Trigger meter animation on mount
    const timer = setTimeout(() => setAnimateMeter(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getDeadlineBadgeColor = (status: string) => {
    switch (status) {
      case "Today":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
      case "Upcoming":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
      case "Passed":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60";
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "Red":
        return {
          bg: "bg-red-50/60 dark:bg-red-950/10",
          border: "border-red-200/80 dark:border-red-950/50",
          text: "text-red-700 dark:text-red-400",
          bar: "bg-gradient-to-r from-red-500 to-rose-600",
          width: "100%",
          label: "Urgent",
          icon: <AlertOctagon className="h-5 w-5 text-red-500" />
        };
      case "Yellow":
        return {
          bg: "bg-amber-50/60 dark:bg-amber-950/10",
          border: "border-amber-200/80 dark:border-amber-950/50",
          text: "text-amber-700 dark:text-amber-400",
          bar: "bg-gradient-to-r from-amber-400 to-orange-500",
          width: "60%",
          label: "Upcoming",
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
        };
      default:
        return {
          bg: "bg-emerald-50/60 dark:bg-emerald-950/10",
          border: "border-emerald-200/80 dark:border-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-400",
          bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
          width: "25%",
          label: "Safe",
          icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
        };
    }
  };

  const currentUrgency = getUrgencyColor(urgency.level);
  const activeTranslation = translations[selectedLanguage] || translations["en"];
  const activeVoiceText = grandmaMode ? activeTranslation.grandmaMode : activeTranslation.summary;

  const handleCitationClick = (citationId?: string) => {
    if (!citationId) return;
    setHighlightedCitationId(citationId);
    // Auto dismiss after 6 seconds
    setTimeout(() => setHighlightedCitationId((prev) => (prev === citationId ? null : prev)), 6000);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
      document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex].id);
      document.getElementById(`tab-${tabs[prevIndex].id}`)?.focus();
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: "summary", label: "Summary", icon: <FileText className="h-4 w-4" /> },
    { id: "actions", label: "Actions", icon: <CheckCircle className="h-4 w-4" /> },
    { id: "dates", label: "Dates", icon: <Calendar className="h-4 w-4" /> },
    { id: "eligibility", label: "Eligibility", icon: <UserCheck className="h-4 w-4" /> },
    { id: "docs", label: "Docs", icon: <FolderOpen className="h-4 w-4" /> },
    { id: "risks", label: "Risks", icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page limit notice */}
      {analysis.totalPages && analysis.pagesAnalyzed && analysis.totalPages > analysis.pagesAnalyzed && (
        <div className="flex items-center gap-2.5 p-4 text-xs rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-150/45 dark:border-amber-950/40 animate-fade-in-up">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-500" />
          <span>
            <strong>Speed Optimization Active:</strong> We only analyzed the first {analysis.pagesAnalyzed} pages of your {analysis.totalPages}-page document to ensure a faster response time.
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold font-sans text-gray-950 dark:text-zinc-55 leading-none">
                {classification.type}
              </h2>
              <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/50">
                {(classification.confidence * 100).toFixed(0)}% Match
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-zinc-400">
                Decoded using {analysis.ocr.method === "pdf-text" ? "Digital Text Extractor" : analysis.ocr.method === "openrouter-vision" ? "OpenRouter Multimodal OCR" : analysis.ocr.method === "demo" ? "Demo Mode" : "Local OCR Engine"}
              </span>
              {analysis.timings && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Activity className="h-3 w-3 animate-pulse text-emerald-500" />
                    <span>Demo Speed: {analysis.timings.totalMs}ms</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-950/40 p-1.5 rounded-2xl border border-gray-200/50 dark:border-zinc-800/80 self-stretch sm:self-auto justify-between sm:justify-start">
          <Globe className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-500 ml-1.5 hidden xs:block" />
          {isTranslating ? (
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              <span>Translating...</span>
            </div>
          ) : (
            (Object.keys(languageNativeLabels) as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? "bg-indigo-650 text-white shadow-sm"
                    : "text-gray-650 dark:text-zinc-400 hover:bg-gray-150/60 dark:hover:bg-zinc-900"
                }`}
              >
                {languageNativeLabels[lang]}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Grid: Left side (Tabs & Content) & Right side (Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tabs Dashboard */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* Quick Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/20 shadow-soft">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-100/80 dark:border-zinc-800/50">
              <span className="text-base sm:text-lg">📄</span>
              <div className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-55">Document Type</span>
                <span className="block text-xs font-extrabold text-gray-950 dark:text-zinc-50 truncate leading-tight">{classification.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-100/80 dark:border-zinc-800/50">
              <span className="text-base sm:text-lg">
                {urgency.level === "Red" ? "🔴" : urgency.level === "Yellow" ? "🟡" : "🟢"}
              </span>
              <div className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-55">Urgency Level</span>
                <span className={`block text-xs font-extrabold leading-tight ${urgency.level === "Red" ? "text-red-650 dark:text-red-400" : urgency.level === "Yellow" ? "text-amber-650 dark:text-amber-400" : "text-emerald-650 dark:text-emerald-400"}`}>
                  {urgency.level === "Red" ? "High Urgency" : urgency.level === "Yellow" ? "Moderate Urgency" : "Safe / Low"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-100/80 dark:border-zinc-800/50">
              <span className="text-base sm:text-lg">🎯</span>
              <div className="min-w-0">
                <span className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-450 dark:text-zinc-55">AI Confidence</span>
                <span className="block text-xs font-extrabold text-gray-950 dark:text-zinc-50 leading-tight">{(classification.confidence * 100).toFixed(0)}% Match</span>
              </div>
            </div>
          </div>

          {/* Sticky Tab Bar */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-850 py-2 -mx-4 px-4 sm:mx-0 sm:px-0 transition-colors">
            <div 
              role="tablist" 
              aria-label="Document analysis sections" 
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5"
            >
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all outline-none shrink-0 ${
                      isActive 
                        ? "text-indigo-650 dark:text-indigo-400" 
                        : "text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-[-10px] left-2 right-2 h-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Panel (Renders only active tab panel) */}
          <div className="min-h-[300px] mt-1">
            <AnimatePresence mode="wait">
              {activeTab === "summary" && (
                <motion.div
                  key="summary"
                  id="panel-summary"
                  role="tabpanel"
                  aria-labelledby="tab-summary"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className={`p-6 rounded-3xl border transition-all duration-300 shadow-soft ${
                    grandmaMode
                      ? "border-rose-200 bg-rose-50/10 dark:border-rose-950/40 dark:bg-rose-950/5"
                      : "border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-500" />
                      <span>{grandmaMode ? "👵 Grandma's Explanation" : "Document Summary"}</span>
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-750 dark:text-zinc-200 leading-relaxed font-body">
                    {grandmaMode ? activeTranslation.grandmaMode : activeTranslation.summary}
                  </p>

                  {!grandmaMode && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 dark:text-zinc-500">
                          Simple Gist
                        </span>
                        <p className="text-xs text-gray-650 dark:text-zinc-300 leading-relaxed">
                          {summary.simple}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 dark:text-zinc-500">
                          Context & Authority
                        </span>
                        <p className="text-xs text-gray-650 dark:text-zinc-300 leading-relaxed">
                          {summary.context}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "actions" && (
                <motion.div
                  key="actions"
                  id="panel-actions"
                  role="tabpanel"
                  aria-labelledby="tab-actions"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft"
                >
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Action Checklist</span>
                  </h3>
                  {actions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No action items detected in this document.</p>
                  ) : (
                    <div className="space-y-3">
                      {actions.map((act, idx) => (
                        <div
                          key={act.id}
                          onClick={() => handleCitationClick(act.citationId)}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            act.citationId && highlightedCitationId === act.citationId
                              ? "bg-indigo-55/40 dark:bg-indigo-950/20 border-indigo-500 shadow-sm"
                              : "bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 hover:border-indigo-205 dark:hover:border-indigo-900/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-950 dark:text-zinc-50">
                              {activeTranslation.actions[idx] || act.label}
                            </p>
                            {act.details && (
                              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                                {act.details}
                              </p>
                            )}
                            {act.citationId && (
                              <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                                <Quote className="h-2 w-2" />
                                <span>View Evidence</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "dates" && (
                <motion.div
                  key="dates"
                  id="panel-dates"
                  role="tabpanel"
                  aria-labelledby="tab-dates"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft"
                >
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2 mb-4">
                    <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Key Dates & Deadlines</span>
                  </h3>
                  {deadlines.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No specific deadlines detected in this document.</p>
                  ) : (
                    <div className="space-y-3">
                      {deadlines.map((dl) => (
                        <div
                          key={dl.id}
                          onClick={() => handleCitationClick(dl.citationId)}
                          className="p-3.5 rounded-2xl border bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 flex flex-col justify-between gap-3 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-950 dark:text-zinc-50">
                              {dl.label}
                            </p>
                            <p className="text-[11px] text-gray-550 dark:text-zinc-400 mt-1">
                              Target Date: <span className="font-semibold text-gray-700 dark:text-zinc-200">{dl.dateText}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${getDeadlineBadgeColor(dl.status)}`}>
                              {dl.status}
                            </span>
                            <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-950/40">
                              {dl.countdownText}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "eligibility" && (
                <motion.div
                  key="eligibility"
                  id="panel-eligibility"
                  role="tabpanel"
                  aria-labelledby="tab-eligibility"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft"
                >
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2 mb-4">
                    <UserCheck className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Eligibility & Criteria</span>
                  </h3>
                  {eligibility.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No specific eligibility rules detected.</p>
                  ) : (
                    <div className="space-y-3">
                      {eligibility.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => handleCitationClick(el.citationId)}
                          className="p-3.5 rounded-2xl border bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors cursor-pointer flex flex-col gap-1.5"
                        >
                          <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 leading-snug">
                            {el.condition}
                          </span>
                          <p className="text-[11px] text-gray-550 dark:text-zinc-400 leading-relaxed">
                            {el.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "docs" && (
                <motion.div
                  key="docs"
                  id="panel-docs"
                  role="tabpanel"
                  aria-labelledby="tab-docs"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft"
                >
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2 mb-4">
                    <FolderOpen className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Required Documents</span>
                  </h3>
                  {requiredDocuments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No specific required documents mentioned.</p>
                  ) : (
                    <div className="space-y-3">
                      {requiredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleCitationClick(doc.citationId)}
                          className="p-3.5 rounded-2xl border bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors cursor-pointer"
                        >
                          <p className="text-xs font-bold text-gray-950 dark:text-zinc-50">
                            {doc.label}
                          </p>
                          {doc.details && (
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                              {doc.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "risks" && (
                <motion.div
                  key="risks"
                  id="panel-risks"
                  role="tabpanel"
                  aria-labelledby="tab-risks"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft"
                >
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Risks & Penalties</span>
                  </h3>
                  {risks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No major risks or penalty terms identified.</p>
                  ) : (
                    <div className="space-y-3">
                      {risks.map((risk) => (
                        <div
                          key={risk.id}
                          onClick={() => handleCitationClick(risk.citationId)}
                          className="p-3.5 rounded-2xl border bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors cursor-pointer flex flex-col gap-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                risk.severity === "High"
                                  ? "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
                                  : risk.severity === "Medium"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                                  : "bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              {risk.severity}
                            </span>
                            <p className="text-xs font-bold text-gray-950 dark:text-zinc-50">
                              {risk.label}
                            </p>
                          </div>
                          <p className="text-[11px] text-gray-550 dark:text-zinc-400 leading-normal">
                            Consequence: <span className="font-semibold text-gray-700 dark:text-zinc-350">{risk.consequence}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Urgency, Grandma Mode, Voice Reader, Citations list */}
        <div className="flex flex-col gap-6">
          
          {/* Urgency Meter Widget */}
          <div className={`p-6 rounded-3xl border ${currentUrgency.border} ${currentUrgency.bg} flex flex-col gap-3.5 shadow-soft hover:-translate-y-0.5 transition-all duration-300`}>
            <div className="flex items-center gap-2">
              {currentUrgency.icon}
              <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-55">
                Urgency Status: <span className={currentUrgency.text}>{currentUrgency.label}</span>
              </h3>
            </div>

            <div className="w-full bg-gray-200 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${currentUrgency.bar} transition-all duration-1000 ease-out relative`}
                style={{
                  width: animateMeter ? currentUrgency.width : "0%"
                }}
              >
                {/* Glow pulse dot on active end of the bar */}
                {animateMeter && (
                  <span className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 animate-pulse" />
                )}
              </div>
            </div>

            <ul className="space-y-2 mt-1">
              {urgency.reasons.map((reason, idx) => (
                <li key={idx} className="text-xs font-medium leading-relaxed flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Grandma Mode Toggle */}
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-rose-500 fill-current animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50">
                    👵 Grandma Mode
                  </h3>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                    Normal ↔ Simple English
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setGrandmaMode(!grandmaMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                  grandmaMode ? "bg-indigo-600" : "bg-gray-200 dark:bg-zinc-800"
                }`}
                role="switch"
                aria-checked={grandmaMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                    grandmaMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed mt-2">
              When toggled, Grandma Mode rewrites complex bureaucracy and official jargon into simple, child-friendly analogies.
            </p>
          </div>

          {/* Voice Controls Widget */}
          <VoiceControls textToRead={activeVoiceText} languageCode={selectedLanguage} />

          {/* Document Citations Reference Widget */}
          <div className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-soft flex flex-col gap-3.5">
            <h3 className="text-sm font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />
              <span>Evidence Citations ({citations.length})</span>
            </h3>

            {citations.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No document citations available.</p>
            ) : (
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {citations.map((cite) => (
                  <button
                    key={cite.id}
                    onClick={() => handleCitationClick(cite.id)}
                    className={`text-left w-full p-3 rounded-xl border text-[10px] leading-relaxed transition-all ${
                      highlightedCitationId === cite.id
                        ? "bg-indigo-50/70 border-indigo-400 text-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-300"
                        : "bg-gray-50/50 dark:bg-zinc-950/10 border-gray-150 dark:border-zinc-850 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    <span className="font-extrabold text-indigo-650 dark:text-indigo-400 block mb-1 uppercase tracking-wide">
                      Quote [{cite.id}]:
                    </span>
                    &quot;{cite.quote}&quot;
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Citation Toast */}
      {highlightedCitationId && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md bg-white dark:bg-zinc-950 border-2 border-indigo-500 rounded-2xl p-4 shadow-xl animate-fade-in-up flex gap-3">
          <Quote className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                Evidence Citation [{highlightedCitationId}]
              </span>
              <button
                onClick={() => setHighlightedCitationId(null)}
                className="text-[10px] font-bold text-gray-400 hover:text-gray-650 dark:hover:text-zinc-300 ml-2"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-gray-800 dark:text-zinc-200 italic leading-relaxed">
              &quot;{citations.find((c) => c.id === highlightedCitationId)?.quote || "Extracting text..."}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
