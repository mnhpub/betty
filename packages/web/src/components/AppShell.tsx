"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  Content,
} from "@carbon/react";
import { Notification, UserAvatar } from "@carbon/icons-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/groups", label: "Groups" },
  { href: "/members", label: "Members" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header aria-label="Betty">
        <SkipToContent />
        <HeaderName href="/dashboard" prefix="" as={Link}>
          Betty
        </HeaderName>
        <HeaderNavigation aria-label="Betty">
          {navItems.map((item) => (
            <HeaderMenuItem
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
              as={Link}
            >
              {item.label}
            </HeaderMenuItem>
          ))}
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Notifications">
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Account">
            <UserAvatar size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <SideNav aria-label="Side navigation" isFixedNav expanded>
        <SideNavItems>
          {navItems.map((item) => (
            <SideNavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
              as={Link}
            >
              {item.label}
            </SideNavLink>
          ))}
        </SideNavItems>
      </SideNav>
      <Content>{children}</Content>
    </>
  );
}
