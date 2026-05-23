"use client";

import { IconPlugConnected, IconCheck } from "@tabler/icons-react";

const INTEGRATIONS = [
  { name: "Lyzr Studio", status: "connected", description: "AI agent inference and asset management" },
  { name: "Microsoft Excel", status: "connected", description: "Trial balance ingestion via .xlsx upload" },
  { name: "Microsoft Word", status: "connected", description: "Workpaper extraction via .docx upload" },
  { name: "SharePoint", status: "configured", description: "Document library for workpaper storage" },
  { name: "NetSuite", status: "available", description: "Direct GL export integration" },
  { name: "QuickBooks", status: "available", description: "Trial balance direct sync" },
];

export default function IntegrationsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect external data sources and tools to the Advisory Analyst platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INTEGRATIONS.map(int => (
          <div key={int.name} className="glass-card rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <IconPlugConnected className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{int.name}</p>
                {int.status === "connected" && <IconCheck className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{int.description}</p>
              <span className={`text-[10px] font-medium mt-1.5 inline-block px-1.5 py-0.5 rounded ${
                int.status === "connected" ? "bg-emerald-100 text-emerald-700" :
                int.status === "configured" ? "bg-yellow-100 text-yellow-700" :
                "bg-muted text-muted-foreground"
              }`}>{int.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
