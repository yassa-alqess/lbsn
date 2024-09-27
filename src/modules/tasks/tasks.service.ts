import { ITasksAddPayload, ITask, ITasksGetPayload, ITasksGetRespones, ITaskUpdatePayload } from "./tasks.interface";
import Task from "../../shared/models/task";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TaskStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";

export default class TaskService {
    public async addTask(taskPayload: ITasksAddPayload): Promise<ITask> {
        try {
            const task = await Task.findOne({ where: { title: taskPayload.title, profileId: taskPayload.profileId } });
            if (task) {
                throw new AlreadyExistsException("Task", "title", taskPayload.title);
            }
            const newTask = await Task.create({ ...taskPayload, status: TaskStatusEnum.PENDING });
            const newTaskJson = newTask.toJSON() as ITask;
            return {
                ...newTaskJson,
            };
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error adding task: ${err.message}`);
            if (err instanceof AlreadyExistsException) {
                throw err;
            }
            throw new Error(`Error adding task: ${err.message}`);
        }
    }

    public async getTasks(payload: ITasksGetPayload): Promise<ITasksGetRespones | undefined> {
        const tasks = await Task.findAll({
            where: {
                profileId: payload.profileId,
                ...(payload.status && { status: payload.status }),
            }
        });
        return {
            tasks: tasks.map(task => ({
                ...task.toJSON() as ITask
            }))
        };
    }

    public async updateTask(taskPayload: ITaskUpdatePayload): Promise<ITask | undefined> {
        const { taskId } = taskPayload;
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new NotFoundException('Task', 'taskId', taskId);
            }

            const newTask = await task.update({ ...taskPayload });

            const newTaskJson = newTask.toJSON() as ITask;
            return {
                ...newTaskJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating task: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating task: ${error.message}`);
        }

    }

    public async getTask(taskId: string): Promise<ITask | undefined> {
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new NotFoundException('Task', 'taskId', taskId);
        }

        const taskJson = task.toJSON() as ITask;
        return {
            ...taskJson,
        };
    }

    public async deleteTask(taskId: string): Promise<void> {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new NotFoundException('Task', 'taskId', taskId);
            }

            await task.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting task: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting task: ${error.message}`);
        }
    }
}