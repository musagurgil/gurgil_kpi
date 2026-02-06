import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  department: string
  roles: string[]
}

export const auth = {
  async login(email: string, password: string): Promise<AuthUser | null> {
    // Basit email kontrolü (gerçek uygulamada hash'lenmiş şifre kontrolü yapın)
    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { userRoles: true }
    })

    if (!profile) return null

    // Şifre kontrolü burada yapılacak (bcrypt vs.)
    // Şimdilik basit kontrol
    if (password.length < 6) return null

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      department: profile.department,
      roles: profile.userRoles.map(ur => ur.role)
    }
  },

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    department: string
  ): Promise<AuthUser | null> {
    try {
      const profile = await prisma.profile.create({
        data: {
          email,
          firstName,
          lastName,
          department,
          userRoles: {
            create: { role: 'employee' }
          }
        },
        include: { userRoles: true }
      })

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department,
        roles: profile.userRoles.map(ur => ur.role)
      }
    } catch (error) {
      console.error('Signup error:', error)
      return null
    }
  },

  generateToken(user: AuthUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  },

  verifyToken(token: string): AuthUser | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthUser
    } catch {
      return null
    }
  }
}
