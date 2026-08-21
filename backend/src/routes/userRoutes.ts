import { Router } from 'express'
import { getUserProfile, getUserVideos, updateUserProfile, uploadUserAvatar, getCreators } from '../controllers/userController'
import { getReceivedLikes } from '../controllers/likeController'
import { authMiddleware } from '../middleware/auth'
import { uploadAvatar } from '../middleware/uploadAvatar'

const router = Router()

router.get('/', getCreators)
router.get('/:id', getUserProfile)
router.get('/:id/videos', getUserVideos)
router.get('/:id/received-likes', authMiddleware, getReceivedLikes)
router.put('/:id', authMiddleware, updateUserProfile)
router.post('/:id/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadUserAvatar)

export default router
