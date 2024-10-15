/* eslint-disable */

import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive',
];

export default class SheetsService {
    private sheets: any;
    private drive: any;

    constructor() {
        this.sheets = google.sheets({ version: 'v4' });
        this.drive = google.drive({ version: 'v3' });
    }

    private _getAuthToken = async () => {
        const auth = new google.auth.GoogleAuth({
            keyFile: '.keys/credentials.json', // Path to service account key
            scopes: SCOPES,
        });
        try {
            const authToken = await auth.getClient();
            return authToken;
        }
        catch (error: any) {
            throw new Error(`Error getting google auth token: ${error.message}`);
        }
    }

    public createSpreadSheet = async (title: string, sheetName: string = "Sheet1") => {
        const auth = await this._getAuthToken();
        const resource = {
            properties: {
                title,
            },
            sheets: [
                {
                    properties: {
                        title: sheetName, // Set the name of the sheet here
                    },
                },
            ],
        };
        const spreadsheet = await this.sheets.spreadsheets.create({
            resource,
            auth,
        });
        return spreadsheet.data;
    }

    public getSpreadSheet = async (spreadsheetId: string) => {
        const auth = await this._getAuthToken();
        try {
            const res = await this.sheets!.spreadsheets.get({
                spreadsheetId,
                auth,
            });
            return res;
        }
        catch (error: any) {
            throw new Error(`Error getting spreadsheet: ${error.message}`);
        }
    }

    public getSpreadSheetValues = async ({ spreadsheetId, sheetName }: { spreadsheetId: string, sheetName: string }) => {
        const auth = await this._getAuthToken();
        try {
            const res = await this.sheets!.spreadsheets.values.get({
                spreadsheetId,
                auth,
                range: sheetName
            });

            // Extract values from the response
            const values = res.data.values || [];

            // If there are no values, return an empty array
            if (values.length === 0) return [];

            // Use the first row as headers
            const headers = values[0];
            const records: { [key: string]: any }[] = [];

            // Find indices of Timestamp and Phone columns
            const timestampIndex = headers.indexOf('Timestamp');
            const phoneIndex = headers.indexOf('Phone');

            // Add a new header for the combined column
            // const newHeaders = ['_id', ...headers];

            // Iterate over remaining rows and create objects with key-value pairs
            for (let i = 1; i < values.length; i++) {
                const row = values[i];
                const record: { [key: string]: any } = {};

                // Add the combined value to the record
                if (timestampIndex >= 0 && phoneIndex >= 0 && row[timestampIndex] && row[phoneIndex]) {
                    const timestamp = row[timestampIndex] || 'No Timestamp';
                    const phone = row[phoneIndex]
                    record['_id'] = `${timestamp}-${phone}`;
                } else {
                    continue; // Skip the row if either column is missing
                }

                // Add the existing columns
                for (let j = 0; j < headers.length; j++) {
                    record[headers[j]] = row[j] || ''; // Default to empty string if missing
                }

                // Add the record to the list
                records.push(record);
            }

            return records;
        } catch (error: any) {
            throw new Error(`Error getting spreadsheet values: ${error.message}`);
        }
    }

    public shareSheetWithAnyone = async (spreadsheetId: string) => {
        const auth = await this._getAuthToken();
        try {
            await this.drive.permissions.create({
                fileId: spreadsheetId,
                auth,
                requestBody: {
                    role: 'writer',
                    type: 'anyone',
                },
            });
            //eslint-disable-next-line
        } catch (error: any) {
            throw new Error(`Error sharing spreadsheet with anyone: ${error.message}`);
        }
    }

    public shareSheetWithEmail = async (spreadsheetId: string, email: string) => {
        const auth = await this._getAuthToken();
        try {
            await this.drive.permissions.create({
                fileId: spreadsheetId,
                auth,
                requestBody: {
                    role: 'writer',
                    type: 'user',
                    emailAddress: email,
                },
                // transferOwnership: true,
            });

        } catch (error: any) {
            throw new Error(`Error sharing spreadsheet with email: ${error.message}`);
        }
    }
}