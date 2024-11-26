import { JobCategoryEnum, EmploymentTypeEnum } from "../../../shared/enums";

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