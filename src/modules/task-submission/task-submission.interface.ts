import { TaskSubmissionStatusEnum } from "../../shared/enums";

export interface ITaskSubmissionAddPayload {
    taskId: string;
    title: string;
    comment?: string;
    documentUrl?: string;
}

export interface ITaskSubmissionUpdatePayload {
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
    title: string;
    comment: string;
    documentUrl: string;
    status: TaskSubmissionStatusEnum
}