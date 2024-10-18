import { ITasksAddPayload, ITask, ITasksGetPayload, ITaskUpdatePayload, ITasksGetResponse, ITasksGetAllPayload } from "./tasks.interface";
import Task from "../../shared/models/task";
import Profile from "../../shared/models/profile";
import User from "../../shared/models/user";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TaskStatusEnum } from "../../shared/enums";
import logger from "../../config/logger";
import { TASKS_FILES_PATH } from "../../shared/constants";
import ProfileService from "../profiles/profiles.service";
import { deleteFile, getFileSizeAsync } from "../../shared/utils";

// 3rd party dependencies
import path from 'path';

export default class TaskService {
    private _profileService = new ProfileService();
    public async addTask(taskPayload: ITasksAddPayload): Promise<ITask> {
        try {
            const task = await Task.findOne({ where: { title: taskPayload.title, profileId: taskPayload.profileId } });
            if (task) {
                throw new AlreadyExistsException("Task", "title", taskPayload.title);
            }

            const profile = await this._profileService.getProfile(taskPayload.profileId);
            if (!profile) {
                throw new NotFoundException("Profile", "profileId", taskPayload.profileId);
            }
            const newTask = await Task.create({ ...taskPayload, status: TaskStatusEnum.PENDING });
            const newTaskJson = newTask.toJSON() as ITask;
            return {
                ...newTaskJson,
                documentUrl: newTaskJson.documentUrl ? newTaskJson.documentUrl : '',
                size: newTaskJson.documentUrl ? await getFileSizeAsync(path.join(TASKS_FILES_PATH, newTaskJson.documentUrl)) : '0KB'
            };
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error adding task: ${err.message}`);
            if (err instanceof AlreadyExistsException || err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error adding task: ${err.message}`);
        }
    }

    public async getTasks(payload: ITasksGetPayload): Promise<ITasksGetResponse | undefined> {
        const { limit, offset } = payload;
        const { rows: tasks, count } = await Task.findAndCountAll({
            where: {
                profileId: payload.profileId,
                ...(payload.status && { status: payload.status }),
            },
            limit,
            offset,
        });

        return {
            tasks: tasks.map(task => ({
                ...task.toJSON() as ITask,
                documentUrl: task.documentUrl ? task.documentUrl : ''
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10))
        };
    }

    public async updateTask(taskPayload: ITaskUpdatePayload): Promise<ITask | undefined> {
        try {
            const { taskId } = taskPayload;
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new NotFoundException('Task', 'taskId', taskId);
            }

            // Delete old document if new document is uploaded
            const oldDocumentUrl = task.documentUrl;
            const newDocumentUrl = taskPayload.documentUrl;
            if (newDocumentUrl && oldDocumentUrl !== newDocumentUrl) {
                deleteFile(path.join(TASKS_FILES_PATH, oldDocumentUrl));
            }

            // if no new document is uploaded, keep the old document
            if (!newDocumentUrl) {
                delete taskPayload.documentUrl;
            }

            const newTask = await task.update({ ...taskPayload });

            const newTaskJson = newTask.toJSON() as ITask;
            return {
                ...newTaskJson,
                documentUrl: newTaskJson.documentUrl ? newTaskJson.documentUrl : '',
                size: newTaskJson.documentUrl ? await getFileSizeAsync(path.join(TASKS_FILES_PATH, newTaskJson.documentUrl)) : '0KB'
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
            documentUrl: taskJson.documentUrl ? taskJson.documentUrl : '',
            size: taskJson.documentUrl ? await getFileSizeAsync(path.join(TASKS_FILES_PATH, taskJson.documentUrl)) : '0KB'
        };
    }

    public async deleteTask(taskId: string): Promise<void> {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new NotFoundException('Task', 'taskId', taskId);
            }

            await task.destroy();
            if (task.documentUrl) {
                deleteFile(path.join(TASKS_FILES_PATH, task.documentUrl));
            }
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting task: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting task: ${error.message}`);
        }
    }

    public async getAllTasks(payload: ITasksGetAllPayload): Promise<ITasksGetResponse | undefined> {
        const { limit, offset } = payload;
        const { rows: tasks, count } = await Task.findAndCountAll({
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: ['profileId'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username']
                        }
                    ]
                }
            ],
            limit,
            offset
        });

        return {
            tasks: tasks.map(task => ({
                taskId: task.taskId,
                title: task.title,
                comment: task.comment,
                status: task.status,
                createdAt: task.createdAt,
                submittedAt: task.submittedAt,
                profileId: task.profileId,
                username: task.profile.user.username, // Add username here
                documentUrl: task.documentUrl ? task.documentUrl : ''
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10))
        };
    }
}