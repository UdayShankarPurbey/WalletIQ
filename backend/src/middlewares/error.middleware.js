import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

const toApiError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof ZodError) {
    return new ApiError(
      400,
      'Validation failed',
      err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new ApiError(
      400,
      'Validation failed',
      Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })),
    );
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] ?? 'field';
    return new ApiError(409, `Duplicate ${field}`);
  }

  if (err instanceof jwt.TokenExpiredError) {
    return new ApiError(401, 'Token expired');
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return new ApiError(401, 'Invalid token');
  }

  return new ApiError(
    err.statusCode || 500,
    err.message || 'Internal server error',
    [],
    err.stack,
  );
};

const errorHandler = (err, req, res, _next) => {
  const apiErr = toApiError(err);

  const meta = { method: req.method, url: req.originalUrl, statusCode: apiErr.statusCode };
  if (apiErr.statusCode >= 500) {
    logger.error(apiErr.message, { ...meta, stack: apiErr.stack });
  } else {
    logger.warn(apiErr.message, meta);
  }

  res.status(apiErr.statusCode).json({
    statusCode: apiErr.statusCode,
    success: false,
    message: apiErr.message,
    errors: apiErr.errors,
    ...(process.env.NODE_ENV !== 'production' ? { stack: apiErr.stack } : {}),
  });
};

export { errorHandler };
