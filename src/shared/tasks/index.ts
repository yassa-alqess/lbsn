import * as cron from 'node-cron';
import { deleteUnresolvedGuestRequests } from './delete-unresolved-guests.cron';
import { syncSheetData } from './sync-sheet-data';

cron.schedule('0 0 1 * *', deleteUnresolvedGuestRequests, { // once a month
    scheduled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // set the timezone to the server's timezone
});

cron.schedule('*/5 * * * *', syncSheetData, {
    scheduled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Set the timezone to the server's timezone
});