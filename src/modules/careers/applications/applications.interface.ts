import { IJobResponse } from "../jobs/jobs.interface";

export interface IApplicationAddPayload {
    jobId: string;
    fullName: string;
    address: string;
    email: string;
    phone: string;
    expectedSalary: number;
    education: string;
    coverLetter?: string;
    noticePeriod: number;
    resume?: string;
}

export interface IApplicationResponse {
    applicationId: string;
    fullName: string;
    address: string;
    email: string;
    phone: string;
    expectedSalary: number;
    education: string;
    coverLetter?: string;
    noticePeriod: number;
    resume?: string;
    size?: string;
}

export interface IApplicationUpdatePayload {
    applicationId: string;
    status: string;
}

export interface IApplicationsGetResponse {
    applications: IApplicationResponse[];
    total: number;
    pages: number;
}

export interface IApplicationsGetPayload {
    jobTitle?: string;
    status?: string;
    limit: number;
    offset: number;
}

export interface IApplicationsGetAllResponse {
    jobs: IJobResponse[];
    total: number;
    pages: number;
    interviewCount: number;
    pendingCount: number;
    shortlistedCount: number;
    rejectedCount: number;
}