"use client"

import { memo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Plus, Receipt, ShoppingBasket, User } from "lucide-react"
import { C } from "@/lib/constants"

const leftItems = [
  { href: "/casa", label: "Casa", icon: Home },
  { href: "/spese", label: "Spese", icon: Receipt },
]
const rightItems = [
  { href: "/spesa", label: "Lista", icon: ShoppingBasket },
  { href: "/profilo", label: "Profilo", icon: User },
]
const allItems = [...leftItems, ...rightItems]

function NavItem({ href, label, icon: Icon, on }: { href: string; label: string; icon: React.ElementType; on: boolean }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "6px 0",
        textDecoration: "none",
        minHeight: 44,
        justifyContent: "center",
      }}
    >
      <Icon size={22} color={on ? C.sage : C.faint} strokeWidth={on ? 2.4 : 2} />
      <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.sage : C.faint }}>
        {label}
      </span>
    </Link>
  )
}

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname()
  const showFab = pathname.startsWith("/spese") || pathname.startsWith("/spesa")

  function handleFab() {
    window.dispatchEvent(new CustomEvent("coabi-fab"))
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom) + 20px)",
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
        alignItems: "center",
        padding: "8px 4px",
        zIndex: 40,
        overflow: "visible",
      }}
    >
      {showFab ? (
        <>
          {leftItems.map((it) => (
            <NavItem key={it.href} href={it.href} label={it.label} icon={it.icon} on={pathname.startsWith(it.href)} />
          ))}
          <div style={{ position: "relative", width: 60, flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 44 }}>
            <button
              onClick={handleFab}
              aria-label="Aggiungi"
              style={{
                transform: "translateY(-14px)",
                width: 52,
                height: 52,
                borderRadius: 18,
                background: C.coral,
                color: "#fff",
                border: "2.5px solid rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(255,90,60,.40)",
                flexShrink: 0,
              }}
            >
              <Plus size={22} />
            </button>
          </div>
          {rightItems.map((it) => (
            <NavItem key={it.href} href={it.href} label={it.label} icon={it.icon} on={pathname.startsWith(it.href)} />
          ))}
        </>
      ) : (
        allItems.map((it) => (
          <NavItem key={it.href} href={it.href} label={it.label} icon={it.icon} on={pathname.startsWith(it.href)} />
        ))
      )}
    </div>
  )
})
