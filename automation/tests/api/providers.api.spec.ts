import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001/api'

test.describe('API — Authentication & Providers', () => {
  test('POST /auth/login returns token for valid credentials', async ({ request }) => {
    const response = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'test123' },
    })

    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.token).toBeTruthy()
    expect(body.user.username).toBe('admin')
  })

  test('POST /auth/login rejects invalid credentials', async ({ request }) => {
    const response = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'bad' },
    })
    expect(response.status()).toBe(401)
  })

  test('Provider list requires authentication', async ({ request }) => {
    const response = await request.get(`${API}/providers`)
    expect(response.status()).toBe(401)
  })

  test('Provider CRUD via API', async ({ request }) => {
    const login = await request.post(`${API}/auth/login`, {
      data: { username: 'admin', password: 'test123' },
    })
    const { token } = await login.json()
    const headers = { Authorization: `Bearer ${token}` }
    const mpi = `${Date.now()}`.slice(-10)

    const create = await request.post(`${API}/providers`, {
      headers,
      data: {
        name: 'Dr API Test',
        specialty: 'Radiology',
        mpi,
        status: 'Active',
      },
    })
    expect(create.status()).toBe(201)
    const created = await create.json()
    expect(created.id).toMatch(/^PR/)

    const list = await request.get(`${API}/providers`, { headers })
    expect(list.ok()).toBeTruthy()
    const providers = await list.json()
    expect(providers.some((p: { id: string }) => p.id === created.id)).toBeTruthy()

    const update = await request.put(`${API}/providers/${created.id}`, {
      headers,
      data: {
        name: 'Dr API Updated',
        specialty: 'Radiology',
        mpi,
        status: 'Inactive',
      },
    })
    expect(update.ok()).toBeTruthy()
    const updated = await update.json()
    expect(updated.name).toBe('Dr API Updated')
    expect(updated.status).toBe('Inactive')

    const remove = await request.delete(`${API}/providers/${created.id}`, { headers })
    expect(remove.status()).toBe(204)
  })
})
