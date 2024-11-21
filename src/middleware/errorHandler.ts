import { Elysia } from 'elysia';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle Prisma specific errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          set.status = 409;
          return {
            error: 'Resource already exists',
            details: error.message
          };
        case 'P2025': // Record not found
          set.status = 404;
          return {
            error: 'Resource not found',
            details: error.message
          };
        default:
          set.status = 400;
          return {
            error: 'Database error',
            details: error.message
          };
      }
    }

    if (error instanceof PrismaClientValidationError) {
      set.status = 400;
      return {
        error: 'Validation error',
        details: error.message
      };
    }

    // Handle other types of errors
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return {
          error: 'Not Found',
          details: error.message
        };
      case 'VALIDATION':
        set.status = 400;
        return {
          error: 'Validation Error',
          details: error.message
        };
      default:
        set.status = 500;
        return {
          error: 'Internal Server Error',
          details: error.message
        };
    }
  });