import { ITaskSubmission, ITaskSubmissionAddPayload, ItaskSubmissionGetByTaskIdPayload, ItaskSubmissionGetByTaskIdResponse, ITaskSubmissionUpdatePayload } from "./task-submission.interface";
import TaskSubmission from "../../shared/models/task-submission";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { TaskStatusEnum, TaskSubmissionStatusEnum } from "../../shared/enums";
import Task from "../../shared/models/task";
import sequelize from "../../config/database/connection";
import logger from "../../config/logger";

export default class TaskSubmissionService {
    public async addTaskSubmission(taskSubmissionAddPayload: ITaskSubmissionAddPayload): Promise<ITaskSubmission> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId: taskSubmissionAddPayload.taskId } });
        if (taskSubmission) {
            throw new AlreadyExistsException('Task Submission', 'taskId', taskSubmissionAddPayload.taskId);
        }

        const transaction = await sequelize.transaction();

        try {
            // Create new task submission
            const newTaskSubmission = await TaskSubmission.create(
                { ...taskSubmissionAddPayload, status: TaskSubmissionStatusEnum.PENDING },
                { transaction }
            );

            // Update the associated task status
            await Task.update(
                { status: TaskStatusEnum.SUBMITTED },
                { where: { taskId: taskSubmissionAddPayload.taskId }, transaction }
            );

            await transaction.commit();

            return {
                ...newTaskSubmission.toJSON() as ITaskSubmission
            };
            //eslint-disable-next-line
        } catch (error: any) {
            await transaction.rollback();
            logger.error(`Error adding task submission: ${error.message}`);
            throw new Error('Error adding task submission');
        }
    }

    public async updateTaskSubmission(taskSubmissionUpdatePayload: ITaskSubmissionUpdatePayload): Promise<ITaskSubmission | undefined> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId: taskSubmissionUpdatePayload.taskId } });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskSubmissionUpdatePayload.taskId);
        }

        taskSubmission.title = taskSubmissionUpdatePayload.title || taskSubmission.title;
        taskSubmission.comment = taskSubmissionUpdatePayload.comment || taskSubmission.comment;
        taskSubmission.documentUrl = taskSubmissionUpdatePayload.documentUrl || taskSubmission.documentUrl;
        await taskSubmission.save();
        return {
            ...taskSubmission.toJSON() as ITaskSubmission
        };
    }
    
    public async getTaskSubmissionByTaskId(taskSubmissionGetByTaskIdPayload: ItaskSubmissionGetByTaskIdPayload): Promise<ItaskSubmissionGetByTaskIdResponse | undefined> {
        const taskSubmission = await TaskSubmission.findOne({
            where: {
                taskId: taskSubmissionGetByTaskIdPayload.taskId
            }
        });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskSubmissionGetByTaskIdPayload.taskId);
        }
        return {
            taskSubmissionGetByTaskIdResponse: {
                ...taskSubmission.toJSON() as ITaskSubmission
            }
        };
    }

    public async deleteTaskSubmission(taskId: string): Promise<void> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId } });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskId);
        }

        const transaction = await sequelize.transaction();

        try {
            // Delete the task submission
            await taskSubmission.destroy({ transaction });

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
            throw new Error('Error deleting task submission');
        }
    }

    public async approveTaskSubmission(taskId: string): Promise<void> {
        const taskSubmission = await TaskSubmission.findOne({ where: { taskId } });
        if (!taskSubmission) {
            throw new NotFoundException('Task Submission', 'taskId', taskId);
        }
        taskSubmission.status = TaskSubmissionStatusEnum.RESOLVED;
        try {
            await taskSubmission.save();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error approving task submission: ${error.message}`);
            throw new Error('Error approving task submission');
        }
    }

}