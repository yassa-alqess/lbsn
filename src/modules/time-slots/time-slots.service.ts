import { ITimeSlotAddPayload, ITimeSlotResponse, ITimeSlotsGetResponse, ITimeSlotUpdatePayload } from "./time-slots.interface";
import TimeSlot from "../../shared/models/time-slot";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsAvailableEnum } from "../../shared/enums";
import logger from "../../config/logger";

export default class TimeSlotService {
    public async addTimeSlot(timeSlotPayload: ITimeSlotAddPayload): Promise<ITimeSlotResponse> {
        try {
            const timeSlot = await TimeSlot.findOne({ where: { time: timeSlotPayload.time } });
            if (timeSlot) {
                throw new AlreadyExistsException('TimeSlot', 'time', timeSlotPayload.time.toString());
            }
            const newTimeSlot = await TimeSlot.create({ ...timeSlotPayload });
            const newTimeSlotJson = newTimeSlot.toJSON() as ITimeSlotResponse;
            return {
                ...newTimeSlotJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding timeSlot: ${error.message}`);
            if (error instanceof AlreadyExistsException) {
                throw error;
            }
            throw new Error(`Error adding timeSlot: ${error.message}`);
        }
    }

    public async updateTimeSlot(timeSlotPayload: ITimeSlotUpdatePayload): Promise<ITimeSlotResponse | undefined> {
        const { timeSlotId } = timeSlotPayload;
        try {
            const timeSlot = await TimeSlot.findByPk(timeSlotId);
            if (!timeSlot) {
                throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
            }

            const newTimeSlot = await timeSlot.update({ ...timeSlotPayload });
            const newTimeSlotJson = newTimeSlot.toJSON() as ITimeSlotResponse;
            return {
                ...newTimeSlotJson,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating timeSlot: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error updating timeSlot: ${error.message}`);
        }

    }

    public async getTimeSlot(timeSlotId: string): Promise<ITimeSlotResponse | undefined> {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
        }

        const timeSlotJson = timeSlot.toJSON() as ITimeSlotResponse;
        return {
            ...timeSlotJson,
        };
    }

    public async getTimeSlots(isAvailable: IsAvailableEnum | undefined): Promise<ITimeSlotsGetResponse | undefined> {
        const where = isAvailable === undefined ? {} : { isAvailable };
        const timeSlots = await TimeSlot.findAll({ where });
        return {
            timeSlots: timeSlots.map(timeSlot => ({
                ...timeSlot.toJSON() as ITimeSlotResponse
            }))
        };
    }

    public async deleteTimeSlot(timeSlotId: string): Promise<void> {
        try {
            const timeSlot = await TimeSlot.findByPk(timeSlotId);
            if (!timeSlot) {
                throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
            }
            await timeSlot.destroy();
        } //eslint-disable-next-line 
        catch (error: any) {
            logger.error(`Error deleting timeSlot: ${error.message}`);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new Error(`Error deleting timeSlot: ${error.message}`);
        }

    }

    public async getTimeSlotsByDate(date: Date): Promise<ITimeSlotsGetResponse | undefined> {
        const timeSlots = await TimeSlot.findAll({
            where: {
                time: date
            }
        });
        return {
            timeSlots: timeSlots.map(timeSlot => ({
                ...timeSlot.toJSON() as ITimeSlotResponse
            }))
        };
    }
}