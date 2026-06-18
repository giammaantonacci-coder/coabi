"use client"

import { createContext, useContext, useEffect } from "react"
import type { Profile, House, MemberWithProfile } from "@/lib/types"
import { BottomNav } from "@/components/BottomNav"
import { createClient } from "@/lib/supabase/client"

interface HouseContextValue {
  user: { id: string; email?: string }
  profile: Profile
  house: House
  currentMember: MemberWithProfile
}

const HouseContext = createContext<HouseContextValue | null>(null)

export function useHouse(): HouseContextValue {
  const ctx = useContext(HouseContext)
  if (!ctx) throw new Error("useHouse must be used within AppShell")
  return ctx
}

interface AppShellProps {
  user: { id: string; email?: string }
  profile: Profile
  house: House
  currentMember: MemberWithProfile
  children: React.ReactNode
}

export default function AppShell({ user, profile, house, currentMember, children }: AppShellProps) {
  useEffect(() => {
    const rm = localStorage.getItem("coabi_rm")
    if (rm === "0" && !sessionStorage.getItem("coabi_ss")) {
      createClient().auth.signOut().then(() => {
        window.location.href = "/auth/login"
      })
    } else {
      sessionStorage.setItem("coabi_ss", "1")
    }
  }, [])

  return (
    <HouseContext.Provider value={{ user, profile, house, currentMember }}>
      <div
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 412,
            minHeight: "100vh",
            background: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(0,0,0,.18)",
          }}
        >
          {children}
          <BottomNav />
        </div>
      </div>
    </HouseContext.Provider>
  )
}
