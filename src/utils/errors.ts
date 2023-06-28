export class ChatStoreError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ChatStoreError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CharacterStoreError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CharacterStoreError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DecodingError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DecodingError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MissingCharacterPropertiesError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DecodingError.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
