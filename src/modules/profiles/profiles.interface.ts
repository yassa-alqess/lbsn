export interface IProfileAddPayload {
    name: string;
}

export interface IProfileResponse {
    profileId: string;
    name: string;
}
export interface IProfileUpdatePayload {
    profileId: string;
    name?: string;
}

export interface IProfilesGetResponse {
    profiles: IProfileResponse[]
}