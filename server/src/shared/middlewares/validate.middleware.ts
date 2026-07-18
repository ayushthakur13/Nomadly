import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, target: 'body' | 'params' | 'query' = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues.map(issue => {
            const pathStr = issue.path.join('.');
            return pathStr ? `${pathStr}: ${issue.message}` : issue.message;
          })
        });
        return;
      }
      next(error);
    }
  };
}
