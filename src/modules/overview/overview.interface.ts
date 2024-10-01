import { PeriodEnum } from "../../shared/enums";

export interface IPeriod {
    profileId: string;
    period: PeriodEnum
    start?: Date;
    end?: Date;
}