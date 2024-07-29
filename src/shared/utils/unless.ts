/**
 * applyMiddlewareExceptSpecificPaths
 */

import { Request, Response, NextFunction } from 'express';

export const unless = (middleware: (req: Request, res: Response, next: NextFunction) => void, paths: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const pathCheck = paths.some((path) => path === req.path);
        pathCheck ? next() : middleware(req, res, next);
    };
};


