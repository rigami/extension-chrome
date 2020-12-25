import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse, Typography } from '@material-ui/core';
import { BG_CHANGE_INTERVAL, BG_SELECT_MODE, BG_TYPE, FETCH } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import useCoreService from '@/stores/app/BaseStateProvider';
import changeLocationPage from './ChangeQuery';
import useAppStateService from '@/stores/app/AppStateProvider';
import appVariables from '@/config/appVariables';
import { eventToBackground } from '@/stores/server/bus';

const useStyles = makeStyles((theme) => ({
    row: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        alignItems: 'center',
    },
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
    input: { padding: theme.spacing(2) },
    submit: { flexShrink: 0 },
    locationRow: {
        paddingLeft: theme.spacing(4),
    },
    geoButtonWrapper: {
        position: 'relative',
    },
    geoButton: {

    },
    geoButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

const stations = [
    ...appVariables.backgrounds.radio.collections.map((collection) => ({
        type: 'collection',
        id: collection,
    })),
    ...appVariables.backgrounds.radio.queryPresets.map((query) => ({
        type: 'query',
        ...query,
    })),
    {
        type: 'custom-query',
        id: 'CUSTOM_QUERY',
    },
];

function Radio({ onSelect }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation();
    const [isCustomQuery, setIsCustomQuery] = useState(coreService.storage.persistent.backgroundRadioQuery?.type === 'custom-query');

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.RADIO}>
            <MenuRow
                title={t('settings.bg.scheduler.changeInterval.title')}
                description={t('settings.bg.scheduler.changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`settings.bg.scheduler.changeInterval.interval.${value}`),
                    value: backgrounds.settings.changeInterval,
                    onChange: (event) => backgrounds.settings.update({ changeInterval: event.target.value }),
                    values: [
                        BG_CHANGE_INTERVAL.OPEN_TAB,
                        BG_CHANGE_INTERVAL.MINUTES_30,
                        BG_CHANGE_INTERVAL.HOURS_1,
                        BG_CHANGE_INTERVAL.HOURS_6,
                        BG_CHANGE_INTERVAL.HOURS_12,
                        BG_CHANGE_INTERVAL.DAY_1,
                    ],
                }}
            />
            <MenuRow
                title={t('settings.bg.scheduler.BGType.title')}
                description={t('settings.bg.scheduler.BGType.description')}
                action={{
                    type: ROWS_TYPE.MULTISELECT,
                    format: (value) => t(`settings.bg.scheduler.BGType.type.${value}`),
                    value: backgrounds.settings.type || [],
                    onChange: (event) => {
                        if (event.target.value.length === 0) return;

                        backgrounds.settings.update({ type: event.target.value })
                    },
                    values: [
                        BG_TYPE.IMAGE,
                        BG_TYPE.VIDEO,
                    ],
                }}
            />
            <MenuRow
                title={t('settings.bg.scheduler.changeInterval.title')}
                description={t('settings.bg.scheduler.changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`settings.bg.scheduler.query.query.${value}`),
                    value: isCustomQuery ? 'CUSTOM_QUERY' : coreService.storage.persistent.backgroundRadioQuery?.id,
                    onChange: (event) => {
                        if (event.target.value === 'CUSTOM_QUERY') {
                            setIsCustomQuery(true);
                        } else {
                            const value = stations.find((station) => station.id === event.target.value);

                            setIsCustomQuery(false);

                            coreService.storage.updatePersistent({
                                backgroundRadioQuery: value,
                                bgsRadio: [],
                            });

                            eventToBackground('backgrounds/nextBg');
                        }
                    },
                    values: stations.map(({ id }) => id),
                }}
            />
            <Collapse in={isCustomQuery}>
                <MenuRow
                    title={t('settings.bg.scheduler.query.title')}
                    description={t('settings.bg.scheduler.query.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect(changeLocationPage),
                        component: coreService.storage.persistent.backgroundRadioQuery?.value
                            ? (`${
                                coreService.storage.persistent.backgroundRadioQuery?.value || t('unknown')
                            }`)
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('settings.bg.scheduler.query.notSet')}
                                </Typography>
                            ),
                    }}
                />
            </Collapse>
        </Collapse>
    );
}

export default observer(Radio);
