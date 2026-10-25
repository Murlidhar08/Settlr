"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Printer,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { envClient } from "@/lib/env.client";

export interface LegalSection {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface LegalPageLayoutProps {
  type: "privacy" | "terms";
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: LegalSection[];
  children?: ReactNode;
}

export function LegalPageLayout({
  type,
  title,
  subtitle,
  badge,
  lastUpdated,
  effectiveDate,
  sections,
  children,
}: LegalPageLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // Scrollspy: track visible section during scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Copy anchor link
  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}${pathname}#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedSectionId(sectionId);
    toast.success("Section link copied to clipboard");
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  // Filter sections by search query
  const filteredSections = sections.filter((section) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-all duration-300">
                <Image
                  src="/images/logo/maskable_icon_x192.png"
                  alt={envClient.NEXT_PUBLIC_APP_NAME}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/75">
                {envClient.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>

            {/* Document Switcher Pill */}
            <nav className="hidden sm:flex items-center p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-semibold">
              <Link
                href={"/privacy-policy" as any}
                className={`px-3 py-1.5 rounded-lg transition-all ${type === "privacy"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Privacy Policy
              </Link>
              <Link
                href={"/terms-and-services" as any}
                className={`px-3 py-1.5 rounded-lg transition-all ${type === "terms"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Terms &amp; Services
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="hidden md:inline-flex rounded-xl text-xs font-bold gap-1.5 border-border/60 hover:bg-muted/60"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to</span> Sign In
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. HERO HEADER BANNER */}
      <section className="relative overflow-hidden border-b border-border/40 bg-linear-to-b from-primary/5 via-primary/2 to-transparent pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                {badge}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed font-medium">
                {subtitle}
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs font-medium text-muted-foreground shrink-0">
              <div className="flex items-center gap-1.5 bg-muted/50 border border-border/50 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Last Updated: <strong className="text-foreground">{lastUpdated}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 border border-border/50 px-3 py-1.5 rounded-xl">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Effective: <strong className="text-foreground">{effectiveDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search policy sections, keywords, rights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background/80 backdrop-blur-sm border-border/60 focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="p-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-3 px-3">
                  Table of Contents
                </h3>
                <nav className="space-y-1 text-sm">
                  {sections.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(section.id);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth" });
                            setActiveSection(section.id);
                          }
                        }}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all ${isActive
                            ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                      >
                        <span className="truncate pr-2">
                          <span className="text-xs font-mono mr-1.5 text-muted-foreground/70">
                            {idx + 1}.
                          </span>
                          {section.title}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive
                              ? "text-primary opacity-100 translate-x-0.5"
                              : "opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0"
                            }`}
                        />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Security highlight card in sidebar */}
              <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  Security Commitment
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {envClient.NEXT_PUBLIC_APP_NAME} implements multi-factor authentication, Passkeys, and strict OWASP security standards.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Legal Clauses & Sections */}
          <main className="lg:col-span-9 space-y-10">
            {children}

            {filteredSections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-xs hover:border-border transition-colors group space-y-5"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-xs font-mono">
                      {idx + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {section.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleCopyLink(section.id)}
                    title="Copy section link"
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  >
                    {copiedSectionId === section.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Section Body */}
                <div className="text-muted-foreground leading-relaxed space-y-4 text-sm sm:text-base font-normal">
                  {section.content}
                </div>
              </section>
            ))}

            {filteredSections.length === 0 && (
              <div className="text-center py-16 px-4 bg-muted/20 border border-border/50 rounded-3xl">
                <Search className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground">No matching clauses found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Try adjusting your search terms or clearing the filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-xl"
                >
                  Clear search
                </Button>
              </div>
            )}

            {/* Support / Legal Inquiry CTA Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                Questions or Concerns?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions about our {title.toLowerCase()} or wish to exercise any of your privacy rights, please reach out directly to our compliance and security department.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:legal@example.com"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Contact Legal Department &rarr;
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 4. FOOTER */}
      <footer className="border-t border-border/40 bg-card/40 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {envClient.NEXT_PUBLIC_APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href={"/privacy-policy" as any} className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link href={"/terms-and-services" as any} className="hover:text-foreground transition-colors">
              Terms &amp; Services
            </Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LegalPageLayout;
