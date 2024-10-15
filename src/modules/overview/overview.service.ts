import Lead from '../../shared/models/lead';
import { PeriodEnum, SalesStageEnum } from '../../shared/enums';
import { IPeriod } from './overview.interface';
import Sale from '../../shared/models/sale';
// 3rd party dependencies
import sequelize, { Op } from 'sequelize';
import moment from 'moment';

export default class OverviewService {
    async getLeadsCountByPeriod(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        switch (period) {
            case PeriodEnum.YEARLY:
                return await this._getLeadsGroupedByMonth(profileId, today.clone().subtract(1, 'year'));

            case PeriodEnum.MONTHLY:
                return await this._getLeadsGroupedByDay(profileId, today.clone().subtract(1, 'month').startOf('month'), today.clone().startOf('month').endOf('month'));

            case PeriodEnum.WEEKLY:
                return await this._getLeadsGroupedByDay(profileId, today.clone().startOf('isoWeek'), today);

            case PeriodEnum.DAILY:
                return await this._getLeadsGroupedByHour(profileId, today);

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                return await this._getLeadsGroupedByDay(profileId, moment(startDate), moment(endDate));

            default:
                throw new Error('Invalid period');
        }
    }

    private async _getLeadsGroupedByMonth(profileId: string, startOfYear: moment.Moment) {
        const leads = await Lead.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.gte]: startOfYear.startOf('month').toDate(),
                    [Op.lte]: moment().toDate() // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']],
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            month: lead.get('month'),
            count: lead.get('count')
        }));
    }

    private async _getLeadsGroupedByDay(profileId: string, startDate: moment.Moment, endDate: moment.Moment = moment()) {
        const leads = await Lead.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.gte]: startDate.toDate(),
                    [Op.lte]: endDate.toDate() // till now or end of custom period
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'day'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            day: lead.get('day'),
            count: lead.get('count')
        }));
    }

    private async _getLeadsGroupedByHour(profileId: string, startOfDay: moment.Moment) {
        const leads = await Lead.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.gte]: startOfDay.toDate(),
                    [Op.lte]: moment().toDate() // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt')), 'hour'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            order: [[sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt')), 'ASC']],
            group: [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            hour: lead.get('hour'),
            count: lead.get('count')
        }));
    }

    public async getDealsCountByPeriod(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        switch (period) {
            case PeriodEnum.YEARLY:
                return await this._getDealsGroupedByMonth(profileId, today.clone().subtract(1, 'year'));

            case PeriodEnum.MONTHLY:
                return await this._getDealsGroupedByDay(
                    profileId,
                    today.clone().subtract(1, 'month').startOf('month'),
                    today.clone().startOf('month').endOf('month')
                );

            case PeriodEnum.WEEKLY:
                return await this._getDealsGroupedByDay(profileId, today.clone().startOf('isoWeek'), today);

            case PeriodEnum.DAILY:
                return await this._getDealsGroupedByHour(profileId, today);

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                return await this._getDealsGroupedByDay(profileId, moment(startDate), moment(endDate));

            default:
                throw new Error('Invalid period');
        }
    }

    private async _getDealsGroupedByMonth(profileId: string, startOfYear: moment.Moment) {
        const deals = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfYear.startOf('month').toDate(),
                    [Op.lte]: moment().toDate() // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('saleId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
        });

        return deals.map(deal => ({
            month: deal.get('month'),
            count: deal.get('count')
        }));
    }

    private async _getDealsGroupedByDay(profileId: string, startDate: moment.Moment, endDate: moment.Moment = moment()) {
        const deals = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startDate.toDate(),
                    [Op.lte]: endDate.toDate() // till now or end of custom period
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'day'],
                [sequelize.fn('COUNT', sequelize.col('saleId')), 'count'],
            ],
            order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        });

        return deals.map(deal => ({
            day: deal.get('day'),
            count: deal.get('count')
        }));
    }

    private async _getDealsGroupedByHour(profileId: string, startOfDay: moment.Moment) {
        const deals = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfDay.toDate(),
                    [Op.lte]: moment().toDate() // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt')), 'hour'],
                [sequelize.fn('COUNT', sequelize.col('saleId')), 'count'],
            ],
            order: [[sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt')), 'ASC']],
            group: [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt'))],
        });

        return deals.map(deal => ({
            hour: deal.get('hour'),
            count: deal.get('count')
        }));
    }

    public async getDealsCount(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        // eslint-disable-next-line
        const whereClause: any = {
            profileId,
            stage: SalesStageEnum.CLOSED_DEAL,
            createdAt: {},
        };

        switch (period) {
            case PeriodEnum.DAILY:
                whereClause.createdAt[Op.gte] = today.toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.WEEKLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'week').startOf('isoWeek').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.MONTHLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'month').startOf('month').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.YEARLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'year').startOf('year').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                whereClause.createdAt[Op.gte] = moment(startDate).toDate();
                whereClause.createdAt[Op.lte] = moment(endDate).toDate(); // till end of custom period
                break;

            default:
                throw new Error('Invalid period');
        }

        const countResult = await Sale.count({
            where: whereClause,
        });

        return countResult;
    }

    public async getDealsValueSum(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        // eslint-disable-next-line
        let whereClause: any = {
            profileId,
            stage: SalesStageEnum.CLOSED_DEAL,
            createdAt: {},
        };

        switch (period) {
            case PeriodEnum.DAILY:
                whereClause.createdAt[Op.gte] = today.toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.WEEKLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'week').startOf('isoWeek').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.MONTHLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'month').startOf('month').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.YEARLY:
                whereClause.createdAt[Op.gte] = today.clone().subtract(1, 'year').startOf('year').toDate();
                whereClause.createdAt[Op.lte] = moment().toDate(); // till now
                break;

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                whereClause.createdAt[Op.gte] = moment(startDate).toDate();
                whereClause.createdAt[Op.lte] = moment(endDate).toDate(); // till end of custom period
                break;

            default:
                throw new Error('Invalid period');
        }

        const sumResult = await Sale.sum('dealsValue', {
            where: whereClause,
        });

        return sumResult || 0; // Return 0 if no deals are found
    }
}