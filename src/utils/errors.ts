export class ChatStoreError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ChatStoreError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}