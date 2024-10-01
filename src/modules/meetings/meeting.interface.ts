export interface IMeeting {
    start_url: string;
    join_url: string;
    password?: string;
    time: Date;
}


// meeting time is given in UTC format (adjusted by the client)