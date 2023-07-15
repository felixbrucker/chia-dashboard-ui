export interface DisabledWallet {
  id: number
  name: string
}

export interface UserSettings {
  disabledWalletsByFingerprint?: Record<number, DisabledWallet[]>
}

export interface User {
  username: string | null
  email: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string | null
  firstName: string | null
  lastName: string | null
  shareKey: string | null
  settings?: UserSettings
}
