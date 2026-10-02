"use client"

import { envClient } from "@/lib/env.client"
import clsx from "clsx"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ProfileAvatar from "../user/profile-avatar"
import { useNavItems } from "../navbar/use-nav-items"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"

interface HeaderProps {
  title: string
  isProfile?: boolean
  isMobileList?: boolean
}

const Header = ({ title, isProfile = true, isMobileList = false }: HeaderProps) => {
  const pathname = usePathname()
  const navItems = useNavItems()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground px-4 sm:px-6 border-b border-border shadow-sm"
    >
      <div className="w-1/4 sm:w-1/3 flex items-center gap-2">
        <Link href="/" className="lg:hidden">
          <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-xl bg-accent/10 border border-border/50">
            <Image src="/images/logo/light_logo.png" alt="Logo" width={22} height={22} className="dark:hidden" />
            <Image src="/images/logo/dark_logo.png" alt="Logo" width={22} height={22} className="hidden dark:block" />
          </div>
        </Link>
      </div>

      <div className="flex-1 flex justify-center overflow-hidden">
        <h1 className="text-xl font-black tracking-normal sm:text-2xl lg:text-3xl bg-linear-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>

      <div className="w-1/4 sm:w-1/3 flex justify-end items-center gap-2">
        {isProfile && (
          <ProfileAvatar />
        )}

        {/* Need desktop nav for mobile devices */}
        {isMobileList && (
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl h-9 w-9">
                  <Menu size={22} />
                </Button>
              } />
              <SheetContent side="right"
                className="w-full! h-full! sm:max-w-[70vw]! lg:max-w-[35vw]! border-l-0 sm:border-l p-2 px-6 flex flex-col overflow-hidden bg-background/90! backdrop-blur-md!">
                <SheetHeader className="mb-6 px-2">
                  <SheetTitle className="flex items-center gap-3 text-sidebar-foreground text-left font-black tracking-tighter text-2xl">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center relative rounded-xl bg-sidebar-accent/10">
                      <Image src="/images/logo/light_logo.png" alt="Logo" width={28} height={28} className="dark:hidden" />
                      <Image src="/images/logo/dark_logo.png" alt="Logo" width={28} height={28} className="hidden dark:block" />
                    </div>
                    {envClient.NEXT_PUBLIC_APP_NAME}
                  </SheetTitle>
                </SheetHeader>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href as any}
                        className={clsx(
                          "group flex items-center gap-4 rounded-xl px-4 py-3 font-semibold transition-all duration-200",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-indigo-500/10"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm tracking-wide">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </motion.header>
  )
}

export { Header }

