import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/lib/session-actions";
import { getMemberJourney } from "@/lib/lms";
import { Button, Grid, Column, Tile } from "@carbon/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";

function formatEventType(eventType: string): string {
  return eventType.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatDataValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [dict, journey] = await Promise.all([getDictionary(locale), getMemberJourney()]);

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

      {journey && (
        <>
          <Column lg={16} md={8} sm={4}>
            <Tile style={{ marginBottom: "1rem" }}>
              <Grid narrow>
                <Column lg={8} md={4} sm={4}>
                  <p style={{ color: "var(--cds-text-secondary)", fontSize: "0.875rem" }}>Events Logged</p>
                  <p style={{ fontSize: "2rem", fontWeight: 600 }}>{journey.eventCount}</p>
                </Column>
                <Column lg={8} md={4} sm={4}>
                  <p style={{ color: "var(--cds-text-secondary)", fontSize: "0.875rem" }}>Current Version</p>
                  <p style={{ fontSize: "2rem", fontWeight: 600 }}>{journey.version}</p>
                </Column>
              </Grid>
            </Tile>
          </Column>

          <Column lg={16} md={8} sm={4}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Member Journey Timeline</h2>
            {journey.events
              .slice()
              .sort((a, b) => a.version - b.version)
              .map((event) => (
                <Tile key={event.version} style={{ marginBottom: "1rem" }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                    {formatEventType(event.eventType)}{" "}
                    <span style={{ color: "var(--cds-text-secondary)", fontWeight: 400 }}>v{event.version}</span>
                  </p>
                  <dl style={{ marginTop: "0.5rem" }}>
                    {Object.entries(event.data).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <dt style={{ color: "var(--cds-text-secondary)", minWidth: "11rem", fontSize: "0.875rem" }}>
                          {key}
                        </dt>
                        <dd style={{ fontSize: "0.875rem" }}>{formatDataValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </Tile>
              ))}
          </Column>
        </>
      )}
    </Grid>
  );
}
