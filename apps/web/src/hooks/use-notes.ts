import { create } from 'zustand'
import { notesApi, type Note } from '../lib/api'

interface NotesState {
  notes: Note[]
  loading: boolean
  search: string
  activeTag: string | null
  setSearch: (query: string) => void
  setTag: (tag: string | null) => void
  fetchNotes: () => Promise<void>
  createNote: () => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
}

export const useNotes = create<NotesState>()((set, get) => ({
  notes: [],
  loading: false,
  search: '',
  activeTag: null,

  setSearch: (search) => {
    set({ search })
    void get().fetchNotes()
  },
  setTag: (tag) => {
    set({ activeTag: tag })
    void get().fetchNotes()
  },

  fetchNotes: async () => {
    set({ loading: true })
    try {
      const { search, activeTag } = get()
      const data = await notesApi.list({
        search: search || undefined,
        tag: activeTag ?? undefined,
      })
      set({ notes: data.notes })
    } finally {
      set({ loading: false })
    }
  },

  createNote: async () => {
    const data = await notesApi.create({ title: 'Untitled', content: '' })
    set((state) => ({ notes: [data.note, ...state.notes] }))
    return data.note
  },

  updateNote: async (id, updates) => {
    const data = await notesApi.update(id, updates)
    set((state) => ({ notes: state.notes.map((note) => (note.id === id ? data.note : note)) }))
  },

  deleteNote: async (id) => {
    await notesApi.delete(id)
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }))
  },
}))