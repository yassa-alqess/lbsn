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
            keyFile: '.keys/ldns-sheets-d2c4a31efa5d.json', // Path to service account key
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

    public createSpreadSheet = async (title: string) => {
        const auth = await this._getAuthToken();
        const resource = {
            properties: {
                title,
            },
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
            return res;
        }
        catch (error: any) {
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