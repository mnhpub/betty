"use client";

import Link from "next/link";
import { Button, Column, Grid, Stack } from "@carbon/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export default function HomeHero({ locale, dict }: { locale: Locale; dict: Dictionary["landing"] }) {
  return (
    <Grid fullWidth className="landing-page" style={{ minHeight: "100vh", alignContent: "center" }}>
      <Column lg={{ span: 8, offset: 4 }} md={{ span: 6, offset: 1 }} sm={4}>
        <Stack gap={6} orientation="vertical">
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>{dict.title}</h1>
            <p style={{ color: "var(--cds-text-secondary)", fontSize: "1.125rem" }}>{dict.subtitle}</p>
          </div>
          <Stack gap={4} orientation="horizontal" style={{ justifyContent: "center" }}>
            <Button href={`/${locale}/login`} as={Link}>
              {dict.login}
            </Button>
            <Button href={`/${locale}/signup`} as={Link} kind="tertiary">
              {dict.signup}
            </Button>
          </Stack>
        </Stack>
      </Column>
    </Grid>
  );
}
