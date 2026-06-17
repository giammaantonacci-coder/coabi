"use client"

import { useEffect, useState } from "react"
import { Check, Plus, ShoppingBasket } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useHouse } from "@/app/(app)/AppShell"
import { C, addPill, card, inputStyle, primaryBtn } from "@/lib/constants"
import { r2 } from "@/lib/finance"
import { Backdrop, SheetHead } from "@/components/Sheet"
import type { MemberWithProfile, ShoppingItem } from "@/lib/types"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ["#5C7E70", "#CF5F49", "#CC8E2E"]

function AddItemSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (item: string, tag: "comune" | "personale") => Promise<void>
}) {
  const [item, setItem] = useState("")
  const [tag, setTag] = useState<"comune" | "personale">("comune")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!item.trim()) return
    setLoading(true)
    await onSubmit(item.trim(), tag)
    setLoading(false)
  }

  const options: { id: "comune" | "personale"; label: string; sub: string }[] = [
    { id: "comune", label: "Comune", sub: "diviso tra tutti" },
    { id: "personale", label: "Personale", sub: "la pago io" },
  ]

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Cosa serve?" onClose={onClose} />
      <input
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Es. carta igienica, latte…"
        style={inputStyle}
        autoFocus
      />
      <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 700, margin: "16px 2px 8px", letterSpacing: ".03em" }}>
        CHI LA PAGA?
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {options.map((o) => {
          const on = tag === o.id
          return (
            <button
              key={o.id}
              onClick={() => setTag(o.id)}
              style={{
                flex: 1, textAlign: "left", padding: "12px 14px", borderRadius: 15, cursor: "pointer",
                background: on ? (o.id === "comune" ? C.sageSoft : C.honeySoft) : C.card,
                border: `1.5px solid ${on ? (o.id === "comune" ? C.sage : C.honey) : C.line}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.label}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{o.sub}</div>
            </button>
          )
        })}
      </div>
      <button
        disabled={!item.trim() || loading}
        onClick={handleSubmit}
        style={{ ...primaryBtn, opacity: item.trim() && !loading ? 1 : 0.4 }}
      >
        {loading ? "Aggiunta…" : "Aggiungi alla lista"}
      </button>
    </Backdrop>
  )
}

function BoughtSheet({
  item,
  members,
  onClose,
  onSubmit,
}: {
  item: ShoppingItem
  members: MemberWithProfile[]
  onClose: () => void
  onSubmit: (amount: number) => Promise<void>
}) {
  const [amt, setAmt] = useState("")
  const [loading, setLoading] = useState(false)
  const ok = Number(amt) > 0
  const requester = members.find((m) => m.id === item.requested_by)

  async function handleSubmit() {
    if (!ok) return
    setLoading(true)
    await onSubmit(r2(Number(amt.replace(",", "."))))
    setLoading(false)
  }

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title={`Preso · ${item.item}`} onClose={onClose} />
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 16, top: 14, fontSize: 18, color: C.sub, fontWeight: 600 }}>€</span>
        <input
          value={amt}
          onChange={(e) => setAmt(e.target.value.replace(",", "."))}
          placeholder="0,00"
          inputMode="decimal"
          style={{ ...inputStyle, paddingLeft: 34, fontSize: 20, fontWeight: 700 }}
          className="disp"
          autoFocus
        />
      </div>
      <div style={{ fontSize: 12.5, color: item.tag === "comune" ? C.sageDeep : C.honey, marginTop: 10, fontWeight: 600 }}>
        {item.tag === "comune"
          ? "Verrà diviso tra tutti i coinquilini"
          : `Verrà messo a carico di ${requester?.profile.full_name ?? "chi l'ha chiesto"}`}
      </div>
      <button
        disabled={!ok || loading}
        onClick={handleSubmit}
        style={{ ...primaryBtn, opacity: ok && !loading ? 1 : 0.4 }}
      >
        {loading ? "Conferma…" : "Conferma"}
      </button>
    </Backdrop>
  )
}

function Skeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 68, borderRadius: 16, background: C.sageSoft, marginBottom: 10, opacity: 0.4 + i * 0.1 }} />
      ))}
    </div>
  )
}

export default function SpesaPage() {
  const { currentMember, house } = useHouse()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"add" | "bought" | null>(null)
  const [boughtTarget, setBoughtTarget] = useState<ShoppingItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  async function refresh() {
    const supabase = createClient()

    const { data: itemsRaw } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("house_id", house.id)
      .eq("status", "da_comprare")
      .order("created_at", { ascending: true })

    const { data: membersRaw } = await supabase
      .from("house_members")
      .select("*, profiles!user_id(*)")
      .eq("house_id", house.id)
      .is("left_at", null)

    if (itemsRaw) setItems(itemsRaw)

    if (membersRaw) {
      const mapped: MemberWithProfile[] = membersRaw.map((m, idx) => ({
        ...m,
        profiles: undefined,
        profile: {
          full_name: m.profiles?.full_name ?? "Coinquilino",
          avatar_color: m.profiles?.avatar_color ?? AVATAR_COLORS[idx % AVATAR_COLORS.length],
        },
        short: initials(m.profiles?.full_name ?? "C"),
      }))
      setMembers(mapped)
    }

    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function handleAddItem(item: string, tag: "comune" | "personale") {
    const supabase = createClient()
    await supabase.from("shopping_items").insert({
      house_id: house.id,
      item,
      tag,
      requested_by: currentMember.id,
      status: "da_comprare",
    })
    setModal(null)
    flash("Richiesta aggiunta alla lista")
    await refresh()
  }

  async function handleBought(it: ShoppingItem, amount: number) {
    const supabase = createClient()

    const expenseData = {
      house_id: house.id,
      kind: it.tag as "comune" | "personale",
      description: it.item,
      amount,
      paid_by: currentMember.id,
      owed_by: it.tag === "personale" ? it.requested_by : null,
      source: "lista_spesa" as const,
    }

    const { data: expense } = await supabase.from("expenses").insert(expenseData).select().single()

    await supabase
      .from("shopping_items")
      .update({ status: "preso", resulting_expense_id: expense?.id ?? null })
      .eq("id", it.id)

    setModal(null)
    setBoughtTarget(null)

    const requester = members.find((m) => m.id === it.requested_by)
    flash(
      it.tag === "comune"
        ? "Preso → diviso tra tutti"
        : `Preso → a carico di ${requester?.profile.full_name ?? "chi l'ha chiesto"}`
    )
    await refresh()
  }

  return (
    <div>
      <div style={{ padding: "20px 18px 14px" }}>
        <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 600, letterSpacing: ".02em" }}>
          {house.city ?? house.address}
        </div>
        <div className="disp" style={{ fontSize: 25, fontWeight: 700, marginTop: 4, color: "#1B201A" }}>
          Lista della spesa
        </div>
      </div>

      <div style={{ padding: "0 18px 120px" }}>
        <div style={{ ...card(), background: C.sageSoft, border: "none", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 4 }}>
          <ShoppingBasket size={18} color={C.sageDeep} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: C.sageDeep, lineHeight: 1.4 }}>
            Chi va a fare la spesa prende ciò che serve e segna il costo. Diventa una spesa <b>comune</b> o <b>personale</b>, in automatico.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 2px 10px" }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" }}>
            Serve in casa
          </span>
          <button onClick={() => setModal("add")} style={addPill}>
            <Plus size={15} /> Richiedi
          </button>
        </div>

        {loading ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <div style={{ ...card(), textAlign: "center", color: C.sub }}>
            Lista vuota. Niente da comprare 👍
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it) => {
              const requester = members.find((m) => m.id === it.requested_by)
              return (
                <div
                  key={it.id}
                  className="pop"
                  style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 11,
                      background: it.tag === "comune" ? C.sageSoft : C.honeySoft,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ShoppingBasket size={16} color={it.tag === "comune" ? C.sageDeep : C.honey} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{it.item}</div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>
                        <span style={{ color: it.tag === "comune" ? C.sageDeep : C.honey, fontWeight: 600 }}>
                          {it.tag}
                        </span>{" "}
                        · da {requester?.profile.full_name ?? "coinquilino"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setBoughtTarget(it); setModal("bought") }}
                    style={{ ...addPill, background: C.sage, color: "#fff", border: "none" }}
                  >
                    <Check size={15} /> L'ho preso
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal === "add" && (
        <AddItemSheet onClose={() => setModal(null)} onSubmit={handleAddItem} />
      )}
      {modal === "bought" && boughtTarget && (
        <BoughtSheet
          item={boughtTarget}
          members={members}
          onClose={() => { setModal(null); setBoughtTarget(null) }}
          onSubmit={(amount) => handleBought(boughtTarget, amount)}
        />
      )}

      {toast && (
        <div
          className="fade-in"
          style={{
            position: "fixed", left: "50%", transform: "translateX(-50%)",
            bottom: 96, background: C.ink, color: "#fff",
            padding: "10px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 500,
            zIndex: 60, maxWidth: 360, textAlign: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
