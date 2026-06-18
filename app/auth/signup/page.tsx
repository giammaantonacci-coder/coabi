"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        avatar_color: "#5C7E70",
      })
    }

    if (!data.session) {
      setError("__confirm__")
      setLoading(false)
      return
    }

    router.push("/onboarding")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)" }}>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 24 }}>
            Crea il tuo account
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              autoComplete="email"
            />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 caratteri)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: 46 }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: C.faint, display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error === "__confirm__" ? (
              <div style={{ fontSize: 13.5, color: C.sageDeep, fontWeight: 500, padding: "12px 14px", background: C.sageSoft, borderRadius: 10, lineHeight: 1.5 }}>
                Account creato. Controlla la tua email e clicca il link di conferma, poi torna qui ad accedere.
              </div>
            ) : error ? (
              <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{ ...primaryBtn, marginTop: 8, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creazione account…" : "Crea account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.sub }}>
          Hai già un account?{" "}
          <Link href="/auth/login" style={{ color: C.sageDeep, fontWeight: 600, textDecoration: "none" }}>
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
