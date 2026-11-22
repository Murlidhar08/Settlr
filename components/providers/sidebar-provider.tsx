"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export interface SidebarContextType {
  /** Whether the desktop sidebar is currently collapsed (w-16 vs w-64) */
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  /** Whether the mobile menu drawer is open */
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  /** Toggles mobile drawer on mobile (<1024px), or desktop sidebar collapse on desktop (>=1024px) */
  toggleSidebar: () => void;
  /** Explicitly open mobile menu */
  openMobileMenu: () => void;
  /** Explicitly close mobile menu */
  closeMobileMenu: () => void;
}

const defaultContext: SidebarContextType = {
  isCollapsed: true,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleSidebar: () => {},
  openMobileMenu: () => {},
  closeMobileMenu: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultContext);

export interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({
  children,
  defaultCollapsed = true,
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, []);

  const openMobileMenu = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isCollapsed,
      setIsCollapsed,
      isMobileOpen,
      setIsMobileOpen,
      toggleSidebar,
      openMobileMenu,
      closeMobileMenu,
    }),
    [isCollapsed, isMobileOpen, toggleSidebar, openMobileMenu, closeMobileMenu]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  return useContext(SidebarContext);
}
