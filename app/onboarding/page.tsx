"use client"

import { useState, useTransition } from "react"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"
import { createHouseAction, joinHouseAction } from "@/app/actions/onboarding"

type Mode = "crea" | "entra"

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>("crea")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [roomLabel, setRoomLabel] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")

  const [inviteCode, setInviteCode] = useState("")
  const [roomLabelEntra, setRoomLabelEntra] = useState("")
  const [monthlyRentEntra, setMonthlyRentEntra] = useState("")

  function handleCrea(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createHouseAction({
        address,
        city,
        roomLabel,
        monthlyRent: parseFloat(monthlyRent) || 0,
      })
      if (result?.error) setError(result.error)
    })
  }

  function handleEntra(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await joinHouseAction({
        inviteCode,
        roomLabel: roomLabelEntra,
        monthlyRent: parseFloat(monthlyRentEntra) || 0,
      })
      if (result?.error) setError(result.error)
    })
  }

  const modeBtn = (m: Mode, label: string, sub: string) => {
    const on = mode === m
    return (
      <button
        type="button"
        onClick={() => { setMode(m); setError(null) }}
        style={{
          flex: 1, textAlign: "left", padding: "14px 16px", borderRadius: 16,
          cursor: "pointer",
          background: on ? C.sageSoft : "#fff",
          border: `1.5px solid ${on ? C.sage : C.line}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14.5, color: on ? C.sageDeep : C.ink }}>{label}</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{sub}</div>
      </button>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "48px 20px 40px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Wordmark size={30} />
          <p style={{ marginTop: 14, fontSize: 14.5, color: C.sub, lineHeight: 1.5 }}>
            Crea la tua casa e invita i coinquilini —<br />i conti li sistemiamo insieme.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {modeBtn("crea", "Crea la tua casa", "apri una nuova casa")}
          {modeBtn("entra", "Entra in una casa", "hai un codice invito")}
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)" }}>
          {mode === "crea" ? (
            <form onSubmit={handleCrea} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Indirizzo (es. Via Saluzzo 12)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Città"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Nome stanza (es. Stanza grande)"
                value={roomLabel}
                onChange={(e) => setRoomLabel(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: 14, fontSize: 15, color: C.sub, fontWeight: 600, pointerEvents: "none" }}>€</span>
                <input
                  type="number"
                  placeholder="Affitto mensile"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  style={{ ...inputStyle, paddingLeft: 32 }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isPending || !address.trim()} style={{ ...primaryBtn, marginTop: 4, opacity: (isPending || !address.trim()) ? 0.5 : 1 }}>
                {isPending ? "Creazione in corso…" : "Crea casa →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEntra} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Codice casa (8 caratteri)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                maxLength={8}
                style={{ ...inputStyle, textTransform: "lowercase", letterSpacing: "0.1em", fontWeight: 600 }}
              />
              <input
                type="text"
                placeholder="Nome stanza (es. Stanza singola)"
                value={roomLabelEntra}
                onChange={(e) => setRoomLabelEntra(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 16, top: 14, fontSize: 15, color: C.sub, fontWeight: 600, pointerEvents: "none" }}>€</span>
                <input
                  type="number"
                  placeholder="Affitto mensile"
                  value={monthlyRentEntra}
                  onChange={(e) => setMonthlyRentEntra(e.target.value)}
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  style={{ ...inputStyle, paddingLeft: 32 }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isPending || !inviteCode.trim()} style={{ ...primaryBtn, marginTop: 4, opacity: (isPending || !inviteCode.trim()) ? 0.5 : 1 }}>
                {isPending ? "Verifica in corso…" : "Entra →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
