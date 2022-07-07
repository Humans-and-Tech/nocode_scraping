import { ScrapingStatus, GenericResponseStatus, DataSelector } from './models';

export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class SelectorError extends BaseError {
  selector?: DataSelector;

  constructor(message: string, selector: DataSelector | undefined) {
    super(message);
    this.selector = selector;
  }
}

export class ScrapingError extends SelectorError {
  status: ScrapingStatus;

  constructor(
    message: string,
    status:
      | ScrapingStatus.ERROR
      | ScrapingStatus.NO_CONTENT
      | ScrapingStatus.ELEMENT_NOT_FOUND
      | ScrapingStatus.INVALID_SELECTOR,
    selector: DataSelector | undefined
  ) {
    super(message, selector);
    this.status = status;
  }
}

export class DataSelectorValidityError extends SelectorError {
  status: GenericResponseStatus;

  constructor(message: string, selector: DataSelector) {
    super(message, selector);
    this.status = GenericResponseStatus.ERROR;
  }
}
