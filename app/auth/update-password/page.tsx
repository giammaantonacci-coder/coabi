"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { C, inputStyle, primaryBtn } from "@/lib/constants"
import { Wordmark } from "@/components/Wordmark"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/casa"), 2000)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Wordmark size={32} />
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)" }}>
          {done ? (
            <>
              <h1 className="disp" style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 12 }}>
                Password aggiornata
              </h1>
              <p style={{ fontSize: 14, color: C.sub }}>
                Ottimo. Verrai reindirizzato a breve.
              </p>
            </>
          ) : (
            <>
              <h1 className="disp" style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 20 }}>
                Nuova password
              </h1>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nuova password (min. 6 caratteri)"
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

                {error && (
                  <div style={{ fontSize: 13.5, color: C.coral, fontWeight: 500, padding: "8px 12px", background: C.coralSoft, borderRadius: 10 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password.length < 6}
                  style={{ ...primaryBtn, marginTop: 4, opacity: (loading || password.length < 6) ? 0.5 : 1 }}
                >
                  {loading ? "Salvataggio…" : "Salva nuova password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
