import express, { NextFunction, Response, Request } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import staticRouter from './routes/static.routes'

config()
const app = express()
const PORT = process.env.POST || 4000
initFolder()
databaseService.connect()

app.use(express.json())
app.get('/', (req, res) => {
  res.send('HeLLo world')
})

app.use('/users', usersRouter)
//localhost:3000/api/tweets
app.use('/medias', mediasRouter)

// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)

//app dùng 1 errorHandler tổng
app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Server dang open : ${PORT}`)
})
export default usersRouter
