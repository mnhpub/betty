import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
  Grid,
  Column,
  Tile,
} from "@carbon/react";
import { Bell, CircleUser } from "lucide-react";

const meta: Meta<typeof Header> = {
  title: "Header",
  component: Header,
};
export default meta;

type Story = StoryObj<typeof Header>;

const navItems = [
  { href: "#", label: "Dashboard" },
  { href: "#", label: "Groups" },
  { href: "#", label: "Members" },
];

export const Default: Story = {
  render: () => (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="Betty">
            <SkipToContent />
            <HeaderMenuButton
              aria-label="Toggle navigation"
              isActive={isSideNavExpanded}
              isCollapsible
              onClick={onClickSideNavExpand}
            />
            <HeaderName href="#" prefix="">
              Betty
            </HeaderName>
            <HeaderNavigation aria-label="Betty">
              {navItems.map((item, i) => (
                <HeaderMenuItem key={item.label} href={item.href} isActive={i === 0}>
                  {item.label}
                </HeaderMenuItem>
              ))}
            </HeaderNavigation>
            <HeaderGlobalBar>
              <HeaderGlobalAction aria-label="Notifications">
                <Bell size={20} />
              </HeaderGlobalAction>
              <HeaderGlobalAction aria-label="Account">
                <CircleUser size={20} />
              </HeaderGlobalAction>
            </HeaderGlobalBar>
          </Header>
          <SideNav aria-label="Side navigation" expanded={isSideNavExpanded} isFixedNav isChildOfHeader>
            <SideNavItems>
              {navItems.map((item, i) => (
                <SideNavLink key={item.label} href={item.href} isActive={i === 0}>
                  {item.label}
                </SideNavLink>
              ))}
            </SideNavItems>
          </SideNav>
          <Content>
            <Grid fullWidth>
              <Column lg={16} md={8} sm={4}>
                <Tile>
                  <h1>Welcome, Demo User</h1>
                </Tile>
              </Column>
            </Grid>
          </Content>
        </>
      )}
    />
  ),
};
