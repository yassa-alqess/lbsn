export interface IProfileResponse {
    profileId: string;
    name: string;
    // userId: string; I'm not interested in getting all the uses that rqeuest this service (profile)
}
export interface IProfileUpdatePayload {
    profileId: string;
    name?: string;
}

export interface IProfilesGetResponse {
    profiles: IProfileResponse[]
}