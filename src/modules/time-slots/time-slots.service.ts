import { ITimeSlotAddPayload, ITimeSlotResponse, ITimeSlotsGetResponse, ITimeSlotUpdatePayload } from "./time-slots.interface";
import TimeSlot from "../../shared/models/time-slot";
import { AlreadyExistsException, NotFoundException } from "../../shared/exceptions";
import { IsAvailableEnum } from "../../shared/enums";
import logger from "../../config/logger";

export default class TimeSlotService {
    public async addTimeSlot(timeSlotPayload: ITimeSlotAddPayload): Promise<ITimeSlotResponse> {
        const timeSlot = await TimeSlot.findOne({ where: { time: timeSlotPayload.time } });
        if (timeSlot) {
            throw new AlreadyExistsException('TimeSlot', 'time', timeSlotPayload.time.toString());
        }
        try {
            const timeSlot = await TimeSlot.create({ ...timeSlotPayload });
            return {
                ...timeSlot.toJSON() as ITimeSlotResponse,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error adding timeSlot: ${error.message}`);
            throw new Error(`Error adding timeSlot`);
        }
    }

    public async updateTimeSlot(timeSlotPayload: ITimeSlotUpdatePayload): Promise<ITimeSlotResponse | undefined> {
        const { timeSlotId } = timeSlotPayload;
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
        }
        try {

            await timeSlot.update({ ...timeSlotPayload });
            return {
                ...timeSlot.toJSON() as ITimeSlotResponse,
            };
            //eslint-disable-next-line
        } catch (error: any) {
            logger.error(`Error updating timeSlot: ${error.message}`);
            throw new Error(`Error updating timeSlot`);
        }

    }

    public async getTimeSlot(timeSlotId: string): Promise<ITimeSlotResponse | undefined> {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
        }
        return {
            ...timeSlot.toJSON() as ITimeSlotResponse,
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
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new NotFoundException('TimeSlot', 'timeSlotId', timeSlotId);
        }

        try {

            await timeSlot.destroy();
        } //eslint-disable-next-line 
        catch (error: any) {
            logger.error(`Error deleting timeSlot: ${error.message}`);
            throw new Error(`Error deleting timeSlot`);
        }

    }
}