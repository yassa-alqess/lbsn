import { IAuthPayload } from "../../modules/auth/auth.interface";
import logger from "../../config/logger";
import { InvalidIdException, NotFoundException, NotOwnerOfProfileException } from "../exceptions";
import Profile from "../models/profile";
import { INVALID_UUID } from "../constants";

// 3rd party dependencies
import { Request, Response, NextFunction } from "express";

export async function isOwnerOfProfileGuard(req: Request, res: Response, next: NextFunction) {
    logger.debug('validating if user is owner of profile');
    const profileId = req.query?.profileId as string || req.body?.profileId as string; // profileId can be a query string or body param
    const { id: userId } = req.user as IAuthPayload;

    try {
        const profile = await Profile.findOne({ where: { profileId } });

        if (!profile) {
            throw new NotFoundException('Profile', 'profileId', profileId);
        }

        if (profile.userId !== userId) {
            throw new NotOwnerOfProfileException();
        }

        next();
        //eslint-disable-next-line
    } catch (error: any) {
        if (error?.original?.code == INVALID_UUID) { //invalid input syntax for type uuid
            return next(new InvalidIdException('profileId'));
        }
        next(error);
    }
}