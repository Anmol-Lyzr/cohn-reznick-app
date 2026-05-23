"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/lib/hooks";
import { CtaCard } from "@/components/analysis/CtaCard";
import { EmptyState } from "@/components/analysis/EmptyState";

const CONFIDENCE_STYLES: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-muted text-muted-foreground",
};

export default function DriverAnalysisPage() {
  const result = useAppSelector(s => s.analysis.result);

  if (!result) {
    return <EmptyState title="No analysis results yet" />;
  }

  const { driver_analysis } = result;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Driver Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {driver_analysis.length} root cause{driver_analysis.length !== 1 ? "s" : ""} identified across linked anomaly findings.
        </p>
      </div>

      <div className="space-y-4">
        {driver_analysis.map((driver, i) => (
          <motion.div
            key={driver.driver_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">{driver.driver_id}</span>
                  <span className="text-[10px] text-muted-foreground">→ links to</span>
                  <span className="text-[10px] font-mono text-primary font-medium">{driver.linked_finding_id}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ml-auto ${CONFIDENCE_STYLES[driver.confidence]}`}>
                    {driver.confidence} confidence
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">Root Cause</h3>
                <p className="text-sm text-foreground/80 mt-1">{driver.root_cause}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Supporting Evidence</p>
                <p className="text-sm text-foreground/80">{driver.supporting_evidence}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cross-Referenced Accounts</p>
                <div className="flex flex-wrap gap-1.5">
                  {driver.cross_referenced_accounts.map(acc => (
                    <span key={acc} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <CtaCard id={driver.driver_id} cta={driver.call_to_action} prefix={driver.driver_id} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
