import { APIGatewayProxyResult } from "aws-lambda";
import { formatResponse } from "./format-response";

export enum OAuthError {
  ACCESS_DENIED = "access_denied",
  INVALID_REQUEST = "invalid_request",
  INVALID_CLIENT = "invalid_client",
}

export enum APIError {
  INTERNAL_ERROR = "internal_error",
  INVALID_REQUEST = "invalid_request",
  CONFLICT = "conflict",
  NOT_FOUND = "not_found",
}

export enum SigningError {
  NONCE = "invalid_nonce",
  SIGNATURE = "invalid_signature",
}
export const CANNOT_PROCESS_ERROR = "Cannot process request.";
export const AUTHENTICATION_FAILED_ERROR = "Client authentication failed.";
export const INVALID_REQUEST_ERROR = "Invalid request.";
export const NOT_FOUND_ERROR = "Resource not found.";

export const internalServerError = (): APIGatewayProxyResult =>
  formatResponse(500, {
    error: APIError.INTERNAL_ERROR,
    error_description: CANNOT_PROCESS_ERROR,
  });

export const unauthenticated = (
  errorDescription = AUTHENTICATION_FAILED_ERROR
): APIGatewayProxyResult =>
  formatResponse(401, {
    error: OAuthError.ACCESS_DENIED,
    error_description: errorDescription,
  });

export const invalidRequest = (): APIGatewayProxyResult =>
  formatResponse(400, {
    error: APIError.INVALID_REQUEST,
    error_description: INVALID_REQUEST_ERROR,
  });

export const invalidSignature = (): APIGatewayProxyResult =>
  formatResponse(400, {
    error: SigningError.SIGNATURE,
    error_description: CANNOT_PROCESS_ERROR,
  });

export const notFound = (): APIGatewayProxyResult =>
  formatResponse(404, {
    error: APIError.NOT_FOUND,
    error_description: NOT_FOUND_ERROR,
  });
