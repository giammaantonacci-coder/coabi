"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Receipt, ShoppingBasket, User } from "lucide-react"
import { C } from "@/lib/constants"

const items = [
  { href: "/casa", label: "Casa", icon: Home },
  { href: "/spese", label: "Spese", icon: Receipt },
  { href: "/spesa", label: "Lista", icon: ShoppingBasket },
  { href: "/profilo", label: "Profilo", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 48px)",
        maxWidth: 360,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "0 8px 32px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.85)",
        display: "flex",
        padding: "8px 4px",
        zIndex: 40,
      }}
    >
      {items.map((it) => {
        const on = pathname.startsWith(it.href)
        const Icon = it.icon
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "6px 0",
              textDecoration: "none",
            }}
          >
            <Icon size={22} color={on ? C.sage : C.faint} strokeWidth={on ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? C.sage : C.faint }}>
              {it.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
