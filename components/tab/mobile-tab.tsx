"use client";

import type { TabItem } from "../navbar/tab-item";
import { AppMobileTab, type AppMobileTabProps } from "./app-mobile-tab";

export interface MobileNavProps extends AppMobileTabProps {
    navItems?: (TabItem & { active?: boolean })[];
    onChange?: (value: string) => void;
}

export type MobileTabProps = MobileNavProps;

/**
 * Standalone Mobile Tab / Navigation bar component.
 * Renders directly where placed in the DOM.
 * Useful when a page sets `hidden` on the layout mobile tab and wants to render
 * a custom mobile tab instance directly in its own hierarchy.
 */
export function MobileTab(props: MobileTabProps) {
    return <AppMobileTab standalone={props.standalone ?? true} {...props} />;
}

export default function MobileNav(props: MobileNavProps) {
    return <AppMobileTab standalone={props.standalone ?? true} {...props} />;
}

export { MobileNavItem, type MobileNavItemProps } from "./mobile-nav-item";
