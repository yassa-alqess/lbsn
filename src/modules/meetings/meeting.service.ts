import axios from 'axios'
import { MEETING_API_URL, MEETING_AUTH_API_URL, MEETING_ACCOUNT_ID, MEETING_CLIENT_ID, MEETING_CLIENT_SECRET } from '../../shared/constants/index'
import logger from '../../config/logger'

export default class MeetingService {

    public _getAccessToken = async () => {
        const url = `${MEETING_AUTH_API_URL}/oauth/token?grant_type=account_credentials&account_id=${MEETING_ACCOUNT_ID}`
        const headers = {
            Authorization: `Basic ${Buffer.from(`${MEETING_CLIENT_ID}:${MEETING_CLIENT_SECRET}`).toString('base64')}`,
        }

        const response = await axios.post(url, {}, { headers });
        return response.data.access_token
    }

    public scheduleMeeting = async (topic: string, startTime: Date, password: string) => {

        const url = `${MEETING_API_URL}`
        let token;
        try {

            token = await this._getAccessToken();
            //eslint-disable-next-line
        } catch (err) {
            logger.error(`Couldn't get access token ${err}`);
            throw new Error("Couldn't get access token");
        }
        const headers = {
            Authorization: `Bearer ${token}`,
        }
        const payload = {
            topic,
            type: 2,
            start_time: startTime,
            timeZone: 'GMT+2',
            duration: 60,
            password,
            default_password: false,
            pre_schedule: false,
        }

        let response;
        try {

            response = await axios.post(url, payload, { headers });

            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Couldn't Create A Meeting ${err}`);
            throw new Error("Couldn't Create A Meeting");
        }

        return response.data;
    }
}