import express, { NextFunction, Response, Request } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'

const app = express()
const PORT = 3000
databaseService.connect()

app.use(express.json())
app.get('/', (req, res) => {
  res.send('HeLLo world')
})

app.use('/users', usersRouter)
//localhost:3000/api/tweets

//app dùng 1 errorHandler tổng
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server dang open : ${PORT}`)
})
export default usersRouter
