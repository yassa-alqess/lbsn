import { TaskSubmissionStatusEnum } from "../../shared/enums";

export interface ITaskSubmissionAddPayload {
    profileId: string;
    taskId: string;
    title: string;
    comment?: string;
    documentUrl?: string;
}

export interface ITaskSubmissionUpdatePayload {
    profileId: string;
    taskId: string;
    title?: string;
    comment?: string;
    documentUrl?: string;
}

export interface ItaskSubmissionGetByTaskIdPayload {
    taskId: string;
}

export interface ITaskSubmission {
    taskSubmissionId: string;
    taskId: string;
    profileId: string;
    title: string;
    comment: string;
    documentUrl: string;
    status: TaskSubmissionStatusEnum
    createdAt: Date;
    approvedAt: Date;
}