"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export type ActionResult = { error: string } | null

export async function createHouseAction(data: {
  address: string
  city: string
  roomLabel: string
  monthlyRent: number
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sessione scaduta, accedi di nuovo." }

  const admin = createAdminClient()

  const { data: house, error: houseErr } = await admin
    .from("houses")
    .insert({ address: data.address, city: data.city || null })
    .select()
    .single()

  if (houseErr || !house) {
    return { error: `[houses] ${houseErr?.code}: ${houseErr?.message}` }
  }

  const { error: memberErr } = await admin.from("house_members").insert({
    house_id: house.id,
    user_id: user.id,
    room_label: data.roomLabel || null,
    monthly_rent: data.monthlyRent,
  })

  if (memberErr) {
    return { error: `[house_members] ${memberErr.code}: ${memberErr.message}` }
  }

  redirect("/casa")
}

export async function joinHouseAction(data: {
  inviteCode: string
  roomLabel: string
  monthlyRent: number
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sessione scaduta, accedi di nuovo." }

  const admin = createAdminClient()

  const { data: house, error: houseErr } = await admin
    .from("houses")
    .select("id")
    .eq("invite_code", data.inviteCode.trim().toLowerCase())
    .single()

  if (houseErr || !house) {
    return { error: "Codice non trovato. Richiedi il codice al tuo coinquilino." }
  }

  const { error: memberErr } = await admin.from("house_members").insert({
    house_id: house.id,
    user_id: user.id,
    room_label: data.roomLabel || null,
    monthly_rent: data.monthlyRent,
  })

  if (memberErr) {
    if (memberErr.code === "23505") return { error: "Sei già membro di questa casa." }
    return { error: `[house_members] ${memberErr.code}: ${memberErr.message}` }
  }

  redirect("/casa")
}
