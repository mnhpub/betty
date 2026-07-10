"use server";

import { revalidatePath } from "next/cache";
import { createGroup as createGroupApi } from "@/lib/groups";
import { currentLocale } from "@/lib/i18n/server-locale";

export async function createGroupAction(name: string, groupTypeId: string): Promise<{ error?: string }> {
  const result = await createGroupApi(name, groupTypeId);
  if (result.error) return result;
  revalidatePath(`/${await currentLocale()}/groups`);
  return {};
}
