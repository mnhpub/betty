"use client";

import { usePathname, useRouter } from "next/navigation";
import { OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { LOCALE_LABELS, setLocaleCookie, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

const flagStyle: React.CSSProperties = {
  display: "inline-block",
  width: "1.25rem",
  height: "0.9rem",
  borderRadius: "2px",
};

export default function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    const rest = pathname.replace(new RegExp(`^/${locale}`), "");
    router.push(`/${next}${rest}`);
  }

  function CurrentFlagIcon(props: { className?: string }) {
    return <span {...props} className={`${props.className ?? ""} fi fi-${LOCALE_LABELS[locale].flag}`} style={flagStyle} />;
  }

  return (
    <OverflowMenu aria-label={label} iconDescription={label} renderIcon={CurrentFlagIcon} size="lg" flipped>
      {SUPPORTED_LOCALES.map((l) => (
        <OverflowMenuItem
          key={l}
          itemText={
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className={`fi fi-${LOCALE_LABELS[l].flag}`} style={flagStyle} />
              {LOCALE_LABELS[l].name}
            </span>
          }
          onClick={() => switchTo(l)}
        />
      ))}
    </OverflowMenu>
  );
}
