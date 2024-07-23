export interface TasksGetPayload {
    profileId: string;
    status: number;
}

export interface TasksGetRespones {
    tasks: Task[];


}

export interface TasksAddPayload {
    profileId: string;
    title: string;
    comment: string;
}

export interface Task {
    taskId: string;
    profileId: string;
    title: string;
    comment: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}