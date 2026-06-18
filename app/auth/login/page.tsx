"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("email not confirmed")
          ? "Devi prima confermare la tua email. Controlla la casella di posta."
          : "Email o password errata, riprova."
      )
      setLoading(false)
      return
    }

    localStorage.setItem("coabi_rm", rememberMe ? "1" : "0")
    sessionStorage.setItem("coabi_ss", "1")
    router.push("/casa")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)" }}>
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

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: 46 }}
                autoComplete="current-password"
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                />
                <div style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${rememberMe ? C.sage : C.line}`,
                  background: rememberMe ? C.sage : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background .15s, border-color .15s",
                }}>
                  {rememberMe && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 13.5, color: C.sub }}>Ricordami</span>
              </label>
              <Link href="/auth/reset-password" style={{ fontSize: 13.5, color: C.sageDeep, fontWeight: 600, textDecoration: "none" }}>
                Password dimenticata?
              </Link>
            </div>

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
