"use client";

import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">📂</div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description ?? "Run a TB analysis first to populate this page."}
        </p>
      </div>
      <Link
        href="/workflows/tb-ingestion"
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Go to TB Ingestion →
      </Link>
    </div>
  );
}
