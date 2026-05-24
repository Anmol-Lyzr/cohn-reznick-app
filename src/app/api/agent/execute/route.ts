import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const LYZR_API_KEY = process.env.LYZR_API_KEY!;
const LYZR_AGENT_ID = process.env.LYZR_AGENT_ID!;
const LYZR_USER_ID = process.env.LYZR_USER_ID!;
const LYZR_BASE = "https://agent-prod.studio.lyzr.ai/v3";

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);

  const res = await fetch(
    `${LYZR_BASE}/assets/upload?parser_provider=lyzr_parse&parsing_mode=full&enable_vlm=false&vlm_provider=openai&vlm_model=gpt-4o&extract_tables=true&describe_images=false&chunking_strategy=hybrid`,
    {
      method: "POST",
      headers: { "x-api-key": LYZR_API_KEY },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asset upload failed: ${res.status} ${text}`);
  }

  const raw = await res.text();
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error(`Upload response not JSON: ${raw.slice(0, 300)}`); }

  // Lyzr returns { results: [{ asset_id }] } | { asset_id } | [{ asset_id }] | { data: ... }
  function extractAssetId(v: unknown): string | undefined {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return extractAssetId(v[0]);
    if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      return (o.asset_id ?? o.id ?? o.assetId
        ?? extractAssetId(o.results)
        ?? extractAssetId(o.data)) as string | undefined;
    }
  }

  const assetId = extractAssetId(data);
  if (!assetId) throw new Error(`No asset_id in upload response: ${raw.slice(0, 400)}`);
  return assetId;
}

const ACTIVITIES = [
  { action: "Receiving uploaded files...", icon: "upload" },
  { action: "Uploading trial balance to Lyzr asset store...", icon: "cloud" },
  { action: "Uploading workpaper documents...", icon: "cloud" },
  { action: "Parsing financial data from Excel...", icon: "table" },
  { action: "Extracting workpaper context...", icon: "file" },
  { action: "Building 36-month period index...", icon: "calendar" },
  { action: "Sending to CohnReznick Advisory Agent...", icon: "cpu" },
  { action: "Running anomaly detection across accounts...", icon: "search" },
  { action: "Performing driver analysis...", icon: "git-branch" },
  { action: "Generating follow-up questions...", icon: "message-question" },
  { action: "Building issue tracker...", icon: "list-check" },
  { action: "Finalising analysis output...", icon: "check" },
];

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const close = () => {
        if (!closed) { closed = true; controller.close(); }
      };
      const send = (event: string, data: unknown) => {
        if (!closed) controller.enqueue(encoder.encode(sse(event, data)));
      };

      try {
        const formData = await req.formData();
        send("activity", { ...ACTIVITIES[0], ts: Date.now() });

        const files = formData.getAll("files") as File[];
        const useSample = formData.get("sample") === "true";

        if (useSample) {
          for (let i = 1; i < ACTIVITIES.length; i++) {
            await new Promise(r => setTimeout(r, 500));
            send("activity", { ...ACTIVITIES[i], ts: Date.now() });
          }
          const { SAMPLE_ANALYSIS } = await import("@/lib/sample-data");
          send("done", { result: SAMPLE_ANALYSIS });
          return;
        }

        if (!files.length) {
          send("error", { error: "No files provided" });
          return;
        }

        // Upload files and collect asset IDs
        const assetIds: string[] = [];
        for (let i = 0; i < files.length; i++) {
          send("activity", { ...ACTIVITIES[Math.min(i + 1, 2)], ts: Date.now() });
          await new Promise(r => setTimeout(r, 200));
          const assetId = await uploadFile(files[i]);
          assetIds.push(assetId);
        }

        send("activity", { ...ACTIVITIES[3], ts: Date.now() });
        await new Promise(r => setTimeout(r, 300));
        send("activity", { ...ACTIVITIES[4], ts: Date.now() });
        await new Promise(r => setTimeout(r, 300));
        send("activity", { ...ACTIVITIES[5], ts: Date.now() });
        await new Promise(r => setTimeout(r, 300));
        send("activity", { ...ACTIVITIES[6], ts: Date.now() });

        const sessionId = `${LYZR_AGENT_ID}-${Math.random().toString(36).slice(2, 14)}`;

        const inferRes = await fetch(`${LYZR_BASE}/inference/stream/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "x-api-key": LYZR_API_KEY,
          },
          body: JSON.stringify({
            user_id: LYZR_USER_ID,
            agent_id: LYZR_AGENT_ID,
            session_id: sessionId,
            message: "Analyse the uploaded trial balance and workpaper files. Detect anomalies, perform driver analysis, generate follow-up questions, and build the issue tracker. Return a complete structured JSON response.",
            assets: assetIds,
          }),
        });

        if (!inferRes.ok) {
          const text = await inferRes.text();
          send("error", { error: `Inference failed: ${inferRes.status} ${text}` });
          return;
        }

        // Show inference-phase activities sequentially, each exactly once, 6s apart
        let stepIdx = 0;
        const inferenceSteps = [7, 8, 9, 10];
        const activityInterval = setInterval(() => {
          if (stepIdx < inferenceSteps.length) {
            send("activity", { ...ACTIVITIES[inferenceSteps[stepIdx]], ts: Date.now() });
            stepIdx++;
          }
          if (stepIdx >= inferenceSteps.length) clearInterval(activityInterval);
        }, 6000);

        const reader = inferRes.body?.getReader();
        if (!reader) {
          clearInterval(activityInterval);
          send("error", { error: "No response stream from agent" });
          return;
        }

        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";
        let doneStreaming = false;

        while (!doneStreaming) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            // Strip trailing \r only — preserve leading spaces which are part of
            // JSON string values (e.g. " Dec" in "Jan-2024 to Dec-2025").
            const raw = line.slice(6).replace(/\r$/, "");
            const trimmed = raw.trim();
            if (!trimmed || trimmed === "[DONE]") {
              if (trimmed === "[DONE]") doneStreaming = true;
              continue;
            }
            // Always append raw token — do not JSON.parse individual tokens.
            // Number/bool/null tokens (e.g. "36", "true", "[]") are valid JSON
            // but have no delta.content, causing them to be silently dropped
            // which produces malformed accumulated JSON.
            fullText += raw;
          }
        }

        clearInterval(activityInterval);
        send("activity", { ...ACTIVITIES[11], ts: Date.now() });

        // Lyzr streams with backslash-escaped quotes (\"); always unescape.
        // The regex handles both \" → " and \\ → \ in one pass.
        const unescaped = fullText.replace(/\\(["\\])/g, "$1");

        const jsonMatch = unescaped.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          send("error", { error: `Agent returned no JSON (${fullText.length} chars). Preview: ${unescaped.slice(0, 300)}` });
          return;
        }

        let result: unknown;
        const candidate = jsonMatch[0];
        try {
          result = JSON.parse(candidate);
        } catch {
          // Recovery: the LLM occasionally emits lone backslashes before characters
          // that aren't valid JSON escape sequences (e.g. \: or \, from formatting).
          // Fix them by doubling the backslash so JSON.parse sees a literal backslash.
          // Valid escapes are: " \ / b f n r t u — leave those untouched.
          const fixed = candidate.replace(/\\([^"\\\/bfnrtu0-9])/g, "\\\\$1");
          try {
            result = JSON.parse(fixed);
          } catch (e2) {
            send("error", { error: `JSON parse failed: ${(e2 as Error).message}. Preview: ${candidate.slice(0, 300)}` });
            return;
          }
        }
        send("done", { result });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send("error", { error: message });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
