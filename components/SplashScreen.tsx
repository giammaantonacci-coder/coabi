"use client"

import { useState, useEffect } from "react"

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "zooming" | "done">("visible")

  useEffect(() => {
    if (sessionStorage.getItem("coabi_splash_done")) {
      setPhase("done")
      return
    }
    const t1 = setTimeout(() => setPhase("zooming"), 600)
    const t2 = setTimeout(() => {
      setPhase("done")
      sessionStorage.setItem("coabi_splash_done", "1")
    }, 1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === "done") return null

  const zooming = phase === "zooming"

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#FF5A3C",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: zooming ? 0 : 1,
        transition: zooming ? "opacity 300ms ease-in" : "none",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 80,
          height: 71,
          transform: zooming ? "scale(14)" : "scale(1)",
          transition: zooming
            ? "transform 500ms cubic-bezier(0.4, 0, 1, 1)"
            : "none",
          willChange: "transform",
        }}
      >
        <svg
          viewBox="0 0 100 89"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <polygon points="50,0 100,34 100,89 0,89 0,34" />
        </svg>
      </div>
    </div>
  )
}
