export class EmptyAddressError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EmptyAddressError.prototype);
  }
}

export class InvalidBech32Error extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidBech32Error.prototype);
  }
}

export class EmptyAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EmptyAmountError.prototype);
  }
}

export class InvalidNumberAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidNumberAmountError.prototype);
  }
}

export class ZeroAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ZeroAmountError.prototype);
  }
}

export class NagativeAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NagativeAmountError.prototype);
  }
}

export class InsufficientAmountError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientAmountError.prototype);
  }
}

export class InsufficientFeeError extends Error {
  constructor(m: string) {
    super(m);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InsufficientFeeError.prototype);
  }
}