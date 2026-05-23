"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  IconBuilding, IconArrowRight, IconFileSpreadsheet,
  IconAlertCircle, IconLoader2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { setResult } from "@/store/analysisSlice";
import type { CohnReznickAnalysis } from "@/types/analysis";

interface AnalysisSummary {
  _id: string;
  created_at: string;
  period_range: string;
  files_ingested: string[];
  uploaded_files: string[];
  total_months: number;
  accounts_processed: number;
  anomaly_count: number;
  issue_count: number;
}

function engagementTitle(summary: AnalysisSummary): string {
  const files = summary.uploaded_files?.length ? summary.uploaded_files : summary.files_ingested;
  if (!files?.length) return "Unnamed Engagement";
  return files[0]
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function CustomersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analyses")
      .then(r => r.json())
      .then(data => { setAnalyses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleOpen = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/analyses/${id}`);
      const doc = await res.json();
      dispatch(setResult(doc.result as CohnReznickAnalysis));
      router.push("/workflows/anomaly-detection");
    } catch (err) {
      console.error("Failed to load analysis:", err);
    } finally {
      setLoadingId(null);
    }
  }, [dispatch, router]);

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Customer Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Loading…" : `${analyses.length} saved ${analyses.length === 1 ? "analysis" : "analyses"}`}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconLoader2 className="w-4 h-4 animate-spin" />
          Loading saved analyses…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && analyses.length === 0 && (
        <div className="glass-card rounded-xl p-10 text-center space-y-3">
          <IconBuilding className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">No analyses saved yet</p>
          <p className="text-xs text-muted-foreground">Run a TB Ingestion analysis to populate this page.</p>
          <button
            onClick={() => router.push("/workflows/tb-ingestion")}
            className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Run Analysis →
          </button>
        </div>
      )}

      {analyses.length > 0 && (
        <div className="space-y-3">
          {analyses.map((a, i) => (
            <motion.button
              key={a._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleOpen(a._id)}
              disabled={!!loadingId}
              className="w-full glass-card rounded-xl p-4 text-left hover:border-primary/50 transition-colors group disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {loadingId === a._id
                    ? <IconLoader2 className="w-5 h-5 text-primary animate-spin" />
                    : <IconBuilding className="w-5 h-5 text-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{engagementTitle(a)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.period_range} · {a.total_months} months · {a.accounts_processed} accounts
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  {/* Source documents */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {(a.uploaded_files?.length ? a.uploaded_files : a.files_ingested)?.map(f => (
                      <span key={f} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                        <IconFileSpreadsheet className="w-3 h-3 text-emerald-500 shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Counts */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-medium">
                      {a.anomaly_count} anomalies
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                      {a.issue_count} issues
                    </span>
                  </div>
                </div>

                <IconArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
