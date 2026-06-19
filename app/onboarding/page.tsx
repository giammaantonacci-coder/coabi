"use client"

import { useState, useTransition } from "react"
import { Home, Users } from "lucide-react"
import { C, card, inputStyle, primaryBtn } from "@/lib/constants"
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FFFFFF",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "52px 20px 40px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
          <p style={{ marginTop: 12, fontSize: 15, color: C.sub, lineHeight: 1.5 }}>
            Crea la tua casa e invita i coinquilini —<br />i conti li sistemiamo insieme.
          </p>
        </div>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {([
            { id: "crea" as Mode, label: "Crea casa", sub: "apri una nuova casa", Icon: Home },
            { id: "entra" as Mode, label: "Entra", sub: "hai un codice invito", Icon: Users },
          ]).map(({ id, label, sub, Icon }) => {
            const on = mode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setError(null) }}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 18,
                  cursor: "pointer",
                  background: on ? C.sageSoft : "#fff",
                  border: `1.5px solid ${on ? C.sage : C.line}`,
                  transition: "background .15s, border-color .15s",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 11,
                  background: on ? C.sage : C.line,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 10,
                  transition: "background .15s",
                }}>
                  <Icon size={17} color={on ? "#fff" : C.sub} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: on ? C.sageDeep : C.ink }}>{label}</div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{sub}</div>
              </button>
            )
          })}
        </div>

        {/* Form card */}
        <div style={{ ...card(28), borderRadius: 24 }}>
          {mode === "crea" ? (
            <form onSubmit={handleCrea} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 8 }}>
                  La tua casa
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Indirizzo (es. Via Saluzzo 12)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    style={inputStyle}
                    autoComplete="street-address"
                  />
                  <input
                    type="text"
                    placeholder="Città"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={inputStyle}
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div style={{ height: 1, background: C.line, margin: "2px 0" }} />

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 8 }}>
                  La tua stanza
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Nome stanza (es. Stanza grande)"
                    value={roomLabel}
                    onChange={(e) => setRoomLabel(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: C.sub, fontWeight: 600, pointerEvents: "none" }}>€</span>
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
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "10px 14px", background: C.coralSoft, borderRadius: 12 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !address.trim()}
                style={{ ...primaryBtn, marginTop: 4, opacity: (isPending || !address.trim()) ? 0.5 : 1 }}
              >
                {isPending ? "Creazione in corso…" : "Crea casa →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEntra} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 8 }}>
                  Codice casa
                </div>
                <input
                  type="text"
                  placeholder="8 caratteri (es. ab3x9k2m)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                  required
                  maxLength={8}
                  style={{ ...inputStyle, letterSpacing: "0.12em", fontWeight: 700 }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>

              <div style={{ height: 1, background: C.line, margin: "2px 0" }} />

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 8 }}>
                  La tua stanza
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Nome stanza (es. Stanza singola)"
                    value={roomLabelEntra}
                    onChange={(e) => setRoomLabelEntra(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: C.sub, fontWeight: 600, pointerEvents: "none" }}>€</span>
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
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "10px 14px", background: C.coralSoft, borderRadius: 12 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !inviteCode.trim()}
                style={{ ...primaryBtn, marginTop: 4, opacity: (isPending || !inviteCode.trim()) ? 0.5 : 1 }}
              >
                {isPending ? "Verifica in corso…" : "Entra nella casa →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
