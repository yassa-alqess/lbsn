import { TaskStatusEnum } from "../../shared/enums";

export interface ITasksGetPayload {
    profileId: string;
    status?: TaskStatusEnum;
}

export interface ITasksGetRespones {
    tasks: ITask[];
}

export interface ITasksAddPayload {
    profileId: string;
    title: string;
    comment: string;
}

export interface ITaskUpdatePayload {
    taskId: string;
    title?: string;
    comment?: string;
}

export interface ITask {
    taskId: string;
    profileId: string;
    title: string;
    comment: string;
    status: TaskStatusEnum;
    createdAt: Date;
    updatedAt: Date;
}