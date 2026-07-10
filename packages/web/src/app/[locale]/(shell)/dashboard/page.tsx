import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "./actions";
import MembershipChart from "@/components/MembershipChart";
import { Button, Grid, Column, Tile } from "@carbon/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);

  return (
    <Grid className="dashboard-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: "1rem" }}>
          <h1 style={{ marginBottom: "0.25rem" }}>{dict.dashboard.welcome.replace("{name}", user.name)}</h1>
          <p style={{ color: "var(--cds-text-secondary)" }}>{user.email}</p>
          <form action={logout} style={{ marginTop: "1rem" }}>
            <Button kind="tertiary" type="submit" size="sm">
              {dict.dashboard.logout}
            </Button>
          </form>
        </Tile>
      </Column>
      <Column lg={16} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: "1rem" }}>{dict.dashboard.membershipGrowth}</h3>
          <MembershipChart />
        </Tile>
      </Column>
    </Grid>
  );
}
