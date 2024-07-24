import { ITasksAddPayload, ITask, ITasksGetPayload, ITasksGetRespones } from "../../shared/interfaces/task";
import Task from "../../shared/models/task";

export default class TaskService {
    constructor() {
    }


    public async addTask(taskPayload: ITasksAddPayload): Promise<ITask> {
        const task = await Task.create({ ...taskPayload });
        return {
            taskId: task.taskId,
            profileId: task.profile.profileId,
            title: task.title,
            comment: task.comment,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };
    }

    public async getTasks(payload: ITasksGetPayload): Promise<ITasksGetRespones> {
        const tasks = await Task.findAll({
            where: {
                profileId: payload.profileId,
                status: payload.status
            }
        });
        return {
            tasks: tasks.map(task => ({
                taskId: task.taskId,
                profileId: task.profile.profileId,
                title: task.title,
                comment: task.comment,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
            }))
        };
    }
}