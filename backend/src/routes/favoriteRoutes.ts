import { Router } from 'express'
import { getVideoFavoriteStatus, toggleFavorite, getUserFavorites } from '../controllers/favoriteController'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/favorites', optionalAuthMiddleware, getVideoFavoriteStatus)
router.post('/:id/favorites', authMiddleware, toggleFavorite)
router.get('/user/:userId/favorites', authMiddleware, getUserFavorites)

export default router
