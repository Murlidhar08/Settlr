"use client";

import { TabItem } from "@/components/navbar/tab-item";
import {
  getMobileTabConfigForPath,
  type MobileTabConfig,
} from "@/components/tab/mobile-tab-config";
import { usePathname } from "next/navigation";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function areNavItemsEqual(
  a?: (TabItem & { active?: boolean })[],
  b?: (TabItem & { active?: boolean })[]
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.id === b[i].id &&
      item.label === b[i].label &&
      item.href === b[i].href &&
      item.active === b[i].active &&
      item.badgeCount === b[i].badgeCount &&
      item.hidden === b[i].hidden
  );
}

function areConfigsEqual(
  a: MobileTabConfig | null,
  b: MobileTabConfig | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.hidden === b.hidden &&
    a.className === b.className &&
    a.showShade === b.showShade &&
    areNavItemsEqual(a.navItems, b.navItems)
  );
}

export interface MobileTabActionsContextType {
  setOverrideConfig: Dispatch<SetStateAction<MobileTabConfig | null>>;
  resetMobileTabConfig: () => void;
  setMobileTabConfig: (config: Partial<MobileTabConfig> | null) => void;
}

export interface MobileTabContextType extends MobileTabActionsContextType {
  mobileTabConfig: MobileTabConfig;
}

const MobileTabValueContext = createContext<MobileTabConfig>({});
const MobileTabActionsContext = createContext<MobileTabActionsContextType | null>(null);

export { MobileTabActionsContext, MobileTabValueContext };

/**
 * Access the active mobile tab configuration values (consumed by AppMobileTab in layout).
 */
export function useMobileTabValue(): MobileTabConfig {
  return useContext(MobileTabValueContext);
}

/**
 * Access stable mobile tab modifier actions without triggering re-renders on config value changes.
 */
export function useMobileTabActions(): MobileTabActionsContextType {
  const ctx = useContext(MobileTabActionsContext);
  if (!ctx) {
    throw new Error("useMobileTabActions must be used within a MobileTabProvider");
  }
  return ctx;
}

/**
 * Safely access mobile tab actions without throwing if provider is absent.
 * Does not re-render caller on mobile tab value updates.
 */
export function useMobileTabActionsContext(): MobileTabActionsContextType | null {
  return useContext(MobileTabActionsContext);
}

/**
 * Combined hook returning both mobile tab values and actions.
 * Returns null when used outside of MobileTabProvider.
 */
export function useMobileTab(): MobileTabContextType | null {
  const actions = useContext(MobileTabActionsContext);
  const mobileTabConfig = useContext(MobileTabValueContext);
  if (!actions) return null;
  return {
    ...actions,
    mobileTabConfig,
  };
}

export function MobileTabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [overrideConfig, setOverrideConfig] = useState<MobileTabConfig | null>(null);

  // Synchronously reset page-specific overrides when route pathname changes during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOverrideConfig(null);
  }

  const routeConfig = useMemo(
    () => getMobileTabConfigForPath(pathname),
    [pathname]
  );

  const activeConfig = useMemo<MobileTabConfig>(() => {
    if (!overrideConfig) return routeConfig;
    return {
      ...routeConfig,
      ...overrideConfig,
    };
  }, [routeConfig, overrideConfig]);

  const resetMobileTabConfig = useCallback(() => {
    setOverrideConfig(null);
  }, []);

  const setMobileTabConfig = useCallback(
    (config: Partial<MobileTabConfig> | null) => {
      if (!config) {
        setOverrideConfig(null);
        return;
      }
      setOverrideConfig((curr) => {
        const next = { ...(curr || {}), ...config };
        return areConfigsEqual(curr, next) ? curr : next;
      });
    },
    []
  );

  const actions = useMemo<MobileTabActionsContextType>(
    () => ({
      setOverrideConfig,
      resetMobileTabConfig,
      setMobileTabConfig,
    }),
    [resetMobileTabConfig, setMobileTabConfig]
  );

  return (
    <MobileTabActionsContext.Provider value={actions}>
      <MobileTabValueContext.Provider value={activeConfig}>
        {children}
      </MobileTabValueContext.Provider>
    </MobileTabActionsContext.Provider>
  );
}

/**
 * Hook to set or override the mobile tab config dynamically from any child page/component.
 * Consumes MobileTabActionsContext only, so caller components do not re-render when config updates.
 * Safely guards against infinite re-renders by comparing prop values.
 */
export function useSetMobileTabConfig(props: Partial<MobileTabConfig>) {
  const actions = useContext(MobileTabActionsContext);
  const prevRef = useRef<Partial<MobileTabConfig> | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!actions) return;
    const prev = prevRef.current;
    const hasChanged =
      !prev ||
      prev.hidden !== props.hidden ||
      prev.className !== props.className ||
      prev.showShade !== props.showShade ||
      !areNavItemsEqual(prev.navItems, props.navItems);

    if (hasChanged) {
      prevRef.current = props;
      actions.setOverrideConfig((curr) => {
        const next = { ...(curr || {}), ...props };
        return areConfigsEqual(curr, next) ? curr : next;
      });
    } else if (prev && prev.onChange !== props.onChange) {
      prevRef.current = props;
      actions.setOverrideConfig((curr) => {
        if (!curr) return curr;
        return { ...curr, onChange: props.onChange };
      });
    }
  }, [
    actions,
    props.hidden,
    props.className,
    props.showShade,
    props.navItems,
  ]);
}
