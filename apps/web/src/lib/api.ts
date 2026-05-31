const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? body.message ?? `Request failed: ${res.status}`)
  }

  return res.json()
}

export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: User }>('/auth/me'),
}

export const notesApi = {
  list: (params?: { search?: string; tag?: string; archived?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.search) {
      qs.set('search', params.search)
    }
    if (params?.tag) {
      qs.set('tag', params.tag)
    }
    if (typeof params?.archived === 'boolean') {
      qs.set('archived', String(params.archived))
    }
    const query = qs.toString()
    return request<{ notes: Note[] }>(`/notes${query ? `?${query}` : ''}`)
  },
  get: (id: string) => request<{ note: Note }>(`/notes/${id}`),
  create: (data: Partial<Note>) =>
    request<{ note: Note }>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Note>) =>
    request<{ note: Note }>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/notes/${id}`, { method: 'DELETE' }),
  share: (id: string) => request<{ shareId: string }>(`/notes/${id}/share`, { method: 'POST' }),
  summarise: (id: string) =>
    request<{ generation: AiGeneration }>(`/notes/${id}/summarise`, { method: 'POST' }),
}

export const sharedApi = {
  get: (shareId: string) => request<{ note: Note }>(`/shared/${shareId}`),
}

export const insightsApi = {
  get: () => request<Insights>('/insights'),
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface AiGeneration {
  id: string
  summary: string
  actionItems: string[]
  suggestedTitle: string
  tokensUsed: number
  model: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  isArchived: boolean
  isPublic: boolean
  shareId: string | null
  createdAt: string
  updatedAt: string
  noteTags: { tag: Tag }[]
  aiGenerations: AiGeneration[]
}

export interface Insights {
  totalNotes: number
  recentNotes: Pick<Note, 'id' | 'title' | 'updatedAt'>[]
  topTags: (Tag & { useCount: number })[]
  aiStats: { totalGenerations: number; totalTokensUsed: number }
  weeklyActivity: { day: string; count: number }[]
}