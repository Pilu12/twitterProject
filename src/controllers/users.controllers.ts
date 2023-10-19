import { Response, Request } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456') {
    res.json({
      data: [
        { name: 'Diep', yob: 1999 },
        { name: 'Hung', yob: 2003 },
        { name: 'Thanh', yob: 1994 }
      ]
    })
  } else {
    res.status(400).json({
      message: 'login failed'
    })
  }
}
//todo----------------------------------------------------------------registerController
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  //const { email, password, name, confirm_password, date_of_birth } = req.body
  try {
    // tạo 1 user mới và bỏ vao Collection users trong database
    const result = await userServices.register(req.body)
    return res.status(201).json({
      message: 'register successful',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'register failed',
      error
    })
  }
}
