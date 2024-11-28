import { IApplicationAddPayload, IApplicationResponse, IApplicationsGetAllResponse, IApplicationsGetPayload, IApplicationsGetResponse, IApplicationUpdatePayload } from "./applications.interface";
import Application from "../../../shared/models/application";
import Job from "../../../shared/models/job";
import { NotFoundException } from "../../../shared/exceptions";
import { ApplicationStatusEnum } from "../../../shared/enums";
import logger from "../../../config/logger";
import { deleteFile, getFileSizeAsync } from "../../../shared/utils";
import { APPLICATIONS_FILES_PATH } from "../../../shared/constants";
import { IJobResponse } from "../jobs/jobs.interface";
import JobService from "../jobs/jobs.service";

// 3rd party dependencies
import path from 'path';

export default class ApplicationsService {
    private _jobsService = new JobService();
    public async addApplication(applicationPayload: IApplicationAddPayload): Promise<IApplicationResponse> {
        try {
            const job = await this._jobsService.getJob(applicationPayload.jobId);
            if (!job) {
                throw new NotFoundException('Job', 'jobId', applicationPayload.jobId);
            }
            const newApplication = await Application.create({ ...applicationPayload, status: ApplicationStatusEnum.PENDING });
            const newApplicationJson = newApplication.toJSON() as IApplicationResponse;
            return {
                ...newApplicationJson,
                resume: newApplicationJson.resume ? newApplicationJson.resume : '',
                size: newApplicationJson.resume ? await getFileSizeAsync(path.join(APPLICATIONS_FILES_PATH, newApplicationJson.resume)) : '0KB'
            };
            //eslint-disable-next-line
        } catch (err: any) {
            logger.error(`Error adding application: ${err.message}`);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error adding application: ${err.message}`);
        }
    }

    public async getApplications(payload: IApplicationsGetPayload): Promise<IApplicationsGetResponse | undefined> {
        const { limit, offset, status, jobTitle } = payload;

        // Find and count applications with job title filter
        const { rows: applications, count } = await Application.findAndCountAll({
            where: {
                ...(status && { status }),
            },
            include: [
                {
                    model: Job,
                    as: 'job',
                    where: {
                        ...(jobTitle && { title: jobTitle }),
                    },
                    attributes: []
                }
            ],
            limit,
            offset,
        });

        return {
            applications: applications.map(application => ({
                ...application.toJSON(),
                resume: application.resume ? application.resume : ''
            })),
            total: count,
            pages: Math.ceil(count / (limit || 10))
        };
    }

    public async getApplication(applicationId: string): Promise<IApplicationResponse | undefined> {
        const application = await Application.findByPk(applicationId);
        if (!application) {
            throw new NotFoundException('Application', "applicationId", applicationId);
        }

        const applicationJson = application.toJSON() as IApplicationResponse;
        return {
            ...applicationJson,
            resume: applicationJson.resume ? applicationJson.resume : '',
            size: applicationJson.resume ? await getFileSizeAsync(path.join(APPLICATIONS_FILES_PATH, applicationJson.resume)) : '0KB'
        };
    }

    public async updateApplication(applicationPayload: IApplicationUpdatePayload): Promise<IApplicationResponse | undefined> {
        try {
            const { applicationId } = applicationPayload;
            const application = await Application.findByPk(applicationId);
            if (!application) {
                throw new NotFoundException('Application', 'applicationId', applicationId);
            }


            const newApplication = await application.update({ ...applicationPayload });
            const newApplicationJson = newApplication.toJSON() as IApplicationResponse;
            return {
                ...newApplicationJson,
                resume: newApplicationJson.resume ? newApplicationJson.resume : '',
                size: newApplicationJson.resume ? await getFileSizeAsync(path.join(APPLICATIONS_FILES_PATH, newApplicationJson.resume)) : '0KB'
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating application: ${error.message} `);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating application: ${error.message} `);
        }
    }

    public async deleteApplication(applicationId: string): Promise<void> {
        try {
            const application = await Application.findByPk(applicationId);
            if (!application) {
                throw new NotFoundException('Application', 'applicationId', applicationId);
            }
            await application.destroy();
            if (application.resume) {
                deleteFile(path.join(APPLICATIONS_FILES_PATH, application.resume));
            }
        } //eslint-disable-next-line
        catch (err: any) {
            logger.error(`Error deleting application: ${err.message} `);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error(`Error deleting application: ${err.message} `);
        }
    }

    public async getAllApplications(payload: IApplicationsGetPayload): Promise<IApplicationsGetAllResponse | undefined> {
        const { limit, offset } = payload;


        const { rows: applications, count } = await Application.findAndCountAll({
            include: [
                {
                    model: Job,
                    as: 'job',
                    attributes: ['title',],
                }
            ],
            limit,
            offset,
        });

        // Group applications by job title
        const jobsMap: { [key: string]: IJobResponse } = {};

        applications.forEach(application => {
            const job = application.job;

            if (!job) return;

            const jobTitle = job.title;

            if (!jobsMap[jobTitle]) {
                jobsMap[jobTitle] = {
                    jobId: job.jobId,
                    title: job.title,
                    description: job.description,
                    jobCategory: job.jobCategory,
                    employmentType: job.employmentType,
                    applications: []
                };
            }

            jobsMap[jobTitle].applications?.push({
                applicationId: application.applicationId,
                fullName: application.fullName,
                address: application.address,
                email: application.email,
                phone: application.phone,
                expectedSalary: application.expectedSalary,
                education: application.education,
                coverLetter: application.coverLetter,
                noticePeriod: application.noticePeriod,
                resume: application.resume ? application.resume : '',
            });
        });

        // Calculate status counts
        const interviewCount = applications.filter(a => a.status === ApplicationStatusEnum.INTERVIEW).length;
        const pendingCount = applications.filter(a => a.status === ApplicationStatusEnum.PENDING).length;
        const shortlistedCount = applications.filter(a => a.status === ApplicationStatusEnum.SHORTLISTED).length;
        const rejectedCount = applications.filter(a => a.status === ApplicationStatusEnum.REJECTED).length;

        return {
            jobs: Object.values(jobsMap), // Convert grouped jobs map into an array
            total: count,
            pages: Math.ceil(count / (limit || 10)),
            interviewCount,
            pendingCount,
            shortlistedCount,
            rejectedCount,
        };
    }

}