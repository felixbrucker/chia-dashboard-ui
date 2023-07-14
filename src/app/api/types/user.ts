export interface UserSettings {
  disabledWallets: string[]
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
  settings: UserSettings
}
