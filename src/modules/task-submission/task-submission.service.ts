import { ITaskSubmission, ITaskSubmissionAddPayload, ItaskSubmissionGetByTaskIdPayload, ITaskSubmissionUpdatePayload } from "./task-submission.interface";
import TaskSubmission from "../../shared/models/task-submission";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TaskStatusEnum, TaskSubmissionStatusEnum } from "../../shared/enums";
import Task from "../../shared/models/task";
import logger from "../../config/logger";
import { Sequelize } from "sequelize";
import DatabaseManager from "../../config/database/db-manager";
import { TASK_SUBMISSIONS_FILES_PATH } from "../../shared/constants";
import { getFileSizeAsync, deleteFile } from "../../shared/utils";

// 3rd party dependencies
import path from 'path';

export default class TaskSubmissionService {
    private _sequelize: Sequelize | null = null;
    constructor() {
        this._sequelize = DatabaseManager.getSQLInstance();
    }
    public async addTaskSubmission(taskSubmissionAddPayload: ITaskSubmissionAddPayload): Promise<ITaskSubmission> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId: taskSubmissionAddPayload.taskId } });
        if (taskSubmission) {
            throw new AlreadyExistsException('Task Submission', 'taskId', taskSubmissionAddPayload.taskId);
        }

        const transaction = await this._sequelize!.transaction();
        try {
            // Create new task submission
            const newTaskSubmission = await TaskSubmission.create(
                { ...taskSubmissionAddPayload, status: TaskSubmissionStatusEnum.PENDING },
                { transaction }
            );

            // Update the associated task status
            await Task.update(
                { status: TaskStatusEnum.SUBMITTED, submittedAt: new Date() },
                { where: { taskId: taskSubmissionAddPayload.taskId }, transaction }
            );

            await transaction.commit();

            return {
                taskSubmissionId: newTaskSubmission.taskSubmissionId,
                taskId: newTaskSubmission.taskId,
                title: newTaskSubmission.title,
                comment: newTaskSubmission.comment,
                status: newTaskSubmission.status,
                createdAt: newTaskSubmission.createdAt,
                approvedAt: newTaskSubmission.approvedAt,
                documentUrl: newTaskSubmission.documentUrl ? newTaskSubmission.documentUrl : '',
                size: newTaskSubmission.documentUrl ? await getFileSizeAsync(path.join(TASK_SUBMISSIONS_FILES_PATH, newTaskSubmission.documentUrl)) : '0KB'
            };

            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Error adding task submission: ${error.message}`);
            throw new Error(`Error adding task submission: ${error.message}`);
        }
    }

    public async updateTaskSubmission(taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload): Promise<ITaskSubmission | undefined> {
        try {
            const taskSubmission = await TaskSubmission.findOne({
                where: { taskId: taskSubmissionUpdatePayload.taskId }
            });

            if (!taskSubmission) {
                throw new NotFoundException('Task Submission', 'taskId', taskSubmissionUpdatePayload.taskId);
            }


            // Delete old document if new document is uploaded
            const oldDocumentUrl = taskSubmission.documentUrl;
            const newDocumentUrl = taskSubmissionUpdatePayload.documentUrl;
            if (newDocumentUrl && oldDocumentUrl && oldDocumentUrl !== newDocumentUrl) {
                deleteFile(path.join(TASK_SUBMISSIONS_FILES_PATH, oldDocumentUrl));
            }

            // if no new document is uploaded, keep the old document
            if (!newDocumentUrl) {
                delete taskSubmissionUpdatePayload.documentUrl;
            }

            const newTaskSubmission = await taskSubmission.update({ ...taskSubmissionUpdatePayload });
            return {
                taskSubmissionId: newTaskSubmission.taskSubmissionId,
                taskId: newTaskSubmission.taskId,
                title: newTaskSubmission.title,
                comment: newTaskSubmission.comment,
                status: newTaskSubmission.status,
                createdAt: newTaskSubmission.createdAt,
                approvedAt: newTaskSubmission.approvedAt,
                documentUrl: newTaskSubmission.documentUrl ? newTaskSubmission.documentUrl : '',
                size: newTaskSubmission.documentUrl ? await getFileSizeAsync(path.join(TASK_SUBMISSIONS_FILES_PATH, newTaskSubmission.documentUrl)) : '0KB'
            };
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error updating task submission: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating task submission: ${error.message}`);
        }
    }

    public async getTaskSubmissionByTaskId(taskSubmissionGetByTaskIdPayload: ItaskSubmissionGetByTaskIdPayload): Promise<ITaskSubmission | undefined> {
        const taskSubmission = await TaskSubmission.findOne({
            where: {
                taskId: taskSubmissionGetByTaskIdPayload.taskId
            }
        });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskSubmissionGetByTaskIdPayload.taskId);
        }

        return {
            taskSubmissionId: taskSubmission.taskSubmissionId,
            taskId: taskSubmission.taskId,
            title: taskSubmission.title,
            comment: taskSubmission.comment,
            status: taskSubmission.status,
            createdAt: taskSubmission.createdAt,
            approvedAt: taskSubmission.approvedAt,
            documentUrl: taskSubmission.documentUrl ? taskSubmission.documentUrl : '',
            size: taskSubmission.documentUrl ? await getFileSizeAsync(path.join(TASK_SUBMISSIONS_FILES_PATH, taskSubmission.documentUrl)) : '0KB'
        };
    }

    public async deleteTaskSubmission(taskId: string): Promise<void> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId } });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskId);
        }

        const transaction = await this._sequelize!.transaction();

        try {
            // Delete the task submission
            await taskSubmission.destroy({ transaction });
            if (taskSubmission.documentUrl) {
                deleteFile(path.join(TASK_SUBMISSIONS_FILES_PATH, taskSubmission.documentUrl));
            }

            // Update the associated task status
            await Task.update(
                { status: TaskStatusEnum.PENDING },
                { where: { taskId }, transaction }
            );

            await transaction.commit();
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Error deleting task submission: ${error.message}`);
            throw new Error(`Error deleting task submission: ${error.message}`);
        }
    }

    public async approveTaskSubmission(taskId: string): Promise<void> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId } });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskId);
        }
        taskSubmission.status = TaskSubmissionStatusEnum.RESOLVED;
        taskSubmission.approvedAt = new Date();
        try {
            await taskSubmission.save();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error approving task submission: ${error.message}`);
            throw new Error(`Error approving task submission: ${error.message}`);
        }
    }
}