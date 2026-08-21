import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const thumbnailDir = path.join(uploadDir, 'thumbnails')
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, file.fieldname === 'thumbnail' ? thumbnailDir : uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.fieldname === 'thumbnail') {
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPG, PNG or WEBP images are allowed for the thumbnail'))
    }
    return
  }
  const allowedMimes = ['video/mp4', 'video/quicktime']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only video files are allowed'))
  }
}

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
})
