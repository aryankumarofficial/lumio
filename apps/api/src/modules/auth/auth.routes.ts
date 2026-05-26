import { Router } from 'express'
import { signup, login, logout, me } from './auth.controller.js'

export const authRoutes: import('express').Router = Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.get('/me', me)
