"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowRight, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useHouse } from "@/app/(app)/AppShell"
import { C, card, inputStyle, primaryBtn } from "@/lib/constants"
import { eur, r2, computeNet, settle } from "@/lib/finance"
import { Backdrop, SheetHead } from "@/components/Sheet"
import type { Expense, MemberWithProfile, Settlement, SettleSuggestion } from "@/lib/types"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [C.sage, C.coral, C.honey]

function ExpRow({ e, members, last }: { e: Expense; members: MemberWithProfile[]; last: boolean }) {
  const payer = members.find((m) => m.id === e.paid_by)
  const owedTo = e.owed_by ? members.find((m) => m.id === e.owed_by) : null
  const date = new Date(e.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "short" })

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 16px",
      borderBottom: last ? "none" : `1px solid ${C.line}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 11,
          background: payer?.profile.avatar_color ?? C.sage,
          color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 13, fontWeight: 700,
        }}>
          {payer?.short ?? "?"}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>{e.description}</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 1 }}>
            {payer?.profile.full_name ?? "—"} · {date} ·{" "}
            {e.kind === "personale" && owedTo ? (
              <span style={{ color: C.honey, fontWeight: 600 }}>a carico di {owedTo.profile.full_name}</span>
            ) : (
              `diviso ÷${members.length}`
            )}
          </div>
        </div>
      </div>
      <div className="disp" style={{ fontWeight: 700, fontSize: 15.5 }}>{eur(e.amount)}</div>
    </div>
  )
}

function AddExpenseSheet({
  onClose,
  onSubmit,
  members,
  currentMemberId,
}: {
  onClose: () => void
  onSubmit: (desc: string, amount: number, kind: "comune" | "personale", owedBy: string | null) => Promise<void>
  members: MemberWithProfile[]
  currentMemberId: string
}) {
  const [desc, setDesc] = useState("")
  const [amt, setAmt] = useState("")
  const [kind, setKind] = useState<"comune" | "personale">("comune")
  const [owedBy, setOwedBy] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const others = members.filter((m) => m.id !== currentMemberId)

  function handleKindChange(k: "comune" | "personale") {
    setKind(k)
    if (k === "personale" && others.length === 1) setOwedBy(others[0].id)
    else if (k === "comune") setOwedBy("")
  }

  const ok =
    desc.trim().length > 0 &&
    Number(amt) > 0 &&
    (kind === "comune" || owedBy !== "")

  async function handleSubmit() {
    if (!ok) return
    setLoading(true)
    await onSubmit(desc.trim(), r2(Number(amt.replace(",", "."))), kind, owedBy || null)
    setLoading(false)
  }

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Nuova spesa" onClose={onClose} />
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {(["comune", "personale"] as const).map((k) => {
          const on = kind === k
          return (
            <button
              key={k}
              onClick={() => handleKindChange(k)}
              style={{
                flex: 1, textAlign: "left", padding: "10px 14px", borderRadius: 13, cursor: "pointer",
                background: on ? (k === "comune" ? C.sageSoft : C.honeySoft) : C.card,
                border: `1.5px solid ${on ? (k === "comune" ? C.sage : C.honey) : C.line}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{k === "comune" ? "Comune" : "Personale"}</div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 1 }}>
                {k === "comune" ? "divisa tra tutti" : "a carico di uno"}
              </div>
            </button>
          )
        })}
      </div>

      {kind === "personale" && others.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: C.sub, fontWeight: 700, margin: "0 2px 8px", letterSpacing: ".03em" }}>
            A CARICO DI
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {others.map((m) => {
              const on = owedBy === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setOwedBy(m.id)}
                  style={{
                    padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                    background: on ? C.honey : C.card,
                    border: `1.5px solid ${on ? C.honey : C.line}`,
                    color: on ? "#fff" : C.ink,
                    fontWeight: 600, fontSize: 13.5,
                  }}
                >
                  {m.profile.full_name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Cosa avete preso?"
        style={inputStyle}
        autoFocus
      />
      <div style={{ position: "relative", marginTop: 12 }}>
        <span style={{ position: "absolute", left: 16, top: 14, fontSize: 18, color: C.sub, fontWeight: 600 }}>€</span>
        <input
          value={amt}
          onChange={(e) => setAmt(e.target.value.replace(",", "."))}
          placeholder="0,00"
          inputMode="decimal"
          style={{ ...inputStyle, paddingLeft: 34, fontSize: 20, fontWeight: 700 }}
          className="disp"
        />
      </div>
      <button
        disabled={!ok || loading}
        onClick={handleSubmit}
        style={{ ...primaryBtn, opacity: ok && !loading ? 1 : 0.4 }}
      >
        {loading ? "Aggiunta…" : "Aggiungi spesa"}
      </button>
    </Backdrop>
  )
}

function PaySheet({
  s, members, onClose, onPaid,
}: {
  s: SettleSuggestion
  members: MemberWithProfile[]
  onClose: () => void
  onPaid: () => void
}) {
  const to = members.find((m) => m.id === s.to)

  const AppBtn = ({ label, color }: { label: string; color: string }) => (
    <button onClick={onPaid} style={{
      flex: 1, background: C.card, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: "16px 0",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: 17,
      }}>
        {label[0]}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  )

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title={`Paga ${to?.profile.full_name ?? "coinquilino"}`} onClose={onClose} />
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div className="disp" style={{ fontSize: 40, fontWeight: 700 }}>{eur(s.amount)}</div>
        <div style={{ fontSize: 13.5, color: C.sub, marginTop: 2 }}>Il pagamento avviene fuori dall'app</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <AppBtn label="Revolut" color="#0a1a2f" />
        <AppBtn label="PayPal" color="#1b3a8a" />
      </div>
      <button
        onClick={onPaid}
        style={{ ...primaryBtn, background: "none", color: C.sageDeep, border: `1px solid ${C.sage}` }}
      >
        <Check size={17} style={{ marginRight: 6, verticalAlign: -3 }} />
        Segna come già pagato
      </button>
    </Backdrop>
  )
}

function Skeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 60, borderRadius: 16, background: C.sageSoft, marginBottom: 12, opacity: 0.4 + i * 0.1 }} />
      ))}
    </div>
  )
}

export default function SpesePage() {
  const { currentMember, house } = useHouse()
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"add" | "pay" | null>(null)
  const [payTarget, setPayTarget] = useState<SettleSuggestion | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  async function refresh() {
    const supabase = createClient()

    const { data: membersRaw } = await supabase
      .from("house_members")
      .select("*, profiles!user_id(*)")
      .eq("house_id", house.id)
      .is("left_at", null)

    const { data: expensesRaw } = await supabase
      .from("expenses")
      .select("*")
      .eq("house_id", house.id)
      .order("created_at", { ascending: false })

    const { data: settlementsRaw } = await supabase
      .from("settlements")
      .select("*")
      .eq("house_id", house.id)

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

    if (expensesRaw) setExpenses(expensesRaw)
    if (settlementsRaw) setSettlements(settlementsRaw)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    const handler = () => setModal("add")
    window.addEventListener("coabi-fab", handler)
    return () => window.removeEventListener("coabi-fab", handler)
  }, [])

  const memberIds = members.map((m) => m.id)
  const net = useMemo(() => computeNet(memberIds, expenses, settlements), [memberIds, expenses, settlements])
  const suggestions = useMemo(() => settle(net), [net])
  const youOwe = suggestions.filter((s) => s.from === currentMember.id)
  const oweYou = suggestions.filter((s) => s.to === currentMember.id)

  async function handleAddExpense(
    desc: string,
    amount: number,
    kind: "comune" | "personale",
    owedBy: string | null
  ) {
    const supabase = createClient()
    await supabase.from("expenses").insert({
      house_id: house.id,
      kind,
      description: desc,
      amount,
      paid_by: currentMember.id,
      owed_by: owedBy,
      source: "manuale",
    })
    setModal(null)
    flash(kind === "comune" ? "Spesa aggiunta al comune" : "Spesa personale registrata")
    await refresh()
  }

  async function handleMarkPaid(s: SettleSuggestion) {
    const supabase = createClient()
    await supabase.from("settlements").insert({
      house_id: house.id,
      from_member: s.from,
      to_member: s.to,
      amount: s.amount,
    })
    setModal(null)
    setPayTarget(null)
    const to = members.find((m) => m.id === s.to)
    flash(`Segnato come pagato a ${to?.profile.full_name ?? "coinquilino"}`)
    await refresh()
  }

  return (
    <div>
      <div style={{ padding: "20px 18px 14px" }}>
        <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, letterSpacing: ".02em" }}>
          {house.city ?? house.address}
        </div>
        <div className="disp" style={{ fontSize: 25, fontWeight: 700, marginTop: 4, color: C.ink }}>
          Spese comuni
        </div>
      </div>

      <div style={{ padding: "0 18px 120px" }}>
        {loading ? (
          <Skeleton />
        ) : (
          <>
            {(youOwe.length > 0 || oweYou.length > 0) ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "4px 2px 10px" }}>
                  Chi deve a chi
                </div>
                <div style={card()}>
                  {youOwe.map((s, i) => {
                    const to = members.find((m) => m.id === s.to)
                    return (
                      <div
                        key={"o" + i}
                        onClick={() => { setPayTarget(s); setModal("pay") }}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 0", cursor: "pointer",
                          borderBottom: `1px solid ${C.line}`,
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 9, background: to?.profile.avatar_color ?? C.sage, display: "inline-block" }} />
                          <b>Tu</b> <ArrowRight size={14} color={C.faint} /> {to?.profile.full_name ?? "coinquilino"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <b style={{ fontSize: 15 }}>{eur(s.amount)}</b>
                          <span style={{ background: C.sage, color: "#fff", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 99 }}>Salda</span>
                        </span>
                      </div>
                    )
                  })}
                  {oweYou.map((s, i) => {
                    const from = members.find((m) => m.id === s.from)
                    return (
                      <div
                        key={"y" + i}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 0",
                          borderBottom: i < oweYou.length - 1 ? `1px solid ${C.line}` : "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 9, background: from?.profile.avatar_color ?? C.honey, display: "inline-block" }} />
                          <b>{from?.profile.full_name ?? "coinquilino"}</b> <ArrowRight size={14} color={C.faint} /> Tu
                        </span>
                        <b style={{ fontSize: 15 }}>{eur(s.amount)}</b>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ ...card(), textAlign: "center", color: C.sub, marginTop: 4 }}>
                Tutti in pari. Niente conti aperti ✦
              </div>
            )}

            <div style={{ margin: "22px 2px 10px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" }}>
                Movimenti
              </span>
            </div>
            <div style={card(0)}>
              {expenses.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: C.sub, fontSize: 14 }}>
                  Nessuna spesa ancora.
                </div>
              ) : (
                expenses.map((e, i) => (
                  <ExpRow key={e.id} e={e} members={members} last={i === expenses.length - 1} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {modal === "add" && (
        <AddExpenseSheet
          onClose={() => setModal(null)}
          onSubmit={handleAddExpense}
          members={members}
          currentMemberId={currentMember.id}
        />
      )}
      {modal === "pay" && payTarget && (
        <PaySheet
          s={payTarget}
          members={members}
          onClose={() => { setModal(null); setPayTarget(null) }}
          onPaid={() => handleMarkPaid(payTarget)}
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
