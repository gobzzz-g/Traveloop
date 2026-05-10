import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  success = true,
  message,
  data,
  meta,
}: ApiResponseOptions<T>): void {
  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
}

export function getPaginationParams(
  page: string | undefined,
  limit: string | undefined
): { skip: number; take: number; page: number; limit: number } {
  const pageNum = Math.max(1, parseInt(page || '1'));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10')));
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    page: pageNum,
    limit: limitNum,
  };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
