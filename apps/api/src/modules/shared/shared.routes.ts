import { Router } from 'express'
import { getSharedNote } from './shared.controller.js'

export const sharedRoutes: import('express').Router = Router()

sharedRoutes.get('/:shareId', getSharedNote)
