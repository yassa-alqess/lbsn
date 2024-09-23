export interface IWarmLeadAddPayload {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    companyEmail: string;
}

export interface IWarmLeadsResponse {
    leads: IWarmLead[];
}

export interface IWarmLead {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    companyEmail: string;
}