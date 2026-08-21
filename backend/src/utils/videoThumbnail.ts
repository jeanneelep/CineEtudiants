import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'
import path from 'path'
import fs from 'fs'

ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

const thumbnailDir = path.join(__dirname, '../../uploads/thumbnails')

if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true })
}

export function generateThumbnail(videoPath: string, videoFilename: string): Promise<string | null> {
  return new Promise((resolve) => {
    const thumbnailFilename = `${path.parse(videoFilename).name}.jpg`

    ffmpeg(videoPath)
      .on('end', () => resolve(`/uploads/thumbnails/${thumbnailFilename}`))
      .on('error', () => resolve(null))
      .screenshots({
        timestamps: ['1'],
        filename: thumbnailFilename,
        folder: thumbnailDir,
        size: '640x?'
      })
  })
}
