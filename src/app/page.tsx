"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, Briefcase, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { EngagementCard } from "@/components/dashboard/EngagementCard";
import { InsightRow } from "@/components/dashboard/InsightRow";
import { SearchBar } from "@/components/dashboard/SearchBar";
import Logo from "@/components/logo/Logo";
import type { DashboardInsight, EngagementData, SuggestedAction } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;

const INSIGHTS: DashboardInsight[] = [
  { id: "i1", severity: "critical", headline: "Payroll Spike — Meridian Industrial", summary: "Payroll expense surged 34% in Q3 2023 vs prior year with no headcount change documented in workpapers.", category: "anomaly", actionLabel: "Investigate" },
  { id: "i2", severity: "warning", headline: "Revenue Softness — Hartwell Holdings", summary: "Net revenue declined 11% YoY in Oct–Nov 2023. Management commentary does not address seasonal drivers.", category: "revenue", actionLabel: "Add Follow-Up" },
  { id: "i3", severity: "warning", headline: "COGS Spike — Crestline Partners", summary: "Cost of goods sold increased 22% in Dec 2023 while revenue was flat — margin compression flag.", category: "cogs", actionLabel: "Review" },
  { id: "i4", severity: "info", headline: "AR Build-Up — Meridian Industrial", summary: "Accounts receivable increased $4.2M over 3 months with no new customer disclosures. Collectability risk.", category: "ar" },
];

const ENGAGEMENTS: EngagementData[] = [
  { id: "e1", client: "Meridian Industrial Solutions", type: "Quality of Earnings", progress: { survey: true, policy: true, competitive: false, synthesis: false }, lastActivity: "2 hours ago", industry: "Manufacturing" },
  { id: "e2", client: "Hartwell Holdings", type: "Transaction Diligence", progress: { survey: true, policy: false, competitive: false, synthesis: false }, lastActivity: "Yesterday", industry: "Real Estate" },
  { id: "e3", client: "Crestline Partners", type: "M&A Advisory", progress: { survey: true, policy: true, competitive: true, synthesis: false }, lastActivity: "3 days ago", industry: "Private Equity" },
];

const SUGGESTED_ACTIONS: SuggestedAction[] = [
  { client: "Meridian Industrial Solutions", label: "Ingest trial balance", detail: "Upload 36-month TB + workpapers for AI analysis", href: "/workflows/tb-ingestion" },
  { client: "Hartwell Holdings", label: "Review anomaly findings", detail: "8 flagged anomalies pending analyst review", href: "/workflows/anomaly-detection" },
  { client: "Crestline Partners", label: "Generate follow-up questions", detail: "Driver analysis complete — draft management questions", href: "/workflows/follow-up-questions" },
  { client: "Meridian Industrial Solutions", label: "Track open issues", detail: "5 critical issues require management response", href: "/workflows/issue-tracker" },
  { client: "Hartwell Holdings", label: "Draft diligence report", detail: "Export findings to Excel for partner review", href: "/workflows/report-drafting" },
];

export default function Dashboard() {
  const router = useRouter();
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [query, setQuery] = useState("");

  const displayed = showAllInsights ? INSIGHTS : INSIGHTS.slice(0, 3);

  return (
    <div className="px-4 py-5 sm:px-6 max-w-[1050px] mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-6rem)]">
        <div className="mb-4 flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-2xl font-semibold text-foreground">CohnReznick</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Welcome, <span className="text-primary">Rahul</span></h1>
        <p className="text-sm text-muted-foreground mt-2">Advisory Analyst — Transaction Diligence Intelligence Platform</p>
        <SearchBar
          query={query}
          onChange={setQuery}
          onSubmit={() => router.push("/workflows/tb-ingestion")}
          suggestedActions={SUGGESTED_ACTIONS}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-3 space-y-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Diligence Insights</h2>
            <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{INSIGHTS.length}</span>
          </div>
          <div className="glass-card rounded-xl p-1">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-0">
              {displayed.map((insight, idx) => <InsightRow key={insight.id} insight={insight} index={idx} />)}
            </motion.div>
            {!showAllInsights && INSIGHTS.length > 3 && (
              <button onClick={() => setShowAllInsights(true)} className="w-full py-1 text-[9px] font-medium text-primary hover:text-primary/80 transition-all flex items-center justify-center gap-1">
                Show all {INSIGHTS.length} insights <ChevronDown className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
            Active Engagements
            <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{ENGAGEMENTS.length}</span>
          </h2>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1.5">
            {ENGAGEMENTS.map((e) => (
              <EngagementCard key={e.id} engagement={e} onClick={() => router.push("/workflows/tb-ingestion")} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
