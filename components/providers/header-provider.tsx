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

function areMenuItemsEqual(a?: HeaderMenuItem[], b?: HeaderMenuItem[]) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every(
    (item, i) =>
      item.label === b[i].label &&
      item.destructive === b[i].destructive &&
      item.onClick === b[i].onClick &&
      item.icon === b[i].icon
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
    a.hidden === b.hidden &&
    a.className === b.className &&
    areMenuItemsEqual(a.menuItems, b.menuItems)
  );
}

export interface HeaderActionsContextType {
  setOverrideConfig: Dispatch<SetStateAction<HeaderConfig | null>>;
  resetHeaderConfig: () => void;
  setHeaderConfig: (config: Partial<HeaderConfig> | null) => void;
}

export interface HeaderContextType extends HeaderActionsContextType {
  headerConfig: HeaderConfig;
}

const HeaderValueContext = createContext<HeaderConfig>({});
const HeaderActionsContext = createContext<HeaderActionsContextType | null>(null);

/**
 * Access the active header configuration values (consumed by AppHeader in layout).
 */
export function useHeaderValue(): HeaderConfig {
  return useContext(HeaderValueContext);
}

/**
 * Access stable header modifier actions without triggering re-renders on header value changes.
 */
export function useHeaderActions(): HeaderActionsContextType {
  const ctx = useContext(HeaderActionsContext);
  if (!ctx) {
    throw new Error("useHeaderActions must be used within a HeaderProvider");
  }
  return ctx;
}

/**
 * Legacy combined hook returning both header values and actions.
 */
export function useHeader(): HeaderContextType | null {
  const actions = useContext(HeaderActionsContext);
  const headerConfig = useContext(HeaderValueContext);
  if (!actions) return null;
  return {
    ...actions,
    headerConfig,
  };
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [overrideConfig, setOverrideConfig] = useState<HeaderConfig | null>(null);

  // Synchronously reset page-specific overrides when route pathname changes during render
  // This eliminates 1-frame flashes of previous page header configs.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOverrideConfig(null);
  }

  const routeConfig = useMemo(() => getHeaderConfigForPath(pathname), [pathname]);

  const activeConfig = useMemo<HeaderConfig>(() => {
    if (!overrideConfig) return routeConfig;
    return {
      ...routeConfig,
      ...overrideConfig,
    };
  }, [routeConfig, overrideConfig]);

  const resetHeaderConfig = useCallback(() => {
    setOverrideConfig(null);
  }, []);

  const setHeaderConfig = useCallback((config: Partial<HeaderConfig> | null) => {
    if (!config) {
      setOverrideConfig(null);
      return;
    }
    setOverrideConfig((curr) => {
      const next = { ...(curr || {}), ...config };
      return areConfigsEqual(curr, next) ? curr : next;
    });
  }, []);

  const actions = useMemo<HeaderActionsContextType>(() => ({
    setOverrideConfig,
    resetHeaderConfig,
    setHeaderConfig,
  }), [resetHeaderConfig, setHeaderConfig]);

  return (
    <HeaderActionsContext.Provider value={actions}>
      <HeaderValueContext.Provider value={activeConfig}>
        {children}
      </HeaderValueContext.Provider>
    </HeaderActionsContext.Provider>
  );
}

/**
 * Hook to set or override the header config dynamically from any child page/component.
 * Consumes HeaderActionsContext only, so caller components do not re-render when header updates.
 * Safely guards against infinite re-renders by comparing prop values.
 */
export function useSetHeaderConfig(props: Partial<HeaderConfig>) {
  const actions = useContext(HeaderActionsContext);
  const prevRef = useRef<Partial<HeaderConfig> | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!actions) return;
    const prev = prevRef.current;
    const hasChanged =
      !prev ||
      prev.title !== props.title ||
      prev.description !== props.description ||
      prev.showBack !== props.showBack ||
      prev.backUrl !== props.backUrl ||
      prev.showProfile !== props.showProfile ||
      prev.showMobileNav !== props.showMobileNav ||
      prev.hidden !== props.hidden ||
      prev.className !== props.className ||
      !areMenuItemsEqual(prev.menuItems, props.menuItems);

    if (hasChanged) {
      prevRef.current = props;
      actions.setOverrideConfig((curr) => {
        const next = { ...(curr || {}), ...props };
        return areConfigsEqual(curr, next) ? curr : next;
      });
    }
  }, [
    actions,
    props.title,
    props.description,
    props.showBack,
    props.backUrl,
    props.showProfile,
    props.showMobileNav,
    props.hidden,
    props.className,
    props.menuItems,
  ]);
}
