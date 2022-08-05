import { DataSelector } from './spider';

export enum GenericResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error' // a backend error
}

export interface IWebSocketResponse {
  status: GenericResponseStatus;
  message?: string;
  data?: unknown;
  selector?: DataSelector;
}

export interface IAPIResponse {
  status: GenericResponseStatus;
  message?: string;
  data?: unknown;
  selector?: DataSelector;
}
