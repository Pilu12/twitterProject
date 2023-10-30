import { Router } from 'express'
import { register, wrap } from 'module'
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyValidator,
  loginVAlidator,
  refreshTokenValidator,
  registerValidator
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
export default usersRouter
