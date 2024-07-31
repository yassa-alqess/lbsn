export interface IGuestAddPayload {
    email: string;
    name: string;
    taxId: string;
    companyName: string;
    phone: string;
    location: string;
}

export interface IGuestResponse {
    guestId: string;
    email: string;
    name: string;
    taxId: string;
    companyName: string;
    phone: string;
    location: string;
}
export interface IGuestUpdatePayload {
    guestId: string;
    email?: string;
    name?: string;
    taxId?: string;
    companyName?: string;
    phone?: string;
    location?: string;
}

export interface IGuestsGetResponse {
    guests: IGuestResponse[]
}