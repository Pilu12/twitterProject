import path, { resolve } from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { Files } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { reject } from 'lodash'

//tạo folder để lưu ảnh
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // cho phép tạo folder nested vào nhau
      })
    }
  })
  //fs thư viện thao tác đường dẫn
}
//lấy name ko lấy đuôi
export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('')
}

export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')

  return nameArr[nameArr.length - 1]
}

//xử lí file mà client gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu ở đâu
    maxFiles: 4, //tối đa bao nhiêu
    keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg
    maxFileSize: 300 * 1024 * 4, //tối đa bao nhiêu byte, 300kb
    filter: function ({ name, originalFilename, mimetype }) {
      //mimetype: kiểu file
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //mimetype? nếu là string thì check, k thì thôi
      //ép Boolean luôn, nếu k thì valid sẽ là boolean | undefined
      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      //nếu đúng thì return valid
      return valid
    }
  })
  //form.parse về thành promise
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

//vào body nhận req xử lí video xem có thỏa yêu cầu và lưu vào video
export const handleUploadVideo = async (req: Request) => {
  //cấu hình nhận vào video thế nào : formmidable
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, // uploads/video
    maxFiles: 1,
    maxFieldsSize: 50 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = 'video' && Boolean(mimetype?.includes('video/'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.video) {
        return reject(new Error('Video is empty'))
      }
      //lấy ra danh sách video đã up
      const videos = files.video as File[]
      //gán đuôi cũ
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        //filepath la link dẫn đến video, vì ko dùng keepExtension
        fs.renameSync(video.filepath, video.filepath + '.' + ext)

        video.newFilename = video.newFilename + '.' + ext
      })

      return resolve(files.video as File[])
    })
  })
}
