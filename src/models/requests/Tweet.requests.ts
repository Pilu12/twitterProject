import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'
/*
khi ngươi dùng muốn đăng bài, thì người ta phải truyền: 
*/
export interface TweetRequestBody {
  type: TweetType // dạng bài
  audience: TweetAudience // ai có thểm xem được
  content: string // nội dung
  parent_id: null | string //  không là ObjectID được vif ->
  hashtags: string[] //người dùng truyền lên dạng string, ->
  mentions: string[] //mình sẽ convert sang ObjectId sau
  medias: Media[]
}
