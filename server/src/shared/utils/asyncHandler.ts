import { Response, NextFunction } from 'express';

export const asyncHandler = (
  fn: (req: any, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
