import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse, Typography } from '@material-ui/core';
import {
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
} from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppStateService from '@/stores/app/AppStateProvider';
import appVariables from '@/config/appVariables';
import { eventToBackground } from '@/stores/server/bus';
import MenuInfo from '@/ui/Menu/MenuInfo';
import changeLocationPage from './ChangeQuery';

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
    locationRow: { paddingLeft: theme.spacing(4) },
    geoButtonWrapper: { position: 'relative' },
    geoButton: {},
    geoButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

const stations = [
    ...appVariables.backgrounds.stream.collections.map((collection) => ({
        type: 'collection',
        id: collection,
    })),
    ...appVariables.backgrounds.stream.queryPresets.map((query) => ({
        type: 'query',
        ...query,
    })),
    {
        type: 'custom-query',
        id: 'CUSTOM_QUERY',
    },
];

function Stream({ onSelect }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsBackground']);
    const [isCustomQuery, setIsCustomQuery] = useState(
        coreService.storage.persistent.data.backgroundStreamQuery?.type === 'custom-query',
    );

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM}>
            <MenuInfo
                show={coreService.isOffline}
                variant="warn"
                message={t('notConnectionUseLocal')}
                description={t('notConnectionUseLocal', { context: 'description' })}
            />
            <MenuRow
                title={t('changeInterval.title')}
                description={t('changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`changeInterval.value.${value}`),
                    value: backgrounds.settings.changeInterval,
                    onChange: (event) => backgrounds.settings.update({ changeInterval: event.target.value }),
                    values: [
                        BG_CHANGE_INTERVAL.OPEN_TAB,
                        BG_CHANGE_INTERVAL.MINUTES_5,
                        BG_CHANGE_INTERVAL.MINUTES_30,
                        BG_CHANGE_INTERVAL.HOURS_1,
                        BG_CHANGE_INTERVAL.HOURS_6,
                        BG_CHANGE_INTERVAL.HOURS_12,
                        BG_CHANGE_INTERVAL.DAY_1,
                    ],
                }}
            />
            <MenuRow
                title={t('bgType.title')}
                description={t('bgType.description')}
                action={{
                    type: ROWS_TYPE.MULTISELECT,
                    format: (value) => t(`bgType.value.${value}`),
                    value: backgrounds.settings.type || [],
                    onChange: (event) => {
                        if (event.target.value.length === 0) return;

                        backgrounds.settings.update({ type: event.target.value });
                    },
                    values: [BG_TYPE.IMAGE, BG_TYPE.VIDEO],
                }}
            />
            <MenuRow
                title={t('query.title')}
                description={t('query.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`query.value.${value}`),
                    value: isCustomQuery ? 'CUSTOM_QUERY' : coreService.storage.persistent.data.backgroundStreamQuery?.id,
                    onChange: (event) => {
                        if (event.target.value === 'CUSTOM_QUERY') {
                            onSelect(changeLocationPage);
                        } else {
                            const value = stations.find((station) => station.id === event.target.value);

                            setIsCustomQuery(false);

                            coreService.storage.persistent.update({
                                backgroundStreamQuery: value,
                                bgsStream: [],
                                prepareBGStream: null,
                            });

                            // eventToBackground('backgrounds/nextBg');
                        }
                    },
                    values: stations.map(({ id }) => id),
                }}
            />
            <Collapse in={isCustomQuery}>
                <MenuRow
                    title={t('query.custom.title')}
                    description={t('query.custom.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect(changeLocationPage),
                        component: coreService.storage.persistent.data.backgroundStreamQuery?.value
                            ? (`${
                                coreService.storage.persistent.data.backgroundStreamQuery?.value || t('unknown')
                            }`)
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('query.notSet')}
                                </Typography>
                            ),
                    }}
                />
            </Collapse>
        </Collapse>
    );
}

export default observer(Stream);
