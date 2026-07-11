"use server";

import { revalidatePath } from "next/cache";
import { createJournalEntry } from "@/lib/audit";
import { currentLocale } from "@/lib/i18n/server-locale";

export async function addJournalEntryAction(input: {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: Record<string, unknown>;
}): Promise<{ error?: string }> {
  const result = await createJournalEntry(input);
  if (result.error) return result;
  revalidatePath(`/${await currentLocale()}/audit-log`);
  return {};
}
