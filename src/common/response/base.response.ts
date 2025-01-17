export interface BaseResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;
  readonly error?: string;
  readonly statusCode: number;
}

export class SuccessResponse<T> implements BaseResponse<T> {
  readonly success: boolean = true;
  readonly message: string;
  readonly statusCode: number;
  readonly data: T;

  constructor(data: T, message: string = 'Success', statusCode: number = 200) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ErrorResponse implements BaseResponse<null> {
  readonly success: boolean = false;
  readonly message: string;
  readonly error: string;
  readonly statusCode: number;
  readonly data?: null;

  constructor(
    error: string,
    message: string = 'Error',
    statusCode: number = 400,
  ) {
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
  }
}
