import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box, Chip, Collapse, Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { ArrowForwardRounded as CreateCustomQueryIcon } from '@material-ui/icons';
import clsx from 'clsx';
import {
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
} from '@/enum';
import { AutoAwesomeRounded as EditorsChoiceIcon } from '@/icons';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppStateService from '@/stores/app/AppStateProvider';
import appVariables from '@/config/appVariables';
import { eventToBackground } from '@/stores/universal/serviceBus';
import MenuInfo from '@/ui/Menu/MenuInfo';
import changeQueryPage from './ChangeQuery';

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
    chipsWrapper: { paddingRight: theme.spacing(1) },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
    },
    selected: {
        borderColor: theme.palette.primary.main,
        backgroundColor: `${alpha(theme.palette.primary.main, 0.21)} !important`,
    },
    recommendedChip: {
        height: 48,
        padding: theme.spacing(1.5),
        fontWeight: theme.typography.body1.fontWeight,
        fontSize: theme.typography.body2.fontSize,
        '& $chipIcon': { marginRight: 0 },
    },
    chipIcon: { },
    editorChoiceChip: {
        '& $chipIcon': { color: theme.palette.favorite.main },
        '&$selected': {
            borderColor: theme.palette.favorite.main,
            backgroundColor: `${alpha(theme.palette.favorite.main, 0.14)} !important`,
        },
    },
    customQueryChip: {
        display: 'inline-flex',
        flexDirection: 'row-reverse',
        '& $chipIcon': {
            marginLeft: 0,
            marginRight: theme.spacing(0.5),
        },
    },
    bodyWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

function Stream({ onSelect }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);
    /* const [isCustomQuery, setIsCustomQuery] = useState(
        coreService.storage.persistent.data.backgroundStreamQuery?.type === 'custom-query',
    ); */

    // const isCustomQuery = coreService.storage.persistent.data.backgroundStreamQuery?.type === 'custom-query';
    const selected = coreService.storage.persistent.data.backgroundStreamQuery?.type === 'custom-query'
        ? 'CUSTOM_QUERY'
        : coreService.storage.persistent.data.backgroundStreamQuery?.id;

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM} unmountOnExit>
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
                classes={{ bodyWrapper: classes.bodyWrapper }}
                /* action={{
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
                }} */
            >
                <Box className={classes.chipsWrapper}>
                    <Chip
                        className={clsx(
                            classes.chip,
                            classes.recommendedChip,
                            classes.editorChoiceChip,
                            selected === 'EDITORS_CHOICE' && classes.selected,
                        )}
                        classes={{ icon: classes.chipIcon }}
                        variant="outlined"
                        label={t('query.value.EDITORS_CHOICE')}
                        icon={<EditorsChoiceIcon />}
                        onClick={() => {
                            coreService.storage.persistent.update({
                                backgroundStreamQuery: {
                                    type: 'collection',
                                    id: 'EDITORS_CHOICE',
                                },
                                bgsStream: [],
                                prepareBGStream: null,
                            });
                        }}
                    />
                    <Chip
                        className={clsx(
                            classes.chip,
                            classes.recommendedChip,
                            classes.customQueryChip,
                            selected === 'CUSTOM_QUERY' && classes.selected,
                        )}
                        classes={{ icon: classes.chipIcon }}
                        variant="outlined"
                        label={
                            selected === 'CUSTOM_QUERY'
                                ? t('query.custom.button.change', { query: coreService.storage.persistent.data.backgroundStreamQuery?.value || t('unknown') })
                                : t('query.value.CUSTOM_QUERY')
                        }
                        icon={<CreateCustomQueryIcon />}
                        onClick={() => {
                            onSelect(changeQueryPage);
                        }}
                    />
                </Box>
                <Box className={classes.chipsWrapper}>
                    {(appVariables.backgrounds.stream.queryPresets.map((query) => (
                        <Chip
                            className={clsx(classes.chip, selected === query.id && classes.selected)}
                            variant="outlined"
                            key={query.id}
                            label={t(`query.value.${query.id}`)}
                            onClick={() => {
                                coreService.storage.persistent.update({
                                    backgroundStreamQuery: {
                                        type: 'query',
                                        ...query,
                                    },
                                    bgsStream: [],
                                    prepareBGStream: null,
                                });
                            }}
                        />
                    )))}
                </Box>
            </MenuRow>
            {/* <Collapse in={isCustomQuery}>
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
            </Collapse> */}
        </Collapse>
    );
}

export default observer(Stream);
