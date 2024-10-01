import Lead from '../../shared/models/lead';
import { PeriodEnum, SalesStageEnum } from '../../shared/enums';
import { IPeriod } from './overview.interface';
import logger from '../../config/logger';

// 3rd party dependencies
import sequelize, { Op } from 'sequelize';
import moment from 'moment';
import Sale from '@/shared/models/sale';

export default class OverviewService {
    async getLeadCountByPeriod(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        switch (period) {
            case PeriodEnum.DAILY:
                return await this._getLeadsGroupedByHour(profileId, today);

            case PeriodEnum.WEEKLY:
                return await this._getLeadsGroupedByDay(profileId, today.clone().startOf('isoWeek'));

            case PeriodEnum.MONTHLY:
                return await this._getLeadsGroupedByWeek(profileId, today.clone().startOf('month'));

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                return await this._getLeadsGroupedByDay(profileId, moment(startDate), moment(endDate));

            default:
                throw new Error('Invalid period');
        }
    }

    private async _getLeadsGroupedByHour(profileId: string, startOfDay: moment.Moment) {
        logger.debug(`starting from ${startOfDay.toDate()} till moment ${moment().toDate()}`);
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
            group: [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            hour: lead.get('hour'),
            count: lead.get('count')
        }));
    }

    private async _getLeadsGroupedByDay(profileId: string, startOfWeek: moment.Moment, endOfWeek: moment.Moment = moment()) {
        const leads = await Lead.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.gte]: startOfWeek.toDate(),
                    [Op.lte]: endOfWeek.toDate() // till now or end of custom period
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'day'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            day: lead.get('day'),
            count: lead.get('count')
        }));
    }

    private async _getLeadsGroupedByWeek(profileId: string, startOfMonth: moment.Moment) {
        const leads = await Lead.findAll({
            where: {
                profileId,
                createdAt: {
                    [Op.gte]: startOfMonth.toDate(),
                    [Op.lte]: moment().toDate(), // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt')), 'week'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            week: lead.get('week'),
            count: lead.get('count')
        }));
    }

    async getDealsCount(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        switch (period) {
            case PeriodEnum.DAILY:
                return await this._getDealsGroupedByHour(profileId, today);

            case PeriodEnum.WEEKLY:
                return await this._getDealsGroupedByDay(profileId, today.clone().startOf('isoWeek'));

            case PeriodEnum.MONTHLY:
                return await this._getDealsGroupedByWeek(profileId, today.clone().startOf('month'));

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                return await this._getDealsGroupedByDay(profileId, moment(startDate), moment(endDate));

            default:
                throw new Error('Invalid period');
        }
    }

    private async _getDealsGroupedByHour(profileId: string, startOfDay: moment.Moment) {
        logger.debug(`starting from ${startOfDay.toDate()} till moment ${moment().toDate()}`);
        const leads = await Sale.findAll({
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
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            hour: lead.get('hour'),
            count: lead.get('count')
        }));
    }

    private async _getDealsGroupedByDay(profileId: string, startOfWeek: moment.Moment, endOfWeek: moment.Moment = moment()) {
        const leads = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfWeek.toDate(),
                    [Op.lte]: endOfWeek.toDate() // till now or end of custom period
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'day'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            day: lead.get('day'),
            count: lead.get('count')
        }));
    }

    private async _getDealsGroupedByWeek(profileId: string, startOfMonth: moment.Moment) {
        const leads = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfMonth.toDate(),
                    [Op.lte]: moment().toDate(), // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt')), 'week'],
                [sequelize.fn('COUNT', sequelize.col('leadId')), 'count'],
            ],
            group: [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            week: lead.get('week'),
            count: lead.get('count')
        }));
    }

    async getDealsValueCount(periodPayload: IPeriod) {
        const { profileId, period, start: startDate, end: endDate } = periodPayload;
        const today = moment().startOf('day');

        switch (period) {
            case PeriodEnum.DAILY:
                return await this._getDealsValueGroupedByHour(profileId, today);

            case PeriodEnum.WEEKLY:
                return await this._getDealsValueGroupedByDay(profileId, today.clone().startOf('isoWeek'));

            case PeriodEnum.MONTHLY:
                return await this._getDealsValueGroupedByWeek(profileId, today.clone().startOf('month'));

            case PeriodEnum.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('Custom period requires both startDate and endDate');
                }
                return await this._getDealsValueGroupedByDay(profileId, moment(startDate), moment(endDate));

            default:
                throw new Error('Invalid period');
        }
    }

    private async _getDealsValueGroupedByHour(profileId: string, startOfDay: moment.Moment) {
        logger.debug(`starting from ${startOfDay.toDate()} till moment ${moment().toDate()}`);
        const leads = await Sale.findAll({
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
                [sequelize.fn('SUM', sequelize.col('dealValue')), 'value'],
            ],
            group: [sequelize.fn('date_trunc', 'hour', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            hour: lead.get('hour'),
            value: lead.get('value')
        }));
    }

    private async _getDealsValueGroupedByDay(profileId: string, startOfWeek: moment.Moment, endOfWeek: moment.Moment = moment()) {
        const leads = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfWeek.toDate(),
                    [Op.lte]: endOfWeek.toDate() // till now or end of custom period
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'day'],
                [sequelize.fn('SUM', sequelize.col('dealValue')), 'value'],
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            day: lead.get('day'),
            value: lead.get('value')
        }));
    }

    private async _getDealsValueGroupedByWeek(profileId: string, startOfMonth: moment.Moment) {
        const leads = await Sale.findAll({
            where: {
                profileId,
                stage: SalesStageEnum.CLOSED_DEAL,
                createdAt: {
                    [Op.gte]: startOfMonth.toDate(),
                    [Op.lte]: moment().toDate(), // till now
                },
            },
            attributes: [
                [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt')), 'week'],
                [sequelize.fn('SUM', sequelize.col('dealValue')), 'value'],
            ],
            group: [sequelize.fn('date_trunc', 'week', sequelize.col('createdAt'))],
        });

        return leads.map(lead => ({
            week: lead.get('week'),
            value: lead.get('value')
        }));
    }
}