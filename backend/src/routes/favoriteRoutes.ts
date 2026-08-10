import { Router } from 'express'
import { getVideoFavoriteStatus, toggleFavorite, getUserFavorites } from '../controllers/favoriteController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/:id/favorites', getVideoFavoriteStatus)
router.post('/:id/favorites', authMiddleware, toggleFavorite)
router.get('/user/:userId/favorites', authMiddleware, getUserFavorites)

export default router
