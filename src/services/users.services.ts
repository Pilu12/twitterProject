import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { config } from 'dotenv'
config()
class UserServices {
  // F tạo accessToken
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  // F tạo refreshToken
  private signREfreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToKen },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  async register(payLoad: RegisterReqBody) {
    // const { email, password } = payLoad
    const result = await databaseService.users.insertOne(
      new User({
        ...payLoad,
        date_of_birth: new Date(payLoad.date_of_birth),
        password: hashPassword(payLoad.password)
      })
    )
    // lấy user_id từ accout vừa tạo
    const user_id = result.insertedId.toString()
    // tạo ra access từ user_id và refresh
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signREfreshToken(user_id)
    ])
    return { access_token, refresh_token }
  }
  async checkEmailExist(email: string) {
    // vào database tìm user có email
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
}

const userServices = new UserServices()
export default userServices
