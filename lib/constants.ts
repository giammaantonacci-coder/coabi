import type React from "react"

export const C = {
  ink: "#1B201A", sub: "#6B7268", faint: "#9aa093",
  bg: "#FFFFFF", card: "#FFFFFF",
  sage: "#5C7E70", sageDeep: "#3A554C", sageSoft: "#E4EDE7",
  coral: "#CF5F49", coralSoft: "#F6E2DC",
  honey: "#CC8E2E", honeySoft: "#F4E8CF",
  line: "#E7E4D9",
} as const

export const iconBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 13, background: "#fff",
  border: `1px solid #E7E4D9`, display: "flex", alignItems: "center",
  justifyContent: "center", cursor: "pointer",
}

export const primaryBtn: React.CSSProperties = {
  width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 15,
  background: "#3A554C", color: "#fff", border: "none", fontSize: 15.5,
  fontWeight: 700, cursor: "pointer",
}

export const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "13px 16px",
  borderRadius: 14, border: `1px solid #E7E4D9`, background: "#fff",
  fontSize: 15, outline: "none", color: "#1B201A",
}

export const addPill: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, background: "#fff",
  border: `1px solid #E7E4D9`, color: "#1B201A", fontSize: 13,
  fontWeight: 600, padding: "7px 13px", borderRadius: 99, cursor: "pointer",
}

export function card(pad = 16): React.CSSProperties {
  return { background: "#fff", border: `1px solid #E7E4D9`, borderRadius: 20, padding: pad }
}
