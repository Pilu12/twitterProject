import { Router } from 'express'
import { register, wrap } from 'module'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oAuthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyValidator,
  followValidator,
  forgotPasswordValidator,
  loginVAlidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.request'
import { wrapAsync } from '~/utils/handlers'

const usersRouter = Router()
/*
des: đăng nhập
path: /users/register
method: POST
body: {email, password}
*/
usersRouter.post('/login', loginVAlidator, wrapAsync(loginController))

// usersRouter.post('/register', registerValidator, registerController)
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

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
mình sẽ verifu cái token này, nếu thành cồn thì mình se cho ngta reset password
body: {forgotpassword: strng} */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordController)
)

/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)
/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))
/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>}
body: {followed_user_id: string}
*/
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))
//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers
/*
6543b1e35b581595d14702ea 
follow 
65434b9d03a35d0a23f48af9
*/
//============================================================================
/*
    des: unfollow someone
    path: '/follow/:user_id'
    method: delete
    headers: {Authorization: Bearer <access_token>}
  g}
    */
usersRouter.delete(
  '/unfollow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

//unfollowValidator: kiểm tra user_id truyền qua params có hợp lệ hay k?

/*
  des: change password
  path: '/change-password'
  method: PUT
  headers: {Authorization: Bearer <access_token>}
  Body: {old_password: string, password: string, confirm_password: string}
g}
  */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/*
  des: refreshtoken
  path: '/refresh-token'
  method: POST
  Body: {refresh_token: string}
g}
  */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

usersRouter.get('/oauth/google', wrapAsync(oAuthController))
export default usersRouter
