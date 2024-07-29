/**
 * The `unless middleware` function is used to conditionally apply another middleware function based on the request path.
 */

import { Request, Response, NextFunction } from 'express';

export const unless = (middleware: (req: Request, res: Response, next: NextFunction) => void, paths: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const pathCheck = paths.some((path) => path === req.path);
        pathCheck ? next() : middleware(req, res, next);
    };
};


