"use client";

export default function SettingsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and preferences.</p>
      </div>
      <div className="glass-card rounded-xl divide-y divide-border">
        {[
          { label: "User", value: "Rahul Gattani · rahul@cohnreznick.com" },
          { label: "Agent ID", value: "6a11f4a2deec6496bac38e02" },
          { label: "Model", value: "gpt-4.1 · Temperature 0.2" },
          { label: "Session Mode", value: "Journey (single-run)" },
          { label: "Store Messages", value: "Enabled (PoC mode)" },
          { label: "Agent Version", value: "1.0.0" },
        ].map(row => (
          <div key={row.label} className="flex items-center gap-4 px-4 py-3">
            <p className="text-sm font-medium text-foreground w-36 shrink-0">{row.label}</p>
            <p className="text-sm text-muted-foreground font-mono">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
