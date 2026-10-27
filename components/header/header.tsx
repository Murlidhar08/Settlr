"use client";

import { AppHeader, type AppHeaderProps } from "./app-header";

export interface HeaderProps extends AppHeaderProps {
  isProfile?: boolean;
  isMobileList?: boolean;
}

/**
 * Standalone Header component.
 * Renders directly where placed in the DOM.
 * Useful when a page sets `hidden` on the layout header and wants to render
 * a custom header instance directly in its own page hierarchy.
 */
export function Header({
  isProfile,
  isMobileList,
  showProfile,
  showMobileNav,
  ...props
}: HeaderProps) {
  return (
    <AppHeader
      standalone={true}
      showProfile={showProfile ?? isProfile}
      showMobileNav={showMobileNav ?? isMobileList}
      {...props}
    />
  );
}


