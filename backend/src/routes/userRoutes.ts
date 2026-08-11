import { Router } from 'express'
import { getUserProfile, getUserVideos, updateUserProfile, uploadUserAvatar } from '../controllers/userController'
import { authMiddleware } from '../middleware/auth'
import { uploadAvatar } from '../middleware/uploadAvatar'

const router = Router()

router.get('/:id', getUserProfile)
router.get('/:id/videos', getUserVideos)
router.put('/:id', authMiddleware, updateUserProfile)
router.post('/:id/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadUserAvatar)

export default router
