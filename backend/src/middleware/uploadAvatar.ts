import multer from 'multer'
import path from 'path'
import fs from 'fs'

const avatarDir = path.join(__dirname, '../../uploads/avatars')

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const userId = (req as any).userId || 'unknown'
    cb(null, `${userId}-${Date.now()}${ext}`)
  }
})

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG or WEBP images are allowed'))
  }
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})
