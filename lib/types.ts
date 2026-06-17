export interface Profile {
  id: string
  full_name: string
  avatar_color: string
  created_at: string
}

export interface House {
  id: string
  address: string
  city: string | null
  property_type: string | null
  contract_start: string | null
  contract_end: string | null
  invite_code: string
  created_at: string
}

export interface HouseMember {
  id: string
  house_id: string
  user_id: string
  room_label: string | null
  monthly_rent: number
  joined_at: string
  left_at: string | null
}

export interface Expense {
  id: string
  house_id: string
  kind: "comune" | "personale"
  description: string
  amount: number
  paid_by: string
  owed_by: string | null
  source: "manuale" | "lista_spesa"
  created_at: string
}

export interface Settlement {
  id: string
  house_id: string
  from_member: string
  to_member: string
  amount: number
  settled_at: string
}

export interface ShoppingItem {
  id: string
  house_id: string
  item: string
  tag: "comune" | "personale"
  requested_by: string
  status: "da_comprare" | "preso"
  resulting_expense_id: string | null
  created_at: string
}

export interface DepositContribution {
  id: string
  house_id: string
  member_id: string
  amount: number
  contributed_at: string
  refunded: boolean
  refunded_at: string | null
}

export interface MemberWithProfile extends HouseMember {
  profile: {
    full_name: string
    avatar_color: string
  }
  short: string
}

export interface HouseContext {
  user: { id: string; email?: string }
  profile: Profile
  house: House
  currentMember: MemberWithProfile
}

export interface SettleSuggestion {
  from: string
  to: string
  amount: number
}
