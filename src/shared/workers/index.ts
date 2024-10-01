import * as cron from 'node-cron';
import { deleteUnresolvedGuestRequests } from './delete-unresolved-guests.cron';

cron.schedule('0 0 1 * *', deleteUnresolvedGuestRequests, { // once a month
    scheduled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // set the timezone to the server's timezone
});