import type { ReactNode } from "react";

export interface SidePanelItem {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  badgeClassName?: string;
  content: ReactNode;
  hidden?: boolean;
}

export interface SidePanelGroup {
  id?: string;
  title?: string;
  items: SidePanelItem[];
}

export interface SidePanelLayoutProps {
  /** Grouped sidepanel items */
  groups?: SidePanelGroup[];
  /** Flat list of items (rendered as a single group) */
  items?: SidePanelItem[];
  /** Default active part ID when none is specified in URL */
  defaultPart?: string;
  /** Back button text for small devices (e.g. "Settings" or "Back") */
  backLabel?: string;
  /** URL query parameter name (defaults to "part") */
  paramName?: string;
  /** Container CSS classes */
  className?: string;
  /** Sidepanel container CSS classes */
  sidePanelClassName?: string;
  /** Content area CSS classes */
  contentClassName?: string;
  /** Callback fired when the active part changes */
  onPartChange?: (partId: string) => void;
}
