import { Router } from 'express'
import { register } from 'module'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginVAlidator, registerValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

usersRouter.get('/login', loginVAlidator, loginController)
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
