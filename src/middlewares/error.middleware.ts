import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
// trong err có status và message
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err.message)
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
