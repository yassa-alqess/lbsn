import { TaskStatusEnum } from "../../shared/enums";
import { ITaskSubmission } from "../task-submission/task-submission.interface";

export interface ITasksGetPayload {
    profileId: string;
    status?: TaskStatusEnum;
    limit: number;
    offset: number;
}

export interface ITasksGetAllPayload {
    limit: number;
    offset: number;
}

export interface ITasksGetResponse {
    tasks: ITask[];
    total: number;
    pages: number;
}

export interface ITasksAddPayload {
    profileId: string;
    title: string;
    comment: string;
    documentUrl: string;
}

export interface ITaskUpdatePayload {
    taskId: string;
    title?: string;
    comment?: string;
    documentUrl?: string;
}

export interface ITask {
    taskId: string;
    profileId: string;
    username?: string;
    title: string;
    comment: string;
    documentUrl: string;
    size?: string;
    status: TaskStatusEnum;
    createdAt: Date;
    submission?: ITaskSubmission;
}