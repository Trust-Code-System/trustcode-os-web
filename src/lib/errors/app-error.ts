export type AppErrorShape = {
  code?: string;
  message: string;
  status?: number;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
  requestId?: string;
};

export class AppError extends Error implements AppErrorShape {
  readonly code?: string;
  readonly status?: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(input: AppErrorShape) {
    super(input.message);
    this.name = "AppError";
    if (input.code !== undefined) this.code = input.code;
    if (input.status !== undefined) this.status = input.status;
    if (input.fieldErrors !== undefined) this.fieldErrors = input.fieldErrors;
    if (input.details !== undefined) this.details = input.details;
    if (input.requestId !== undefined) this.requestId = input.requestId;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError({ code: "REQUEST_ABORTED", message: "The request was cancelled." });
  }
  return new AppError({ code: "UNEXPECTED_ERROR", message: "Something went wrong. Please try again." });
}
