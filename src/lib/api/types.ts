export type PaginationMeta = { page: number; pageSize: number; total: number };
export type ApiSuccess<T> = { ok: true; data: T; meta?: PaginationMeta };
export type ApiFailure = { ok: false; error: { code: string; message: string; fields?: Record<string, string[]> }; requestId?: string };
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
export type ApiResult<T> = { data: T; meta?: PaginationMeta };
