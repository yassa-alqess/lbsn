import { TaskStatusEnum } from "../../shared/enums";

export interface ITasksGetPayload {
    profileId: string;
    status: number;
}

export interface ITasksGetRespones {
    tasks: ITask[];
}

export interface ITasksAddPayload {
    profileId: string;
    title: string;
    comment: string;
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