"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Column, Grid, InlineNotification, PasswordInput, Stack, TextInput, Tile } from "@carbon/react";
import { signup, type AuthActionState } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

const initialState: AuthActionState = {};

export default function SignupForm({ locale, dict }: { locale: Locale; dict: Dictionary["auth"]["signup"] }) {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <Grid fullWidth style={{ minHeight: "100vh", alignContent: "center" }}>
      <Column lg={{ span: 6, offset: 5 }} md={{ span: 4, offset: 2 }} sm={4}>
        <Tile>
          <form action={formAction}>
            <Stack gap={5}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{dict.heading}</h1>

              <TextInput id="signup-name" name="name" type="text" labelText={dict.name} required />
              <TextInput id="signup-email" name="email" type="email" labelText={dict.email} required />
              <PasswordInput id="signup-password" name="password" labelText={dict.password} required minLength={8} />

              {state?.error && (
                <InlineNotification kind="error" title={state.error} hideCloseButton lowContrast />
              )}

              <Button type="submit" disabled={pending}>
                {pending ? dict.submitPending : dict.submit}
              </Button>

              <p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
                {dict.hasAccount}{" "}
                <Link href={`/${locale}/login`} style={{ color: "var(--cds-link-primary)", fontWeight: 500 }}>
                  {dict.loginLink}
                </Link>
              </p>
            </Stack>
          </form>
        </Tile>
      </Column>
    </Grid>
  );
}
