"use client";

import { IconBook, IconCheck } from "@tabler/icons-react";

const SKILLS = [
  { id: "anomaly-detection", name: "Anomaly Detection", description: "Detects statistical outliers, spikes, and unusual movements across 36-month trial balance data.", status: "active" },
  { id: "driver-analysis", name: "Driver Analysis", description: "Identifies root causes behind anomalies by cross-referencing related accounts and workpaper evidence.", status: "active" },
  { id: "follow-up-generation", name: "Follow-Up Question Generation", description: "Generates targeted management questions for each anomaly with priority and target audience.", status: "active" },
  { id: "issue-tracking", name: "Issue Tracking", description: "Compiles all identified issues into a structured tracker with severity, status, and resolution guidance.", status: "active" },
  { id: "qoe-normalisation", name: "QoE Normalisation", description: "Applies earnings normalisation adjustments for non-recurring items detected in the analysis.", status: "coming-soon" },
  { id: "working-capital", name: "Working Capital Analysis", description: "Calculates normalised working capital peg and identifies peg adjustments for the purchase agreement.", status: "coming-soon" },
];

export default function SkillsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Skills Library</h1>
        <p className="text-sm text-muted-foreground mt-1">AI skills powering the CohnReznick Advisory Analyst.</p>
      </div>
      <div className="space-y-3">
        {SKILLS.map(skill => (
          <div key={skill.id} className="glass-card rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <IconBook className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{skill.name}</p>
                {skill.status === "active" && <IconCheck className="w-3.5 h-3.5 text-emerald-500" />}
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ml-auto ${
                  skill.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>{skill.status === "active" ? "Active" : "Coming Soon"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
