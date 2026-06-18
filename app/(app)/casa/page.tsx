"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowRight, Bell, Check, Info, Link2, Users, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useHouse } from "@/app/(app)/AppShell"
import { C, card, iconBtn, primaryBtn } from "@/lib/constants"
import { eur, r2, computeNet, settle } from "@/lib/finance"
import { Wordmark } from "@/components/Wordmark"
import { Backdrop, SheetHead } from "@/components/Sheet"
import type { Expense, MemberWithProfile, Settlement, SettleSuggestion } from "@/lib/types"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [C.sage, C.coral, C.honey]

function Avatar({ short, color, size = 30 }: { short: string; color: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 99,
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700,
    }}>
      {short}
    </div>
  )
}

function AvatarStack({ members, size = 26 }: { members: MemberWithProfile[]; size?: number }) {
  return (
    <div style={{ display: "flex" }}>
      {members.map((m, i) => (
        <div key={m.id} style={{ marginLeft: i ? -8 : 0, border: "2px solid transparent", borderRadius: 99 }}>
          <Avatar short={m.short} color={m.profile.avatar_color} size={size} />
        </div>
      ))}
    </div>
  )
}

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
          justifyContent: "center", fontSize: 12, fontWeight: 700,
        }}>
          {payer?.short ?? "?"}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>{e.description}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>
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

function InviteSheet({ inviteCode, onClose, onCopy }: { inviteCode: string; onClose: () => void; onCopy: () => void }) {
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Invita in casa" onClose={onClose} />
      <p style={{ fontSize: 14, color: C.sub, marginTop: -4, marginBottom: 16, lineHeight: 1.45 }}>
        Manda il codice ai tuoi coinquilini. Entrano nella casa e i conti tornano giusti per tutti.
      </p>
      <div style={{
        background: C.card, border: `1px dashed ${C.sage}`,
        borderRadius: 16, padding: "16px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700, letterSpacing: ".04em" }}>CODICE CASA</div>
          <div className="disp" style={{ fontSize: 28, fontWeight: 700, letterSpacing: ".06em" }}>
            {inviteCode.toUpperCase()}
          </div>
        </div>
        <Link2 size={22} color={C.sage} />
      </div>
      <button onClick={onCopy} style={primaryBtn}>Copia codice</button>
    </Backdrop>
  )
}

function InfoSheet({
  house,
  members,
  onClose,
}: {
  house: { address: string; city: string | null; contract_start: string | null; contract_end: string | null }
  members: MemberWithProfile[]
  onClose: () => void
}) {
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) : "—"

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Info casa" onClose={onClose} />

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "4px 2px 8px" }}>
        Indirizzo
      </div>
      <div style={{ background: C.sageSoft, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{house.address}</div>
        {house.city && <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{house.city}</div>}
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "0 2px 8px" }}>
        Contratto
      </div>
      <div style={{ background: C.sageSoft, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 13.5, color: C.sub }}>Inizio</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fmtDate(house.contract_start)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
          <span style={{ fontSize: 13.5, color: C.sub }}>Scadenza</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fmtDate(house.contract_end)}</span>
        </div>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "0 2px 8px" }}>
        Coinquilini
      </div>
      <div style={{ background: C.sageSoft, borderRadius: 14, overflow: "hidden" }}>
        {members.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 16px",
              borderBottom: i < members.length - 1 ? `1px solid ${C.line}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 99,
                background: m.profile.avatar_color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>
                {m.short}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.profile.full_name}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{m.room_label ?? "Stanza"}</div>
              </div>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{eur(m.monthly_rent)}/mese</span>
          </div>
        ))}
      </div>
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
    <div style={{ padding: "0 18px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 60, borderRadius: 16, background: C.sageSoft, marginBottom: 12, opacity: 0.5 + i * 0.1 }} />
      ))}
    </div>
  )
}

export default function CasaPage() {
  const { currentMember, house } = useHouse()
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"invite" | "info" | "pay" | null>(null)
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

  useEffect(() => { refresh() }, [])

  const memberIds = members.map((m) => m.id)
  const net = useMemo(() => computeNet(memberIds, expenses, settlements), [memberIds, expenses, settlements])
  const suggestions = useMemo(() => settle(net), [net])
  const youOwe = suggestions.filter((s) => s.from === currentMember.id)
  const oweYou = suggestions.filter((s) => s.to === currentMember.id)
  const youNet = r2(net[currentMember.id] ?? 0)
  const inPari = Math.abs(youNet) < 0.01

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
      {/* Header */}
      <div style={{ padding: "20px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Wordmark size={19} />
          <div className="disp" style={{ fontSize: 25, fontWeight: 700, marginTop: 4, color: "#1B201A" }}>
            {house.address}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setModal("info")} aria-label="Info casa" style={iconBtn}>
            <Info size={18} color={C.sageDeep} />
          </button>
          <button onClick={() => setModal("invite")} aria-label="Invita coinquilino" style={iconBtn}>
            <Users size={19} color={C.sageDeep} />
          </button>
          <div style={{ ...iconBtn, position: "relative", cursor: "default" }}>
            <Bell size={18} color={C.sageDeep} />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px 120px" }}>
        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Hero */}
            <div style={{ background: C.sageDeep, borderRadius: 26, padding: "22px 22px 18px", color: "#fff", marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, opacity: .8, fontWeight: 600, letterSpacing: ".03em" }}>LA TUA POSIZIONE</span>
                <AvatarStack members={members} size={26} />
              </div>
              <div className="disp" style={{ fontSize: 33, fontWeight: 700, marginTop: 12, lineHeight: 1.05 }}>
                {inPari ? "Sei in pari 🎉" : youNet < 0 ? `Devi ${eur(Math.abs(youNet))}` : `Ti spettano ${eur(youNet)}`}
              </div>
              <div style={{ fontSize: 13.5, opacity: .85, marginTop: 6 }}>
                {inPari
                  ? "Nessun conto in sospeso con la casa."
                  : youNet < 0
                    ? "In totale verso i coinquilini."
                    : "In totale dai coinquilini."}
              </div>

              {(youOwe.length > 0 || oweYou.length > 0) && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {youOwe.map((s, i) => {
                    const to = members.find((m) => m.id === s.to)
                    return (
                      <button
                        key={"o" + i}
                        onClick={() => { setPayTarget(s); setModal("pay") }}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: "rgba(255,255,255,.12)", border: "none", color: "#fff",
                          padding: "11px 13px", borderRadius: 13, fontSize: 14, cursor: "pointer", width: "100%",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 9, background: to?.profile.avatar_color ?? C.coral, display: "inline-block" }} />
                          Tu <ArrowRight size={13} /> {to?.profile.full_name ?? "coinquilino"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                          {eur(s.amount)}
                          <span style={{ background: "#fff", color: C.sageDeep, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99 }}>
                            Salda
                          </span>
                        </span>
                      </button>
                    )
                  })}
                  {oweYou.map((s, i) => {
                    const from = members.find((m) => m.id === s.from)
                    return (
                      <div
                        key={"y" + i}
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: "rgba(255,255,255,.12)", padding: "11px 13px", borderRadius: 13, fontSize: 14,
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 9, background: from?.profile.avatar_color ?? C.honey, display: "inline-block" }} />
                          {from?.profile.full_name ?? "coinquilino"} <ArrowRight size={13} /> Tu
                        </span>
                        <span style={{ fontWeight: 700 }}>{eur(s.amount)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Ultimi movimenti */}
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "22px 2px 10px" }}>
              Ultimi movimenti
            </div>
            <div style={card(0)}>
              {expenses.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: C.sub, fontSize: 14 }}>
                  Nessuna spesa ancora. Inizia tu!
                </div>
              ) : (
                expenses.slice(0, 3).map((e, i) => (
                  <ExpRow key={e.id} e={e} members={members} last={i === Math.min(2, expenses.length - 1)} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {modal === "invite" && (
        <InviteSheet
          inviteCode={house.invite_code}
          onClose={() => setModal(null)}
          onCopy={() => {
            navigator.clipboard.writeText(house.invite_code).catch(() => {})
            setModal(null)
            flash("Codice copiato — mandalo ai coinquilini")
          }}
        />
      )}
      {modal === "info" && <InfoSheet house={house} members={members} onClose={() => setModal(null)} />}
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
