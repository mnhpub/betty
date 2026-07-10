"use client";

import { Grid, Column, Tile } from "@carbon/react";
import type { MemberJourney } from "@/lib/lms";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function formatEventType(eventType: string): string {
  return eventType.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatDataValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function JourneyTimeline({
  journey,
  dict,
}: {
  journey: MemberJourney | null;
  dict: Dictionary["journeys"];
}) {
  return (
    <Grid className="journeys-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>{dict.title}</h1>
        <p style={{ marginBottom: "0.25rem" }}>{dict.placeholder}</p>
        <p style={{ color: "var(--cds-text-secondary)", marginBottom: "1.5rem" }}>{dict.trackedAs}</p>

        {!journey ? (
          <Tile>
            <p>{dict.noData}</p>
          </Tile>
        ) : (
          <>
            <Tile style={{ marginBottom: "1.5rem" }}>
              <Grid narrow>
                <Column lg={8} md={4} sm={4}>
                  <p style={{ color: "var(--cds-text-secondary)" }}>{dict.summary.eventsLogged}</p>
                  <p style={{ fontSize: "2rem" }}>{journey.eventCount}</p>
                </Column>
                <Column lg={8} md={4} sm={4}>
                  <p style={{ color: "var(--cds-text-secondary)" }}>{dict.summary.currentVersion}</p>
                  <p style={{ fontSize: "2rem" }}>{journey.version}</p>
                </Column>
              </Grid>
            </Tile>

            <h2 style={{ marginBottom: "1rem" }}>{dict.timelineHeading}</h2>
            {journey.events
              .slice()
              .sort((a, b) => a.version - b.version)
              .map((event) => (
                <Tile key={event.version} style={{ marginBottom: "1rem" }}>
                  <p style={{ fontWeight: 600 }}>
                    {formatEventType(event.eventType)}{" "}
                    <span style={{ color: "var(--cds-text-secondary)", fontWeight: 400 }}>v{event.version}</span>
                  </p>
                  <dl style={{ marginTop: "0.5rem" }}>
                    {Object.entries(event.data).map(([key, value]) => (
                      <div key={key} style={{ display: "flex", gap: "0.5rem" }}>
                        <dt style={{ color: "var(--cds-text-secondary)", minWidth: "10rem" }}>{key}</dt>
                        <dd>{formatDataValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </Tile>
              ))}
          </>
        )}
      </Column>
    </Grid>
  );
}
