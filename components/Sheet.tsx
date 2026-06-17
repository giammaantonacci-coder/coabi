"use client"

import { X } from "lucide-react"
import { C, iconBtn } from "@/lib/constants"

interface BackdropProps {
  onClose: () => void
  children: React.ReactNode
}

export function Backdrop({ onClose, children }: BackdropProps) {
  return (
    <div
      className="fade-in"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,18,.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        className="sheet-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 412,
          background: C.bg,
          borderRadius: "26px 26px 0 0",
          padding: "10px 20px 40px",
        }}
      >
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 9,
            background: C.line,
            margin: "6px auto 16px",
          }}
        />
        {children}
      </div>
    </div>
  )
}

interface SheetHeadProps {
  title: string
  onClose: () => void
}

export function SheetHead({ title, onClose }: SheetHeadProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <span className="disp" style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
        {title}
      </span>
      <button
        onClick={onClose}
        style={{ ...iconBtn, width: 34, height: 34 }}
        aria-label="Chiudi"
      >
        <X size={17} color={C.sub} />
      </button>
    </div>
  )
}
