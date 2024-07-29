import { ITaskSubmission, ITaskSubmissionAddPayload, ItaskSubmissionGetPayload, ItaskSubmissionGetResponse, ITaskSubmissionUpdatePayload } from "../../shared/interfaces/task-submission";
import TaskSubmission from "../../shared/models/task-submission";

export default class TaskSubmissionService {
    public async addTaskSubmisson(taskSubmissionAddPayload: ITaskSubmissionAddPayload, path: string): Promise<ITaskSubmission> {
        const taskSubmission = await TaskSubmission.create({ ...taskSubmissionAddPayload, documentUrl: path });
        return {
            taskSubmissionId: taskSubmission.taskSubmissionId,
            taskId: taskSubmission.task.taskId,
            // profileId: taskSubmission.profile.profileId,
            title: taskSubmission.title,
            comment: taskSubmission.comment,
            documentUrl: taskSubmission.documentUrl
        };
    }
    public async updateTaskSubmisson(taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload, path: string): Promise<ITaskSubmission> {
        const taskSubmission = await TaskSubmission.findByPk(taskSubmissionUpdatePayload.taskSubmissionId);
        if (taskSubmission) {
            taskSubmission.title = taskSubmissionUpdatePayload.title;
            taskSubmission.comment = taskSubmissionUpdatePayload.comment;
            taskSubmission.documentUrl = path;
            await taskSubmission.save();
            return {
                taskSubmissionId: taskSubmission.taskSubmissionId,
                taskId: taskSubmission.task.taskId,
                // profileId: taskSubmission.profile.profileId,
                title: taskSubmission.title,
                comment: taskSubmission.comment,
                documentUrl: taskSubmission.documentUrl
            };
        }
        throw new Error('Task Submission not found');
    }
    public async getTaskSubmission(taskSubmissionGetPayload: ItaskSubmissionGetPayload): Promise<ItaskSubmissionGetResponse> {
        const taskSubmission = await TaskSubmission.findOne({
            where: {
                // profileId: taskSubmissionGetPayload.profileId,
                taskId: taskSubmissionGetPayload.taskId
            }
        });
        if (taskSubmission) {
            return {
                taskSubmissionGetResponse: {
                    taskSubmissionId: taskSubmission.taskSubmissionId,
                    taskId: taskSubmission.task.taskId,
                    documentUrl: taskSubmission.documentUrl,
                    title: taskSubmission.title,
                    comment: taskSubmission.comment
                }
            };
        }
        throw new Error('Task Submission not found');
    }

}