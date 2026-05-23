export interface CallToAction {
  title: string;
  description: string;
  impact: string;
  action_when_approved: string[];
  action_when_rejected: string[];
  suggestion_prompt: string;
  target_recipient: string;
  target_channel: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Pending" | "Approved" | "Executed" | "Dismissed";
}

export interface AnomalyFinding {
  finding_id: string;
  account_name: string;
  account_code: string;
  period: string;
  movement_type: string;
  delta_absolute: number;
  delta_percentage: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  source_reference: string;
  description: string;
  call_to_action: CallToAction;
}

export interface DriverAnalysis {
  driver_id: string;
  linked_finding_id: string;
  root_cause: string;
  supporting_evidence: string;
  cross_referenced_accounts: string[];
  confidence: "High" | "Medium" | "Low";
  call_to_action: CallToAction;
}

export interface FollowUpQuestion {
  question_id: string;
  question_text: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  target_audience: string;
  linked_finding_id: string;
  rationale: string;
  call_to_action: CallToAction;
}

export interface IssueTrackerItem {
  issue_id: string;
  account_name: string;
  account_code: string;
  period: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Under Review" | "Resolved" | "Dismissed";
  driver_summary: string;
  linked_finding_id: string;
  call_to_action: CallToAction;
}

export interface DataSummary {
  period_range: string;
  total_months: number;
  accounts_processed: number;
  total_entries: number;
  files_ingested: string[];
  account_categories: string[];
}

export interface AnalysisMetadata {
  source_files: string[];
  period_range: string;
  processed_at: string;
  session_id: string;
  agent_version: string;
}

export interface CohnReznickAnalysis {
  data_summary: DataSummary;
  anomaly_findings: AnomalyFinding[];
  driver_analysis: DriverAnalysis[];
  follow_up_questions: FollowUpQuestion[];
  issue_tracker: IssueTrackerItem[];
  metadata: AnalysisMetadata;
}

export type CtaStatus = "Pending" | "Approved" | "Dismissed";
export type CtaStatuses = Record<string, CtaStatus>;
