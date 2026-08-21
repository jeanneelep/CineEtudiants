import { Response, NextFunction } from 'express'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'
import fs from 'fs'
import { AuthRequest } from './auth'

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

const MAX_DURATION_SECONDS = 45 * 60

function rejectFile(req: AuthRequest, res: Response, message: string) {
  const file = (req as any).file || (req as any).files?.videoFile?.[0]
  const thumbnailFile = (req as any).files?.thumbnail?.[0]
  if (file) fs.unlink(file.path, () => {})
  if (thumbnailFile) fs.unlink(thumbnailFile.path, () => {})
  res.status(400).json({ error: message })
}

export const validateVideo = (req: AuthRequest, res: Response, next: NextFunction) => {
  const file = (req as any).file || (req as any).files?.videoFile?.[0]

  if (!file) {
    return next()
  }

  ffmpeg.ffprobe(file.path, (err, metadata) => {
    if (err) {
      return rejectFile(req, res, 'Format non supporté, réexporte en H.264 et réessaie.')
    }

    const videoStream = metadata.streams.find(s => s.codec_type === 'video')
    const audioStream = metadata.streams.find(s => s.codec_type === 'audio')
    const duration = metadata.format.duration || 0

    if (videoStream?.codec_name !== 'h264' || audioStream?.codec_name !== 'aac') {
      return rejectFile(req, res, 'Format non supporté, réexporte en H.264 et réessaie.')
    }

    if (duration <= 0 || duration > MAX_DURATION_SECONDS) {
      return rejectFile(req, res, 'Vidéo trop longue (45 minutes maximum).')
    }

    ;(req as any).videoDuration = Math.round(duration)
    next()
  })
}
