import { IAuthPayload } from "../../modules/auth/auth.interface";
import logger from "../../config/logger";
import { InvalidIdException, NotFoundException, NotOwnerOfProfileException, ParamRequiredException } from "../exceptions";
import Profile from "../models/profile";
import { INVALID_UUID } from "../constants";

// 3rd party dependencies
import { Request, Response, NextFunction } from "express";

export async function isOwnerOfProfileGuard(req: Request, res: Response, next: NextFunction) {
    logger.debug('validating if user is owner of profile');

    try {
        const { profileId } = (req.params) as { profileId: string }; // profileId for user endpoints is a param in the path
        if (!profileId) {
            throw new ParamRequiredException('profileId');
        }
        const { id: userId } = req.user as IAuthPayload;
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