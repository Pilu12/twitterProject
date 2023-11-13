import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
config() // check nếu bị lỗi về connect
// xem cái config - xem cái tên bên .env, xem bỏ vô `` chưa
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@project.51pw1ig.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${process.env.DB_NAME}`)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTION_USERS as string)
  }

  async indexUsers() {
    const exist = await this.users.indexExists(['_id_', 'username_1', 'email_1', 'email_1_password_1'])
    if (exist) return

    await this.users.createIndex({ username: 1 }, { unique: true })
    await this.users.createIndex({ email: 1 }, { unique: true })
    await this.users.createIndex({ email: 1, password: 1 })
  }
  async indexRefreshTokens() {
    const exist = await this.users.indexExists(['token_1', 'exp_1'])
    if (exist) return
    this.refreshTokens.createIndex({ token: 1 })
    //đây là ttl index , sẽ tự động xóa các document khi hết hạn của exp
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  async indexFollowers() {
    const exist = await this.users.indexExists(['user_id_1', 'followed_user_id_1'])
    if (exist) return
    await this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
