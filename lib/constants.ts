import type React from "react"

export const C = {
  ink: "#16201C", sub: "#5F6B63", faint: "#9AA59C",
  bg: "#FFFFFF", card: "#FFFFFF",
  sage: "#2E9E73", sageDeep: "#1F7D58", sageSoft: "#D8F2E6",
  coral: "#FF5A3C", coralSoft: "#FFE1D9",
  honey: "#F2A626", honeySoft: "#FCEBCC",
  line: "#EFEDE7",
} as const

export const iconBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 13, background: "#fff",
  border: `1px solid #EFEDE7`, display: "flex", alignItems: "center",
  justifyContent: "center", cursor: "pointer",
}

export const primaryBtn: React.CSSProperties = {
  width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 16,
  background: "#1F7D58", color: "#fff", border: "none", fontSize: 15.5,
  fontWeight: 700, cursor: "pointer",
  boxShadow: "0 4px 14px rgba(31,125,88,.28)",
}

export const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "13px 16px",
  borderRadius: 14, border: `1px solid #EFEDE7`, background: "#fff",
  fontSize: 15, outline: "none", color: "#16201C",
}

export const addPill: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, background: "#fff",
  border: `1px solid #EFEDE7`, color: "#16201C", fontSize: 13,
  fontWeight: 600, padding: "7px 13px", borderRadius: 99, cursor: "pointer",
}

export const fab: React.CSSProperties = {
  position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 92px)", right: 20,
  width: 54, height: 54, borderRadius: 18,
  background: "#FF5A3C", color: "#fff", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", zIndex: 35,
  boxShadow: "0 6px 20px rgba(255,90,60,.35)",
}

export function card(pad = 16): React.CSSProperties {
  return {
    background: "#fff",
    borderRadius: 22,
    padding: pad,
    boxShadow: "0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)",
  }
}
