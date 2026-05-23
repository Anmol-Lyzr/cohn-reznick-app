"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/lib/hooks";
import { CtaCard } from "@/components/analysis/CtaCard";
import { EmptyState } from "@/components/analysis/EmptyState";

const SEVERITY_STYLES: Record<string, string> = {
  Critical: "border-l-red-500 bg-red-50/50",
  High: "border-l-orange-400 bg-orange-50/50",
  Medium: "border-l-yellow-400 bg-yellow-50/50",
  Low: "border-l-blue-400 bg-blue-50/50",
};

const SEVERITY_BADGE: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-blue-100 text-blue-700",
};

export default function AnomalyDetectionPage() {
  const result = useAppSelector(s => s.analysis.result);

  if (!result) {
    return <EmptyState title="No analysis results yet" />;
  }

  const { anomaly_findings, data_summary } = result;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Anomaly Detection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {anomaly_findings.length} anomalies detected across {data_summary.accounts_processed} accounts for {data_summary.period_range}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["Critical", "High", "Medium", "Low"] as const).map(sev => {
          const count = anomaly_findings.filter(f => f.severity === sev).length;
          return (
            <div key={sev} className="glass-card rounded-lg p-3 text-center">
              <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${SEVERITY_BADGE[sev]}`}>{sev}</p>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {anomaly_findings.map((finding, i) => (
          <motion.div
            key={finding.finding_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl border-l-4 p-4 space-y-3 ${SEVERITY_STYLES[finding.severity]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SEVERITY_BADGE[finding.severity]}`}>
                    {finding.severity}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{finding.finding_id}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{finding.movement_type}</span>
                </div>
                <h3 className="font-semibold text-foreground">{finding.account_name}
                  <span className="text-muted-foreground font-normal ml-1.5 text-sm">({finding.account_code})</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{finding.period}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-foreground">
                  {finding.delta_percentage > 0 ? "+" : ""}{finding.delta_percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {finding.delta_absolute >= 0 ? "+$" : "-$"}{Math.abs(finding.delta_absolute).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/80">{finding.description}</p>
            <p className="text-xs text-muted-foreground font-mono">Source: {finding.source_reference}</p>

            <CtaCard id={finding.finding_id} cta={finding.call_to_action} prefix={finding.finding_id} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
