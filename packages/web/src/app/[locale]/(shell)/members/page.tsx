import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Grid, Column, Tile } from "@carbon/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";

// Placeholder wireframe — real member profiles/history land with TPOF-3.
export default async function MembersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);

  return (
    <Grid className="members-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>{dict.members.title}</h1>
        <Tile>
          <p>{dict.members.placeholder}</p>
          <p style={{ color: "var(--cds-text-secondary)", marginTop: "0.5rem" }}>{dict.members.trackedAs}</p>
        </Tile>
      </Column>
    </Grid>
  );
}
