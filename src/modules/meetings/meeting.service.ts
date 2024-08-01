import axios from 'axios'
import { MEETING_API_URL, MEETING_AUTH_API_URL, MEETING_ACCOUNT_ID, MEETING_CLIENT_ID, MEETING_CLIENT_SECRET } from '../../shared/constants/index'

export default class MeetingService {
    private _getAccessToken = async () => {
        const url = `${MEETING_AUTH_API_URL}/oauth/token?grant_type=client_credentials&account_id=${MEETING_ACCOUNT_ID}`
        const headers = {
            Authorization: `Basic ${Buffer.from(`${MEETING_CLIENT_ID}:${MEETING_CLIENT_SECRET}`).toString('base64')}`
        }
        const response = await axios.post(url, {}, { headers })
        return response.data.access_token
    }

    public sheduleMeeting = async (topic: string, startTime: string, password: string) => {

        const url = `${MEETING_API_URL}`
        const token = await this._getAccessToken();
        const headers = {
            Authorization: `Bearer ${token}`
        }
        const payload = {
            topic,
            type: 2,
            start_time: startTime,
            timeZone: 'GMT+2',
            duration: 60,
            password
        }
        const response = await axios.post(url, payload, { headers })
        return response.data.join_url
    }
}