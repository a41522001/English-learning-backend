class ResponseModel<T> {
  code: number;
  data: T;
  message: string;
  time: string;
  token?: string;
  constructor(code: number, message: string, data: T, token?: string) {
    this.code = code;
    this.data = data;
    this.message = message;
    this.time = new Date().toISOString();
    if (token) {
      this.token = token;
    }
  }
  static successResponse<T>(data: T, message: string = '成功', code: number = 100) {
    return new ResponseModel(code, message, data);
  }
  static errorResponse(message: string, code: number, data: null = null) {
    return new ResponseModel(code, message, data);
  }
  static loginResponse(message: string, code: number, data: null = null) {
    return new ResponseModel(code, message, data);
  }
}
export default ResponseModel;
