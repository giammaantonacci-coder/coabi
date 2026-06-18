"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)" }}>
          {sent ? (
            <>
              <h1 className="disp" style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 12 }}>
                Email inviata
              </h1>
              <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.55, marginBottom: 20 }}>
                Controlla la tua casella di posta. Ti abbiamo mandato un link per reimpostare la password.
              </p>
              <Link
                href="/auth/login"
                style={{ display: "block", textAlign: "center", fontSize: 14.5, color: C.sageDeep, fontWeight: 600, textDecoration: "none" }}
              >
                Torna al login
              </Link>
            </>
          ) : (
            <>
              <h1 className="disp" style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                Recupera password
              </h1>
              <p style={{ fontSize: 14, color: C.sub, marginBottom: 20, lineHeight: 1.5 }}>
                Inserisci la tua email e ti mandiamo un link per reimpostare la password.
              </p>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  autoComplete="email"
                />
                {error && (
                  <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...primaryBtn, marginTop: 4, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? "Invio in corso…" : "Invia link di reset"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          <Link href="/auth/login" style={{ color: C.sageDeep, fontWeight: 600, textDecoration: "none" }}>
            ← Torna al login
          </Link>
        </p>
      </div>
    </div>
  )
}
