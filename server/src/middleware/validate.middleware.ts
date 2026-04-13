import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware factory for request body validation using Zod schemas
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors?.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
  };
};
