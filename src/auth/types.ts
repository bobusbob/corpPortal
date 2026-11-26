export type RegisterInput = {
  fullName: string
  username: string
  email: string
  password: string
}

export type LoginInput = {
  username: string
  password: string
}

export type RegisterResult =
  | { status: 'signed-in' }
  | { status: 'confirm-email' }
  | { status: 'error'; message: string; field?: 'username' | 'email' | 'password' }
