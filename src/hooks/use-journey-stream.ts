"use client";

import { useState, useRef, useCallback } from "react";

export interface ActivityEvent {
  action: string;
  icon: string;
  ts: number;
  filePath?: string;
}

export interface JourneyState {
  isRunning: boolean;
  activities: ActivityEvent[];
  output: string;
  error: string | null;
}

export function useJourneyStream() {
  const [state, setState] = useState<JourneyState>({
    isRunning: false,
    activities: [],
    output: "",
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (skill: string, inputs: Record<string, unknown>, file?: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ isRunning: true, activities: [], output: "", error: null });

    try {
      const formData = new FormData();
      formData.append("skill", skill);
      formData.append("inputs", JSON.stringify(inputs));
      if (file) formData.append("document", file);

      const response = await fetch("/api/agent/journey/execute", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.text();
        setState(s => ({ ...s, isRunning: false, error: err }));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState(s => ({ ...s, isRunning: false, error: "No stream" }));
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
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "activity") {
                setState(s => ({ ...s, activities: [...s.activities, data as ActivityEvent] }));
              } else if (currentEvent === "delta") {
                setState(s => ({ ...s, output: s.output + (data.text as string) }));
              } else if (currentEvent === "done") {
                setState(s => ({ ...s, isRunning: false }));
              } else if (currentEvent === "error") {
                setState(s => ({ ...s, isRunning: false, error: data.error as string }));
              } else if (currentEvent === "generating") {
                setState(s => ({
                  ...s,
                  activities: [...s.activities, { action: (data.action as string) || "Generating deliverable...", icon: "cpu", ts: Date.now() }],
                }));
              }
            } catch { /* ignore parse errors */ }
            currentEvent = "";
          }
        }
      }

      setState(s => ({ ...s, isRunning: false }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setState(s => ({ ...s, isRunning: false, error: err.message }));
      }
    }
  }, []);

  const loadSampleData = useCallback((activities: ActivityEvent[], output: string) => {
    setState({ isRunning: false, activities, output, error: null });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ isRunning: false, activities: [], output: "", error: null });
  }, []);

  return { state, execute, reset, loadSampleData };
}
