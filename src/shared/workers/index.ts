import * as cron from 'node-cron';
import { deleteUnresolvedGuestRequests } from './delete-unresolved-guests.cron';

cron.schedule('0 0 * * 0', deleteUnresolvedGuestRequests, { // once a week
    scheduled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});
