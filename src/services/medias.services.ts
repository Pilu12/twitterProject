import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
import { result } from 'lodash'
class MediaService {
  async uploadImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    // xử lí file = sharp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        //xóa file trong temp
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.POST}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    // lưu video vào trong uploads/temp
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (video) => {
        const { newFilename } = video

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.POST}/static/video/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediaService()
export default mediasService
