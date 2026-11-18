export { default as AppTabs } from "./app-tabs";
export { AppMobileTab, type AppMobileTabProps } from "./app-mobile-tab";
export { PageMobileTab, type PageMobileTabProps } from "./page-mobile-tab";
export {
  default as MobileNav,
  MobileTab,
  MobileNavItem,
  type MobileNavProps,
  type MobileTabProps,
  type MobileNavItemProps,
} from "./mobile-tab";
export {
  getMobileTabConfigForPath,
  mobileTabRoutesConfig,
  type MobileTabConfig,
  type MobileTabRouteRule,
} from "./mobile-tab-config";
export {
  MobileTabProvider,
  useMobileTab,
  useSetMobileTabConfig,
  useMobileTabValue,
  useMobileTabActions,
  useMobileTabActionsContext,
  type MobileTabContextType,
  type MobileTabActionsContextType,
} from "../providers/mobile-tab-provider";

