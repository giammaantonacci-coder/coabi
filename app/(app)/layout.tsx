import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AppShell from "./AppShell"
import type { MemberWithProfile } from "@/lib/types"

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: memberData } = await supabase
    .from("house_members")
    .select("*, houses(*), profiles!user_id(*)")
    .eq("user_id", user.id)
    .is("left_at", null)
    .single()

  if (!memberData) redirect("/onboarding")

  const profileData = memberData.profiles

  const currentMember: MemberWithProfile = {
    ...memberData,
    houses: undefined,
    profiles: undefined,
    profile: {
      full_name: profileData?.full_name ?? "Utente",
      avatar_color: profileData?.avatar_color ?? "#5C7E70",
    },
    short: initials(profileData?.full_name ?? "U"),
  }

  return (
    <AppShell
      user={{ id: user.id, email: user.email }}
      profile={profileData}
      house={memberData.houses}
      currentMember={currentMember}
    >
      {children}
    </AppShell>
  )
}
