const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  UNPROCESSABLE_ENTITY: 422,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

export default HTTP_STATUS
//request handler & errorhandle là gì?
//throw new Error torng checkSchema nhận lỗi status bao nhiêu?
//throw new ErrorWithMessage trong checkSchema thì sao ?
// 2 throw đó trong hàm bình thường khác gì với async ?
// nếu async thì nên làm gì khi throw ?
// wrapAsync có nhiệm vụ gì ?
//omit của lodash có nv gì ?
// file HttpStatus , message, error lưu gì ?
// khi login thì ng dùng truyền gì, ta phải làm gì ?
