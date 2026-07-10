import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listGroups, listGroupTypes } from "@/lib/groups";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";
import GroupsTable from "./GroupsTable";

export default async function GroupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [groups, groupTypes, dict] = await Promise.all([
    listGroups(),
    listGroupTypes(),
    getDictionary(locale),
  ]);

  return <GroupsTable groups={groups} groupTypes={groupTypes} dict={dict.groups} />;
}
