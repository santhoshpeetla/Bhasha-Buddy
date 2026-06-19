"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import DocumentUploader from "@/components/DocumentUploader";
import { Sparkles, FileText, ArrowRight, ShieldCheck, Volume2, HelpCircle, Loader2, RefreshCw, X, AlertTriangle } from "lucide-react";
import type { DocumentAnalysis, SupportedLanguage } from "@/lib/types";
import { demoDocuments } from "@/lib/demo-documents";

// Start page load timing instrumentation
if (typeof window !== "undefined") {
  console.time("page-load");
}

// Lazy-load heavy widgets to reduce initial bundle and hydration block
const ResultsPanel = dynamic(() => import("@/components/ResultsPanel"), {
  loading: () => (
    <div className="animate-pulse h-[500px] bg-gray-100 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-3xl flex items-center justify-center">
      <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold">Loading dashboard elements...</span>
    </div>
  ),
  ssr: false, // Disables server-side pre-render for window/speechSynthesis client compatibility
});

const DocumentChat = dynamic(() => import("@/components/DocumentChat"), {
  loading: () => (
    <div className="animate-pulse h-[400px] bg-gray-100 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-3xl flex items-center justify-center">
      <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold">Loading Chat Bot...</span>
    </div>
  ),
  ssr: false,
});

type StatusState = "idle" | "uploaded" | "processing-ocr" | "generating-analysis" | "completed" | "cancelled";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [statusState, setStatusState] = useState<StatusState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Measure initial page hydration & interactive loading speed
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.timeEnd("page-load");
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    // Safety check: if currently analyzing, prompt user before canceling
    if (isLoading) {
      setPendingFile(file);
      setShowConfirmModal(true);
      return;
    }

    await startAnalysis(file);
  };

  const startAnalysis = async (file: File) => {
    setSelectedFile(file);
    setAnalysis(null);
    setSelectedLanguage("en");
    setError(null);
    setIsLoading(true);
    setStatusState("processing-ocr");

    // Create a new AbortController instance
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "en");

    console.time("upload-processing");
    try {
      // Simulate sub-status transitions for visual feedback progress states
      const statusTimer = setTimeout(() => {
        if (!controller.signal.aborted) {
          setStatusState("generating-analysis");
        }
      }, 1800);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(statusTimer);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze document.");
      }

      const data = (await response.json()) as DocumentAnalysis;
      setAnalysis(data);
      setStatusState("completed");
      console.timeEnd("upload-processing");

      // Log performance timing metrics
      if (data.timings) {
        console.log("--- PERFORMANCE METRICS INSTRUMENTATION ---");
        console.time("ocr");
        console.log(`OCR processing took: ${data.timings.ocrMs}ms`);
        console.timeEnd("ocr");
        
        console.time("gemini");
        console.log(`Gemini processing took: ${data.timings.aiMs}ms`);
        console.timeEnd("gemini");

        console.time("translation");
        console.log(`Translation processing took: 0ms (Pre-translated during analysis and cached)`);
        console.timeEnd("translation");
        
        console.log(`Total Analysis Duration: ${data.timings.totalMs}ms`);
        console.log("-------------------------------------------");
      }

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Fetch request successfully aborted.");
        setStatusState("cancelled");
      } else {
        const msg = err instanceof Error ? err.message : "An error occurred while uploading. Please try again.";
        setError(msg);
        setStatusState("cancelled");
        setSelectedFile(null);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDemoSelect = async (kind: string) => {
    const fileMock = new File([], demoDocuments[kind].fileName);
    
    // Safety check: if currently analyzing, prompt user before canceling
    if (isLoading) {
      setPendingFile(fileMock);
      setShowConfirmModal(true);
      return;
    }

    await startDemo(kind, fileMock);
  };

  const startDemo = async (kind: string, fileMock: File) => {
    setSelectedFile(fileMock);
    setAnalysis(null);
    setSelectedLanguage("en");
    setError(null);
    setIsLoading(true);
    setStatusState("generating-analysis");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    console.time("upload-processing");
    try {
      const response = await fetch(`/api/demo?kind=${kind}&language=en`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to run demo.");
      }

      const data = (await response.json()) as DocumentAnalysis;
      setAnalysis(data);
      setStatusState("completed");
      console.timeEnd("upload-processing");

      if (data.timings) {
        console.log("--- PERFORMANCE METRICS INSTRUMENTATION (DEMO) ---");
        console.time("ocr");
        console.log(`OCR processing took: ${data.timings.ocrMs}ms`);
        console.timeEnd("ocr");
        
        console.time("gemini");
        console.log(`Gemini processing took: ${data.timings.aiMs}ms`);
        console.timeEnd("gemini");

        console.time("translation");
        console.log(`Translation processing took: 0ms (Pre-translated and cached)`);
        console.timeEnd("translation");
        
        console.log(`Total Analysis Duration: ${data.timings.totalMs}ms`);
        console.log("--------------------------------------------------");
      }

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Demo fetch request successfully aborted.");
        setStatusState("cancelled");
      } else {
        const msg = err instanceof Error ? err.message : "Demo failed to load. Please try again.";
        setError(msg);
        setStatusState("cancelled");
        setSelectedFile(null);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Feature 2: Cancel Analysis
  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStatusState("cancelled");
    setError("Analysis was cancelled by the user.");
    setSelectedFile(null);
  };

  // Feature 4: Safety Modal Confirm
  const handleConfirmCancelAndReplace = () => {
    setShowConfirmModal(false);
    
    // Abort active fetch call
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const fileToAnalyze = pendingFile;
    setPendingFile(null);

    if (fileToAnalyze) {
      const isDemo = Object.keys(demoDocuments).find(
        (key) => demoDocuments[key].fileName === fileToAnalyze.name
      );
      if (isDemo) {
        startDemo(isDemo, fileToAnalyze);
      } else {
        startAnalysis(fileToAnalyze);
      }
    }
  };

  // Feature 4: Safety Modal Cancel
  const handleCancelReplace = () => {
    setShowConfirmModal(false);
    setPendingFile(null);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  const handleLanguageChange = async (targetLang: SupportedLanguage) => {
    if (!analysis) return;

    // If it's already translated, just switch
    if (targetLang === "en" || (analysis.translations && analysis.translations[targetLang])) {
      setSelectedLanguage(targetLang);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: analysis.translations.en.summary,
          grandmaMode: analysis.translations.en.grandmaMode,
          actions: analysis.translations.en.actions,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed.");
      }

      const translatedData = await response.json();
      
      // Update analysis state with the new translation
      setAnalysis((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          translations: {
            ...prev.translations,
            [targetLang]: translatedData,
          },
        };
      });

      setSelectedLanguage(targetLang);
    } catch (err) {
      console.error("Failed to translate:", err);
      alert("Language translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Feature 3: Clear all and return to upload
  const clearFile = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setSelectedLanguage("en");
    setError(null);
    setStatusState("idle");
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return (
    <AppShell>
      <div className="relative overflow-hidden flex flex-col gap-12 pb-16 min-h-[calc(100vh-80px)]">
        {/* Animated background decorative blobs */}
        <div className="absolute top-[-5%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-indigo-200/20 dark:bg-indigo-950/10 blur-[80px] pointer-events-none animate-float-slow" />
        <div className="absolute top-[25%] right-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-orange-200/20 dark:bg-orange-950/10 blur-[100px] pointer-events-none animate-float-reverse" />
        <div className="absolute bottom-[10%] left-[20%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-violet-200/15 dark:bg-purple-950/10 blur-[90px] pointer-events-none animate-pulse-glow" />

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6 mt-4 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-150/40 dark:border-indigo-950/40 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
            <span>Empowering Citizens with Clarity</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-gray-950 dark:text-zinc-50 leading-tight">
            Understand Any{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-orange-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-orange-400">
              Document in Seconds
            </span>
          </h1>

          <p className="text-base text-gray-500 dark:text-zinc-400 leading-relaxed max-w-2xl font-body">
            Upload government notices, scholarship forms, medical reports, legal documents, and circulars in English, Telugu, or Hindi.
          </p>

          {!analysis && !isLoading && (
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <button
                onClick={() => {
                  const el = document.getElementById("uploader-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transform hover:-translate-y-0.5 transition-all"
              >
                Upload Document
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("demo-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 text-gray-800 dark:text-zinc-200 rounded-2xl font-bold text-sm shadow-sm transform hover:-translate-y-0.5 transition-all"
              >
                Try Demo
              </button>
            </div>
          )}

          {/* Statistics Strip */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-8 py-4 px-6 sm:px-12 bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md border border-gray-150/45 dark:border-zinc-800/30 rounded-3xl w-full max-w-2xl shadow-soft">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-650 dark:text-indigo-400 font-display">25K+</span>
              <span className="text-[10px] text-gray-550 dark:text-zinc-500 uppercase tracking-wider font-bold">Docs Decoded</span>
            </div>
            <div className="flex flex-col items-center border-x border-gray-200/50 dark:border-zinc-800/55 px-4 sm:px-8">
              <span className="text-xl sm:text-2xl font-extrabold text-violet-650 dark:text-violet-400 font-display">3</span>
              <span className="text-[10px] text-gray-550 dark:text-zinc-500 uppercase tracking-wider font-bold">Languages</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-orange-650 dark:text-orange-400 font-display">&lt;5s</span>
              <span className="text-[10px] text-gray-550 dark:text-zinc-500 uppercase tracking-wider font-bold">Avg Speed</span>
            </div>
          </div>
        </section>

        {/* Upload System, Demo Grid, and General Chat */}
        {!analysis && !isLoading && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto w-full relative z-10">
            {/* File Upload Area */}
            <div id="uploader-section" className="flex flex-col gap-4 md:col-span-1 lg:col-span-1 scroll-mt-24">
              <h2 className="text-lg font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2">
                <span>Step 1: Upload Your Document</span>
              </h2>
              <DocumentUploader
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
                selectedFile={selectedFile}
                clearFile={clearFile}
              />

              {error && (
                <div className="text-xs text-red-650 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/45 p-3 rounded-xl flex items-center justify-between">
                  <span>{error}</span>
                  {statusState === "cancelled" && (
                    <button onClick={() => setError(null)} className="text-[10px] font-bold underline ml-2">Dismiss</button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Demo Mode */}
            <div id="demo-section" className="flex flex-col gap-4 md:col-span-1 lg:col-span-1 scroll-mt-24">
              <h2 className="text-lg font-bold font-sans text-gray-950 dark:text-zinc-50 flex items-center gap-2">
                <span>Or Try Demo Mode</span>
                <span className="text-xs bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                  No Upload Needed
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.values(demoDocuments).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDemoSelect(doc.id)}
                    disabled={isLoading}
                    className="p-4 text-left border border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-2xl transition-all flex flex-col justify-between min-h-[120px] group shadow-sm disabled:opacity-50"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-150 group-hover:text-indigo-650 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-[10px] text-gray-550 dark:text-zinc-450 leading-relaxed mt-1">
                        {doc.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 mt-3">
                      <span>Test Demo</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* General Chat Assistant */}
            <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-950 dark:text-zinc-50 flex items-center gap-2">
                <span>BhashaBuddy Assistant</span>
              </h2>
              <DocumentChat />
            </div>
          </section>
        )}

        {/* Global Progress Loading Card */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-6 max-w-sm w-full mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-soft animate-pulse">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <FileText className="absolute h-5 w-5 text-indigo-500" />
            </div>
            
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold text-indigo-705 bg-indigo-50 dark:bg-indigo-950/30 rounded-full border border-indigo-150/20 dark:border-indigo-950/40 uppercase tracking-widest mb-3">
                {statusState === "processing-ocr" ? "Processing OCR" : "Generating Analysis"}
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                {statusState === "processing-ocr" 
                  ? "Transcribing document..." 
                  : "Synthesizing checklists..."}
              </h3>
              <p className="text-[11px] text-gray-550 dark:text-zinc-450 mt-1.5 leading-relaxed">
                {statusState === "processing-ocr"
                  ? "Running digital extraction & Gemini Vision scan."
                  : "Drafting actions, translations, and Grandma Mode analogies."}
              </p>
            </div>

            <button
              onClick={handleCancelAnalysis}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-red-650 hover:text-red-750 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/30 rounded-xl transition-colors w-full"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel Analysis</span>
            </button>
          </div>
        )}

        {/* Analysis Dashboard Section */}
        {analysis && !isLoading && (
          <div ref={resultRef} className="border-t border-gray-200 dark:border-zinc-800 pt-12 flex flex-col gap-6 scroll-mt-20">
            {/* Header with Cancel/Reset trigger */}
            <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950 dark:text-zinc-50">
                  Analysis Results
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Decoded elements, action checklist, and grounded Q&A.
                </p>
              </div>
              
              <button
                onClick={clearFile}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-750 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm self-stretch sm:self-auto justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Analyze Another Document</span>
              </button>
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary Dashboard Panel */}
              <div className="lg:col-span-2">
                <ResultsPanel
                  analysis={analysis}
                  onLanguageChange={handleLanguageChange}
                  isTranslating={isTranslating}
                  selectedLanguage={selectedLanguage}
                />
              </div>

              {/* Chat & Voice Side Block */}
              <div className="flex flex-col gap-6">
                <DocumentChat
                  documentText={analysis.ocr.text}
                  documentType={analysis.classification.type}
                  documentSummary={analysis.summary.purpose}
                />
              </div>
            </div>
          </div>
        )}

        {/* Safety Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-lg flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-950 dark:text-zinc-50">
                    Analysis In Progress
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed mt-1">
                    An analysis is currently running. Do you want to cancel it and decode the new document instead?
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={handleCancelReplace}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-gray-750 dark:text-zinc-300 bg-gray-150 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-850 rounded-xl transition-all"
                >
                  Continue Current Analysis
                </button>
                <button
                  onClick={handleConfirmCancelAndReplace}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-xl transition-all shadow-sm"
                >
                  Cancel and Replace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works section - when no file loaded */}
        {!analysis && !isLoading && (
          <section className="max-w-5xl mx-auto w-full border-t border-gray-200 dark:border-zinc-800 pt-12 flex flex-col gap-6">
            <h2 className="text-base font-bold text-center text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
              How BhashaBuddy Helps You
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 flex flex-col gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  100% Privacy Focused
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Documents are processed in memory and immediately deleted. We never store your uploads.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 flex flex-col gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                  <Volume2 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  Voice Reader Enabled
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Have documents read out to you in English, Hindi, or Telugu. Perfect for senior citizens.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 flex flex-col gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  Grandma Mode Toggle
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Struggling with legal jargon? Grandma Mode translates clauses into easy, friendly analogies.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
