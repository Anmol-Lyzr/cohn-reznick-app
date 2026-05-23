"use client";

import { IconFile, IconFileSpreadsheet } from "@tabler/icons-react";
import { useAppSelector } from "@/lib/hooks";

export default function FileSystemPage() {
  const result = useAppSelector(s => s.analysis.result);

  const files = result?.metadata.source_files ?? [];

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">File System</h1>
        <p className="text-sm text-muted-foreground mt-1">Files ingested in the current analysis session.</p>
      </div>
      {files.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No files ingested yet. Run a TB analysis to see uploaded assets here.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl divide-y divide-border">
          {files.map(f => {
            const ext = f.split(".").pop()?.toLowerCase();
            return (
              <div key={f} className="flex items-center gap-3 px-4 py-3">
                {ext === "xlsx" || ext === "xls" || ext === "csv"
                  ? <IconFileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  : <IconFile className="w-5 h-5 text-blue-500 shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-foreground">{f}</p>
                  <p className="text-xs text-muted-foreground">Session: {result?.metadata.session_id}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
