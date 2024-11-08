import GuestRequest from '../models/guest-request';
import { IsResolvedEnum } from '../enums';
import DatabaseManager from '../../config/database/db-manager';
import logger from '../../config/logger';
import GuestRequestsService from '../../modules/guest-requests/guest-requests.service';

//3rd party dependencies
import { Op } from 'sequelize';

export async function deleteUnresolvedGuestRequests() {
    logger.info('Processing unresolved guest requests...');
    const sequelize = DatabaseManager.getSQLInstance();
    const transaction = await sequelize.transaction();
    const guestRequestsService = new GuestRequestsService();

    try {
        const date = new Date();
        date.setMonth(date.getMonth() - 1); // 1 month ago

        const unresolvedRequests = await GuestRequest.findAll({
            where: {
                resolved: IsResolvedEnum.PENDING,
                createdAt: {
                    [Op.lt]: date // older than 1 month
                }
            },
            transaction
        });

        for (const request of unresolvedRequests) {
            await guestRequestsService.deleteGuestRequest(request.guestRequestId, transaction); //delegate the deletion to the service
            logger.info(`Marked guest request for guest ID ${request.guestId} for deletion.`);
        }

        await transaction.commit();
        logger.info('All unresolved guest requests have been successfully deleted.');
    } catch (error: unknown) {
        await transaction.rollback();
        if (error instanceof Error) {
            logger.error(`Error processing unresolved guest requests: ${error.message}`);
        } else {
            logger.error(`Error processing unresolved guest requests: An unknown error occurred`);
        }
    }
}

