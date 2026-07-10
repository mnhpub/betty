"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
} from "@carbon/react";
import { Bell, CircleUser } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

export default function AppShell({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Dictionary["nav"];
}) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}/dashboard`, label: dict.dashboard },
    { href: `/${locale}/groups`, label: dict.groups },
    { href: `/${locale}/members`, label: dict.members },
  ];

  return (
    <HeaderContainer
      render={({
        isSideNavExpanded,
        onClickSideNavExpand,
      }: {
        isSideNavExpanded: boolean;
        onClickSideNavExpand: () => void;
      }) => (
        <>
          <Header aria-label="Betty">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={dict.toggleNavigation}
              isActive={isSideNavExpanded}
              isCollapsible
              onClick={onClickSideNavExpand}
            />
            <HeaderName href={`/${locale}/dashboard`} prefix="" as={Link}>
              Betty
            </HeaderName>
            <HeaderNavigation aria-label="Betty">
              {navItems.map((item) => (
                <HeaderMenuItem key={item.href} href={item.href} isActive={pathname === item.href} as={Link}>
                  {item.label}
                </HeaderMenuItem>
              ))}
            </HeaderNavigation>
            <HeaderGlobalBar>
              <HeaderGlobalAction aria-label={dict.notifications}>
                <Bell size={20} />
              </HeaderGlobalAction>
              <HeaderGlobalAction aria-label={dict.account}>
                <CircleUser size={20} />
              </HeaderGlobalAction>
              <LanguageSwitcher locale={locale} label={dict.changeLanguage} />
            </HeaderGlobalBar>
          </Header>
          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            isFixedNav
            isChildOfHeader
          >
            <SideNavItems>
              {navItems.map((item) => (
                <SideNavLink key={item.href} href={item.href} isActive={pathname === item.href} as={Link}>
                  {item.label}
                </SideNavLink>
              ))}
            </SideNavItems>
          </SideNav>
          <Content>{children}</Content>
        </>
      )}
    />
  );
}
