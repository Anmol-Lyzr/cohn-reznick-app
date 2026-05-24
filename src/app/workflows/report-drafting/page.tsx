"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/lib/hooks";
import { EmptyState } from "@/components/analysis/EmptyState";
import { IconDownload, IconFileSpreadsheet } from "@tabler/icons-react";
import type { CohnReznickAnalysis } from "@/types/analysis";

async function downloadExcel(result: CohnReznickAnalysis) {
  const xlsxMod = await import("xlsx");
  // xlsx is a CJS module; .default may or may not exist depending on the bundler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XLSX = (xlsxMod as any).default ?? xlsxMod;
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ["CohnReznick Advisory Analyst — Diligence Report"],
    [],
    ["Period Range", result.data_summary.period_range],
    ["Total Months", result.data_summary.total_months],
    ["Accounts Processed", result.data_summary.accounts_processed],
    ["Total Entries", result.data_summary.total_entries],
    ["Files Ingested", result.data_summary.files_ingested.join(", ")],
    ["Account Categories", result.data_summary.account_categories.join(", ")],
    [],
    ["Generated", result.metadata.processed_at],
    ["Agent Version", result.metadata.agent_version],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Anomaly Findings sheet
  const anomalyHeaders = ["Finding ID", "Account Name", "Account Code", "Period", "Movement Type", "Delta ($)", "Delta (%)", "Severity", "Description", "Source Reference"];
  const anomalyRows = result.anomaly_findings.map(f => [
    f.finding_id, f.account_name, f.account_code, f.period, f.movement_type,
    f.delta_absolute, f.delta_percentage, f.severity, f.description, f.source_reference,
  ]);
  const wsAnomalies = XLSX.utils.aoa_to_sheet([anomalyHeaders, ...anomalyRows]);
  XLSX.utils.book_append_sheet(wb, wsAnomalies, "Anomaly Findings");

  // Driver Analysis sheet
  const driverHeaders = ["Driver ID", "Linked Finding", "Root Cause", "Supporting Evidence", "Cross-Referenced Accounts", "Confidence"];
  const driverRows = result.driver_analysis.map(d => [
    d.driver_id, d.linked_finding_id, d.root_cause, d.supporting_evidence,
    d.cross_referenced_accounts.join("; "), d.confidence,
  ]);
  const wsDrivers = XLSX.utils.aoa_to_sheet([driverHeaders, ...driverRows]);
  XLSX.utils.book_append_sheet(wb, wsDrivers, "Driver Analysis");

  // Follow-Up Questions sheet
  const fupHeaders = ["Question ID", "Question Text", "Priority", "Target Audience", "Linked Finding", "Rationale"];
  const fupRows = result.follow_up_questions.map(q => [
    q.question_id, q.question_text, q.priority, q.target_audience, q.linked_finding_id, q.rationale,
  ]);
  const wsFUP = XLSX.utils.aoa_to_sheet([fupHeaders, ...fupRows]);
  XLSX.utils.book_append_sheet(wb, wsFUP, "Follow-Up Questions");

  // Issue Tracker sheet
  const issueHeaders = ["Issue ID", "Account Name", "Account Code", "Period", "Severity", "Status", "Driver Summary", "Linked Finding"];
  const issueRows = result.issue_tracker.map(i => [
    i.issue_id, i.account_name, i.account_code, i.period,
    i.severity, i.status, i.driver_summary, i.linked_finding_id,
  ]);
  const wsIssues = XLSX.utils.aoa_to_sheet([issueHeaders, ...issueRows]);
  XLSX.utils.book_append_sheet(wb, wsIssues, "Issue Tracker");

  XLSX.writeFile(wb, `CohnReznick_Diligence_Report_${result.data_summary.period_range.replace(/\s/g, "_")}.xlsx`);
}

export default function ReportDraftingPage() {
  const result = useAppSelector(s => s.analysis.result);

  const handleDownload = useCallback(() => {
    if (result) downloadExcel(result).catch(err => console.error("Excel download failed:", err));
  }, [result]);

  if (!result) {
    return <EmptyState title="No analysis results yet" description="Run a TB analysis to generate a downloadable diligence report." />;
  }

  const { data_summary, anomaly_findings, driver_analysis, follow_up_questions, issue_tracker } = result;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Report Drafting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Export the full diligence analysis to Excel for partner review.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          <IconDownload className="w-4 h-4" />
          Download Excel
        </button>
      </div>

      {/* Report preview */}
      <div className="glass-card rounded-xl divide-y divide-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <IconFileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">CohnReznick Diligence Report</p>
            <p className="text-xs text-muted-foreground">{data_summary.period_range} · {data_summary.files_ingested.join(", ")}</p>
          </div>
          <span className="text-xs text-muted-foreground">.xlsx</span>
        </div>

        {[
          { label: "Summary", rows: 1, description: `Period: ${data_summary.period_range} · ${data_summary.accounts_processed} accounts · ${data_summary.total_entries} entries` },
          { label: "Anomaly Findings", rows: anomaly_findings.length, description: `${anomaly_findings.filter(f => f.severity === "Critical").length} critical · ${anomaly_findings.filter(f => f.severity === "High").length} high` },
          { label: "Driver Analysis", rows: driver_analysis.length, description: `${driver_analysis.filter(d => d.confidence === "High").length} high confidence · ${driver_analysis.filter(d => d.confidence === "Medium").length} medium confidence` },
          { label: "Follow-Up Questions", rows: follow_up_questions.length, description: `${follow_up_questions.filter(q => q.priority === "Critical").length} critical · ${follow_up_questions.filter(q => q.priority === "High").length} high priority` },
          { label: "Issue Tracker", rows: issue_tracker.length, description: `${issue_tracker.filter(i => i.status === "Open").length} open · ${issue_tracker.filter(i => i.status === "Under Review").length} under review` },
        ].map(sheet => (
          <div key={sheet.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{sheet.label}</p>
              <p className="text-xs text-muted-foreground">{sheet.description}</p>
            </div>
            <span className="text-xs text-muted-foreground">{sheet.rows} row{sheet.rows !== 1 ? "s" : ""}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        The Excel workbook contains 5 sheets: Summary, Anomaly Findings, Driver Analysis, Follow-Up Questions, and Issue Tracker. Column widths and formatting are applied automatically.
      </p>
    </div>
  );
}
