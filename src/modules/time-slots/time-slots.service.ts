import { ITimeSlotAddPayload, ITimeSlotResponse, ITimeSlotsGetResponse, ITimeSlotUpdatePayload } from "./time-slots.interface";
import TimeSlot from "../../shared/models/time-slot";

export default class TimeSlotService {
    public async addTimeSlot(timeSlotPayload: ITimeSlotAddPayload): Promise<ITimeSlotResponse> {
        const timeSlot = await TimeSlot.create({ ...timeSlotPayload });
        return {
            timeSlotId: timeSlot.timeSlotId,
            time: timeSlot.time,
            isAvailable: timeSlot.isAvailable,
        };
    }

    public async updateTimeSlot(timeSlotPayload: ITimeSlotUpdatePayload): Promise<ITimeSlotResponse> {
        const { timeSlotId } = timeSlotPayload;
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new Error('TimeSlot not found');
        }
        await timeSlot.update({ ...timeSlotPayload });
        return {
            timeSlotId: timeSlot.timeSlotId,
            time: timeSlot.time,
            isAvailable: timeSlot.isAvailable,
        };
    }
    public async getTimeSlot(timeSlotId: string): Promise<ITimeSlotResponse> {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new Error('TimeSlot not found');
        }
        return {
            timeSlotId: timeSlot.timeSlotId,
            time: timeSlot.time,
            isAvailable: timeSlot.isAvailable
        };
    }

    public async getTimeSlots(activated: boolean | undefined): Promise<ITimeSlotsGetResponse> {
        const where = activated === undefined ? {} : { isAvailable: activated };
        const timeSlots = await TimeSlot.findAll({ where });
        return {
            timeSlots: timeSlots.map(timeSlot => ({
                timeSlotId: timeSlot.timeSlotId,
                time: timeSlot.time,
                isAvailable: timeSlot.isAvailable
            }))
        };
    }

    public async deleteTimeSlot(timeSlotId: string): Promise<void> {
        const timeSlot = await TimeSlot.findByPk(timeSlotId);
        if (!timeSlot) {
            throw new Error('TimeSlot not found');
        }
        await timeSlot.destroy();
    }
}