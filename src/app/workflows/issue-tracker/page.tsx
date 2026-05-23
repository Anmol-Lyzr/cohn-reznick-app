"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useAppSelector } from "@/lib/hooks";
import { CtaCard } from "@/components/analysis/CtaCard";
import { EmptyState } from "@/components/analysis/EmptyState";
import type { IssueTrackerItem } from "@/types/analysis";

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-blue-100 text-blue-700",
};

const STATUS_BADGE: Record<string, string> = {
  Open: "bg-red-50 text-red-600 border-red-200",
  "Under Review": "bg-yellow-50 text-yellow-700 border-yellow-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Dismissed: "bg-muted text-muted-foreground border-border",
};

function IssueRow({ issue }: { issue: IssueTrackerItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">{issue.issue_id}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{issue.account_name}
            <span className="text-muted-foreground font-normal ml-1">({issue.account_code})</span>
          </p>
          <p className="text-xs text-muted-foreground">{issue.period}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_BADGE[issue.severity]}`}>
            {issue.severity}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_BADGE[issue.status]}`}>
            {issue.status}
          </span>
          {expanded ? <IconChevronUp className="w-4 h-4 text-muted-foreground" /> : <IconChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Driver Summary</p>
                <p className="text-sm text-foreground/80">{issue.driver_summary}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Linked finding: <span className="font-mono text-primary">{issue.linked_finding_id}</span></p>
              <CtaCard id={issue.issue_id} cta={issue.call_to_action} prefix={issue.issue_id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IssueTrackerPage() {
  const result = useAppSelector(s => s.analysis.result);

  if (!result) {
    return <EmptyState title="No analysis results yet" />;
  }

  const { issue_tracker } = result;
  const openCount = issue_tracker.filter(i => i.status === "Open").length;
  const criticalCount = issue_tracker.filter(i => i.severity === "Critical").length;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Issue Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {issue_tracker.length} issues tracked · {openCount} open · {criticalCount} critical
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["Open", "Under Review", "Resolved", "Dismissed"] as const).map(s => {
          const count = issue_tracker.filter(i => i.status === s).length;
          return (
            <div key={s} className={`glass-card rounded-lg p-3 text-center border ${STATUS_BADGE[s]}`}>
              <p className="text-xs font-semibold mb-1">{s}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {issue_tracker.map((issue, i) => (
          <motion.div
            key={issue.issue_id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <IssueRow issue={issue} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
