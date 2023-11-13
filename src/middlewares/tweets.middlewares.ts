import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'
const tweetTypes = numberEnumToArray(TweetType) // [0,1,2,4]
const tweetAudiences = numberEnumToArray(TweetAudience) //[0,1]
const mediaTypes = numberEnumToArray(MediaType) //[0,1]

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes], //[[0,1,2,3]]
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType // lấy ra type người dùng truyền
            //check xem nó có trong TweetType kay không
            //nếu `type` là
            //`retweet`, `comment`, `quotetweet` thì `parent_id` phải là `tweet_id`
            //của tweet cha
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }
            // nếu `type` là `tweet` thì `parent_id` phải là `null`, khác thì lỗi
            if (type == TweetType.Tweet && value != null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            //oke thì trả về true
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType // lấy type ra
            const mentions = req.body as string[] //không dùng destructuring vì
            const hashtags = req.body as string[] // không định nghĩa kiểu dữ liệu được
            //nếu `type` là `tweet` , `comment` , `quotetweet` và không có mention hay hashtag
            //    thì `content` phải là string và không được rỗng
            if (
              [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              value.trim() == ''
            ) {
              //thì nó không phải là  `tweet` , `comment` , `quotetweet`
              // sẽ báo lỗi về
              //isEmpty() của lodash
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }
            // nếu `type` là `retweet` thì `content` phải là `''` (rỗng)
            if (type == TweetType.Retweet && value != '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            //oke thì trả về true
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //đi qua mỗi phần tử trong array xem nó có phải là string hay không
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            //tới đây là hashtag hợp lệ
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //ddi qua mỗi phần tử trong array xem nos cos phải là user_id
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_user_id)
            }
            //oke thì trả về true
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //yêu cầu mỗi phần tử trong array phải là Media Object
            if (
              value.some((item: any) => {
                //check url có phải string ko, mediaTypes valid hay không
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            //oke thì trả về true
            return true
          }
        }
      }
    },

    ['body']
  )
)
