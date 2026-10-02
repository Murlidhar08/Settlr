"use client";

import {
  getHeaderConfigForPath,
  type HeaderConfig,
  type HeaderMenuItem,
} from "@/components/header/header-config";
import { usePathname } from "next/navigation";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function areMenuItemsEqual(a?: HeaderMenuItem[], b?: HeaderMenuItem[]) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.label === b[i].label &&
      item.destructive === b[i].destructive
  );
}

function areConfigsEqual(a: HeaderConfig | null, b: HeaderConfig | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.showBack === b.showBack &&
    a.backUrl === b.backUrl &&
    a.showProfile === b.showProfile &&
    a.showMobileNav === b.showMobileNav &&
    a.rightAction === b.rightAction &&
    areMenuItemsEqual(a.menuItems, b.menuItems)
  );
}

interface HeaderContextType {
  headerConfig: HeaderConfig;
  setOverrideConfig: Dispatch<SetStateAction<HeaderConfig | null>>;
  resetHeaderConfig: () => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function useHeader() {
  return useContext(HeaderContext);
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [overrideConfig, setOverrideConfig] = useState<HeaderConfig | null>(null);

  // Automatically reset any page-specific override when the route changes
  useEffect(() => {
    setOverrideConfig(null);
  }, [pathname]);

  const routeConfig = useMemo(() => getHeaderConfigForPath(pathname), [pathname]);

  const activeConfig = useMemo(() => {
    if (!overrideConfig) return routeConfig;
    return {
      ...routeConfig,
      ...overrideConfig,
    };
  }, [routeConfig, overrideConfig]);

  const resetHeaderConfig = () => {
    setOverrideConfig(null);
  };

  return (
    <HeaderContext.Provider
      value={{
        headerConfig: activeConfig,
        setOverrideConfig,
        resetHeaderConfig,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

/**
 * Hook to set or override the header config dynamically from any child page/component.
 * Safely guards against infinite re-renders by comparing prop values.
 */
export function useSetHeaderConfig(props: Partial<HeaderConfig>) {
  const ctx = useHeader();
  const prevRef = useRef<Partial<HeaderConfig> | null>(null);

  useEffect(() => {
    if (!ctx) return;
    const prev = prevRef.current;
    const hasChanged =
      !prev ||
      prev.title !== props.title ||
      prev.description !== props.description ||
      prev.showBack !== props.showBack ||
      prev.backUrl !== props.backUrl ||
      prev.showProfile !== props.showProfile ||
      prev.showMobileNav !== props.showMobileNav ||
      prev.rightAction !== props.rightAction ||
      !areMenuItemsEqual(prev.menuItems, props.menuItems);

    if (hasChanged) {
      prevRef.current = props;
      ctx.setOverrideConfig((curr) => {
        const next = { ...(curr || {}), ...props };
        return areConfigsEqual(curr, next) ? curr : next;
      });
    }
  }, [
    ctx,
    props.title,
    props.description,
    props.showBack,
    props.backUrl,
    props.showProfile,
    props.showMobileNav,
    props.rightAction,
    props.menuItems,
  ]);
}
