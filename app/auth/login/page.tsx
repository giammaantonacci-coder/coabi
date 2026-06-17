"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError("Devi prima confermare la tua email. Controlla la casella di posta.")
      } else {
        setError("Email o password errata, riprova.")
      }
      setLoading(false)
      return
    }

    router.push("/casa")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EE", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", border: `1px solid ${C.line}` }}>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 24 }}>
            Bentornato
          </h1>

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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              autoComplete="current-password"
            />

            {error && (
              <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...primaryBtn, marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Accesso in corso…" : "Accedi"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.sub }}>
          Prima volta?{" "}
          <Link href="/auth/signup" style={{ color: C.sageDeep, fontWeight: 600, textDecoration: "none" }}>
            Crea il tuo account
          </Link>
        </p>
      </div>
    </div>
  )
}
