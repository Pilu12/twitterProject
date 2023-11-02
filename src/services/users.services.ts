import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { USERS_MESSAGES } from '~/constants/messages'
config()
class UserServices {
  // F tạo accessToken
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }
  // F tạo refreshToken
  private signREfreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToKen },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  private signEmailVeryfyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }
  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signREfreshToken(user_id)])
  }
  async register(payLoad: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVeryfyToken(user_id.toString())
    // const { email, password } = payLoad
    const result = await databaseService.users.insertOne(
      new User({
        ...payLoad,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payLoad.date_of_birth),
        password: hashPassword(payLoad.password)
      })
    )
    // lấy user_id từ accout vừa tạo

    // tạo ra access từ user_id và refresh
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    // lưu refreshToken vào database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    console.log(email_verify_token)

    return { access_token, refresh_token }
  }
  async checkEmailExist(email: string) {
    // vào database tìm user có email
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async login(user_id: string) {
    //dùng user_id tạo access_refresh
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    // lưu refresh_token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refresh_token }
    //return access refresh cho controller
  }
  async logout(refresh_token: string) {
    //dungf refresh_token tim va xoa
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      mesage: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async verifyEmail(user_id: string) {
    // tạo access và refresh token cho client và lưu refreshtoken vào database
    //đồng thời tìm user và update lại email_verify_token thành '', verify: 1, updateAt
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refresh_token }
  }
  async resendEmailVerify(user_id: string) {
    // tạo email_verify_token mới
    const email_verify_token = await this.signEmailVeryfyToken(user_id)
    // update lai email_verify_token
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    console.log(email_verify_token)
    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }
  async forgotPassword(user_id: string) {
    // tạo ra forgot_password_token mới
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    // update lại user với forgot_password_token mới và update_at vào database
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TORESET_PASSWORD
    }

    // gửi mail cho user
    //thông báo gửi thành công
  }
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    // dùng user_id update lại pass wword
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password),
          update_at: '$$NOW'
        }
      }
    ])
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
}

const userServices = new UserServices()
export default userServices
