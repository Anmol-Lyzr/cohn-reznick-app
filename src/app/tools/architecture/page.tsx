"use client";

export default function ArchitecturePage() {
  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Agent Architecture</h1>
        <p className="text-sm text-muted-foreground mt-1">System design of the CohnReznick Advisory Agent pipeline.</p>
      </div>
      <div className="glass-card rounded-xl p-6 font-mono text-xs text-muted-foreground space-y-1 leading-relaxed">
        <p className="text-foreground font-semibold mb-3">End-to-end data flow</p>
        <p>Browser  ──▶  POST /api/agent/execute  (multipart: files[])</p>
        <p>                │</p>
        <p>                ├─▶  Lyzr Assets API  (upload trial balance + workpapers)</p>
        <p>                │       └─▶  asset_id[] returned</p>
        <p>                │</p>
        <p>                ├─▶  Lyzr Inference Stream API  (agent_id: 6a11f4a2...)</p>
        <p>                │       ├─▶  assets: [asset_id, ...]</p>
        <p>                │       └─▶  message: &quot;Analyse TB and workpapers...&quot;</p>
        <p>                │</p>
        <p>                ├─▶  SSE stream: activity events  ──▶  UI pipeline view</p>
        <p>                └─▶  SSE done event: JSON result  ──▶  Redux store</p>
        <p className="mt-3 text-foreground font-semibold">Agent output schema</p>
        <p>CohnReznickAnalysis</p>
        <p>  ├── data_summary</p>
        <p>  ├── anomaly_findings[]  (each with embedded call_to_action)</p>
        <p>  ├── driver_analysis[]   (each with embedded call_to_action)</p>
        <p>  ├── follow_up_questions[] (each with embedded call_to_action)</p>
        <p>  ├── issue_tracker[]     (each with embedded call_to_action)</p>
        <p>  └── metadata</p>
      </div>
    </div>
  );
}
