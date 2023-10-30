import { Response, Request, NextFunction } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { EmailVerifyReqBody, LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/User.request'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
export const loginController = async (req: Request, res: Response) => {
  //vào req lấy user và _id của user đó
  // dùng cái user_id đó tạo access và refresh_token
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userServices.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
//todo----------------------------------------------------------------registerController
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userServices.register(req.body)
  return res.status(201).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

// logout:
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ body
  const refresh_token = req.body.refresh_token
  // gọi hàm logout, hàm nhận vào refresh_token tìm và xóa
  const result = await userServices.logout(refresh_token)
  res.json(result)
}

// email_verify_controoler
export const emailVerifyController = async (req: Request<ParamsDictionary, any, EmailVerifyReqBody>, res: Response) => {
  // khi mà req vòa được, thì email_Verify_token đã valid
  //đồng thời trong req có decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // tìm xem có user có mã nàu khôbng
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // nếu có user thì kiểm tra, xem user có lưu email_verify_token không>
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // nếu xún đc dậy, nghĩa là user này là có và chưa verify
  // verifyEmail(user_id): là tìm user đó bằng user_id và
  // update lại email_verify_tiken thành ''
  // và verify: 1
  const result = userServices.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
