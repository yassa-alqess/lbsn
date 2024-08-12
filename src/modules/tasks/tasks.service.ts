import { ITasksAddPayload, ITask, ITasksGetPayload, ITasksGetRespones, ITaskUpdatePayload } from "./tasks.interface";
import Task from "../../shared/models/task";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TaskStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";

export default class TaskService {
    public async addTask(taskPayload: ITasksAddPayload): Promise<ITask> {
        const task = await Task.findOne({ where: { title: taskPayload.title, profileId: taskPayload.profileId } });
        if (task) {
            throw new AlreadyExistsException("Task", "title", taskPayload.title);
        }
        try {
            const task = await Task.create({ ...taskPayload, status: TaskStatusEnum.PENDING });
            return {
                taskId: task.taskId,
                profileId: task.profile.profileId,
                title: task.title,
                comment: task.comment,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
            };
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error adding task: ${err.message}`);
            throw new Error(`Error adding task`);
        }
    }

    public async getTasks(payload: ITasksGetPayload): Promise<ITasksGetRespones | undefined> {
        const tasks = await Task.findAll({
            where: {
                profileId: payload.profileId,
                status: payload.status ? payload.status : undefined
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

    public async updateTask(taskPayload: ITaskUpdatePayload): Promise<ITask> {
        const { taskId } = taskPayload;
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new NotFoundException('Task', 'taskId', taskId);
        }
        try {

            await task.update({ ...taskPayload });
            return {
                ...task.toJSON() as ITask,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating task: ${error.message}`);
            throw new Error(`Error updating task`);
        }

    }
    public async getTask(taskId: string): Promise<ITask | undefined> {
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new NotFoundException('Task', 'taskId', taskId);
        }
        return {
            ...task.toJSON() as ITask,
        };
    }

    public async deleteTask(taskId: string): Promise<void> {
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new NotFoundException('Task', 'taskId', taskId);
        }
        try {

            await task.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting task: ${error.message}`);
            throw new Error(`Error deleting task`);
        }
    }
}