import { Router, Request, Response, NextFunction } from 'express';
import WarmService from './warm-table.service'; // Adjust the import according to your project structure
import { IWarmAddPayload } from './warm-table.interface'; // Adjust the import according to your project structure
import { accessTokenGuard, requireAnyOfThoseRoles } from '../../shared/middlewares';
import { RoleEnum } from '../../shared/enums';

class WarmController {
    private warmService: WarmService | null = null;
    public router = Router();

    constructor() {
        this.warmService = new WarmService();
        this.routes();
    }

    public routes() {
        // Route for adding a new warm (no access control, anyone can post)
        this.router.post('/warm', this.addWarm);

        // Route for getting all warms (requires access token and specific roles)
        this.router.get(
            '/warm',
            accessTokenGuard,
            requireAnyOfThoseRoles([RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN]),
            this.getAllWarms
        );
    }

    public addWarm = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: IWarmAddPayload = req.body;
            const newWarm = await this.warmService?.addWarm(payload);
            res.status(201).json(newWarm);
        } catch (error: any) {
            next(error); // Forward error to the error-handling middleware
        }
    }

    public getAllWarms = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const warms = await this.warmService?.getAllWarms();
            res.status(200).json(warms);
        } catch (error: any) {
            next(error); // Forward error to the error-handling middleware
        }
    }
}

export default WarmController;
