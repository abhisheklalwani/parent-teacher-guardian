import type { GenerateMessagesResult } from "@/lib/generate-messages";
import type { Suggestion } from "@/lib/suggestions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type StoredOutreach = {
  generated_at: string;
  suggestions: Suggestion[];
  students_not_contacted: GenerateMessagesResult["students_not_contacted"];
};

type BatchRow = {
  id: string;
  generated_at: string;
  students_not_contacted: GenerateMessagesResult["students_not_contacted"];
};

type SuggestionRow = {
  student_id: string;
  student_name: string;
  type: Suggestion["type"];
  reason: string;
  evidence: string[];
  subject: string;
  draft: string;
  guardian_name: string;
  guardian_email: string;
};

export async function getLatestSuggestions(
  classId: string,
): Promise<StoredOutreach | null> {
  const supabase = getSupabaseServerClient();

  const { data: batch, error: batchError } = await supabase
    .from("outreach_batches")
    .select("id, generated_at, students_not_contacted")
    .eq("class_id", classId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (batchError) {
    throw new Error(`Failed to load outreach batch: ${batchError.message}`);
  }
  if (!batch) return null;

  const batchRow = batch as BatchRow;

  const { data: rows, error: suggestionsError } = await supabase
    .from("outreach_suggestions")
    .select(
      "student_id, student_name, type, reason, evidence, subject, draft, guardian_name, guardian_email",
    )
    .eq("batch_id", batchRow.id)
    .order("student_id", { ascending: true });

  if (suggestionsError) {
    throw new Error(
      `Failed to load outreach suggestions: ${suggestionsError.message}`,
    );
  }

  const suggestions: Suggestion[] = ((rows ?? []) as SuggestionRow[]).map(
    (row) => ({
      id: row.student_id,
      studentName: row.student_name,
      type: row.type,
      reason: row.reason,
      evidence: row.evidence ?? [],
      subject: row.subject,
      draft: row.draft,
      guardianName: row.guardian_name,
      guardianEmail: row.guardian_email,
    }),
  );

  return {
    generated_at: batchRow.generated_at,
    suggestions,
    students_not_contacted: batchRow.students_not_contacted ?? [],
  };
}

export async function saveSuggestions(
  classId: string,
  result: GenerateMessagesResult,
  suggestions: Suggestion[],
): Promise<StoredOutreach> {
  const supabase = getSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("outreach_batches")
    .delete()
    .eq("class_id", classId);

  if (deleteError) {
    throw new Error(
      `Failed to clear previous outreach batch: ${deleteError.message}`,
    );
  }

  const { data: batch, error: insertBatchError } = await supabase
    .from("outreach_batches")
    .insert({
      class_id: classId,
      generated_at: result.generated_at,
      students_not_contacted: result.students_not_contacted ?? [],
    })
    .select("id, generated_at, students_not_contacted")
    .single();

  if (insertBatchError || !batch) {
    throw new Error(
      `Failed to save outreach batch: ${insertBatchError?.message ?? "no row returned"}`,
    );
  }

  const batchRow = batch as BatchRow;

  if (suggestions.length > 0) {
    const { error: insertSuggestionsError } = await supabase
      .from("outreach_suggestions")
      .insert(
        suggestions.map((suggestion) => ({
          batch_id: batchRow.id,
          student_id: suggestion.id,
          student_name: suggestion.studentName,
          type: suggestion.type,
          reason: suggestion.reason,
          evidence: suggestion.evidence,
          subject: suggestion.subject,
          draft: suggestion.draft,
          guardian_name: suggestion.guardianName,
          guardian_email: suggestion.guardianEmail,
        })),
      );

    if (insertSuggestionsError) {
      throw new Error(
        `Failed to save outreach suggestions: ${insertSuggestionsError.message}`,
      );
    }
  }

  return {
    generated_at: batchRow.generated_at,
    suggestions,
    students_not_contacted: batchRow.students_not_contacted ?? [],
  };
}
