"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Receipt, ShoppingBasket, User } from "lucide-react"
import { C } from "@/lib/constants"

const items = [
  { href: "/casa", label: "Casa", icon: Home },
  { href: "/spese", label: "Spese", icon: Receipt },
  { href: "/spesa", label: "Spesa", icon: ShoppingBasket },
  { href: "/profilo", label: "Profilo", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 412,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderTop: `1px solid ${C.line}`,
        display: "flex",
        padding: "8px 8px 22px",
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
            <Icon size={22} color={on ? C.sageDeep : C.faint} strokeWidth={on ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? C.sageDeep : C.faint }}>
              {it.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
