import { Response, Request, NextFunction } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EmailVerifyReqBody,
  ForgotPasswordReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload
} from '~/models/requests/User.request'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
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

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // qua được bên đây thì đã qua đc accessTokenValidator
  // là bên trong req đã có đecoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  // tìm user có user _ id này
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // nếu ko có user thì res lỗi
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // nếu có thì xem nó verify chưa
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu xuống đây thì user chưa verify và bị mất email_verify_token
  //tiến hành tạo mới email_verify_token và lưu vào datavase
  const result = await userServices.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  // vì đã qua fotgotPAsswordValidator nên req có user
  const { _id } = req.user as User
  // tiến hnahf tạo forgot_pasword_token và luu vào user và kèm gửi mail cho user
  const result = await userServices.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // dùng user_id dods tìm user và update lai password
  const result = await userServices.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  // vào database tìm userr có user_d đó và đưa cho client
  const result = await userServices.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}
