export interface AuthUser {
  userId: string
  username: string
  realName?: string | null
  email?: string | null
  avatar?: string | null
  roles: string[]
  permissions: string[];
}