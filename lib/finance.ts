import type { Expense, Settlement, SettleSuggestion } from "./types"

export const eur = (n: number) =>
  "€" + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const r2 = (n: number) => Math.round(n * 100) / 100

export function computeNet(
  memberIds: string[],
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const net: Record<string, number> = {}
  memberIds.forEach((id) => (net[id] = 0))

  const n = memberIds.length

  expenses.forEach((e) => {
    if (e.kind === "personale") {
      if (net[e.paid_by] !== undefined) net[e.paid_by] += e.amount
      if (e.owed_by && net[e.owed_by] !== undefined) net[e.owed_by] -= e.amount
    } else {
      const share = e.amount / n
      if (net[e.paid_by] !== undefined) net[e.paid_by] += e.amount
      memberIds.forEach((id) => {
        net[id] -= share
      })
    }
  })

  settlements.forEach((s) => {
    if (net[s.from_member] !== undefined) net[s.from_member] += s.amount
    if (net[s.to_member] !== undefined) net[s.to_member] -= s.amount
  })

  return net
}

export function settle(net: Record<string, number>): SettleSuggestion[] {
  const cred: { id: string; amt: number }[] = []
  const deb: { id: string; amt: number }[] = []

  Object.entries(net).forEach(([id, v]) => {
    const x = r2(v)
    if (x > 0.009) cred.push({ id, amt: x })
    else if (x < -0.009) deb.push({ id, amt: -x })
  })

  cred.sort((a, b) => b.amt - a.amt)
  deb.sort((a, b) => b.amt - a.amt)

  const out: SettleSuggestion[] = []
  let i = 0, j = 0

  while (i < deb.length && j < cred.length) {
    const p = Math.min(deb[i].amt, cred[j].amt)
    out.push({ from: deb[i].id, to: cred[j].id, amount: r2(p) })
    deb[i].amt -= p
    cred[j].amt -= p
    if (deb[i].amt < 0.009) i++
    if (cred[j].amt < 0.009) j++
  }

  return out
}
