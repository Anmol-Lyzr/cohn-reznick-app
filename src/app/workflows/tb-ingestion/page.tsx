"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUpload, IconFile, IconFileSpreadsheet, IconX,
  IconPlayerPlay, IconCheck, IconAlertCircle, IconFlask,
} from "@tabler/icons-react";
import { useAnalysisStream } from "@/hooks/use-analysis-stream";
import { useAppDispatch } from "@/lib/hooks";
import { setResult } from "@/store/analysisSlice";
import type { CohnReznickAnalysis } from "@/types/analysis";

const ALLOWED_EXTS = new Set(["xlsx", "xls", "csv", "doc", "docx"]);

function isAllowed(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTS.has(ext);
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "csv" || ext === "xls") return <IconFileSpreadsheet className="w-4 h-4 text-emerald-600" />;
  return <IconFile className="w-4 h-4 text-blue-500" />;
}

const ICON_MAP: Record<string, string> = {
  upload: "⬆", cloud: "☁", table: "📊", file: "📄", calendar: "📅",
  cpu: "🧠", search: "🔍", "git-branch": "🌿", "message-question": "❓",
  "list-check": "✅", check: "✓",
};

export default function TBIngestionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { state, execute, reset } = useAnalysisStream();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedResultRef = useRef<CohnReznickAnalysis | null>(null);

  useEffect(() => {
    if (state.phase === "complete" && state.result && state.result !== savedResultRef.current) {
      savedResultRef.current = state.result;
      dispatch(setResult(state.result));
      fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: state.result,
          uploaded_files: files.map(f => f.name),
        }),
      }).catch(err => console.error("Failed to save analysis:", err));
    }
  }, [state.phase, state.result, dispatch, files]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(isAllowed);
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...arr.filter(f => !names.has(f.name))];
    });
  }, []);

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const isComplete = state.phase === "complete";
  const isRunning = state.phase === "running";
  const hasError = state.phase === "error";

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">TB Ingestion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a 36-month trial balance (Excel/CSV) and supporting workpapers (Word). The AI agent will detect anomalies, analyse drivers, and generate a full diligence output.
        </p>
      </div>

      {state.phase === "idle" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/*
            sr-only: position:absolute + clip — NOT display:none.
            display:none blocks programmatic .click() in Safari/WebKit.
            No htmlFor/id — prevents Playwright and assistive tech from
            auto-activating the picker outside of an explicit user click.
          */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.doc,.docx"
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            onChange={handleInputChange}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none ${
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <IconUpload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Accepts .xlsx, .xls, .csv, .doc, .docx</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <FileIcon name={f.name} />
                    <span className="text-sm font-medium text-foreground">{f.name}</span>
                    <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeFile(f.name); }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => execute(files, false)}
              disabled={files.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IconPlayerPlay className="w-4 h-4" />
              Run Analysis
            </button>
            <button
              onClick={() => execute(files, true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-muted text-foreground font-medium text-sm hover:bg-muted/70 border border-border transition-colors"
            >
              <IconFlask className="w-4 h-4" />
              Load Sample Data
            </button>
          </div>
        </motion.div>
      )}

      {(isRunning || isComplete || hasError) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              {isRunning ? "Analysis in Progress…" : isComplete ? "Analysis Complete" : "Analysis Failed"}
            </h2>
            {state.activities.map((act, i) => (
              <motion.div
                key={`${act.ts}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2.5 text-sm"
              >
                <span className="text-base">{ICON_MAP[act.icon] ?? "•"}</span>
                <span className={i === state.activities.length - 1 && isRunning ? "text-primary font-medium" : "text-muted-foreground"}>
                  {act.action}
                </span>
                {(i < state.activities.length - 1 || !isRunning) ? (
                  <IconCheck className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                ) : (
                  <span className="ml-auto inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </motion.div>
            ))}
          </div>

          {hasError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isComplete && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2">
                  <IconCheck className="w-4 h-4" />
                  Analysis complete — results saved. Navigate to any workflow to review findings.
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => router.push("/workflows/anomaly-detection")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    View Anomaly Findings →
                  </button>
                  <button onClick={() => router.push("/workflows/driver-analysis")} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 border border-border transition-colors">
                    Driver Analysis
                  </button>
                  <button onClick={() => router.push("/workflows/follow-up-questions")} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 border border-border transition-colors">
                    Follow-Up Questions
                  </button>
                  <button onClick={() => router.push("/workflows/issue-tracker")} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 border border-border transition-colors">
                    Issue Tracker
                  </button>
                  <button onClick={reset} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/70 border border-border transition-colors">
                    Run Again
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {hasError && (
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/70 border border-border transition-colors">
              Try Again
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
