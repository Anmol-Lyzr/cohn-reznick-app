"use client";

import { useState, useRef, useCallback } from "react";
import type { CohnReznickAnalysis } from "@/types/analysis";

export interface ActivityEvent {
  action: string;
  icon: string;
  ts: number;
  filePath?: string;
}

export type AnalysisPhase = "idle" | "running" | "complete" | "error";

export interface AnalysisStreamState {
  phase: AnalysisPhase;
  activities: ActivityEvent[];
  result: CohnReznickAnalysis | null;
  error: string | null;
}

export function useAnalysisStream() {
  const [state, setState] = useState<AnalysisStreamState>({
    phase: "idle",
    activities: [],
    result: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (files: File[], useSample = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ phase: "running", activities: [], result: null, error: null });

    try {
      const formData = new FormData();
      if (useSample) {
        formData.append("sample", "true");
      } else {
        files.forEach(f => formData.append("files", f));
      }

      const response = await fetch("/api/agent/execute", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        setState(s => ({ ...s, phase: "error", error: err }));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState(s => ({ ...s, phase: "error", error: "No response stream" }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "activity") {
                setState(s => ({ ...s, activities: [...s.activities, data as ActivityEvent] }));
              } else if (currentEvent === "done") {
                setState(s => ({
                  ...s,
                  phase: "complete",
                  result: data.result as CohnReznickAnalysis,
                }));
              } else if (currentEvent === "error") {
                setState(s => ({ ...s, phase: "error", error: data.error as string }));
              }
            } catch { /* ignore parse errors */ }
            currentEvent = "";
          }
        }
      }

      setState(s => s.phase === "running" ? { ...s, phase: "error", error: "Stream ended without result" } : s);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setState(s => ({ ...s, phase: "error", error: err.message }));
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ phase: "idle", activities: [], result: null, error: null });
  }, []);

  return { state, execute, reset };
}
