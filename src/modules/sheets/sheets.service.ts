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
        const authToken = await auth.getClient();
        return authToken;
    }
    public getSpreadSheet = async (spreadsheetId: string) => {
        const auth = await this._getAuthToken();
        const res = await this.sheets!.spreadsheets.get({
            spreadsheetId,
            auth,
        });
        return res;
    }

    public getSpreadSheetValues = async ({ spreadsheetId, sheetName }: { spreadsheetId: string, sheetName: string }) => {
        const auth = await this._getAuthToken();
        const res = await this.sheets!.spreadsheets.values.get({
            spreadsheetId,
            auth,
            range: sheetName
        });
        return res;
    }
}