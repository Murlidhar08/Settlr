"use client";

import { useEffect } from "react";

/**
 * Prevents pinch-in and pinch-out gestures on mobile/PWA devices
 * to maintain a native application feel and avoid unwanted viewport scaling.
 */
export function PwaPinchZoomPreventer() {
  useEffect(() => {
    // Prevent iOS WebKit gesture zoom (pinch and rotate)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // Prevent multi-touch pinch zooming while preserving standard single-touch scrolling
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("gesturestart", handleGesture, { passive: false });
    document.addEventListener("gesturechange", handleGesture, { passive: false });
    document.addEventListener("gestureend", handleGesture, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", handleGesture);
      document.removeEventListener("gesturechange", handleGesture);
      document.removeEventListener("gestureend", handleGesture);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return null;
}

