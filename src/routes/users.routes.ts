import { Router } from 'express'
import { register, wrap } from 'module'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyValidator,
  forgotPasswordValidator,
  loginVAlidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const usersRouter = Router()
/*
des: đăng nhập
path: /users/register
method: POST
body: {email, password}
*/
usersRouter.get('/login', loginVAlidator, wrapAsync(loginController))

// usersRouter.post('/register', registerValidator, registerController)
usersRouter.post(
  '/register',
  registerValidator,
  wrapAsync(registerController)
  //   (req, res, next) => {
  //     console.log('Req handler1')
  //     next(new Error('Error in handler 1'))
  //   }, // async -> next bth, throw bi loi do || hoặc try cath bát nó
  //   // con bth thi bth hehe
  //   (req, res, next) => {
  //     console.log('Req handler2')
  //     next()
  //   },
  //   (req, res, next) => {
  //     console.log('Req handler3')
  //     res.json({ message: `Register Success` })
)
//dês: đang xuất
// path: /users/logout
//method: POST
// Header: {Authorization: Bearer <access_token>}
// body: {refresh_token: string}

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
//verify email
/*
khi người dùng đăng ký, email, tỏng email của họ sẽ có 1 link 
trong link này đã setup sẵn 1 req kèm email verifyToken
thì verify-email  cho req đó 
method: POST
path: /userrs/verify-email
body: {email_verify_token: string}
*/
usersRouter.post('/verify-email', emailVerifyValidator, wrapAsync(emailVerifyController))
/*
resend email verify 
method: POST  
Header: Authorization: Bearer <access_token>

*/
usersRouter.post('/resend-email-verify', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
forgot- password 
khi người dùng quên mật khẩu, họ cung cấp email cho mình 
mình xem user sở hữu email đó ko 
nếu có thì tạo 1 forgot_password_token và gửi vào email của user đó 

method: POST 
path: /users/forgot-password
body: (email: string)
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))
/*
dess: verify forgot password token
người dùng sau khi báo forgot pasword họ sẽ nhận đc 1 email
họ vào và click vào link trong email đó, link đó có 1 req
đón kèm forgot_password_token và gửi lên server
mình sẽ verifu cái token này, nếu thành cồn thì mình sex cho ngta reset password
body: {forgotpassword: strng} */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordController)
)
export default usersRouter
