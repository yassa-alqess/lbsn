export interface ITaskSubmissionAddPayload {
    taskId: string;
    profileId: string;
    title: string;
    comment: string;
}

export interface ITaskSubmissionUpdatePayload {
    taskSubmissionId: string;
    taskId: string;
    profileId: string;
    title: string;
    comment: string;
}

export interface ItaskSubmissionGetByIdPayload {
    // profileId: string;
    taskId: string;
}


export interface ItaskSubmissionGetByIdResponse {

    taskSubmissionGetByIdResponse: ITaskSubmission
}

export interface ITaskSubmission {
    taskSubmissionId: string;
    taskId: string;
    // profileId: string;
    title: string;
    comment: string;
    documentUrl: string;
}