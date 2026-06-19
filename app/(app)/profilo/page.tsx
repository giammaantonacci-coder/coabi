"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { AlertTriangle, Camera, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useHouse } from "@/app/(app)/AppShell"
import { C, card, inputStyle, primaryBtn } from "@/lib/constants"
import { eur, computeNet, settle, r2 } from "@/lib/finance"
import { Backdrop, SheetHead } from "@/components/Sheet"
import type { DepositContribution, Expense, MemberWithProfile, Settlement } from "@/lib/types"

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [C.sage, C.coral, C.honey]

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: C.sub, fontSize: 14 }}>{label}</span>
      <span className={strong ? "disp" : ""} style={{ fontWeight: strong ? 700 : 600, fontSize: strong ? 16 : 14.5 }}>
        {value}
      </span>
    </div>
  )
}

function MiniStat({ label, value, tone, sub }: { label: string; value: string; tone: "sage" | "honey"; sub?: string }) {
  const bg = tone === "sage" ? C.sageSoft : C.honeySoft
  const fg = tone === "sage" ? C.sageDeep : C.honey
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 15, padding: "12px 14px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: fg, letterSpacing: ".02em", textTransform: "uppercase" }}>{label}</div>
      <div className="disp" style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function AddDepositSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (amount: number) => Promise<void>
}) {
  const [amt, setAmt] = useState("")
  const [loading, setLoading] = useState(false)
  const ok = Number(amt) > 0

  async function handleSubmit() {
    if (!ok) return
    setLoading(true)
    await onSubmit(r2(Number(amt.replace(",", "."))))
    setLoading(false)
  }

  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Registra cauzione" onClose={onClose} />
      <div style={{ fontSize: 13.5, color: C.sub, marginBottom: 16, lineHeight: 1.4 }}>
        Inserisci la quota di cauzione che hai versato al proprietario.
      </div>
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
      <button
        disabled={!ok || loading}
        onClick={handleSubmit}
        style={{ ...primaryBtn, opacity: ok && !loading ? 1 : 0.4 }}
      >
        {loading ? "Salvataggio…" : "Salva cauzione"}
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

export default function ProfiloPage() {
  const { currentMember, house, profile } = useHouse()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [deposits, setDeposits] = useState<DepositContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [modal, setModal] = useState<"deposit" | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function refresh() {
    const supabase = createClient()

    const [membersRes, expensesRes, settlementsRes, depositsRes] = await Promise.all([
      supabase.from("house_members").select("*, profiles!user_id(*)").eq("house_id", house.id).is("left_at", null),
      supabase.from("expenses").select("*").eq("house_id", house.id),
      supabase.from("settlements").select("*").eq("house_id", house.id),
      supabase.from("deposit_contributions").select("*").eq("member_id", currentMember.id),
    ])

    if (membersRes.data) {
      setMembers(membersRes.data.map((m, idx) => ({
        ...m,
        profiles: undefined,
        profile: {
          full_name: m.profiles?.full_name ?? "Coinquilino",
          avatar_color: m.profiles?.avatar_color ?? AVATAR_COLORS[idx % AVATAR_COLORS.length],
        },
        short: initials(m.profiles?.full_name ?? "C"),
      })))
    }

    if (expensesRes.data) setExpenses(expensesRes.data)
    if (settlementsRes.data) setSettlements(settlementsRes.data)
    if (depositsRes.data) setDeposits(depositsRes.data)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const memberIds = members.map((m) => m.id)
  const net = useMemo(() => computeNet(memberIds, expenses, settlements), [memberIds, expenses, settlements])
  const youNet = r2(net[currentMember.id] ?? 0)

  const totalDeposit = deposits.reduce((acc, d) => acc + Number(d.amount), 0)

  const joinedAt = new Date(currentMember.joined_at).toLocaleDateString("it-IT", {
    day: "numeric", month: "short", year: "numeric",
  })

  const contractEnd = house.contract_end
    ? new Date(house.contract_end).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })
    : "—"

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setUploadError("Seleziona un'immagine"); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Immagine troppo grande (max 5 MB)"); return }

    setUploading(true)
    setUploadError(null)
    const supabase = createClient()

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${profile.id}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      setUploadError("Upload fallito. Riprova.")
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id)
    setAvatarUrl(urlWithBust)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleAddDeposit(amount: number) {
    const supabase = createClient()
    await supabase.from("deposit_contributions").insert({
      house_id: house.id,
      member_id: currentMember.id,
      amount,
    })
    setModal(null)
    await refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div>
      <div style={{ padding: "20px 18px 14px" }}>
        <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, letterSpacing: ".02em" }}>
          {house.city ?? house.address}
        </div>
        <div className="disp" style={{ fontSize: 25, fontWeight: 700, marginTop: 4, color: C.ink }}>
          Il tuo profilo
        </div>
      </div>

      <div style={{ padding: "0 18px 120px" }}>
        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Profile card */}
            <div style={{ ...card(), display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              {/* Avatar — tappable */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Cambia foto profilo"
                style={{
                  position: "relative", flexShrink: 0,
                  width: 60, height: 60, borderRadius: 99,
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: 60, height: 60, borderRadius: 99, objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{
                    width: 60, height: 60, borderRadius: 99,
                    background: profile.avatar_color,
                    color: "#fff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 700, fontSize: 21,
                  }}>
                    {currentMember.short}
                  </div>
                )}
                {/* Camera badge */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: 99,
                  background: C.sageDeep, border: "2px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={11} color="#fff" />
                </div>
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="disp" style={{ fontSize: 19, fontWeight: 700 }}>{profile.full_name}</div>
                <div style={{ fontSize: 13, color: C.sub }}>
                  {currentMember.room_label ?? "Stanza"} · in casa da {joinedAt}
                </div>
                {uploadError && (
                  <div style={{ fontSize: 13, color: C.coral, marginTop: 4 }}>{uploadError}</div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "22px 2px 10px" }}>
              Le tue voci fisse
            </div>
            <div style={card()}>
              <Row label="Affitto (la tua stanza)" value={eur(currentMember.monthly_rent) + "/mese"} />
              <Row label="Quota utenze (stima)" value={"~ " + eur(38) + "/mese"} />
              <Row
                label="Saldo attuale con la casa"
                value={youNet < 0 ? "− " + eur(Math.abs(youNet)) : eur(youNet)}
                strong
              />
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "22px 2px 10px" }}>
              Alla tua uscita
            </div>
            <div style={card()}>
              <div style={{ display: "flex", gap: 10 }}>
                <MiniStat
                  label="Certo, ora"
                  value={youNet >= 0 ? eur(youNet) : "− " + eur(Math.abs(youNet))}
                  tone="sage"
                  sub="saldo attuale"
                />
                <MiniStat
                  label="Stimato"
                  value="± €15"
                  tone="honey"
                  sub="bollette non arrivate"
                />
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <Row label="Scadenza contratto" value={contractEnd} />
                <Row label="Cauzione versata" value={totalDeposit > 0 ? eur(totalDeposit) : "Non registrata"} />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
                <Lock size={14} color={C.sub} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.sub }}>
                  Torna alla tua uscita, salvo trattenute per danni.
                </span>
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                {totalDeposit === 0 && (
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 14 }}>
                    <AlertTriangle size={15} color={C.honey} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Nessuna cauzione registrata</div>
                      <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>
                        Aggiungi la tua quota cauzione per tenerla sotto controllo.
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setModal("deposit")}
                  style={{
                    width: "100%", padding: "11px 0", borderRadius: 13,
                    background: "none", color: C.sageDeep,
                    border: `1px solid ${C.sage}`,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {totalDeposit > 0 ? "Aggiungi versamento" : "Registra cauzione"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: "100%", marginTop: 24, padding: "14px 0", borderRadius: 15,
                background: "none", color: C.coral, border: `1px solid ${C.coral}`,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                opacity: loggingOut ? 0.5 : 1,
              }}
            >
              {loggingOut ? "Disconnessione…" : "Disconnetti"}
            </button>
          </>
        )}
      </div>

      {modal === "deposit" && (
        <AddDepositSheet
          onClose={() => setModal(null)}
          onSubmit={handleAddDeposit}
        />
      )}
    </div>
  )
}
