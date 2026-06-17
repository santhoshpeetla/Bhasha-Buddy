"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, Square, Volume2, Sparkles } from "lucide-react";

interface VoiceControlsProps {
  textToRead: string;
  languageCode: "en" | "te" | "hi";
}

export default function VoiceControls({ textToRead, languageCode }: VoiceControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Set up utterance when text changes
  useEffect(() => {
    if (!synth || !textToRead) return;

    // Stop current speech before setting up new
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);

    const utt = new SpeechSynthesisUtterance(textToRead);

    // Event listeners
    utt.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utt.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Configure Voice based on language
    const voices = synth.getVoices();
    let selectedVoice = null;

    if (languageCode === "hi") {
      selectedVoice = voices.find((v) => v.lang.includes("hi-IN") || v.lang.includes("hi"));
      utt.rate = 0.95; // Slightly slower rate for clarity
    } else if (languageCode === "te") {
      selectedVoice = voices.find((v) => v.lang.includes("te-IN") || v.lang.includes("te"));
      utt.rate = 0.95;
    } else {
      selectedVoice = voices.find(
        (v) =>
          v.lang.includes("en-IN") ||
          v.lang.includes("en-GB") ||
          v.lang.includes("en-US")
      );
      utt.rate = 1.0;
    }

    if (selectedVoice) {
      utt.voice = selectedVoice;
    }

    setUtterance(utt);
  }, [synth, textToRead, languageCode]);

  const handlePlay = () => {
    if (!synth || !utterance) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      synth.cancel(); // safety cancel
      synth.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (!synth || !isPlaying) return;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!synth) {
    return (
      <div className="text-xs text-gray-400 dark:text-zinc-500 italic flex items-center gap-1.5">
        <Volume2 className="h-3.5 w-3.5" />
        <span>Text-to-speech not supported on this browser.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 p-5 bg-white dark:bg-zinc-900/60 rounded-3xl border border-gray-250 dark:border-zinc-800 shadow-soft transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-950 dark:text-zinc-50 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-indigo-500" />
          <span>Voice Reader Assistant</span>
        </span>
        
        {isPlaying && (
          <div className="flex items-center gap-2">
            {/* Animated Waveform */}
            <div className="flex items-end gap-[3px] h-3.5 px-1.5">
              <span className="w-[2.5px] bg-emerald-500 rounded-full h-1.5 animate-soundwave-1"></span>
              <span className="w-[2.5px] bg-emerald-500 rounded-full h-3 animate-soundwave-2"></span>
              <span className="w-[2.5px] bg-emerald-500 rounded-full h-1 animate-soundwave-3"></span>
              <span className="w-[2.5px] bg-emerald-500 rounded-full h-4 animate-soundwave-4"></span>
              <span className="w-[2.5px] bg-emerald-500 rounded-full h-2 animate-soundwave-5"></span>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-950/40">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Speaking</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-650/10 hover:shadow-indigo-650/20"
          aria-label={isPlaying ? "Pause voice output" : "Play voice output"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isPaused ? "Resume" : "Listen Now"}</span>
            </>
          )}
        </button>

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="flex items-center justify-center p-2.5 rounded-xl text-red-650 hover:text-red-700 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-150 dark:border-red-950/40 transition-colors"
            aria-label="Stop reading"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
}
