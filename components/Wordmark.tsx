"use client"

import { C } from "@/lib/constants"

export function Wordmark({ size = 20 }: { size?: number }) {
  const aw = size * 0.56
  const ah = size * 0.5

  return (
    <div
      className="disp"
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontWeight: 700,
        fontSize: size,
        color: C.sageDeep,
      }}
    >
      co
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: aw,
          height: ah,
          margin: `0 ${size * 0.03}px`,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: C.coral,
            clipPath: "polygon(50% 0%, 100% 38%, 100% 100%, 0% 100%, 0% 38%)",
            borderRadius: 2,
          }}
        />
      </span>
      bi
    </div>
  )
}
