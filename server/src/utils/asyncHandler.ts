import { Request, Response, NextFunction } from 'express';

/**
 * Async Route Handler Wrapper
 * Automatically catches errors and passes them to next() middleware
 * Eliminates need for try-catch in every route handler
 * Works with any Request type including extended interfaces like AuthRequest
 */
export const asyncHandler = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
