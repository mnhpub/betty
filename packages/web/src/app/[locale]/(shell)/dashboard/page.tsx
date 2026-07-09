import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { logout } from "./actions";
import MembershipChart from "@/components/MembershipChart";
import { Button, Grid, Column, Tile } from "@carbon/react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <Grid className="dashboard-page" fullWidth>
      <Column lg={16} md={8} sm={4}>
        <Tile style={{ marginBottom: "1rem" }}>
          <h1 style={{ marginBottom: "0.25rem" }}>Welcome, {user.name}</h1>
          <p style={{ color: "var(--cds-text-secondary)" }}>{user.email}</p>
          <form action={logout} style={{ marginTop: "1rem" }}>
            <Button kind="tertiary" type="submit" size="sm">
              Log out
            </Button>
          </form>
        </Tile>
      </Column>
      <Column lg={16} md={8} sm={4}>
        <Tile>
          <h3 style={{ marginBottom: "1rem" }}>Membership growth</h3>
          <MembershipChart />
        </Tile>
      </Column>
    </Grid>
  );
}
