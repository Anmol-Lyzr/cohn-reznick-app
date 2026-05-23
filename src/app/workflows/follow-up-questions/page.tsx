"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/lib/hooks";
import { CtaCard } from "@/components/analysis/CtaCard";
import { EmptyState } from "@/components/analysis/EmptyState";

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function FollowUpQuestionsPage() {
  const result = useAppSelector(s => s.analysis.result);

  if (!result) {
    return <EmptyState title="No analysis results yet" />;
  }

  const { follow_up_questions } = result;

  return (
    <div className="px-4 py-6 sm:px-6 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-playfair">Follow-Up Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {follow_up_questions.length} management question{follow_up_questions.length !== 1 ? "s" : ""} generated for diligence response.
        </p>
      </div>

      <div className="space-y-4">
        {follow_up_questions.map((q, i) => (
          <motion.div
            key={q.question_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{q.question_id}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[q.priority]}`}>
                    {q.priority}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto">→ {q.linked_finding_id}</span>
                </div>
                <blockquote className="text-sm font-medium text-foreground border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-r">
                  {q.question_text}
                </blockquote>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">For</p>
                <p className="text-xs text-foreground">{q.target_audience}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Rationale</p>
                <p className="text-xs text-foreground/80">{q.rationale}</p>
              </div>
            </div>

            <CtaCard id={q.question_id} cta={q.call_to_action} prefix={q.question_id} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
