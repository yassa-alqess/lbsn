//file dependinces
import Controller from './shared/interfaces/controller.interface';
import { ENV, PORT } from './config/env'; //will also trigger dotenv config procedure
import { syncDatabase } from './config/database/connection';
import logger from './config/logger';

//3rd party dependinces
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import { Server } from 'http';

export default class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this._initializeConnection();
        this._initializeMiddlewares();
        this._initializeControllers(controllers);
    }

    private async _initializeConnection() {
        try {
            await syncDatabase();
        }
        catch (error) {
            logger.error('Unable to connect,', error);
            process.exit(1);
        }
    }

    private _initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true })); // no need for body-parser
        this.app.use(cors(
            {
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
                allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
            },
        ));
        this.app.use(helmet());
        this.app.use(
            rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100, // limit each IP to 100 requests per windowMs
            }),
        );
        this.app.set('trust proxy', 1); // trust nginx
    }

    private _initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/api/v0.1/', controller.router);
        });
    }

    public listen(): Server | null {
        this.app.get('/', (_, res) => {
            res.sendStatus(StatusCodes.OK);
        });
        return this.app.listen(PORT, () => {
            logger.info(`⚡️[server]: Server is running at http://localhost:${PORT} in ${ENV} mode`);
        });
    }
    // ! static files are handled with Nginx

}
