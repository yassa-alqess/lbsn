import { Sequelize, Op } from 'sequelize';
import * as cron from 'node-cron';
import GuestRequest from '../models/guest-request';  // Adjust the path as necessary
import { IsResolvedEnum } from '../enums'; // Ensure the path to enums is correct
import DatabaseManager from '../../config/database/db-manager';
import logger from '../../config/logger';


async function deleteUnresolvedGuestRequests() {
    const sequelize =  DatabaseManager.getSQLInstance();
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const unresolvedRequests = await GuestRequest.findAll({
            where: {
                resolved: IsResolvedEnum.PENDING,
                createdAt: {
                    [Op.lt]: oneMonthAgo
                }
            }
        });

        for (const request of unresolvedRequests) {
            const transaction = await sequelize.transaction();
            try {
                await request.destroy({ transaction });
                await transaction.commit();
                logger.info(`Successfully deleted guest request for guest ID ${request.guestId}.`);
            } catch (error: unknown) {
                await transaction.rollback();
                if (error instanceof Error) {
                    logger.error(`Failed to delete guest request for guest ID ${request.guestId}: ${error.message}`);
                } else {
                    logger.error(`Failed to delete guest request for guest ID ${request.guestId}: An unknown error occurred`);
                }
            }
        }

        logger.info('All unresolved guest requests have been processed.');
    } catch (error: unknown) {
        logger.error(`Error processing unresolved guest requests: ${typeof error === 'string' ? error : 'unknown error'}`);
    }
}

cron.schedule('0 0 * * *', deleteUnresolvedGuestRequests, {
    scheduled: true,
    timezone: "America/New_York" // Adjust the timezone to match your locale
});
