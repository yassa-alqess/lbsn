import { IJobAddPayload, IJobResponse, IJobsGetPayload, IJobsGetResponse, IJobUpdatePayload } from "./jobs.interface";
import Job from "../../../shared/models/job";
import Skill from "../../../shared/models/skill";
import { AlreadyExistsException, NotFoundException } from "../../../shared/exceptions";
import logger from "../../../config/logger";

export default class JobService {
    public async addJob(jobPayload: IJobAddPayload): Promise<IJobResponse> {
        try {
            const job = await Job.findOne({ where: { title: jobPayload.title } });
            if (job) {
                throw new AlreadyExistsException('Job', 'title', jobPayload.title.toString());
            }

            // Add skills to Skill model
            const skillPromises = jobPayload.skills.map(async (skill) => {
                let skillInstance = await Skill.findOne({ where: { name: skill } });
                if (!skillInstance) {
                    skillInstance = await Skill.create({ name: skill });
                }
                return skillInstance;
            });
            const skills = await Promise.all(skillPromises);

            // Create job with associated skills
            const newJob = await Job.create({ ...jobPayload });
            await newJob.$set('skills', skills);

            const newJobJson = newJob.toJSON() as IJobResponse;
            return {
                ...newJobJson,
                skills: skills.map(skill => skill.name)
            };

            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding job: ${error.message}`);
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error(`Error adding job: ${error.message}`);
        }
    }


    public async updateJob(jobPayload: IJobUpdatePayload): Promise<IJobResponse | undefined> {
        const { jobId } = jobPayload;
        try {
            const job = await Job.findByPk(jobId);
            if (!job) {
                throw new NotFoundException('Job', 'jobId', jobId);
            }

            const newJob = await job.update({ ...jobPayload });
            const newJobJson = newJob.toJSON() as IJobResponse;
            return {
                ...newJobJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating job: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating job: ${error.message}`);
        }

    }

    public async getJob(jobId: string): Promise<IJobResponse | undefined> {
        const job = await Job.findByPk(jobId, {
            include: [{
                model: Skill,
                as: 'skills'
            }]
        });

        if (!job) {
            throw new NotFoundException('Job', 'jobId', jobId);
        }

        const jobJson = job.toJSON() as IJobResponse;
        return {
            ...jobJson,
            skills: job.skills ? job.skills.map(skill => skill.name) : []
        };
    }


    public async getJobs(payload: IJobsGetPayload): Promise<IJobsGetResponse | undefined> {
        const jobs = await Job.findAll({
            where: { ...payload },
            include: [{
                model: Skill,
                as: 'skills'
            }]
        });

        return {
            jobs: jobs.map(job => ({
                ...job.toJSON() as IJobResponse,
                skills: job.skills ? job.skills.map(skill => skill.name) : []
            }))
        };
    }


    public async deleteJob(jobId: string): Promise<void> {
        try {
            const job = await Job.findByPk(jobId);
            if (!job) {
                throw new NotFoundException('Job', 'jobId', jobId);
            }
            await job.destroy();
        } //eslint-disable-next-line
        catch (error: any) {
            logger.error(`Error deleting job: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting job: ${error.message}`);
        }
    }
}