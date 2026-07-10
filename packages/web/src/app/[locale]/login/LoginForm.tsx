"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Column, Grid, InlineNotification, PasswordInput, Stack, TextInput, Tile } from "@carbon/react";
import { login, demoLogin, type AuthActionState } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

const initialState: AuthActionState = {};

export default function LoginForm({ locale, dict }: { locale: Locale; dict: Dictionary["auth"]["login"] }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [demoState, demoFormAction, demoPending] = useActionState(demoLogin, initialState);

  return (
    <Grid fullWidth style={{ minHeight: "100vh", alignContent: "center" }}>
      <Column lg={{ span: 6, offset: 5 }} md={{ span: 4, offset: 2 }} sm={4}>
        <Stack gap={6}>
          <Tile>
            <form action={formAction}>
              <Stack gap={5}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{dict.heading}</h1>

                <TextInput id="login-email" name="email" type="email" labelText={dict.email} required />
                <PasswordInput id="login-password" name="password" labelText={dict.password} required />

                {state?.error && (
                  <InlineNotification kind="error" title={state.error} hideCloseButton lowContrast />
                )}

                <Button type="submit" disabled={pending}>
                  {pending ? dict.submitPending : dict.submit}
                </Button>

                <p style={{ fontSize: "0.875rem", color: "var(--cds-text-secondary)" }}>
                  {dict.noAccount}{" "}
                  <Link href={`/${locale}/signup`} style={{ color: "var(--cds-link-primary)", fontWeight: 500 }}>
                    {dict.signupLink}
                  </Link>
                </p>
              </Stack>
            </form>
          </Tile>

          <form action={demoFormAction}>
            <Stack gap={3}>
              {demoState?.error && (
                <InlineNotification kind="error" title={demoState.error} hideCloseButton lowContrast />
              )}
              <Button type="submit" kind="tertiary" disabled={demoPending} style={{ width: "100%" }}>
                {demoPending ? dict.demoPending : dict.demo}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Column>
    </Grid>
  );
}
