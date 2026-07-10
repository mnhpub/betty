## Betty design system — build conventions

This is IBM Carbon Design System (`@carbon/react`), scoped to the 11 components Betty's web app actually uses. Real, shipped code — build with it exactly as documented below.

### Wrapping and setup

Every screen must be wrapped in `GlobalTheme` (ships in the bundle, no separate component folder — it's the root theme provider):

```jsx
const { GlobalTheme, Grid, Column, Tile } = window.Carbon;

<GlobalTheme theme="g10">
  <Grid fullWidth>
    <Column lg={16} md={8} sm={4}>
      <Tile>…</Tile>
    </Column>
  </Grid>
</GlobalTheme>
```

Without `GlobalTheme`, components render with no color/spacing tokens applied — broken, not just unstyled-looking. Betty uses the `g10` theme (light gray background) — always pass `theme="g10"` unless the design explicitly calls for a different Carbon theme (`white`, `g90`, `g100`).

Layout follows Carbon's 16-column grid: `Grid` → `Column` (with `lg`/`md`/`sm` span props) → content. Don't build custom flexbox/grid layouts when `Grid`/`Column`/`Stack` cover the case — `Stack` (`orientation="vertical"|"horizontal"`, `gap={n}`) is the idiom for simple stacked/inline spacing between elements, not manual margins.

### Styling idiom

No utility classes and no manual CSS — Carbon components carry their own styling internally and read from CSS custom properties (design tokens) for anything theme-level. Reference real token names when you need a raw value outside a component (e.g. custom text color): `var(--cds-text-secondary)`, `var(--cds-background)`, `var(--cds-border-subtle)`, `var(--cds-link-primary)`, `var(--cds-support-error)`. Full token list is in `styles.css`'s import closure — grep `_ds_bundle.css` for `--cds-` to see every available name before inventing one.

Icons are NOT part of this design system — Betty uses `lucide-react` for icons (`Plus`, `Bell`, `CircleUser` are the ones in current use), passed as components via props like `Button`'s `renderIcon`, never imported from Carbon.

### Where the truth lives

Read `_ds_bundle.css` (via `styles.css`'s `@import` chain) before styling anything — token names and component CSS are both there, verbatim from upstream Carbon. Per-component usage and prop examples live in `components/misc/<Name>/<Name>.prompt.md` — read the specific component's prompt file before composing it; the `.d.ts` alongside it has the exact prop types.

### Idiomatic build snippet

A real Betty pattern — a card with a heading, secondary text, and an action button, Carbon's actual idiom (verified against a synced preview):

```jsx
const { GlobalTheme, Grid, Column, Tile, Stack, Button } = window.Carbon;

<GlobalTheme theme="g10">
  <Grid fullWidth>
    <Column lg={16} md={8} sm={4}>
      <Tile>
        <Stack gap={5}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Welcome, Demo User</h1>
          <p style={{ color: "var(--cds-text-secondary)" }}>demo@example.com</p>
          <Button kind="tertiary" size="sm">Log out</Button>
        </Stack>
      </Tile>
    </Column>
  </Grid>
</GlobalTheme>
```
