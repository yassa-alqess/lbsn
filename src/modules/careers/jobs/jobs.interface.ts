import { JobCategoryEnum, EmploymentTypeEnum } from "../../../shared/enums";
import { IApplicationResponse } from "../applications/applications.interface";

export interface IJobAddPayload {
    title: string;
    description: string;
    jobCategory: JobCategoryEnum;
    employmentType: EmploymentTypeEnum;
    skills: string[];
}

export interface IJobResponse {
    jobId: string;
    title: string;
    description: string;
    jobCategory: JobCategoryEnum;
    employmentType: EmploymentTypeEnum;
    skills?: string[];
    applications?: IApplicationResponse[];
}

export interface IJobUpdatePayload {
    jobId: string;
    title?: string;
    description?: string;
    jobCategory?: JobCategoryEnum;
    employmentType?: EmploymentTypeEnum;
}

export interface IJobsGetPayload {
    jobCategory?: JobCategoryEnum;
    employmentType?: EmploymentTypeEnum;
}

export interface IJobsGetResponse {
    jobs: IJobResponse[];
}