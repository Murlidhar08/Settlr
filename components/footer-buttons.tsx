"use client"

import { envClient } from "@/lib/env.client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface FooterButtonsProp {
  children: ReactNode
  bottomSpace?: boolean
}

const FooterButtons = ({ children, bottomSpace = false }: FooterButtonsProp) => {
  const isSpaceNeed = envClient.NEXT_PUBLIC_BOTTOM_NAV == true || bottomSpace;
  return (
    <div className={`fixed right-5 ${isSpaceNeed ? "bottom-20" : "bottom-5"} lg:bottom-5 lg:right-10 z-50`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto mx-auto flex justify-end gap-2 md:gap-4"
      >
        {children}
      </motion.div>
    </div>
  )
}

export { FooterButtons }

