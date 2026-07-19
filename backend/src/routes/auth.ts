import { Router, type Request, type Response, type NextFunction } from 'express'

const VALID_USER = {
  username: 'admin',
  password: 'test123',
  displayName: 'Admin User',
  role: 'Healthcare Administrator',
}

export const DEMO_TOKEN = 'medicube-demo-token'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const token = header.slice('Bearer '.length)
  if (token !== DEMO_TOKEN) {
    res.status(401).json({ message: 'Invalid token' })
    return
  }
  next()
}

export const authRouter = Router()

authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' })
    return
  }

  if (username !== VALID_USER.username || password !== VALID_USER.password) {
    res.status(401).json({ message: 'Invalid username or password' })
    return
  }

  res.json({
    token: DEMO_TOKEN,
    user: {
      username: VALID_USER.username,
      displayName: VALID_USER.displayName,
      role: VALID_USER.role,
    },
  })
})
