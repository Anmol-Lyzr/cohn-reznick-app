"use client";

import { IconCheck, IconX, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCtaStatus } from "@/store/analysisSlice";
import type { CallToAction } from "@/types/analysis";

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

interface CtaCardProps {
  id: string;
  cta: CallToAction;
  prefix?: string;
}

export function CtaCard({ id, cta, prefix = "" }: CtaCardProps) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(s => s.analysis.ctaStatuses[id]) ?? cta.status;
  const [expanded, setExpanded] = useState(false);

  const isApproved = status === "Approved";
  const isDismissed = status === "Dismissed";
  const isPending = !isApproved && !isDismissed;

  return (
    <div className={`rounded-lg border p-3 text-sm transition-all ${
      isApproved ? "border-emerald-200 bg-emerald-50" :
      isDismissed ? "border-border bg-muted/40 opacity-60" :
      "border-border bg-card"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[cta.priority]}`}>
              {cta.priority}
            </span>
            {prefix && <span className="text-[10px] text-muted-foreground font-mono">{prefix}</span>}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isApproved ? "bg-emerald-100 text-emerald-700" :
              isDismissed ? "bg-muted text-muted-foreground" :
              "bg-primary/10 text-primary"
            }`}>{status}</span>
          </div>
          <p className="font-medium text-foreground leading-snug">{cta.title}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{cta.description}</p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
        >
          {expanded ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 pt-2 border-t border-border">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Impact</p>
            <p className="text-xs text-foreground">{cta.impact}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">If Approved</p>
            <ul className="space-y-0.5">
              {cta.action_when_approved.map((a, i) => (
                <li key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                  <IconCheck className="w-3 h-3 mt-0.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">If Rejected</p>
            <ul className="space-y-0.5">
              {cta.action_when_rejected.map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <IconX className="w-3 h-3 mt-0.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">To</p>
            <p className="text-xs text-foreground">{cta.target_recipient} · {cta.target_channel}</p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex gap-2 mt-3 pt-2 border-t border-border">
          <button
            onClick={() => dispatch(setCtaStatus({ id, status: "Approved" }))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
          >
            <IconCheck className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => dispatch(setCtaStatus({ id, status: "Dismissed" }))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/70 border border-border transition-colors"
          >
            <IconX className="w-3.5 h-3.5" />
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
