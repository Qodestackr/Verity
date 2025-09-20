import { NextResponse } from "next/server";

export interface ApiErrorOptions {
  code: ApiErrorCode;
  message: string;
  status?: number;
  details?: Record<string, any>;
}

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit_exceeded"
  | "subscription_required"
  | "subscription_inactive"
  | "invite_pending"
  | "invite_expired"
  | "internal_server_error";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: Record<string, any>;

  constructor({ code, message, status, details }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;

    // Set appropriate HTTP status based on error code
    this.status = status || this.getStatusFromCode(code);
  }

  private getStatusFromCode(code: ApiErrorCode): number {
    switch (code) {
      case "bad_request":
        return 400;
      case "unauthorized":
        return 401;
      case "forbidden":
        return 403;
      case "not_found":
        return 404;
      case "rate_limit_exceeded":
        return 429;
      case "subscription_required":
      case "invite_pending":
      case "invite_expired":
        return 403;
      default:
        return 500;
    }
  }
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleApiError(
  error: unknown,
  headers: Record<string, string> = {}
): Response {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.status, headers }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "internal_server_error",
        message: "An unexpected error occurred",
      },
    },
    { status: 500, headers }
  );
}
