import { google } from 'googleapis'
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'] // read and write access

export default class SheetsService {
    //eslint-disable-next-line
    public sheets: any;

    constructor() {
        this.sheets = google.sheets({ version: 'v4' })
    }

    private _getAuthToken = async () => {
        const auth = new google.auth.GoogleAuth({
            scopes: SCOPES
        });
        try {
            const authToken = await auth.getClient();
            return authToken;
        } //eslint-disable-next-line
        catch (error: any) {
            throw new Error(`Error getting google auth token: ${error.message}`);
        }
    }
    public getSpreadSheet = async (spreadsheetId: string) => {
        const auth = await this._getAuthToken();
        try {
            const res = await this.sheets!.spreadsheets.get({
                spreadsheetId,
                auth,
            });
            return res;
        } //eslint-disable-next-line
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
        } //eslint-disable-next-line
        catch (error: any) {
            throw new Error(`Error getting spreadsheet values: ${error.message}`);
        }
    }
}