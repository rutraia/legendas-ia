"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
// Substituir por <a> já que não é Next.js
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  // Garantir que items é um array válido
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const [activeTab, setActiveTab] = useState(items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Ordena os itens conforme a sequência da página principal
  const order = ["Home", "Funcionamento", "Sobre", "Planos", "FAQ"];
  const normalized = (str: string) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const menuItemsRaw = items.some(item => normalized(item.name) === "funcionamento")
    ? items.map(item =>
        normalized(item.name) === "funcionamento"
          ? { ...item, url: "#como-funciona" }
          : item
      )
    : [
        ...items,
        {
          name: "Funcionamento",
          url: "#como-funciona",
          icon: items[0]?.icon || (() => null),
        },
      ];
  // Ordena conforme a sequência desejada
  const menuItems = [...menuItemsRaw].sort((a, b) => {
    const ia = order.findIndex(o => normalized(o) === normalized(a.name));
    const ib = order.findIndex(o => normalized(o) === normalized(b.name));
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div
      className={cn(
        "w-full flex justify-center py-4",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-950/60 to-gray-900/60 border border-primary/30 backdrop-blur-md py-2 px-2 rounded-2xl shadow-xl card-glow">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors border border-transparent",
                "text-white/90 hover:text-primary",
                isActive
                  ? "bg-primary/90 text-white border-primary shadow-lg"
                  : "bg-gray-900/80 hover:bg-primary/20 hover:border-primary/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon className="h-5 w-5" />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/30 rounded-full blur-[2px] -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}
