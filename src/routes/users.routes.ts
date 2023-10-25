import { Router } from 'express'
import { register } from 'module'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginVAlidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const usersRouter = Router()

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

export default usersRouter
