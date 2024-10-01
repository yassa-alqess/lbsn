import { PeriodEnum } from "../../shared/enums";

export interface IPeriod {
    profileId: string;
    period: PeriodEnum
    start?: Date;
    end?: Date;
}


// start or end date can be given as a regular day or a UTC time format represinting the day, also a specific time can be passed.