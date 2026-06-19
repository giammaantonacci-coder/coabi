import type { Metadata, Viewport } from "next"
import { Familjen_Grotesk, Hanken_Grotesk } from "next/font/google"
import "./globals.css"

const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-familjen",
  display: "swap",
})

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Coabi",
  description: "Tieni tutti i conti di casa sotto controllo",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icons/icon-192.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#FF5A3C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${familjen.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  )
}
