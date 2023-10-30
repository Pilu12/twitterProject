import { error } from 'console'
import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
// trong err có status và message
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  //nơi tập kết lỗi
  console.log(err.message)
  // neếu lỗi thuộc Dạng ErrorWithStatus thì trả về status và message
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  //còn nếu xuống đây thì error là lỗi mặc định
  //err{message, stack, name} // do stack sẽ hiện dòng lỗi nên omit nó
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })

  // ném lỗi nó cho người dùng
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}
