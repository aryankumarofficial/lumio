import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { getInsights } from './insights.controller.js'

export const insightsRoutes: import('express').Router = Router()

insightsRoutes.use(authenticate)

insightsRoutes.get('/', getInsights)
