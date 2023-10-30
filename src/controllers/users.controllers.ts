import { Response, Request, NextFunction } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
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
