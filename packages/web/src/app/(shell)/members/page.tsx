import { Grid, Column, Tile } from "@carbon/react";

// Placeholder wireframe — real member profiles/history land with TPOF-3.
export default function MembersPage() {
  return (
    <Grid className="members-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <h1 style={{ marginBottom: "1rem" }}>Members</h1>
        <Tile>
          <p>Member profiles, membership history, and multi-group membership are not built yet.</p>
          <p style={{ color: "var(--cds-text-secondary)", marginTop: "0.5rem" }}>
            Tracked as TPOF-3 (Membership) in the backlog.
          </p>
        </Tile>
      </Column>
    </Grid>
  );
}
