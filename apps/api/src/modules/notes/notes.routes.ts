import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import {
    getNotes,
    createNote,
    getNote,
    updateNote,
    deleteNote,
    shareNote,
    summariseNote,
    summariseNoteStream,
} from './notes.controller.js'

export const notesRoutes: import('express').Router = Router()

notesRoutes.use(authenticate)

notesRoutes.get('/', getNotes)
notesRoutes.post('/', createNote)
notesRoutes.get('/:id', getNote)
notesRoutes.patch('/:id', updateNote)
notesRoutes.delete('/:id', deleteNote)

notesRoutes.post('/:id/share', shareNote)
notesRoutes.post('/:id/summarise', summariseNote)
notesRoutes.post('/:id/summarise/stream', summariseNoteStream)
